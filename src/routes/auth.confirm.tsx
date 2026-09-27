import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Brand } from "@/components/vroomever/brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/confirm")({
  component: AuthConfirmPage,
});

function AuthConfirmPage() {
  const nav = useNavigate();
  const [state, setState] = useState<"loading"|"success"|"error">("loading");
  const [message, setMessage] = useState("Verifying your Vroomever account…");

  useEffect(() => {
    let active = true;
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");
      if (!tokenHash || type !== "email") {
        if (active) { setState("error"); setMessage("This verification link is missing or has expired."); }
        return;
      }
      const { error } = await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
      if (!active) return;
      if (error) { setState("error"); setMessage(error.message); return; }
      setState("success");
      setMessage("Your email is verified. Your Vroomever account is now active.");
    };
    void verify();
    return () => { active = false; };
  }, []);

  return <div className="grid min-h-screen place-items-center bg-surface-strong px-5 text-surface-foreground"><div className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 text-center shadow-elevated"><Brand inverted /><div className="mx-auto mt-10 grid size-16 place-items-center rounded-full bg-primary/10 text-primary">{state==="loading"?<Loader2 className="size-8 animate-spin"/>:state==="success"?<CheckCircle2 className="size-8"/>:<XCircle className="size-8 text-destructive"/>}</div><h1 className="mt-6 font-display text-2xl font-bold">{state==="loading"?"Verify your email":state==="success"?"Email verified":"Verification problem"}</h1><p className="mt-3 text-sm text-surface-muted">{message}</p>{state==="success"&&<Button className="mt-7 w-full" onClick={()=>nav({to:"/login"})}>Continue to Vroomever</Button>}{state==="error"&&<Button variant="outline" className="mt-7 w-full" asChild><Link to="/login">Return to sign in</Link></Button>}</div></div>;
}
