import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3, Boxes, CircleDollarSign, FileClock, Flag, LayoutDashboard, LogOut,
  Menu, Settings, ShieldCheck, Sparkles, Tags, UsersRound, X, type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { getMyRoleRow } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brand } from "./brand";
import { PageTitle } from "./marketplace-pages";
import { categories, formatKsh, vipOptions } from "@/data/marketplace";

const adminNav: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/masteradmin", label: "Overview", icon: LayoutDashboard },
  { to: "/masteradmin/users", label: "Users", icon: UsersRound },
  { to: "/masteradmin/products", label: "Products", icon: Boxes },
  { to: "/masteradmin/categories", label: "Categories", icon: Tags },
  { to: "/masteradmin/subscriptions", label: "Subscriptions", icon: CircleDollarSign },
  { to: "/masteradmin/vip", label: "VIP ads", icon: Sparkles },
  { to: "/masteradmin/reports", label: "Reports", icon: Flag },
  { to: "/masteradmin/payments", label: "Payments", icon: CircleDollarSign },
  { to: "/masteradmin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/masteradmin/audit", label: "Audit log", icon: FileClock },
  { to: "/masteradmin/diagnostics", label: "Diagnostics", icon: ShieldCheck },
  { to: "/masteradmin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeItem = adminNav.find((item) => item.to === path) ?? adminNav[0];

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate({ to: "/masteradmin", replace: true });
        return;
      }
      const { data: profile } = await getMyRoleRow();
      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        navigate({ to: "/masteradmin", replace: true });
        return;
      }
      setReady(true);
    });
  }, [navigate]);

  if (!ready)
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong text-surface-foreground">
        <p>Checking admin access…</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-muted/40 lg:grid lg:grid-cols-[260px_1fr]">
      <header className="sticky top-0 z-40 grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center border-b border-border bg-surface-strong px-4 text-surface-foreground shadow-card lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
            {activeItem && <activeItem.icon className="size-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-surface-muted">Vroomever admin</p>
            <p className="truncate font-display text-base font-bold">{activeItem?.label ?? "Overview"}</p>
          </div>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="shrink-0 text-surface-foreground hover:bg-primary/15 hover:text-primary"
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-label={mobileNavOpen ? "Close admin menu" : "Open admin menu"}
          aria-expanded={mobileNavOpen}
        >
          {mobileNavOpen ? <X /> : <Menu />}
        </Button>
      </header>
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          className="fixed inset-0 top-16 z-30 bg-foreground/35 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside className={`${mobileNavOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-16 left-0 z-40 w-[min(82vw,300px)] overflow-y-auto border-r border-border bg-surface-strong text-surface-foreground shadow-elevated transition-transform duration-300 lg:static lg:inset-auto lg:min-h-screen lg:w-auto lg:translate-x-0 lg:shadow-none`}>
        <div className="flex items-center justify-between p-5">
          <Brand inverted />
          <Badge className="bg-primary/20 text-primary">Admin</Badge>
        </div>
        <nav className="grid gap-1 p-3">
          {adminNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileNavOpen(false)}
              className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${path === item.to ? "bg-primary text-primary-foreground" : "text-surface-muted hover:bg-primary/10"}`}
            >
              <item.icon className="size-4 shrink-0" /> <span className="truncate">{item.label}</span>
            </Link>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/masteradmin" });
            }}
            className="mt-3 min-h-11 justify-start gap-3 px-3 text-surface-muted hover:bg-primary/10 hover:text-surface-foreground"
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </nav>
      </aside>
      <main className="min-w-0 px-4 py-5 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}

export function AdminLoginPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setError("Your login session could not be created.");
      setLoading(false);
      return;
    }
    const { data: profile, error: profileError } = await getMyRoleRow();
    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }
    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account does not have administrator access.");
      setLoading(false);
      return;
    }
    nav({ to: "/masteradmin", replace: true });
    setLoading(false);
  };
  return (
    <div className="grid min-h-screen place-items-center bg-surface-strong px-5 text-surface-foreground">
      <form onSubmit={submit} className="w-full max-w-sm rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <Brand inverted />
        <h1 className="mt-8 font-display text-3xl font-bold">Master admin</h1>
        <p className="mt-2 text-sm text-surface-muted">Sign in to the VroomEver administration panel.</p>
        {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <label className="mt-6 block text-sm">
          Admin email
          <Input name="email" required type="email" autoComplete="email" className="mt-2 h-11 bg-background text-foreground" />
        </label>
        <label className="mt-4 block text-sm">
          Password
          <Input name="password" required type="password" autoComplete="current-password" className="mt-2 h-11 bg-background text-foreground" />
        </label>
        <Button className="mt-6 w-full" size="lg" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
          <ShieldCheck />
        </Button>
      </form>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-card border border-border bg-card p-4 shadow-card sm:p-5">
      <span className="block truncate text-xs text-muted-foreground sm:text-sm">{label}</span>
      <strong className="mt-2 block truncate font-display text-2xl sm:text-3xl">{value}</strong>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs font-bold uppercase text-muted-foreground">
            {head.map((h) => (
              <th key={h} className="px-5 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {r.map((c, j) => (
                <td key={j} className="px-5 py-4">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminEntryPage() {
  const [checking, setChecking] = useState(true);
  const [authenticatedAdmin, setAuthenticatedAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!active) return;
      if (!sessionData.session) {
        setAuthenticatedAdmin(false);
        setChecking(false);
        return;
      }
      const { data: profile } = await getMyRoleRow();
      if (!active) return;
      if (profile?.role === "admin") setAuthenticatedAdmin(true);
      else {
        await supabase.auth.signOut();
        if (!active) return;
        setAuthenticatedAdmin(false);
      }
      setChecking(false);
    })();
    return () => { active = false; };
  }, []);

  if (checking) return <div className="grid min-h-screen place-items-center bg-surface-strong text-surface-foreground"><p>Checking admin access…</p></div>;
  return authenticatedAdmin ? <AdminOverview /> : <AdminLoginPage />;
}

type ProductStatus = "pending" | "active" | "hidden" | "rejected";
const confirmDo = (msg: string) => typeof window !== "undefined" && window.confirm(msg);
function useNotice() {
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const show = (error: { message: string } | null, okText: string) => setNotice(error ? { ok: false, text: error.message } : { ok: true, text: okText });
  const el = notice ? <p className={`mb-4 rounded-lg p-3 text-sm ${notice.ok ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{notice.text}</p> : null;
  return { show, el };
}

export function AdminOverview() {
  const [s, setS] = useState({ users: 0, sellers: 0, listings: 0, pending: 0, reports: 0, revenue: 0 });
  const [pending, setPending] = useState<Array<{ id: string; title: string; status: string }>>([]);
  useEffect(() => {
    void (async () => {
      const [u, p, r, pay] = await Promise.all([
        supabase.rpc("admin_users"),
        supabase.from("products").select("id,title,status").order("created_at", { ascending: false }),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("payments").select("amount_ksh,status"),
      ]);
      const users = u.data ?? [];
      const prods = p.data ?? [];
      setS({
        users: users.length,
        sellers: users.filter((x) => x.role === "seller").length,
        listings: prods.length,
        pending: prods.filter((x) => x.status === "pending").length,
        reports: r.count ?? 0,
        revenue: (pay.data ?? []).filter((x) => x.status === "success" || x.status === "successful").reduce((a, b) => a + b.amount_ksh, 0),
      });
      setPending(prods.filter((x) => x.status === "pending").slice(0, 10));
    })();
  }, []);
  return (
    <AdminShell>
      <PageTitle eyebrow="Control center" title="Marketplace overview" copy="Live data from the Vroomever database." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <Stat label="Total users" value={String(s.users)} />
        <Stat label="Sellers" value={String(s.sellers)} />
        <Stat label="All listings" value={String(s.listings)} />
        <Stat label="Pending moderation" value={String(s.pending)} />
        <Stat label="Open reports" value={String(s.reports)} />
        <Stat label="Recorded revenue" value={formatKsh(s.revenue)} />
      </div>
      <div className="mt-6 rounded-card border border-border bg-card p-4 sm:mt-8 sm:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><h2 className="min-w-0 font-display text-lg font-bold sm:text-xl">Pending moderation</h2><Button asChild size="sm" variant="outline" className="shrink-0"><Link to="/masteradmin/products">Review all</Link></Button></div>
        <div className="mt-4 grid gap-3">
          {pending.length ? pending.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 border-b border-border pb-3"><span className="truncate text-sm">{p.title}</span><Badge variant="outline">{p.status}</Badge></div>
          )) : <p className="text-sm text-muted-foreground">No pending listings.</p>}
        </div>
      </div>
    </AdminShell>
  );
}

