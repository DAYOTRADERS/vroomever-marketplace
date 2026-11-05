import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getMyRoleRow } from "@/lib/roles";
import { canOpenStaffPage, staffHome, staffLabel, type StaffRole } from "@/lib/staff";
import { createStaffAccount, deleteStaffAccount, listStaffAccounts } from "@/lib/staff-accounts.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brand } from "./brand";
import { ListingMedia } from "./listing-media";
import { PageTitle } from "./marketplace-pages";
import { AdminShell, Table, useNotice } from "./admin-pages";
import { formatKsh } from "@/data/marketplace";

const logActivity = async (role: StaffRole, action: string) => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("staff_activity").insert({ actor_id: data.user.id, actor_email: data.user.email ?? null, actor_role: role, action });
};

/* ---------- Shell with built-in login ---------- */
function StaffShell({ role, children }: { role: StaffRole; children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "login" | "ready">("checking");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const check = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return setState("login");
    const { data: r } = await getMyRoleRow();
    if (canOpenStaffPage(role, r?.role)) return setState("ready");
    await supabase.auth.signOut();
    setError(`This account is not a ${staffLabel[role].toLowerCase()} login.`);
    setState("login");
  };
  useEffect(() => { void check(); }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true); setError("");
    const f = new FormData(e.currentTarget);
    const { error: err } = await supabase.auth.signInWithPassword({ email: String(f.get("email") ?? "").trim(), password: String(f.get("password") ?? "") });
    if (err) { setError(err.message); setLoading(false); return; }
    const { data: r } = await getMyRoleRow();
    if (!canOpenStaffPage(role, r?.role)) {
      await supabase.auth.signOut();
      setError(`This account is not a ${staffLabel[role].toLowerCase()} login. Use the login created for you by the admin.`);
      setLoading(false); return;
    }
    await logActivity(role, "signed in");
    setLoading(false); setState("ready");
  };

  if (state === "checking") return <div className="grid min-h-screen place-items-center bg-surface-strong text-surface-foreground"><p>Checking access…</p></div>;
  if (state === "login") return (
    <div className="auth-backdrop relative isolate grid min-h-screen place-items-center overflow-hidden px-5 text-surface-foreground">
      
      <form onSubmit={submit} className="auth-form-surface w-full max-w-sm rounded-card border p-6 sm:p-8">
        <Brand inverted />
        <h1 className="mt-8 font-display text-3xl font-bold">{staffLabel[role]}</h1>
        <p className="mt-2 text-sm text-surface-muted">Sign in with the login the administrator created for you.</p>
        {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <label className="mt-6 block text-sm">Email<Input name="email" required type="email" autoComplete="email" className="mt-2 h-11 bg-background text-foreground" /></label>
        <label className="mt-4 block text-sm">Password<Input name="password" required type="password" autoComplete="current-password" className="mt-2 h-11 bg-background text-foreground" /></label>
        <Button className="mt-6 w-full" size="lg" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}<ShieldCheck /></Button>
      </form>
    </div>
  );
  return (
    <div className="min-h-screen min-w-0 bg-muted/40">
      <header className="sticky top-0 z-40 border-b border-border bg-surface-strong text-surface-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-3 sm:p-4">
          <span className="flex items-center gap-3"><Brand inverted /><Badge className="bg-primary/20 text-primary">{staffLabel[role]}</Badge></span>
          <Button variant="ghost" size="sm" className="text-surface-foreground" onClick={async () => { await logActivity(role, "signed out"); await supabase.auth.signOut(); navigate({ to: staffHome[role], replace: true }); setState("login"); }}><LogOut />Sign out</Button>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-6xl p-4 sm:p-6">{children}</main>
    </div>
  );
}

function Tabs<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return <div className="mb-4 flex flex-wrap gap-2">{options.map((o) => <Button key={o.id} size="sm" variant={value === o.id ? "default" : "outline"} onClick={() => onChange(o.id)}>{o.label}</Button>)}</div>;
}

/* ---------- Customer care ---------- */
type Msg = { id: string; user_id: string | null; name: string; email: string; topic: string; message: string; status: string; created_at: string };
type Reply = { id: string; message_id: string; is_admin: boolean; body: string; created_at: string };

