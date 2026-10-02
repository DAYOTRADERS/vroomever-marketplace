import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, Loader2, UserPlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brand } from "@/components/vroomever/brand";
import { createAdminAccount, getAdminSetupState } from "@/lib/admin-accounts.functions";
import { adminExistsPublic, createAdminInBrowser, isServerKeyMissing } from "@/lib/admin-setup";

export const Route = createFileRoute("/notevereveresit")({
  component: CreateAdminPage,
});

function CreateAdminPage() {
  const getState = useServerFn(getAdminSetupState);
  const create = useServerFn(createAdminAccount);
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    getState()
      .then((s) => s.adminExists)
      .catch((e) => (isServerKeyMissing(e) ? adminExistsPublic() : Promise.reject(e)))
      .then((exists) => setAdminExists(exists))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not check administrator setup."))
      .finally(() => setChecking(false));
  }, [getState]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const input = {
        fullName: String(form.get("fullName") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      };
      let email: string;
      let needsConfirmation = false;
      try {
        email = (await create({ data: input })).email;
      } catch (serverErr) {
        if (!isServerKeyMissing(serverErr)) throw serverErr;
        const res = await createAdminInBrowser(input, !adminExists);
        email = res.email;
        needsConfirmation = res.needsConfirmation;
      }
      setInfo(needsConfirmation
        ? `Administrator account created for ${email}. Open the confirmation email we sent, then sign in at /masteradmin/login.`
        : `Administrator account created for ${email}. Sign in at /masteradmin/login.`);
      setAdminExists(true);
      formEl.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Administrator account could not be created.");
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong text-surface-foreground">
        <p className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Checking administrator setup…</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-surface-strong px-5 py-12 text-surface-foreground">
      <div className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <Brand inverted />
        <UserPlus className="mx-auto mt-8 size-12 text-primary" />
        <h1 className="mt-6 text-center font-display text-3xl font-bold">
          {adminExists ? "Create administrator" : "Create first administrator"}
        </h1>
        <p className="mt-2 text-center text-sm text-surface-muted">
          {adminExists
            ? "Creating more admins requires an administrator to be signed in through the Master Admin login."
            : "No administrator exists yet. Create the first admin account below."}
        </p>

        {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {info && <p className="mt-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">{info}</p>}

        <form onSubmit={submit} className="mt-6 grid gap-3">
          <label className="text-sm">
            Full name
            <Input name="fullName" required minLength={2} className="mt-2 h-11 bg-background text-foreground" autoComplete="name" />
          </label>
          <label className="text-sm">
            Administrator email
            <Input name="email" required type="email" className="mt-2 h-11 bg-background text-foreground" autoComplete="off" />
          </label>
          <label className="text-sm">
            Password
            <Input name="password" required minLength={8} type="password" className="mt-2 h-11 bg-background text-foreground" autoComplete="new-password" />
          </label>
          <Button type="submit" className="mt-2 w-full" disabled={busy}>
            {busy ? "Creating admin…" : "Create admin account"}
            <ShieldCheck />
          </Button>
        </form>

        <Button asChild variant="ghost" className="mt-2 w-full">
          <Link to="/masteradmin/login">Go to Master Admin login</Link>
        </Button>
      </div>
    </div>
  );
}