export function AdminUsers() {
  const [rows, setRows] = useState<Array<{ id: string; name: string; email: string; role: string; created_at: string }>>([]);
  const [busy, setBusy] = useState("");
  const [q, setQ] = useState("");
  const n = useNotice();
  const load = async () => {
    const { data, error } = await supabase.rpc("admin_users");
    if (error) n.show(error, "");
    setRows((data ?? []).map((u) => ({ id: u.id, name: u.full_name || "Unnamed user", email: u.email || "", role: u.role || "buyer", created_at: u.created_at })));
  };
  useEffect(() => { void load(); }, []);
  const setRole = async (id: string, role: "buyer" | "seller" | "admin") => {
    setBusy(id);
    const { error } = await supabase.rpc("admin_set_user_role", { target_user_id: id, target_role: role });
    n.show(error, `Role changed to ${role}.`);
    if (!error) await load();
    setBusy("");
  };
  const remove = async (id: string, email: string) => {
    if (!confirmDo(`Permanently delete ${email} and all their listings?`)) return;
    setBusy(id);
    const { error } = await supabase.rpc("admin_delete_user", { target_user_id: id });
    n.show(error, `${email} deleted.`);
    if (!error) await load();
    setBusy("");
  };
  const shown = rows.filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <AdminShell>
      <PageTitle eyebrow="People" title="Users & roles" copy="Every buyer, seller and administrator account." action={<Input placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />} />
      {n.el}
      <Table
        head={["User", "Role", "Joined", "Actions"]}
        rows={shown.map((u) => [
          <div><strong className="block">{u.name}</strong><small className="text-muted-foreground">{u.email}</small></div>,
          <Badge variant="outline">{u.role}</Badge>,
          new Date(u.created_at).toLocaleDateString(),
          <div className="flex flex-wrap gap-2">
            {(["buyer", "seller", "admin"] as const).map((role) => (
              <Button key={role} size="sm" variant={u.role === role ? "default" : "outline"} disabled={busy === u.id || u.role === role} onClick={() => void setRole(u.id, role)}>{role}</Button>
            ))}
            <Button size="sm" variant="ghost" className="text-destructive" disabled={busy === u.id} onClick={() => void remove(u.id, u.email)}>Delete</Button>
          </div>,
        ])}
      />
    </AdminShell>
  );
}

