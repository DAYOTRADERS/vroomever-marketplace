import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3, Boxes, CircleDollarSign, FileClock, Flag, LayoutDashboard, LogOut,
  Settings, ShieldCheck, Sparkles, Tags, UsersRound, type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
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
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate({ to: "/masteradmin/login", replace: true });
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.session.user.id).maybeSingle();
      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        nav({ to: "/masteradmin/login", replace: true });
        return;
      }
      setReady(true);
    });
  }, [navigate]);

  if (!ready) return <div className="grid min-h-screen place-items-center bg-surface-strong text-surface-foreground"><p>Checking admin access…</p></div>;

  return (
    <div className="min-h-screen bg-muted/40 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-border bg-surface-strong text-surface-foreground lg:min-h-screen">
        <div className="flex items-center justify-between p-5"><Brand inverted /><Badge className="bg-primary/20 text-primary">Admin</Badge></div>
        <nav className="grid gap-1 p-3">
          {nav.map((item) => <Link key={item.to} to={item.to} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${path === item.to ? "bg-primary text-primary-foreground" : "text-surface-muted hover:bg-white/5"}`}><item.icon className="size-4" /> {item.label}</Link>)}
          <button type="button" onClick={async()=>{await supabase.auth.signOut(); navigate({to:"/masteradmin/login"});}} className="mt-3 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-surface-muted hover:bg-white/5"><LogOut className="size-4" /> Sign out</button>
        </nav>
      </aside>
      <main className="p-5 lg:p-8">{children}</main>
    </div>
  );
}

export function AdminLoginPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError(signInError.message); setLoading(false); return; }
    const { data: sessionData } = await supabase.auth.getSession();
    const { data: profile } = sessionData.session
      ? await supabase.from("profiles").select("role").eq("id", sessionData.session.user.id).maybeSingle()
      : { data: null };
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
        <Brand inverted /><h1 className="mt-8 font-display text-3xl font-bold">Master admin</h1>
        <p className="mt-2 text-sm text-surface-muted">Secure Vroomever control center access.</p>
        {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <label className="mt-6 block text-sm">Admin email<Input name="email" required type="email" className="mt-2 h-11 bg-background text-foreground" /></label>
        <label className="mt-4 block text-sm">Password<Input name="password" required type="password" className="mt-2 h-11 bg-background text-foreground" /></label>
        <Button className="mt-6 w-full" size="lg" type="submit" disabled={loading}>{loading ? "Signing in…" : "Enter control center"}<ShieldCheck /></Button>
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
 const [users,setUsers]=useState(0); const [listings,setListings]=useState(0); const [pending,setPending]=useState<Array<{id:string;title:string;status:string}>>([]);
 useEffect(()=>{Promise.all([supabase.rpc("admin_users"),supabase.from("products").select("id,title,status").order("created_at",{ascending:false}),supabase.from("categories").select("slug")]).then(([u,p,c])=>{setUsers((u.data??[]).length);setListings((p.data??[]).length);setPending((p.data??[]).filter(x=>x.status==="pending").slice(0,10));});},[]);
 return <AdminShell><PageTitle eyebrow="Control center" title="Marketplace overview" copy="Live Vroomever platform data from Supabase."/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Total users" value={String(users)}/><Stat label="Database listings" value={String(listings)}/><Stat label="Pending moderation" value={String(pending.length)}/><Stat label="Categories" value="21"/></div><div className="mt-8 rounded-card border border-border bg-card p-6"><h2 className="font-display text-xl font-bold">Pending moderation</h2><div className="mt-4 grid gap-3">{pending.length?pending.map(p=><div key={p.id} className="flex items-center justify-between gap-3 border-b border-border pb-3"><span className="truncate text-sm">{p.title}</span><Badge variant="outline">{p.status}</Badge></div>):<p className="text-sm text-muted-foreground">No pending listings.</p>}</div></div></AdminShell>;
}


export function AdminUsers() {
 const [rows,setRows]=useState<Array<{id:string;name:string;email:string;role:string;created_at:string}>>([]);
 const [busy,setBusy]=useState("");
 const load=async()=>{const {data}=await supabase.rpc("admin_users");setRows((data??[]).map(u=>({id:u.id,name:u.full_name||"Unnamed user",email:u.email||"",role:u.role||"buyer",created_at:u.created_at})));};
 useEffect(()=>{void load();},[]);
 const setRole=async(id:string,role:"buyer"|"seller"|"admin")=>{setBusy(id);const {error}=await supabase.rpc("admin_set_user_role",{target_user_id:id,target_role:role});if(!error)await load();setBusy("");};
 return <AdminShell><PageTitle eyebrow="People" title="Users & roles" copy="Live buyer, seller and administrator accounts. Correct legacy role mismatches here."/><Table head={["User","Role","Created","Role actions"]} rows={rows.map(u=>[<div><strong className="block">{u.name}</strong><small className="text-muted-foreground">{u.email}</small></div>,<Badge variant="outline">{u.role}</Badge>,new Date(u.created_at).toLocaleString(),<div className="flex flex-wrap gap-2">{(["buyer","seller","admin"] as const).map(role=><Button key={role} size="sm" variant={u.role===role?"default":"outline"} disabled={busy===u.id||u.role===role} onClick={()=>void setRole(u.id,role)}>{busy===u.id?"Saving…":role}</Button>)}</div>])}/></AdminShell>;
}


export function AdminProducts() {
 const [rows,setRows]=useState<Array<{id:string;title:string;price:number;status:string;seller_id:string}>>([]);
 useEffect(()=>{supabase.from("products").select("id,title,price_ksh,status,seller_id").order("created_at",{ascending:false}).then(({data})=>setRows((data??[]).map(p=>({...p,price:Number(p.price_ksh)}))));},[]);
 const setStatus=async(id:string,status:string)=>{const {error}=await supabase.from("products").update({status}).eq("id",id);if(!error)setRows(rows.map(r=>r.id===id?{...r,status}:r));};
 return <AdminShell><PageTitle eyebrow="Catalogue" title="Product moderation" copy="Live listings stored in Supabase."/><Table head={["Listing","Price","Status","Actions"]} rows={rows.map(p=>[<div><strong className="block">{p.title}</strong><small className="text-muted-foreground">{p.seller_id}</small></div>,formatKsh(p.price),<Badge variant="outline">{p.status}</Badge>,<span className="flex flex-wrap gap-2"><Button size="sm" onClick={()=>void setStatus(p.id,"active")}>Approve</Button><Button size="sm" variant="outline" onClick={()=>void setStatus(p.id,"rejected")}>Reject</Button><Button size="sm" variant="ghost" onClick={()=>void setStatus(p.id,"hidden")}>Hide</Button></span>])}/></AdminShell>;
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
 const [rows,setRows]=useState<Array<{name:string;cadence:string;price:number;limit:number;active:number}>>([]);
 useEffect(()=>{(async()=>{const [{data:pkgs},{data:subs}]=await Promise.all([supabase.from("subscription_packages").select("id,name,cadence,price_ksh,listing_limit"),supabase.from("subscriptions").select("package_id").eq("status","active")]);const counts=new Map<string,number>();(subs??[]).forEach(s=>counts.set(s.package_id,(counts.get(s.package_id)??0)+1));setRows((pkgs??[]).map(p=>({name:p.name,cadence:p.cadence,price:Number(p.price_ksh),limit:p.listing_limit,active:counts.get(p.id)??0})));})()},[]);
 return <AdminShell><PageTitle eyebrow="Revenue" title="Seller subscriptions" copy="Live packages and active seller subscriptions from Supabase."/><Table head={["Package","Cadence","Price","Listing limit","Active sellers"]} rows={rows.map(p=>[<strong>{p.name}</strong>,p.cadence,formatKsh(p.price),String(p.limit),String(p.active)])}/></AdminShell>;
}

export function AdminVip() {
 const [rows,setRows]=useState<Array<{id:string;product:string;duration:number;amount:number;status:string;expires:string|null}>>([]);
 const load=async()=>{const {data}=await supabase.from("vip_promotions").select("id,product_id,duration_days,amount_ksh,status,expires_at").order("created_at",{ascending:false});const ids=(data??[]).map(x=>x.product_id);const {data:productsData}=ids.length?await supabase.from("products").select("id,title").in("id",ids):{data:[]};const names=new Map((productsData??[]).map(p=>[p.id,p.title]));setRows((data??[]).map(x=>({id:x.id,product:names.get(x.product_id)??x.product_id,duration:x.duration_days,amount:Number(x.amount_ksh),status:x.status,expires:x.expires_at})));};
 useEffect(()=>{void load()},[]);
 const setStatus=async(id:string,status:string)=>{const {error}=await supabase.from("vip_promotions").update({status}).eq("id",id);if(!error){await supabase.rpc("admin_log",{p_action:"update_vip_status",p_target_type:"vip_promotion",p_target_id:id,p_details:{status}});await load();}};
 return <AdminShell><PageTitle eyebrow="Promotions" title="VIP advertisements" copy="Live VIP promotion records."/><Table head={["Listing","Duration","Amount","Status","Expires","Actions"]} rows={rows.map(p=>[p.product,`${p.duration} days`,formatKsh(p.amount),<Badge variant="outline">{p.status}</Badge>,p.expires?new Date(p.expires).toLocaleString():"—",<div className="flex gap-2"><Button size="sm" onClick={()=>void setStatus(p.id,"active")}>Activate</Button><Button size="sm" variant="outline" onClick={()=>void setStatus(p.id,"cancelled")}>Cancel</Button></div>])}/></AdminShell>;
}

export function AdminReports() {
 const [rows,setRows]=useState<Array<{id:string;item:string;reason:string;status:string;created:string}>>([]);
 const load=async()=>{const {data}=await supabase.from("reports").select("id,product_id,reason,status,created_at").order("created_at",{ascending:false});const ids=(data??[]).map(x=>x.product_id).filter(Boolean) as string[];const {data:ps}=ids.length?await supabase.from("products").select("id,title").in("id",ids):{data:[]};const names=new Map((ps??[]).map(p=>[p.id,p.title]));setRows((data??[]).map(x=>({id:x.id,item:x.product_id?names.get(x.product_id)??x.product_id:"Account/report",reason:x.reason,status:x.status,created:x.created_at})));};
 useEffect(()=>{void load()},[]);
 const resolve=async(id:string,status:"resolved"|"dismissed")=>{const {error}=await supabase.from("reports").update({status,resolved_at:new Date().toISOString()}).eq("id",id);if(!error){await supabase.rpc("admin_log",{p_action:"update_report",p_target_type:"report",p_target_id:id,p_details:{status}});await load();}};
 return <AdminShell><PageTitle eyebrow="Trust & safety" title="Reported listings" copy="Live reports submitted to the marketplace."/><Table head={["Listing","Reason","Status","Created","Actions"]} rows={rows.map(r=>[r.item,r.reason,<Badge variant="outline">{r.status}</Badge>,new Date(r.created).toLocaleString(),<div className="flex gap-2"><Button size="sm" onClick={()=>void resolve(r.id,"resolved")}>Resolve</Button><Button size="sm" variant="outline" onClick={()=>void resolve(r.id,"dismissed")}>Dismiss</Button></div>])}/></AdminShell>;
}

export function AdminPayments() {
 const [rows,setRows]=useState<Array<{reference:string;user:string;purpose:string;amount:number;method:string;status:string;created:string}>>([]);
 useEffect(()=>{(async()=>{const [{data:payments},{data:users}]=await Promise.all([supabase.from("payments").select("id,user_id,amount_ksh,method,status,purpose,reference,created_at").order("created_at",{ascending:false}),supabase.rpc("admin_users")]);const names=new Map((users??[]).map(u=>[u.id,u.full_name||u.email]));setRows((payments??[]).map(p=>({reference:p.reference??p.id,user:names.get(p.user_id)??p.user_id,purpose:p.purpose??"—",amount:Number(p.amount_ksh),method:p.method,status:p.status,created:p.created_at})));})()},[]);
 return <AdminShell><PageTitle eyebrow="Finance" title="Payments" copy="Live payment records from Supabase."/><Table head={["Reference","User","Purpose","Amount","Method","Status","Created"]} rows={rows.map(p=>[p.reference,p.user,p.purpose,formatKsh(p.amount),p.method,<Badge variant="outline">{p.status}</Badge>,new Date(p.created).toLocaleString()])}/></AdminShell>;
}

export function AdminAnalytics() {
 const [stats,setStats]=useState({users:0,listings:0,views:0,revenue:0});
 const [cats,setCats]=useState<Array<{name:string;count:number}>>([]);
 useEffect(()=>{(async()=>{const [{data:users},{data:ps},{data:payments},{data:categoriesData}]=await Promise.all([supabase.rpc("admin_users"),supabase.from("products").select("views,category_slug"),supabase.from("payments").select("amount_ksh").eq("status","successful"),supabase.from("categories").select("name,slug")]);const catNames=new Map((categoriesData??[]).map(x=>[x.slug,x.name]));const counts=new Map<string,number>();(ps??[]).forEach(p=>counts.set(p.category_slug,(counts.get(p.category_slug)??0)+1));setStats({users:(users??[]).length,listings:(ps??[]).length,views:(ps??[]).reduce((s,p)=>s+Number(p.views??0),0),revenue:(payments??[]).reduce((s,p)=>s+Number(p.amount_ksh??0),0)});setCats([...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([slug,count])=>({name:catNames.get(slug)??slug,count})));})()},[]);
 return <AdminShell><PageTitle eyebrow="Insights" title="Platform analytics" copy="Derived from live users, listings, views and successful payments."/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Users" value={String(stats.users)}/><Stat label="Listings" value={String(stats.listings)}/><Stat label="Listing views" value={stats.views.toLocaleString()}/><Stat label="Successful payments" value={formatKsh(stats.revenue)}/></div><div className="mt-8 rounded-card border border-border bg-card p-6"><h2 className="font-display text-xl font-bold">Listings by category</h2><div className="mt-5 grid gap-3">{cats.map(c=><div key={c.name}><div className="flex justify-between text-sm"><span>{c.name}</span><span className="text-muted-foreground">{c.count}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{width:`${stats.listings?Math.round(c.count/stats.listings*100):0}%`}}/></div></div>)}</div></div></AdminShell>;
}

export function AdminAudit() {
 const [rows,setRows]=useState<Array<{when:string;actor:string;action:string;target:string}>>([]);
 useEffect(()=>{(async()=>{const [{data:logs},{data:users}]=await Promise.all([supabase.from("audit_logs").select("id,actor_id,action,target_type,target_id,details,created_at").order("created_at",{ascending:false}),supabase.rpc("admin_users")]);const names=new Map((users??[]).map(u=>[u.id,u.email||u.full_name]));setRows((logs??[]).map(l=>({when:new Date(l.created_at).toLocaleString(),actor:names.get(l.actor_id)??l.actor_id??"System",action:l.action,target:l.target_type?(l.target_id?`${l.target_type} · ${l.target_id}`:l.target_type):"—"})));})()},[]);
 return <AdminShell><PageTitle eyebrow="Accountability" title="Audit log" copy="Administrative actions recorded by Vroomever."/><Table head={["When","Actor","Action","Target"]} rows={rows.map(r=>[r.when,r.actor,r.action,r.target])}/></AdminShell>;
}

export function AdminSettings() {
 const [name,setName]=useState("Vroomever"); const [support,setSupport]=useState("support@vroomever.com"); const [photos,setPhotos]=useState("5"); const [videos,setVideos]=useState("1"); const [message,setMessage]=useState("");
 useEffect(()=>{supabase.from("platform_settings").select("key,value").then(({data})=>{for(const row of data??[]){if(row.key==="platform_name")setName(String(row.value?.value??row.value??"Vroomever"));if(row.key==="support_email")setSupport(String(row.value?.value??row.value??"support@vroomever.com"));if(row.key==="max_photos")setPhotos(String(row.value?.value??row.value??5));if(row.key==="max_videos")setVideos(String(row.value?.value??row.value??1));}})},[]);
 const save=async()=>{setMessage("");const entries=[["platform_name",{value:name}],["support_email",{value:support}],["max_photos",{value:Number(photos)}],["max_videos",{value:Number(videos)}]];for(const [key,value] of entries){const {error}=await supabase.from("platform_settings").upsert({key,value,updated_by:(await supabase.auth.getUser()).data.user?.id,updated_at:new Date().toISOString()});if(error){setMessage(error.message);return;}}await supabase.rpc("admin_log",{p_action:"update_platform_settings",p_target_type:"platform_settings",p_details:{keys:entries.map(x=>x[0])}});setMessage("Settings saved.");};
 return <AdminShell><PageTitle eyebrow="Configuration" title="Platform settings" copy="Settings stored in the Vroomever database."/><div className="grid gap-5 rounded-card border border-border bg-card p-6 md:grid-cols-2"><label className="text-sm font-semibold">Platform name<Input className="mt-2" value={name} onChange={e=>setName(e.target.value)}/></label><label className="text-sm font-semibold">Support email<Input className="mt-2" value={support} onChange={e=>setSupport(e.target.value)}/></label><label className="text-sm font-semibold">Max photos per listing<Input className="mt-2" type="number" value={photos} onChange={e=>setPhotos(e.target.value)}/></label><label className="text-sm font-semibold">Max videos per listing<Input className="mt-2" type="number" value={videos} onChange={e=>setVideos(e.target.value)}/></label><div className="md:col-span-2"><Button onClick={()=>void save()}>Save settings</Button>{message&&<p className="mt-3 text-sm text-muted-foreground">{message}</p>}</div></div></AdminShell>;
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

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

    const [{ data: profileRows, error: usersError }, { data: productsData, error: productsError }] =
      await Promise.all([
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
    nav({ to: "/admin" });
  };

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-surface-strong text-surface-foreground"><p>Loading admin access…</p></div>;
  }

  if (!sessionReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-strong px-5 text-surface-foreground">
        <form onSubmit={signIn} className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <Brand inverted />
          <h1 className="mt-8 font-display text-3xl font-bold">Admin database</h1>
          <p className="mt-2 text-sm text-surface-muted">Sign in with the Supabase Auth admin account.</p>
          {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <label className="mt-6 block text-sm">Admin email<Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-11 bg-background text-foreground" /></label>
          <label className="mt-4 block text-sm">Password<Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-11 bg-background text-foreground" /></label>
          <Button className="mt-6 w-full" size="lg" type="submit" disabled={signingIn}>{signingIn ? "Signing in…" : "Open admin database"}</Button>
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
          <Button className="mt-6" onClick={signOut}>Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-surface-strong text-surface-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div><Brand inverted /><p className="mt-1 text-xs text-surface-muted">Live Supabase database</p></div>
          <Button variant="outline" onClick={signOut}><LogOut className="size-4" /> Sign out</Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-8 p-5 lg:p-8">
        <PageTitle eyebrow="Administration" title="Users & products" copy="Live records from the Vroomever Supabase database." />
        {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Users" value={String(users.length)} />
          <Stat label="Products" value={String(productRows.length)} />
        </div>
        <section>
          <h2 className="mb-3 font-display text-xl font-bold">All users and roles</h2>
          <Table head={["Name", "Email", "Role", "Created"]} rows={users.map((user) => [
            <div><strong className="block">{user.full_name || "Unnamed user"}</strong><small className="text-muted-foreground">{user.id}</small></div>,
            user.email,
            <Badge variant="outline">{user.role}</Badge>,
            new Date(user.created_at).toLocaleString(),
          ])} />
        </section>
        <section>
          <h2 className="mb-3 font-display text-xl font-bold">All products posted</h2>
          <Table head={["Product", "Seller ID", "Price", "Status", "Created"]} rows={productRows.map((product) => [
            <strong>{product.title}</strong>,
            <span className="font-mono text-xs">{product.seller_id}</span>,
            formatKsh(product.price),
            <Badge variant="outline">{product.status}</Badge>,
            new Date(product.created_at).toLocaleString(),
          ])} />
        </section>
      </main>
    </div>
  );
}


export function AdminBootstrapPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const createAdmin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const { data, error: invokeError } = await supabase.functions.invoke("admin-bootstrap", {
      body: { email, password, full_name: fullName },
      headers: { "x-admin-bootstrap-key": setupKey },
    });

    if (invokeError) {
      setError(invokeError.message);
      setLoading(false);
      return;
    }

    if (data?.error) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setMessage("Admin account created successfully. You can now use /admin to sign in.");
    setPassword("");
    setSetupKey("");
    setLoading(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-surface-strong px-5 text-surface-foreground">
      <form onSubmit={createAdmin} className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <Brand inverted />
        <h1 className="mt-8 font-display text-3xl font-bold">Admin account setup</h1>
        <p className="mt-2 text-sm text-surface-muted">Restricted administrator creation.</p>
        {message && <p className="mt-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">{message}</p>}
        {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <label className="mt-6 block text-sm">Full name<Input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2 h-11 bg-background text-foreground" /></label>
        <label className="mt-4 block text-sm">Admin email<Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-11 bg-background text-foreground" /></label>
        <label className="mt-4 block text-sm">Password<Input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-11 bg-background text-foreground" /></label>
        <label className="mt-4 block text-sm">Setup key<Input required type="password" value={setupKey} onChange={(e) => setSetupKey(e.target.value)} className="mt-2 h-11 bg-background text-foreground" /></label>
        <Button className="mt-6 w-full" size="lg" type="submit" disabled={loading}>{loading ? "Creating admin…" : "Create admin account"}</Button>
      </form>
    </div>
  );
}
