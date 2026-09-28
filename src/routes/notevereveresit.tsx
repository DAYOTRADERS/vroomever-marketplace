import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brand } from "@/components/vroomever/brand";
import { Seo } from "@/components/vroomever/marketplace-pages";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/notevereveresit")({
  head: () => Seo("Administrator setup — VroomEver", "Restricted administrator account setup."),
  component: AdminSetupPage,
});

function AdminSetupPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    // First-admin creation is handled directly by Supabase Auth + a locked
    // database RPC, so the first administrator does not depend on an Edge Function.
    const { data: currentSession } = await supabase.auth.getSession();

    if (!currentSession.session) {
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (signupError) {
        // If the Auth user already exists, try signing in so the same recovery
        // page can promote that account when there are still zero admins.
        if (/already registered|already exists/i.test(signupError.message)) {
          const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
          if (loginError) {
            setError("That email already has an account. Sign in with its current password, then use this setup page.");
            return;
          }
        } else {
          setError(signupError.message);
          return;
        }
      } else if (!signupData.session) {
        // Supabase may require email confirmation. Try the password login once;
        // if confirmation is required, return a clear message instead of an
        // Edge Function/network error.
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
          setError("Supabase requires email confirmation before this first administrator can be activated. Confirm the email, then return here and sign in with the same credentials.");
          return;
        }
      }
    }

    const { error: bootstrapError } = await supabase.rpc("bootstrap_first_admin", {
      target_full_name: fullName,
    });

    if (bootstrapError) {
      setError(bootstrapError.message);
      return;
    }

    setMessage("First administrator created successfully. You can now sign in at /masteradmin.");
    setEmail("");
    setFullName("");
    setPassword("");
    await supabase.auth.signOut();
  };

  return (
    <div className="grid min-h-screen place-items-center bg-surface-strong px-5 text-surface-foreground">
      <form onSubmit={submit} className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <Brand inverted />
        <h1 className="mt-8 font-display text-3xl font-bold">Administrator setup</h1>
        <p className="mt-2 text-sm text-surface-muted">
          If no administrator exists yet, this page creates the first administrator. After the first administrator exists, only an authenticated administrator can create another one.
        </p>

        {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {message && <p className="mt-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">{message}</p>}
        <label className="mt-6 block text-sm">Full name
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-2 h-11 bg-background text-foreground" />
        </label>
        <label className="mt-4 block text-sm">Admin email
          <Input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="mt-2 h-11 bg-background text-foreground" />
        </label>
        <label className="mt-4 block text-sm">Password
          <Input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" minLength={8} className="mt-2 h-11 bg-background text-foreground" />
        </label>
        <Button className="mt-6 w-full" size="lg" type="submit">
          Create administrator
        </Button>
      </form>
    </div>
  );
}