export function AdminProducts() {
  const [rows, setRows] = useState<Array<{ id: string; title: string; price: number; status: string; seller_id: string; is_vip: boolean; category_slug: string; created_at: string }>>([]);
  const [filter, setFilter] = useState<"all" | ProductStatus>("all");
  const n = useNotice();
  const load = () => supabase.from("products").select("id,title,price_ksh,status,seller_id,is_vip,category_slug,created_at").order("created_at", { ascending: false })
    .then(({ data, error }) => { if (error) n.show(error, ""); setRows((data ?? []).map((p) => ({ ...p, price: Number(p.price_ksh) }))); });
  useEffect(() => { void load(); }, []);
  const setStatus = async (id: string, status: ProductStatus) => {
    const { error } = await supabase.from("products").update({ status }).eq("id", id);
    n.show(error, `Listing marked ${status}.`);
    if (!error) setRows(rows.map((r) => (r.id === id ? { ...r, status } : r)));
  };
  const remove = async (id: string, title: string) => {
    if (!confirmDo(`Delete "${title}" permanently?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    n.show(error, "Listing deleted.");
    if (!error) setRows(rows.filter((r) => r.id !== id));
  };
  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  return (
    <AdminShell>
      <PageTitle eyebrow="Catalogue" title="Product moderation" copy="Approve, reject, hide or delete any seller listing." />
      {n.el}
      <div className="mb-4 flex flex-wrap gap-2">{(["all", "pending", "active", "hidden", "rejected"] as const).map((f) => <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>{f} ({f === "all" ? rows.length : rows.filter((r) => r.status === f).length})</Button>)}</div>
      <Table
        head={["Listing", "Price", "Status", "Actions"]}
        rows={shown.map((p) => [
          <div><Link to="/product/$id" params={{ id: p.id }} className="block font-semibold hover:text-primary">{p.title}</Link><small className="text-muted-foreground">{p.category_slug} · {new Date(p.created_at).toLocaleDateString()}{p.is_vip ? " · VIP" : ""}</small></div>,
          formatKsh(p.price),
          <Badge variant="outline">{p.status}</Badge>,
          <span className="flex flex-wrap gap-2">
            <Button size="sm" disabled={p.status === "active"} onClick={() => void setStatus(p.id, "active")}>Approve</Button>
            <Button size="sm" variant="outline" disabled={p.status === "rejected"} onClick={() => void setStatus(p.id, "rejected")}>Reject</Button>
            <Button size="sm" variant="outline" disabled={p.status === "hidden"} onClick={() => void setStatus(p.id, "hidden")}>Hide</Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => void remove(p.id, p.title)}>Delete</Button>
          </span>,
        ])}
      />
    </AdminShell>
  );
}

export function AdminCategories() {
  const [rows, setRows] = useState<Array<{ slug: string; name: string; subcategories: string[]; position: number }>>([]);
  const [draft, setDraft] = useState({ name: "", subs: "" });
  const n = useNotice();
  const load = () => supabase.from("categories").select("*").order("position").then(({ data }) => setRows(data ?? []));
  useEffect(() => { void load(); }, []);
  const save = async (slug: string, name: string, subs: string) => {
    const { error } = await supabase.from("categories").update({ name, subcategories: subs.split(",").map((s) => s.trim()).filter(Boolean) }).eq("slug", slug);
    n.show(error, `${name} saved.`);
    if (!error) void load();
  };
  const add = async (e: FormEvent) => {
    e.preventDefault();
    const slug = draft.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) return;
    const { error } = await supabase.from("categories").insert({ slug, name: draft.name.trim(), subcategories: draft.subs.split(",").map((s) => s.trim()).filter(Boolean), position: rows.length + 1 });
    n.show(error, `${draft.name} added.`);
    if (!error) { setDraft({ name: "", subs: "" }); void load(); }
  };
  const remove = async (slug: string, name: string) => {
    if (!confirmDo(`Delete category "${name}"? Categories that still have listings cannot be deleted.`)) return;
    const { error } = await supabase.from("categories").delete().eq("slug", slug);
    n.show(error ? { message: error.message.includes("foreign key") ? "This category still has listings. Move or delete them first." : error.message } : null, `${name} deleted.`);
    if (!error) void load();
  };
  return (
    <AdminShell>
      <PageTitle eyebrow="Taxonomy" title="Categories & subcategories" copy="Edit names and subcategories (comma separated). Changes apply instantly." />
      {n.el}
      <form onSubmit={add} className="mb-6 grid gap-3 rounded-card border border-border bg-card p-5 md:grid-cols-[1fr_2fr_auto]">
        <Input placeholder="New category name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
        <Input placeholder="Subcategories, comma separated" value={draft.subs} onChange={(e) => setDraft({ ...draft, subs: e.target.value })} />
        <Button type="submit">Add category</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">{rows.map((c) => <CategoryEditor key={c.slug + c.subcategories.join()} c={c} onSave={save} onDelete={remove} />)}</div>
    </AdminShell>
  );
}
function CategoryEditor({ c, onSave, onDelete }: { c: { slug: string; name: string; subcategories: string[] }; onSave: (s: string, n: string, subs: string) => void; onDelete: (s: string, n: string) => void }) {
  const [name, setName] = useState(c.name);
  const [subs, setSubs] = useState(c.subcategories.join(", "));
  return (
    <div className="rounded-card border border-border bg-card p-5">
      <Input value={name} onChange={(e) => setName(e.target.value)} className="font-semibold" />
      <textarea value={subs} onChange={(e) => setSubs(e.target.value)} className="mt-3 min-h-20 w-full rounded-md border border-border bg-background p-2 text-sm" />
      <div className="mt-3 flex gap-2"><Button size="sm" onClick={() => onSave(c.slug, name, subs)}>Save</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(c.slug, c.name)}>Delete</Button></div>
    </div>
  );
}

export function AdminSubscriptions() {
  const [pk, setPk] = useState<Array<{ id: string; name: string; cadence: string; price_ksh: number; listing_limit: number; popular: boolean }>>([]);
  const [subs, setSubs] = useState<Array<{ id: string; user_id: string; package_id: string; status: string; started_at: string; expires_at: string | null }>>([]);
  const n = useNotice();
  const load = async () => {
    const [a, b] = await Promise.all([supabase.from("subscription_packages").select("*").order("price_ksh"), supabase.from("subscriptions").select("*").order("created_at", { ascending: false })]);
    setPk(a.data ?? []); setSubs(b.data ?? []);
  };
  useEffect(() => { void load(); }, []);
  const savePkg = async (id: string, price: number, limit: number) => {
    const { error } = await supabase.from("subscription_packages").update({ price_ksh: price, listing_limit: limit }).eq("id", id);
    n.show(error, "Package updated."); if (!error) void load();
  };
  const setSub = async (id: string, status: string) => {
    const { error } = await supabase.from("subscriptions").update({ status }).eq("id", id);
    n.show(error, `Subscription ${status}.`); if (!error) void load();
  };
  const delSub = async (id: string) => {
    if (!confirmDo("Delete this subscription?")) return;
    const { error } = await supabase.from("subscriptions").delete().eq("id", id);
    n.show(error, "Subscription deleted."); if (!error) void load();
  };
  return (
    <AdminShell>
      <PageTitle eyebrow="Revenue" title="Seller subscriptions" copy="Edit package prices and limits, and manage every seller plan." />
      {n.el}
      <div className="grid gap-4 md:grid-cols-3">{pk.map((p) => <PackageEditor key={p.id + p.price_ksh + p.listing_limit} p={p} onSave={savePkg} active={subs.filter((s) => s.package_id === p.id && s.status === "active").length} />)}</div>
      <h2 className="mb-3 mt-10 font-display text-xl font-bold">All subscriptions</h2>
      <Table head={["Seller ID", "Package", "Status", "Started", "Actions"]} rows={subs.map((s) => [
        <small className="font-mono">{s.user_id.slice(0, 8)}…</small>, s.package_id, <Badge variant="outline">{s.status}</Badge>, new Date(s.started_at).toLocaleDateString(),
        <span className="flex gap-2"><Button size="sm" variant="outline" onClick={() => void setSub(s.id, s.status === "active" ? "cancelled" : "active")}>{s.status === "active" ? "Cancel" : "Activate"}</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => void delSub(s.id)}>Delete</Button></span>,
      ])} />
      {!subs.length && <p className="mt-3 text-sm text-muted-foreground">No subscriptions yet.</p>}
    </AdminShell>
  );
}
function PackageEditor({ p, onSave, active }: { p: { id: string; name: string; cadence: string; price_ksh: number; listing_limit: number }; onSave: (id: string, price: number, limit: number) => void; active: number }) {
  const [price, setPrice] = useState(String(p.price_ksh));
  const [limit, setLimit] = useState(String(p.listing_limit));
  return (
    <div className="rounded-card border border-border bg-card p-5">
      <strong className="font-display text-lg">{p.name}</strong> <small className="text-muted-foreground">/ {p.cadence} · {active} active</small>
      <label className="mt-3 block text-xs font-semibold">Price (KSh)<Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1" /></label>
      <label className="mt-3 block text-xs font-semibold">Listing limit<Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} className="mt-1" /></label>
      <Button size="sm" className="mt-3" onClick={() => onSave(p.id, Number(price), Number(limit))}>Save</Button>
    </div>
  );
}

export function AdminVip() {
  const [rows, setRows] = useState<Array<{ id: string; title: string; is_vip: boolean; vip_expires_at: string | null; status: string }>>([]);
  const n = useNotice();
  const load = () => supabase.from("products").select("id,title,is_vip,vip_expires_at,status").order("is_vip", { ascending: false }).order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  useEffect(() => { void load(); }, []);
  const setVip = async (id: string, days: number | null) => {
    const { error } = await supabase.from("products").update(days ? { is_vip: true, vip_expires_at: new Date(Date.now() + days * 864e5).toISOString() } : { is_vip: false, vip_expires_at: null }).eq("id", id);
    n.show(error, days ? `VIP granted for ${days} days.` : "VIP removed."); if (!error) void load();
  };
  return (
    <AdminShell>
      <PageTitle eyebrow="Promotions" title="VIP advertisements" copy={`Grant or remove VIP placement. Prices: ${vipOptions.map((o) => `${o.duration} ${formatKsh(o.price)}`).join(" · ")}`} />
      {n.el}
      <Table head={["Listing", "Status", "VIP", "Actions"]} rows={rows.map((p) => [
        p.title, <Badge variant="outline">{p.status}</Badge>,
        p.is_vip ? <Badge className="bg-vip text-vip-foreground">VIP{p.vip_expires_at ? ` until ${new Date(p.vip_expires_at).toLocaleDateString()}` : ""}</Badge> : "—",
        <span className="flex flex-wrap gap-2">{[7, 14, 30].map((d) => <Button key={d} size="sm" variant="outline" onClick={() => void setVip(p.id, d)}>{d} days</Button>)}{p.is_vip && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => void setVip(p.id, null)}>Remove</Button>}</span>,
      ])} />
    </AdminShell>
  );
}

export function AdminReports() {
  const [rows, setRows] = useState<Array<{ id: string; reason: string; status: string; created_at: string; product_id: string; products: { title: string } | null }>>([]);
  const n = useNotice();
  const load = () => supabase.from("reports").select("id,reason,status,created_at,product_id,products(title)").order("created_at", { ascending: false }).then(({ data }) => setRows((data ?? []) as never));
  useEffect(() => { void load(); }, []);
  const resolve = async (id: string) => { const { error } = await supabase.from("reports").update({ status: "resolved" }).eq("id", id); n.show(error, "Report resolved."); if (!error) void load(); };
  const delListing = async (pid: string) => { if (!confirmDo("Delete the reported listing?")) return; const { error } = await supabase.from("products").delete().eq("id", pid); n.show(error, "Listing deleted."); if (!error) void load(); };
  const delReport = async (id: string) => { const { error } = await supabase.from("reports").delete().eq("id", id); n.show(error, "Report deleted."); if (!error) void load(); };
  return (
    <AdminShell>
      <PageTitle eyebrow="Trust & safety" title="Reported listings" copy="Reports filed by buyers from listing pages." />
      {n.el}
      <Table head={["Listing", "Reason", "Status", "Actions"]} rows={rows.map((r) => [
        r.products?.title ?? "Deleted listing", r.reason, <Badge variant="outline">{r.status}</Badge>,
        <span className="flex flex-wrap gap-2"><Button size="sm" disabled={r.status === "resolved"} onClick={() => void resolve(r.id)}>Resolve</Button><Button size="sm" variant="outline" onClick={() => void delListing(r.product_id)}>Delete listing</Button><Button size="sm" variant="ghost" onClick={() => void delReport(r.id)}>Dismiss</Button></span>,
      ])} />
      {!rows.length && <p className="mt-3 text-sm text-muted-foreground">No reports yet.</p>}
    </AdminShell>
  );
}

export function AdminPayments() {
  const [rows, setRows] = useState<Array<{ id: string; user_id: string; amount_ksh: number; method: string; status: string; purpose: string | null; reference: string | null; created_at: string }>>([]);
  const n = useNotice();
  const load = () => supabase.from("payments").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  useEffect(() => { void load(); }, []);
  const setStatus = async (id: string, status: string) => { const { error } = await supabase.from("payments").update({ status }).eq("id", id); n.show(error, `Payment marked ${status}.`); if (!error) void load(); };
  const del = async (id: string) => { if (!confirmDo("Delete this payment record?")) return; const { error } = await supabase.from("payments").delete().eq("id", id); n.show(error, "Payment deleted."); if (!error) void load(); };
  return (
    <AdminShell>
      <PageTitle eyebrow="Finance" title="Payments" copy="Simulated payment records stored in the database." />
      {n.el}
      <Table head={["Reference", "Purpose", "Amount", "Method", "Status", "Actions"]} rows={rows.map((r) => [
        r.reference ?? r.id.slice(0, 8), r.purpose ?? "—", formatKsh(r.amount_ksh), r.method, <Badge variant="outline">{r.status}</Badge>,
        <span className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => void setStatus(r.id, "success")}>Success</Button><Button size="sm" variant="outline" onClick={() => void setStatus(r.id, "failed")}>Failed</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => void del(r.id)}>Delete</Button></span>,
      ])} />
      {!rows.length && <p className="mt-3 text-sm text-muted-foreground">No payments recorded yet.</p>}
    </AdminShell>
  );
}

export function AdminAnalytics() {
  const [byCat, setByCat] = useState<Array<[string, number]>>([]);
  const [totals, setTotals] = useState({ views: 0, active: 0, favs: 0 });
  useEffect(() => {
    void (async () => {
      const [{ data: p }, { count }] = await Promise.all([supabase.from("products").select("category_slug,views,status"), supabase.from("favorites").select("product_id", { count: "exact", head: true })]);
      const m = new Map<string, number>();
      (p ?? []).forEach((x) => m.set(x.category_slug, (m.get(x.category_slug) ?? 0) + 1));
      setByCat([...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8));
      setTotals({ views: (p ?? []).reduce((a, b) => a + b.views, 0), active: (p ?? []).filter((x) => x.status === "active").length, favs: count ?? 0 });
    })();
  }, []);
  const max = Math.max(1, ...byCat.map((x) => x[1]));
  return (
    <AdminShell>
      <PageTitle eyebrow="Insights" title="Platform analytics" copy="Calculated live from the database." />
      <div className="grid gap-4 sm:grid-cols-3"><Stat label="Listing views" value={String(totals.views)} /><Stat label="Live listings" value={String(totals.active)} /><Stat label="Favorites saved" value={String(totals.favs)} /></div>
      <div className="mt-8 rounded-card border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">Listings by category</h2>
        <div className="mt-5 grid gap-3">{byCat.length ? byCat.map(([slug, c]) => (
          <div key={slug}><div className="flex justify-between text-sm"><span>{categories.find((x) => x.slug === slug)?.name ?? slug}</span><span className="text-muted-foreground">{c}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${(c / max) * 100}%` }} /></div></div>
        )) : <p className="text-sm text-muted-foreground">No listings yet.</p>}</div>
      </div>
    </AdminShell>
  );
}

