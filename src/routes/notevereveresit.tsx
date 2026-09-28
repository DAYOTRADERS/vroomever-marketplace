import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
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
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        setChecking(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.session.user.id)
        .maybeSingle();
      setIsAdmin(profile?.role === "admin");
      setChecking(false);
    });
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const { data, error: functionError } = await supabase.functions.invoke("admin-create-user", {
      body: { email, fullName, password },
    });

    if (functionError) {
      setError(functionError.message || "Administrator creation service is unavailable.");
      return;
    }

    if (data?.error) {
      setError(String(data.error));
      return;
    }

    setMessage("Administrator account created successfully. You can now sign in at /masteradmin.");
    setEmail("");
    setFullName("");
    setPassword("");
  };

  if (checking) {
    return <div className="grid min-h-screen place-items-center bg-surface-strong text-surface-foreground"><p>Checking administrator access…</p></div>;
  }

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
