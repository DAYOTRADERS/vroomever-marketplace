import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Brand } from "@/components/vroomever/brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/confirm")({ component: AuthConfirmPage });

function AuthConfirmPage() {
  const nav = useNavigate();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your Vroomever email…");

  useEffect(() => {
    let alive = true;
    (async () => {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const tokenHash = query.get("token_hash");
      const errorCode = hash.get("error_code") || query.get("error_code");
      const errorDescription = hash.get("error_description") || query.get("error_description");

      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
        if (error) {
          if (alive) {
            setState("error");
            setMessage(error.message.includes("expired") ? "This link has expired. Please request a new Vroomever email." : error.message);
          }
          return;
        }
      } else if (errorCode) {
        if (alive) {
          setState("error");
          setMessage(errorCode === "otp_expired" ? "This link is expired or was already opened. Please request a new Vroomever email." : (errorDescription || "We could not verify this email link."));
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      const id = data.session?.user.id;
      if (!id) {
        if (alive) {
          setState("error");
          setMessage("This link did not create a Vroomever session. Please request a new email.");
        }
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();
      if (!profile?.role) {
        if (alive) {
          setState("error");
          setMessage("Your email was verified, but your Vroomever profile is missing.");
        }
        return;
      }

      if (alive) {
        setState("success");
        setMessage(profile.role === "seller" ? "Your seller account is verified and ready." : "Your Vroomever account is verified and ready.");
        window.history.replaceState({}, "", "/auth/confirm");
      }
    })();
    return () => { alive = false; };
  }, []);

  const continueToAccount = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { nav({ to: "/auth", search: { role: "buyer", mode: "login" } }); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.session.user.id).maybeSingle();
    if (profile?.role === "seller") nav({ to: "/seller/dashboard", replace: true });
    else if (profile?.role === "admin") nav({ to: "/admin", replace: true });
    else nav({ to: "/dashboard", replace: true });
  };

  return <div className="grid min-h-screen place-items-center bg-surface-strong px-5 text-surface-foreground">
    <div className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 text-center shadow-elevated">
      <Brand inverted />
      <div className="mx-auto mt-10 grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
        {state === "loading" ? <Loader2 className="size-8 animate-spin" /> : state === "success" ? <CheckCircle2 className="size-8" /> : <XCircle className="size-8 text-destructive" />}
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold">{state === "loading" ? "Verify your email" : state === "success" ? "Email verified" : "Verification link problem"}</h1>
      <p className="mt-3 text-sm text-surface-muted">{message}</p>
      {state === "success" ? <Button className="mt-7 w-full" onClick={() => void continueToAccount()}>Continue to Vroomever</Button> : <Button className="mt-7 w-full" asChild><Link to="/auth" search={{ role: "buyer", mode: "signup" }}>Request a new email</Link></Button>}
    </div>
  </div>;
}