import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
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
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const refresh = async () => {
    const { data: exists, error: existsError } = await supabase.rpc("admin_exists");
    if (existsError) {
      setError(`admin_exists failed: ${existsError.message}`);
      setChecking(false);
      return;
    }
    setAdminExists(!!exists);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSessionEmail(session?.user.email ?? null);
    setChecking(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const signIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    await refresh();
  };

  const signUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: "buyer" } },
    });
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    await refresh();
  };

  const promote = async () => {
    setPromoting(true);
    setError("");
    const { error: promoteError } = await supabase.rpc("bootstrap_first_admin", {
      target_full_name: "",
    });
    if (promoteError) {
      setError(promoteError.message);
      setPromoting(false);
      return;
    }
    setDone(true);
    setPromoting(false);
  };

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong text-surface-foreground">
        <p className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Checking database…
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong px-5 text-surface-foreground">
        <div className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <Brand inverted />
          <CheckCircle2 className="mx-auto mt-8 size-12 text-primary" />
          <h1 className="mt-6 font-display text-2xl font-bold">You are now admin</h1>
          <p className="mt-2 text-sm text-surface-muted">
            Your account has been promoted to administrator.
          </p>
          <Button className="mt-7 w-full" onClick={() => nav({ to: "/masteradmin", replace: true })}>
            Open admin dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong px-5 text-surface-foreground">
        <div className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <Brand inverted />
          <ShieldCheck className="mx-auto mt-8 size-12 text-primary" />
          <h1 className="mt-6 font-display text-2xl font-bold">An administrator already exists</h1>
          <p className="mt-2 text-sm text-surface-muted">
            Bootstrap is disabled. Sign in on the master admin page with your admin account.
          </p>
          <Button className="mt-7 w-full" onClick={() => nav({ to: "/masteradmin", replace: true })}>
            Go to master admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-surface-strong px-5 py-12 text-surface-foreground">
      <div className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <Brand inverted />
        <h1 className="mt-8 font-display text-3xl font-bold">First administrator</h1>
        <p className="mt-2 text-sm text-surface-muted">
          No administrator exists yet. Sign in with the account you want to make the first admin.
          If you don't have one yet, create it below.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}

        {sessionEmail ? (
          <div className="mt-6 rounded-card border border-white/10 bg-white/5 p-4">
            <p className="text-sm">
              Signed in as <strong>{sessionEmail}</strong>
            </p>
            <Button className="mt-4 w-full" onClick={() => void promote()} disabled={promoting}>
              {promoting ? "Promoting…" : "Make this account admin"}
              <ShieldCheck />
            </Button>
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={async () => {
                await supabase.auth.signOut();
                setSessionEmail(null);
              }}
            >
              Sign out
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={signIn} className="mt-6 grid gap-3">
              <label className="text-sm">
                Email
                <Input name="email" required type="email" className="mt-2 h-11 bg-background text-foreground" />
              </label>
              <label className="text-sm">
                Password
                <Input name="password" required type="password" className="mt-2 h-11 bg-background text-foreground" />
              </label>
              <Button type="submit" className="mt-1 w-full">
                Sign in
              </Button>
            </form>

            <div className="my-6 text-center text-xs uppercase tracking-widest text-surface-muted">
              or create an account
            </div>

            <form onSubmit={signUp} className="grid gap-3">
              <label className="text-sm">
                Full name
                <Input name="fullName" required className="mt-2 h-11 bg-background text-foreground" />
              </label>
              <label className="text-sm">
                Email
                <Input name="email" required type="email" className="mt-2 h-11 bg-background text-foreground" />
              </label>
              <label className="text-sm">
                Password
                <Input name="password" required type="password" className="mt-2 h-11 bg-background text-foreground" />
              </label>
              <Button type="submit" variant="outline" className="mt-1 w-full">
                Create account
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