export function AdminAudit() {
  const [rows, setRows] = useState<Array<{ id: string; created_at: string; actor_email: string | null; action: string; target_table: string | null; details: unknown }>>([]);
  useEffect(() => { void supabase.from("audit_logs").select("id,created_at,actor_email,action,target_table,details").order("created_at", { ascending: false }).limit(200).then(({ data }) => setRows(data ?? [])); }, []);
  const label = (d: unknown) => { const o = (d ?? {}) as Record<string, string | null>; return o["title"] || o["name"] || o["email"] || o["role"] || o["status"] || "—"; };
  return (
    <AdminShell>
      <PageTitle eyebrow="Accountability" title="Audit log" copy="Every administrator change is recorded automatically." />
      <Table head={["When", "Admin", "Action", "Area", "Target"]} rows={rows.map((r) => [new Date(r.created_at).toLocaleString(), r.actor_email ?? "—", r.action, r.target_table ?? "—", label(r.details)])} />
      {!rows.length && <p className="mt-3 text-sm text-muted-foreground">No admin actions recorded yet.</p>}
    </AdminShell>
  );
}

export function AdminSettings() {
  return (
    <AdminShell>
      <PageTitle eyebrow="Configuration" title="Platform settings" copy="Marketplace rules currently enforced." />
      <div className="grid gap-4 md:grid-cols-2">
        <Stat label="Max photos per listing" value="5" />
        <Stat label="Max videos per listing" value="1" />
        <Stat label="New listings start as" value="Pending review" />
        <Stat label="Add another administrator" value="Users → set role to admin" />
      </div>
    </AdminShell>
  );
}