function CustomerCareInbox() {
  const [rows, setRows] = useState<Msg[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [sellers, setSellers] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"seller" | "buyer">("seller");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const n = useNotice();
  const load = async () => {
    const { data } = await supabase.from("support_messages").select("id,user_id,name,email,topic,message,status,created_at").order("created_at", { ascending: false });
    setRows(data ?? []);
    const ids = [...new Set((data ?? []).map((m) => m.user_id).filter(Boolean))] as string[];
    if (ids.length) {
      const { data: roles } = await supabase.from("user_roles").select("user_id,role").in("user_id", ids).eq("role", "seller");
      setSellers(new Set((roles ?? []).map((r) => r.user_id)));
    }
    const { data: r } = await supabase.from("support_replies").select("id,message_id,is_admin,body,created_at").order("created_at");
    setReplies(r ?? []);
  };
  useEffect(() => {
    void load();
    const ch = supabase.channel(`cc-${Math.random().toString(36).slice(2)}`).on("postgres_changes", { event: "*", schema: "public", table: "support_messages" }, () => void load()).subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, []);
  const isSeller = (m: Msg) => !!m.user_id && sellers.has(m.user_id);
  const shown = rows.filter((m) => (tab === "seller" ? isSeller(m) : !isSeller(m)));
  const openCount = (s: boolean) => rows.filter((m) => isSeller(m) === s && m.status !== "resolved").length;
  const send = async (m: Msg) => {
    const body = (drafts[m.id] ?? "").trim(); if (!body) return;
    const { data: u } = await supabase.auth.getUser(); if (!u.user) return;
    const { error } = await supabase.from("support_replies").insert({ message_id: m.id, author_id: u.user.id, is_admin: true, body: body.slice(0, 2000) });
    n.show(error, m.user_id ? "Reply sent — they see it on their Contact support page." : "Reply saved. This sender wasn't signed in, so also email them.");
    if (!error) { setDrafts((d) => ({ ...d, [m.id]: "" })); void load(); }
  };
  const mark = async (id: string, status: string) => { const { error } = await supabase.from("support_messages").update({ status }).eq("id", id); n.show(error, `Marked ${status.replace("_", " ")}.`); if (!error) void load(); };
  return (
    <>
      <PageTitle eyebrow="Customer care" title="Messages" copy="Messages from sellers and buyers arrive here. Reply and update their status." />
      {n.el}
      <Tabs value={tab} onChange={setTab} options={[{ id: "seller", label: `Seller messages (${openCount(true)} open)` }, { id: "buyer", label: `Buyer messages (${openCount(false)} open)` }]} />
      <div className="grid gap-4">
        {shown.map((m) => (
          <article key={m.id} className="rounded-card border border-border bg-card p-4 shadow-card sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0"><strong>{m.name}</strong> <a className="break-all text-xs text-primary" href={`mailto:${m.email}`}>{m.email}</a><p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()} · {m.topic}{m.user_id ? "" : " · not signed in"}</p></div>
              <Badge variant={m.status === "resolved" ? "outline" : "default"}>{m.status.replace("_", " ")}</Badge>
            </div>
            <p className="mt-3 whitespace-pre-line rounded-lg bg-muted p-3 text-sm">{m.message}</p>
            <div className="mt-3 grid gap-2">{replies.filter((x) => x.message_id === m.id).map((x) => <div key={x.id} className={`max-w-[90%] rounded-lg p-3 text-sm ${x.is_admin ? "ml-auto border border-primary/30 bg-primary/10" : "bg-secondary"}`}><strong className="block text-xs">{x.is_admin ? "Support" : m.name} · {new Date(x.created_at).toLocaleString()}</strong><span className="whitespace-pre-line">{x.body}</span></div>)}</div>
            <textarea value={drafts[m.id] ?? ""} onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: e.target.value }))} maxLength={2000} rows={3} placeholder="Write a reply…" aria-label="Reply" className="mt-3 w-full rounded-md border border-border bg-background p-3 text-sm" />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => void send(m)}>Send reply</Button>
              {m.status === "open" && <Button size="sm" variant="outline" onClick={() => void mark(m.id, "in_progress")}>Mark in progress</Button>}
              {m.status !== "resolved" ? <Button size="sm" variant="outline" onClick={() => void mark(m.id, "resolved")}>Resolve</Button> : <Button size="sm" variant="outline" onClick={() => void mark(m.id, "open")}>Reopen</Button>}
            </div>
          </article>
        ))}
        {!shown.length && <p className="text-sm text-muted-foreground">No {tab} messages yet.</p>}
      </div>
    </>
  );
}
export function CustomerCarePage() { return <StaffShell role="customer_care"><CustomerCareInbox /></StaffShell>; }

/* ---------- Secretary ---------- */
type Prod = { id: string; title: string; price_ksh: number; status: string; category_slug: string; subcategory: string | null; created_at: string; updated_at: string; rejection_reason: string | null; images: string[] | null; video_url: string | null; description: string | null; listing_fee_ksh: number | null; listing_cadence: string | null };
type Pay = { id: string; user_id: string; amount_ksh: number; method: string; status: string; purpose: string | null; reference: string | null; created_at: string };

