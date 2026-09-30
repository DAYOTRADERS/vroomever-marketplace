import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brand } from "@/components/vroomever/brand";

export const Route = createFileRoute("/notevereveresit")({
  component: BootstrapAdminPage,
});

function BootstrapAdminPage() {
  const nav = useNavigate();
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionIsAdmin, setSessionIsAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [done, setDone] = useState(false);

  const refresh = async () => {
    setChecking(true);
    setError("");

    const [{ data: exists, error: existsError }, { data: sessionData }] = await Promise.all([
      supabase.rpc("admin_exists"),
      supabase.auth.getSession(),
    ]);

    if (existsError) {
      setError(existsError.message);
      setChecking(false);
      return;
    }

    const session = sessionData.session;
    setAdminExists(!!exists);
    setSessionEmail(session?.user.email ?? null);

    if (session) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setSessionIsAdmin(false);
      } else {
        setSessionIsAdmin(profile?.role === "admin");
      }
    } else {
      setSessionIsAdmin(false);
    }

    setChecking(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const signIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setInfo("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setBusy(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("Login completed but no user session was returned.");
      setBusy(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setBusy(false);
      return;
    }

    if (profile?.role === "admin") {
      setSessionEmail(data.user.email ?? email);
      setSessionIsAdmin(true);
      setInfo("Administrator session ready.");
    } else if (!adminExists) {
      setSessionEmail(data.user.email ?? email);
      setSessionIsAdmin(false);
      setInfo("Signed in. You can now make this the first administrator.");
    } else {
      await supabase.auth.signOut();
      setError("This account does not have administrator access.");
    }

    setBusy(false);
  };

  const createFirstAdmin = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    setInfo("");

    const { error: promoteError } = await supabase.rpc("bootstrap_first_admin", {
      target_full_name: "",
    });

    if (promoteError) {
      setError(promoteError.message);
      setBusy(false);
      return;
    }

    setDone(true);
    setBusy(false);
  };

  const createAdminAndSendInvite = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setInfo("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const fullName = String(form.get("fullName") ?? "").trim();

    const password = String(form.get("password") ?? "");

    const { data, error: invokeError } = await supabase.functions.invoke("admin-create-user", {
      body: { email, fullName, password },
    });

    if (invokeError) {
      setError(invokeError.message || "Administrator invitation failed.");
      setBusy(false);
      return;
    }

    if (data?.error) {
      setError(String(data.error));
      setBusy(false);
      return;
    }

    setInfo("Administrator invitation sent to " + email + ". Check the email and complete the invitation before signing in.");
    setBusy(false);
    (e.currentTarget as HTMLFormElement).reset();
  };

  const createFirstAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setInfo("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();

    const { data: created, error: createError } = await supabase.functions.invoke("create-account", {
      body: { email, password, fullName, role: "buyer" },
    });
    if (createError) {
      setError(createError.message || "Account creation failed.");
      setBusy(false);
      return;
    }
    if (created?.error) {
      setError(String(created.error));
      setBusy(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setBusy(false);
      return;
    }

    const { error: promoteError } = await supabase.rpc("bootstrap_first_admin", {
      target_full_name: fullName,
    });

    if (promoteError) {
      setError(promoteError.message);
      setBusy(false);
      return;
    }

    setDone(true);
    setBusy(false);
  };

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong text-surface-foreground">
        <p className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Checking administrator access…</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong px-5 text-surface-foreground">
        <div className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <Brand inverted />
          <CheckCircle2 className="mx-auto mt-8 size-12 text-primary" />
          <h1 className="mt-6 font-display text-2xl font-bold">Administrator ready</h1>
          <p className="mt-2 text-sm text-surface-muted">The administrator account is ready. Use the master admin login to continue.</p>
          <Button className="mt-7 w-full" onClick={() => nav({ to: "/masteradmin", replace: true })}>Open master admin</Button>
        </div>
      </div>
    );
  }

  if (adminExists && sessionIsAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong px-5 py-12 text-surface-foreground">
        <div className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <Brand inverted />
          <MailCheck className="mx-auto mt-8 size-12 text-primary" />
          <h1 className="mt-6 text-center font-display text-3xl font-bold">Create administrator</h1>
          <p className="mt-2 text-center text-sm text-surface-muted">Send a secure administrator invitation. The new administrator will finish account setup from the email.</p>

          {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {info && <p className="mt-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">{info}</p>}

          <form onSubmit={createAdminAndSendInvite} className="mt-6 grid gap-3">
            <label className="text-sm">
              Full name
              <Input name="fullName" required className="mt-2 h-11 bg-background text-foreground" autoComplete="name" />
            </label>
            <label className="text-sm">
              Administrator email
              <Input name="email" required type="email" className="mt-2 h-11 bg-background text-foreground" autoComplete="email" />
            </label>
            <label className="text-sm">
              Password
              <Input name="password" required minLength={8} type="password" className="mt-2 h-11 bg-background text-foreground" autoComplete="new-password" />
            </label>
            <Button type="submit" className="mt-2 w-full" disabled={busy}>
              {busy ? "Sending invitation…" : "Create & send invitation"}
              <MailCheck />
            </Button>
          </form>

          <Button variant="ghost" className="mt-2 w-full" disabled={busy} onClick={async () => { await supabase.auth.signOut(); setSessionEmail(null); setSessionIsAdmin(false); }}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong px-5 py-12 text-surface-foreground">
        <div className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <Brand inverted />
          <ShieldCheck className="mx-auto mt-8 size-12 text-primary" />
          <h1 className="mt-6 text-center font-display text-3xl font-bold">Administrator login</h1>
          <p className="mt-2 text-center text-sm text-surface-muted">Sign in with an existing administrator account before creating another administrator.</p>

          {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {info && <p className="mt-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">{info}</p>}

          <form onSubmit={signIn} className="mt-6 grid gap-3">
            <label className="text-sm">
              Admin email
              <Input name="email" required type="email" className="mt-2 h-11 bg-background text-foreground" autoComplete="email" />
            </label>
            <label className="text-sm">
              Password
              <Input name="password" required type="password" className="mt-2 h-11 bg-background text-foreground" autoComplete="current-password" />
            </label>
            <Button type="submit" className="mt-2 w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
              <ShieldCheck />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (sessionEmail) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong px-5 py-12 text-surface-foreground">
        <div className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <Brand inverted />
          <ShieldCheck className="mx-auto mt-8 size-12 text-primary" />
          <h1 className="mt-6 font-display text-2xl font-bold">Make this the first administrator</h1>
          <p className="mt-2 text-sm text-surface-muted">Signed in as <strong>{sessionEmail}</strong>. This account can become the first administrator.</p>
          {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <Button className="mt-7 w-full" onClick={() => void createFirstAdmin()} disabled={busy}>
            {busy ? "Creating admin…" : "Make this account admin"}
            <ShieldCheck />
          </Button>
          <Button variant="ghost" className="mt-2 w-full" disabled={busy} onClick={async () => { await supabase.auth.signOut(); setSessionEmail(null); }}>Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-surface-strong px-5 py-12 text-surface-foreground">
      <div className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <Brand inverted />
        <h1 className="mt-8 font-display text-3xl font-bold">First administrator</h1>
        <p className="mt-2 text-sm text-surface-muted">No administrator exists yet. Create the first account below. Supabase will send a confirmation email when email confirmation is enabled.</p>

        {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {info && <p className="mt-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">{info}</p>}

        <form onSubmit={createFirstAccount} className="mt-6 grid gap-3">
          <label className="text-sm">
            Full name
            <Input name="fullName" required className="mt-2 h-11 bg-background text-foreground" autoComplete="name" />
          </label>
          <label className="text-sm">
            Admin email
            <Input name="email" required type="email" className="mt-2 h-11 bg-background text-foreground" autoComplete="email" />
          </label>
          <label className="text-sm">
            Password
            <Input name="password" required minLength={8} type="password" className="mt-2 h-11 bg-background text-foreground" autoComplete="new-password" />
          </label>
          <Button type="submit" className="mt-2 w-full" disabled={busy}>
            {busy ? "Creating account…" : "Create first admin account"}
            <ShieldCheck />
          </Button>
        </form>

        <Button variant="ghost" className="mt-2 w-full" disabled={busy} onClick={() => nav({ to: "/masteradmin", replace: true })}>
          Back to master admin
        </Button>
      </div>
    </div>
  );
}
