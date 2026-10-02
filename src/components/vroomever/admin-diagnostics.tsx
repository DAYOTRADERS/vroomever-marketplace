import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRoleRow } from "@/lib/roles";
import { getServerConfigStatus } from "@/lib/diagnostics.functions";
import { Button } from "@/components/ui/button";
import { AdminShell } from "./admin-pages";
import { PageTitle } from "./marketplace-pages";

type Status = "pass" | "warn" | "fail";
type Check = { group: string; label: string; status: Status; detail: string; tip?: string };

const TABLES = ["profiles", "user_roles", "categories", "products", "subscription_packages", "subscriptions", "payments", "favorites", "reports", "audit_logs"];

function maskHost(url: string) {
  try {
    const h = new URL(url).host;
    return h.length > 14 ? `${h.slice(0, 6)}…${h.slice(-12)}` : h;
  } catch {
    return "unknown";
  }
}

async function runChecks(serverStatus: () => Promise<{ url: boolean; secret: boolean; ai: boolean }>): Promise<Check[]> {
  const out: Check[] = [];
  const client = supabase as any;
  const url: string = client.supabaseUrl ?? "";
  const key: string = client.supabaseKey ?? "";
  const own = url.includes("lovable.cloud") || url === import.meta.env["VITE_SUPABASE_URL"];

  // Connection + email settings
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
    const s = await res.json();
    out.push({ group: "Database connection", label: "Reachable", status: res.ok ? "pass" : "fail", detail: `${own ? "This app's database" : "A different (external) database"} · ${maskHost(url)}`, tip: own ? undefined : "The site is using another database. Remove database settings from your host so it uses this app's database." });
    if (!own) out[out.length - 1]!.status = "warn";
    out.push({ group: "Email sign-in", label: "Sign-up enabled", status: s.disable_signup ? "fail" : s.external?.email ? "pass" : "fail", detail: s.external?.email ? (s.disable_signup ? "New sign-ups are turned off" : "Email sign-up is on") : "Email sign-in is off" });
    out.push({ group: "Email sign-in", label: "Confirmation email", status: "pass", detail: s.mailer_autoconfirm ? "Not required — accounts are ready instantly" : "Required before first sign-in" });
  } catch {
    out.push({ group: "Database connection", label: "Reachable", status: "fail", detail: `Could not reach ${maskHost(url)}`, tip: "Check your internet connection and the site's database settings." });
  }

  // Tables
  for (const t of TABLES) {
    const { error, count } = await client.from(t).select("*", { count: "exact", head: true });
    const missing = error && (error.code === "PGRST205" || /schema cache|does not exist/i.test(error.message ?? ""));
    out.push({ group: "Required tables", label: t, status: missing ? "fail" : error ? "warn" : "pass", detail: missing ? "Missing" : error ? `Present, but: ${error.message}` : `Present · ${count ?? 0} rows visible`, tip: missing ? "Apply this app's database setup to the connected database." : undefined });
  }

  // Functions (probes are read-only or rejected safely)
  const probes: [string, string, Record<string, unknown>][] = [
    ["get_my_role", "Check my role", {}],
    ["admin_exists", "Admin exists", {}],
    ["admin_users", "List users", {}],
    ["admin_set_user_role", "Set role", { target_user_id: "00000000-0000-0000-0000-000000000000", target_role: "__probe__" }],
  ];
  let adminRows: { role: string }[] | null = null;
  let adminExists: boolean | null = null;
  for (const [fn, label, args] of probes) {
    const { data, error } = await client.rpc(fn, args);
    const missing = error && (error.code === "PGRST202" || /could not find the function/i.test(error.message ?? ""));
    const expectedReject = fn === "admin_set_user_role" && error && /invalid role/i.test(error.message ?? "");
    if (fn === "admin_users" && !error) adminRows = data;
    if (fn === "admin_exists" && !error) adminExists = Boolean(data);
    out.push({ group: "Account functions", label, status: missing ? "fail" : !error || expectedReject ? "pass" : "warn", detail: missing ? "Missing" : !error || expectedReject ? "Installed and working" : `Installed, but: ${error.message}`, tip: missing ? "Apply this app's database setup to the connected database." : undefined });
  }

  // Roles
  const { data: me } = await getMyRoleRow();
  out.push({ group: "Account roles", label: "Your account", status: me?.role === "admin" ? "pass" : "fail", detail: me?.role === "admin" ? "Confirmed administrator" : `Signed in as ${me?.role ?? "unknown"}` });
  out.push({ group: "Account roles", label: "Administrator exists", status: adminExists ? "pass" : "fail", detail: adminExists ? "Yes" : "No administrator found", tip: adminExists ? undefined : "Create one at /notevereveresit." });
  if (adminRows) {
    const c = (r: string) => adminRows!.filter((x) => x.role === r).length;
    out.push({ group: "Account roles", label: "Accounts", status: "pass", detail: `${c("buyer")} buyers · ${c("seller")} sellers · ${c("admin")} admins` });
  }

  // Server settings (booleans only)
  try {
    const s = await serverStatus();
    out.push({ group: "Server settings", label: "Server secret key", status: s.secret ? "pass" : "warn", detail: s.secret ? "Configured" : "Not configured", tip: s.secret ? undefined : "Admin creation still works through the backup method; instant admin accounts and some server features need it." });
    out.push({ group: "Server settings", label: "AI descriptions key", status: s.ai ? "pass" : "warn", detail: s.ai ? "Configured" : "Not configured", tip: s.ai ? undefined : "“Write with AI” won't work on this host." });
  } catch {
    out.push({ group: "Server settings", label: "Server", status: "warn", detail: "Server settings could not be read" });
  }
  return out;
}

const icon = { pass: <CheckCircle2 className="size-5 text-primary" />, warn: <AlertTriangle className="size-5 text-vip" />, fail: <XCircle className="size-5 text-destructive" /> };

export function AdminDiagnostics() {
  const serverStatus = useServerFn(getServerConfigStatus);
  const [checks, setChecks] = useState<Check[]>([]);
  const [busy, setBusy] = useState(true);
  const run = useCallback(async () => {
    setBusy(true);
    try { setChecks(await runChecks(() => serverStatus())); } finally { setBusy(false); }
  }, [serverStatus]);
  useEffect(() => { void run(); }, [run]);
  const groups = [...new Set(checks.map((c) => c.group))];
  const fails = checks.filter((c) => c.status === "fail").length;

  return (
    <AdminShell>
      <PageTitle eyebrow="System health" title="Setup diagnostics" copy="Checks the database connection, required setup and account roles. No keys or secrets are ever shown." />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button onClick={() => void run()} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}Run checks again</Button>
        {!busy && <span className="text-sm text-muted-foreground">{fails ? `${fails} problem${fails > 1 ? "s" : ""} found` : "Everything required is in place"}</span>}
      </div>
      <div className="grid gap-6">
        {groups.map((g) => (
          <section key={g}>
            <h2 className="mb-3 font-display text-lg font-bold">{g}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {checks.filter((c) => c.group === g).map((c) => (
                <div key={c.label} className="flex gap-3 rounded-card border border-border bg-card p-4">
                  {icon[c.status]}
                  <div className="min-w-0">
                    <p className="font-semibold">{c.label}</p>
                    <p className="text-sm text-muted-foreground">{c.detail}</p>
                    {c.tip && <p className="mt-1 text-xs text-foreground">Fix: {c.tip}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}