function SecretaryDesk() {
  const [tab, setTab] = useState<"products" | "payments">("products");
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "rejected" | "hidden">("all");
  const [prods, setProds] = useState<Prod[]>([]);
  const [pays, setPays] = useState<Pay[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const n = useNotice();
  const load = async () => {
    const { data, error } = await supabase.from("products").select("id,title,price_ksh,status,category_slug,subcategory,created_at,updated_at,rejection_reason,images,video_url,description,listing_fee_ksh,listing_cadence").order("created_at", { ascending: false });
    if (error) n.show(error, "");
    setProds((data ?? []).map((p) => ({ ...p, price_ksh: Number(p.price_ksh) })));
    const { data: p } = await supabase.from("payments").select("id,user_id,amount_ksh,method,status,purpose,reference,created_at").order("created_at", { ascending: false });
    setPays(p ?? []);
  };
  useEffect(() => { void load(); }, []);
  const setStatus = async (p: Prod, status: "active" | "rejected") => {
    const reason = (reasons[p.id] ?? "").trim().slice(0, 500);
    if (status === "rejected" && !reason) { n.show({ message: "Type a reason before rejecting this listing." }, ""); return; }
    const { error } = await supabase.from("products").update({ status, rejection_reason: status === "rejected" ? reason : null }).eq("id", p.id);
    n.show(error, status === "active" ? "Listing approved." : "Listing rejected.");
    if (!error) void load();
  };
  const shown = filter === "all" ? prods : prods.filter((p) => p.status === filter);
  const count = (s: string) => prods.filter((p) => p.status === s).length;
  return (
    <>
      <PageTitle eyebrow="Secretary" title="Listings & payments" copy="Review every posted listing, approve or reject it, and check all payments with their status and time." />
      {n.el}
      <Tabs value={tab} onChange={setTab} options={[{ id: "products", label: `Products (${prods.length})` }, { id: "payments", label: `Payments (${pays.length})` }]} />
      {tab === "products" ? <>
        <Tabs value={filter} onChange={setFilter} options={[{ id: "all", label: `All (${prods.length})` }, { id: "pending", label: `Pending (${count("pending")})` }, { id: "active", label: `Approved / active (${count("active")})` }, { id: "rejected", label: `Rejected (${count("rejected")})` }, { id: "hidden", label: `Hidden (${count("hidden")})` }]} />
        <Table head={["Listing", "Price", "Status", "Posted", "Actions"]} rows={shown.map((p) => [
          <div><Link to="/product/$id" params={{ id: p.id }} className="block font-semibold hover:text-primary">{p.title}</Link><small className="text-muted-foreground">{[p.category_slug, p.subcategory].filter(Boolean).join(" · ")}</small><div className="mt-2 max-w-sm"><ListingMedia images={p.images} video={p.video_url} /></div>{p.description && <p className="mt-2 max-w-sm whitespace-pre-line text-xs text-muted-foreground">{p.description}</p>}</div>,
          <div><strong>{formatKsh(p.price_ksh)}</strong>{p.listing_fee_ksh !== null && <small className="mt-1 block">Fee {formatKsh(p.listing_fee_ksh)} · {p.listing_cadence}</small>}</div>,
          <div><Badge variant="outline">{p.status === "active" ? "approved" : p.status}</Badge>{p.rejection_reason && <small className="mt-1 block max-w-48 text-muted-foreground">Reason: {p.rejection_reason}</small>}</div>,
          <small>{new Date(p.created_at).toLocaleString()}<br />Updated {new Date(p.updated_at).toLocaleString()}</small>,
          <span className="flex flex-wrap gap-2">
            <Input className="h-8 w-full min-w-44" placeholder="Reason (required to reject)" value={reasons[p.id] ?? ""} maxLength={500} onChange={(e) => setReasons({ ...reasons, [p.id]: e.target.value })} />
            <Button size="sm" disabled={p.status === "active"} onClick={() => void setStatus(p, "active")}>Approve</Button>
            <Button size="sm" variant="outline" disabled={p.status === "rejected"} onClick={() => void setStatus(p, "rejected")}>Reject</Button>
          </span>,
        ])} />
      </> : (
        <Table head={["Reference", "Purpose", "Amount", "Method", "Status", "Time"]} rows={pays.map((r) => [
          r.reference ?? r.id.slice(0, 8), r.purpose ?? "—", formatKsh(r.amount_ksh), r.method, <Badge variant="outline">{r.status}</Badge>, new Date(r.created_at).toLocaleString(),
        ])} />
      )}
    </>
  );
}
export function SecretaryPage() { return <StaffShell role="secretary"><SecretaryDesk /></StaffShell>; }

/* ---------- Admin: monitor ---------- */
export function AdminMonitor() {
  const [rows, setRows] = useState<Array<{ id: string; created_at: string; actor_email: string | null; actor_role: string; action: string; target_table: string | null; details: unknown }>>([]);
  const [role, setRole] = useState<"all" | StaffRole>("all");
  useEffect(() => {
    const load = () => supabase.from("staff_activity").select("id,created_at,actor_email,actor_role,action,target_table,details").order("created_at", { ascending: false }).limit(300).then(({ data }) => setRows(data ?? []));
    void load(); const t = setInterval(load, 20000); return () => clearInterval(t);
  }, []);
  const label = (d: unknown) => { const o = (d ?? {}) as Record<string, string | null>; return [o["title"] || o["name"], o["reason"] ? `Reason: ${o["reason"]}` : null, o["body"]].filter(Boolean).join(" — ") || "—"; };
  const shown = role === "all" ? rows : rows.filter((r) => r.actor_role === role);
  return (
    <AdminShell>
      <PageTitle eyebrow="Oversight" title="Staff monitor" copy="Every sign-in, reply, approval and rejection made on the customer care and secretary pages." />
      <Tabs value={role} onChange={setRole} options={[{ id: "all", label: "All" }, { id: "customer_care", label: "Customer care" }, { id: "secretary", label: "Secretary" }]} />
      <Table head={["When", "Staff", "Role", "Activity", "Details"]} rows={shown.map((r) => [new Date(r.created_at).toLocaleString(), r.actor_email ?? "—", staffLabel[r.actor_role as StaffRole] ?? r.actor_role, r.action, <span className="line-clamp-3">{label(r.details)}</span>])} />
    </AdminShell>
  );
}

/* ---------- Admin: create staff logins ---------- */
export function AdminStaffLogins() {
  const create = useServerFn(createStaffAccount);
  const list = useServerFn(listStaffAccounts);
  const remove = useServerFn(deleteStaffAccount);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listStaffAccounts>>>([]);
  const [busy, setBusy] = useState(false);
  const n = useNotice();
  const load = () => list().then(setRows).catch((e: Error) => n.show(e, ""));
  useEffect(() => { void load(); }, []);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setBusy(true);
    const form = e.currentTarget; const f = new FormData(form);
    try {
      const res = await create({ data: { fullName: String(f.get("fullName") ?? ""), email: String(f.get("email") ?? ""), password: String(f.get("password") ?? ""), role: String(f.get("role")) as StaffRole } });
      n.show(null, `${staffLabel[res.role]} login created for ${res.email}. They sign in at ${staffHome[res.role]}.`);
      form.reset(); void load();
    } catch (err) { n.show(err as Error, ""); }
    setBusy(false);
  };
  const del = async (id: string, email: string) => {
    if (!window.confirm(`Remove the login for ${email}?`)) return;
    try { await remove({ data: { id } }); n.show(null, "Login removed."); void load(); } catch (err) { n.show(err as Error, ""); }
  };
  return (
    <AdminShell>
      <PageTitle eyebrow="Team" title="Staff logins" copy="Only admins can create logins for customer care (/customeradmin) and secretary (/secretaryadmin)." />
      {n.el}
      <form onSubmit={submit} className="mb-6 grid gap-3 rounded-card border border-border bg-card p-4 shadow-card sm:grid-cols-2 sm:p-5">
        <label className="text-sm">Full name<Input name="fullName" required minLength={2} maxLength={120} className="mt-1" /></label>
        <label className="text-sm">Email<Input name="email" type="email" required maxLength={255} className="mt-1" /></label>
        <label className="text-sm">Password (min 8 characters)<Input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className="mt-1" /></label>
        <label className="text-sm">Role<select name="role" required className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="customer_care">Customer care</option><option value="secretary">Secretary</option></select></label>
        <Button type="submit" disabled={busy} className="sm:col-span-2 sm:w-fit">{busy ? "Creating…" : "Create login"}</Button>
      </form>
      <Table head={["Name", "Email", "Role", "Sign-in page", "Created", ""]} rows={rows.map((r) => [r.fullName || "—", r.email, staffLabel[r.role as StaffRole] ?? r.role, staffHome[r.role as StaffRole] ?? "—", new Date(r.createdAt).toLocaleDateString(), <Button size="sm" variant="ghost" className="text-destructive" onClick={() => void del(r.id, r.email)} aria-label={`Remove ${r.email}`}><Trash2 /></Button>])} />
    </AdminShell>
  );
}