export function AdminDatabasePage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; full_name: string; email: string; role: string; created_at: string }>>([]);
  const [productRows, setProductRows] = useState<Array<{ id: string; title: string; seller_id: string; price: number; status: string; created_at: string }>>([]);

  const loadAdminData = async () => {
    setLoading(true);
    setError("");
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) {
      setSessionReady(false);
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setSessionReady(true);
    const { data: profile, error: profileError } = await getMyRoleRow();
    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }
    if (profile?.role !== "admin") {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setIsAdmin(true);
    const [{ data: profileRows, error: usersError }, { data: productsData, error: productsError }] = await Promise.all([
      supabase.rpc("admin_users"),
      supabase.from("products").select("id,title,seller_id,price_ksh,status,created_at").order("created_at", { ascending: false }),
    ]);
    if (usersError) {
      setError(usersError.message);
      setLoading(false);
      return;
    }
    if (productsError) {
      setError(productsError.message);
      setLoading(false);
      return;
    }
    setUsers(
      (profileRows ?? []).map((row) => ({
        id: row.id,
        full_name: row.full_name ?? "",
        email: row.email ?? "",
        role: row.role ?? "buyer",
        created_at: row.created_at,
      })),
    );
    setProductRows(
      (productsData ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        seller_id: row.seller_id,
        price: Number(row.price_ksh),
        status: row.status,
        created_at: row.created_at,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setSigningIn(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setSigningIn(false);
      return;
    }
    setPassword("");
    await loadAdminData();
    setSigningIn(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSessionReady(false);
    setIsAdmin(false);
    setUsers([]);
    setProductRows([]);
    nav({ to: "/masteradmin", replace: true });
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong text-surface-foreground">
        <p>Loading admin access…</p>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong px-5 text-surface-foreground">
        <form onSubmit={signIn} className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <Brand inverted />
          <h1 className="mt-8 font-display text-3xl font-bold">Admin database</h1>
          <p className="mt-2 text-sm text-surface-muted">Sign in with the Supabase Auth admin account.</p>
          {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <label className="mt-6 block text-sm">
            Admin email
            <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-11 bg-background text-foreground" />
          </label>
          <label className="mt-4 block text-sm">
            Password
            <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-11 bg-background text-foreground" />
          </label>
          <Button className="mt-6 w-full" size="lg" type="submit" disabled={signingIn}>
            {signingIn ? "Signing in…" : "Open admin database"}
          </Button>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong px-5 text-surface-foreground">
        <div className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <Brand inverted />
          <h1 className="mt-8 font-display text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-surface-muted">This account does not have the admin role.</p>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          <Button className="mt-6" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-surface-strong text-surface-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <Brand inverted />
            <p className="mt-1 text-xs text-surface-muted">Live Supabase database</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-8 p-5 lg:p-8">
        <PageTitle eyebrow="Administration" title="Users & products" copy="Live records from the VroomEver Supabase database." />
        {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Users" value={String(users.length)} />
          <Stat label="Products" value={String(productRows.length)} />
        </div>
        <section>
          <h2 className="mb-3 font-display text-xl font-bold">All users and roles</h2>
          <Table
            head={["Name", "Email", "Role", "Created"]}
            rows={users.map((user) => [
              <div>
                <strong className="block">{user.full_name || "Unnamed user"}</strong>
                <small className="text-muted-foreground">{user.id}</small>
              </div>,
              user.email,
              <Badge variant="outline">{user.role}</Badge>,
              new Date(user.created_at).toLocaleString(),
            ])}
          />
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl font-bold">All products posted</h2>
          <Table
            head={["Product", "Seller ID", "Price", "Status", "Created"]}
            rows={productRows.map((product) => [
              <strong>{product.title}</strong>,
              <span className="font-mono text-xs">{product.seller_id}</span>,
              formatKsh(product.price),
              <Badge variant="outline">{product.status}</Badge>,
              new Date(product.created_at).toLocaleString(),
            ])}
          />
        </section>
      </main>
    </div>
  );
}
