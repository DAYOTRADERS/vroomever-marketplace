import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3, Boxes, CircleDollarSign, FileClock, Flag, LayoutDashboard, LogOut,
  Settings, ShieldCheck, Sparkles, Tags, UsersRound, type LucideIcon,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brand } from "./brand";
import { PageTitle } from "./marketplace-pages";
import { categories, formatKsh, packages, products, vipOptions } from "@/data/marketplace";

const nav: { to: string; label: string; icon: LucideIcon }[] = [
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
  { to: "/masteradmin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-muted/40 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-border bg-surface-strong text-surface-foreground lg:min-h-screen">
        <div className="flex items-center justify-between p-5">
          <Brand inverted />
          <Badge className="bg-primary/20 text-primary">Admin</Badge>
        </div>
        <nav className="grid gap-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${path === item.to ? "bg-primary text-primary-foreground" : "text-surface-muted hover:bg-white/5"}`}
            >
              <item.icon className="size-4" /> {item.label}
            </Link>
          ))}
          <Link to="/masteradmin/login" className="mt-3 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-surface-muted hover:bg-white/5">
            <LogOut className="size-4" /> Sign out
          </Link>
        </nav>
      </aside>
      <main className="p-5 lg:p-8">{children}</main>
    </div>
  );
}

export function AdminLoginPage() {
  const nav = useNavigate();
  const submit = (e: FormEvent) => { e.preventDefault(); nav({ to: "/masteradmin" }); };
  return (
    <div className="grid min-h-screen place-items-center bg-surface-strong px-5 text-surface-foreground">
      <form onSubmit={submit} className="w-full max-w-sm rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <Brand inverted />
        <h1 className="mt-8 font-display text-3xl font-bold">Master admin</h1>
        <p className="mt-2 text-sm text-surface-muted">Restricted control center access.</p>
        <label className="mt-6 block text-sm">Admin email<Input required type="email" className="mt-2 h-11 bg-background text-foreground" /></label>
        <label className="mt-4 block text-sm">Password<Input required type="password" className="mt-2 h-11 bg-background text-foreground" /></label>
        <Button className="mt-6 w-full" size="lg" type="submit"><ShieldCheck /> Enter control center</Button>
      </form>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-card border border-border bg-card p-5 shadow-card"><span className="text-sm text-muted-foreground">{label}</span><strong className="mt-2 block font-display text-3xl">{value}</strong></div>;
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead><tr className="border-b border-border bg-muted/50 text-left text-xs font-bold uppercase text-muted-foreground">{head.map((h) => <th key={h} className="px-5 py-3">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-b border-border last:border-0">{r.map((c, j) => <td key={j} className="px-5 py-4">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function AdminOverview() {
  return <AdminShell>
    <PageTitle eyebrow="Control center" title="Marketplace overview" copy="Simulated platform health for Stage 1." />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Total users" value="18,402" /><Stat label="Live listings" value="24,118" />
      <Stat label="Active subscriptions" value="1,247" /><Stat label="Revenue (30d)" value={formatKsh(3820000)} />
    </div>
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="rounded-card border border-border bg-card p-6"><h2 className="font-display text-xl font-bold">Listings per week</h2><div className="mt-8 flex h-48 items-end gap-3">{[40, 65, 58, 92, 74, 110, 96, 128].map((h, i) => <div key={i} className="flex-1 rounded-t bg-primary/70" style={{ height: h }} />)}</div></div>
      <div className="rounded-card border border-border bg-card p-6"><h2 className="font-display text-xl font-bold">Pending moderation</h2><div className="mt-4 grid gap-3">{products.map((p) => <div key={p.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0"><span className="truncate text-sm">{p.title}</span><span className="flex gap-2"><Button size="sm">Approve</Button><Button size="sm" variant="outline">Reject</Button></span></div>)}</div></div>
    </div>
  </AdminShell>;
}

export function AdminUsers() {
  const [users, setUsers] = useState([
    { name: "Amina Wanjiku", email: "amina@example.co.ke", role: "Buyer", status: "Active" },
    { name: "Prestige Motors KE", email: "sales@prestige.co.ke", role: "Seller", status: "Verified" },
    { name: "Gadget Grid", email: "hello@gadgetgrid.co.ke", role: "Seller", status: "Active" },
    { name: "Brian Otieno", email: "brian@example.co.ke", role: "Buyer", status: "Suspended" },
  ]);
  const toggle = (i: number) => setUsers(users.map((u, x) => x === i ? { ...u, status: u.status === "Suspended" ? "Active" : "Suspended" } : u));
  return <AdminShell>
    <PageTitle eyebrow="People" title="Users & roles" copy="Manage buyers, sellers and administrators." />
    <Table head={["User", "Role", "Status", "Actions"]} rows={users.map((u, i) => [
      <div><strong className="block">{u.name}</strong><small className="text-muted-foreground">{u.email}</small></div>,
      <Badge variant="outline">{u.role}</Badge>,
      <Badge className={u.status === "Suspended" ? "bg-destructive text-destructive-foreground" : ""}>{u.status}</Badge>,
      <Button size="sm" variant="outline" onClick={() => toggle(i)}>{u.status === "Suspended" ? "Reinstate" : "Suspend"}</Button>,
    ])} />
  </AdminShell>;
}

export function AdminProducts() {
  const [rows, setRows] = useState(products.map((p, i) => ({ ...p, status: i === 1 ? "Pending" : "Approved" })));
  const set = (i: number, status: string) => setRows(rows.map((r, x) => x === i ? { ...r, status } : r));
  return <AdminShell>
    <PageTitle eyebrow="Catalogue" title="Product moderation" copy="Approve, reject, hide or remove listings." />
    <Table head={["Listing", "Price", "Status", "Actions"]} rows={rows.map((p, i) => [
      <div className="flex items-center gap-3"><img src={p.image} alt="" width={64} height={48} loading="lazy" className="size-12 rounded-md object-cover" /><span><strong className="block">{p.title}</strong><small className="text-muted-foreground">{p.seller}</small></span></div>,
      formatKsh(p.price),
      <Badge variant="outline">{p.status}</Badge>,
      <span className="flex flex-wrap gap-2"><Button size="sm" onClick={() => set(i, "Approved")}>Approve</Button><Button size="sm" variant="outline" onClick={() => set(i, "Rejected")}>Reject</Button><Button size="sm" variant="ghost" onClick={() => set(i, "Hidden")}>Hide</Button></span>,
    ])} />
  </AdminShell>;
}

export function AdminCategories() {
  return <AdminShell>
    <PageTitle eyebrow="Taxonomy" title="Categories & subcategories" copy="Centralized configuration powering the whole marketplace." />
    <div className="grid gap-4 md:grid-cols-2">{categories.map((c) => (
      <div key={c.slug} className="rounded-card border border-border bg-card p-5">
        <div className="flex items-center gap-3"><c.icon className="text-primary" /><strong>{c.name}</strong><Badge variant="outline" className="ml-auto">{c.subcategories.length}</Badge></div>
        <div className="mt-3 flex flex-wrap gap-2">{c.subcategories.map((s) => <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs">{s}</span>)}</div>
      </div>
    ))}</div>
  </AdminShell>;
}

export function AdminSubscriptions() {
  return <AdminShell>
    <PageTitle eyebrow="Revenue" title="Seller subscriptions" copy="Packages, limits and active seller plans." />
    <Table head={["Package", "Cadence", "Price", "Listing limit", "Active sellers"]} rows={packages.map((p, i) => [
      <strong>{p.name}</strong>, p.cadence, formatKsh(p.price), `${p.limit}`, `${[612, 431, 204][i]}`,
    ])} />
  </AdminShell>;
}

export function AdminVip() {
  return <AdminShell>
    <PageTitle eyebrow="Promotions" title="VIP advertisements" copy="Durations, pricing and active promotions." />
    <Table head={["Duration", "Price", "Active", "Actions"]} rows={vipOptions.map((o, i) => [
      o.duration, formatKsh(o.price), `${[38, 74, 29, 61][i]}`, <Button size="sm" variant="outline">Adjust</Button>,
    ])} />
  </AdminShell>;
}

export function AdminReports() {
  const [rows, setRows] = useState([
    { item: "Graphite Pro 256GB, Mint", reason: "Suspected counterfeit", status: "Open" },
    { item: "Serviced 50×100 Plots", reason: "Misleading location", status: "Open" },
    { item: "Emerald 3-Seater Premium Sofa", reason: "Duplicate listing", status: "Resolved" },
  ]);
  return <AdminShell>
    <PageTitle eyebrow="Trust & safety" title="Reported listings" copy="Review and action buyer reports." />
    <Table head={["Listing", "Reason", "Status", "Actions"]} rows={rows.map((r, i) => [
      r.item, r.reason, <Badge variant="outline">{r.status}</Badge>,
      <span className="flex gap-2"><Button size="sm" onClick={() => setRows(rows.map((x, y) => y === i ? { ...x, status: "Resolved" } : x))}>Resolve</Button><Button size="sm" variant="outline">Delete listing</Button></span>,
    ])} />
  </AdminShell>;
}

export function AdminPayments() {
  const rows = [
    ["VRM-10241", "Prestige Motors KE", "Silver package", 3500, "M-Pesa", "Successful"],
    ["VRM-10242", "Gadget Grid", "VIP 7 days", 950, "Card", "Failed"],
    ["VRM-10243", "Nairobi Living", "Gold package", 24000, "M-Pesa", "Successful"],
  ] as const;
  return <AdminShell>
    <PageTitle eyebrow="Finance" title="Simulated payments" copy="Stage 1 transactions are simulated only." />
    <Table head={["Reference", "Seller", "Item", "Amount", "Method", "Status"]} rows={rows.map((r) => [
      r[0], r[1], r[2], formatKsh(r[3] as number), r[4],
      <Badge className={r[5] === "Failed" ? "bg-destructive text-destructive-foreground" : ""}>{r[5]}</Badge>,
    ])} />
  </AdminShell>;
}

export function AdminAnalytics() {
  return <AdminShell>
    <PageTitle eyebrow="Insights" title="Platform analytics" copy="Traffic, conversion and category performance." />
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="Monthly visitors" value="412K" /><Stat label="Listing conversion" value="6.8%" /><Stat label="Avg. session" value="4m 12s" /></div>
    <div className="mt-8 rounded-card border border-border bg-card p-6"><h2 className="font-display text-xl font-bold">Top categories</h2><div className="mt-5 grid gap-3">{categories.slice(0, 6).map((c, i) => <div key={c.slug}><div className="flex justify-between text-sm"><span>{c.name}</span><span className="text-muted-foreground">{90 - i * 12}%</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${90 - i * 12}%` }} /></div></div>)}</div></div>
  </AdminShell>;
}

export function AdminAudit() {
  const rows = [
    ["Today 09:14", "admin@vroomever.com", "Approved listing", "Toyota Land Cruiser V8"],
    ["Today 08:52", "admin@vroomever.com", "Suspended user", "Brian Otieno"],
    ["Yesterday 17:30", "ops@vroomever.com", "Updated package price", "Silver package"],
  ];
  return <AdminShell>
    <PageTitle eyebrow="Accountability" title="Audit log" copy="Every administrative action is recorded." />
    <Table head={["When", "Actor", "Action", "Target"]} rows={rows} />
  </AdminShell>;
}

export function AdminSettings() {
  return <AdminShell>
    <PageTitle eyebrow="Configuration" title="Platform settings" copy="Global marketplace controls." />
    <div className="grid gap-5 rounded-card border border-border bg-card p-6 md:grid-cols-2">
      <label className="text-sm font-semibold">Platform name<Input className="mt-2" defaultValue="Vroomever" /></label>
      <label className="text-sm font-semibold">Support email<Input className="mt-2" defaultValue="support@vroomever.com" /></label>
      <label className="text-sm font-semibold">Max photos per listing<Input className="mt-2" type="number" defaultValue={5} /></label>
      <label className="text-sm font-semibold">Max videos per listing<Input className="mt-2" type="number" defaultValue={1} /></label>
      <div className="md:col-span-2"><Button>Save settings</Button></div>
    </div>
  </AdminShell>;
}
