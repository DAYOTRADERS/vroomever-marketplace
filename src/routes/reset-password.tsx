import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRoleRow } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brand } from "@/components/vroomever/brand";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — VRUMEVER" },
      { name: "description", content: "Set a new password for your VRUMEVER buyer or seller account." },
      { property: "og:title", content: "Reset your password — VRUMEVER" },
      { property: "og:description", content: "Set a new password for your VRUMEVER buyer or seller account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    (async () => {
      // Support every link format the reset email can use.
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash") ?? hash.get("token_hash");
      const linkError = url.searchParams.get("error_description") ?? hash.get("error_description");
      try {
        if (linkError) throw new Error(linkError);
        if (code) {
          const { error: ex } = await supabase.auth.exchangeCodeForSession(code);
          if (ex) throw ex;
        } else if (tokenHash) {
          const { error: ve } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
          if (ve) throw ve;
        } else if (hash.get("access_token") && hash.get("refresh_token")) {
          const { error: se } = await supabase.auth.setSession({ access_token: hash.get("access_token")!, refresh_token: hash.get("refresh_token")! });
          if (se) throw se;
        }
        if (code || tokenHash || hash.get("access_token")) window.history.replaceState(null, "", "/reset-password");
      } catch {
        /* falls through to the expired-link message */
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) setReady(true);
      setChecked(true);
    })();
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const pw = String(f.get("password") ?? "");
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== String(f.get("confirm") ?? "")) return setError("The two passwords don't match.");
    setBusy(true); setError("");
    try {
      const { data: me } = await getMyRoleRow();
      if (me?.role === "admin") {
        await supabase.auth.signOut();
        throw new Error("Administrator passwords can't be reset here. Please contact another administrator.");
      }
      const { error: upErr } = await supabase.auth.updateUser({ password: pw });
      if (upErr) throw upErr;
      const role = me?.role === "seller" ? "seller" : "buyer";
      await supabase.auth.signOut();
      nav({ to: "/auth", search: { role, mode: "login" }, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-surface-strong px-5 py-12 text-surface-foreground">
      <div className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <Brand inverted />
        <h1 className="mt-8 font-display text-3xl font-bold">Set a new password</h1>
        {!ready ? (
          <p className="mt-4 text-sm text-surface-muted">
            {checked ? "This reset link is invalid or has expired. Go to the Buyer or Seller login and tap “Forgot password?” to get a new one." : "Checking your reset link…"}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-3">
            <label className="text-sm">New password<Input name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-2 h-11 bg-background text-foreground" /></label>
            <label className="text-sm">Confirm new password<Input name="confirm" type="password" required minLength={8} autoComplete="new-password" className="mt-2 h-11 bg-background text-foreground" /></label>
            {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save new password"}</Button>
          </form>
        )}
        <Button variant="ghost" className="mt-2 w-full" onClick={() => nav({ to: "/auth", search: { role: new URLSearchParams(window.location.search).get("role") === "seller" ? "seller" : "buyer", mode: "login" } })}>Back to sign in</Button>
      </div>
    </div>
  );
}
