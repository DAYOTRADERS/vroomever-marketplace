import { Link, useNavigate } from "@tanstack/react-router";
import {
 ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Bell, Camera, Check, CheckCircle2, ChevronLeft, ChevronRight,
 CircleDollarSign, Clock3, Eye, FileVideo, Filter, Heart, ImagePlus, ListChecks, MapPin, MessageCircle,
 PackageCheck, Phone, Plus, Search, ShieldCheck, Sparkles, Star, Store, UploadCloud, UserRound, UsersRound,
 WalletCards, WandSparkles, X, Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { getMyRoleRow } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Brand } from "./brand";
import { ProductCard } from "./product-card";
import { SiteShell } from "./site-shell";
import { categories, formatKsh, packages, vipOptions } from "@/data/marketplace";
import { categoryImages } from "@/data/category-images";
import type { CardProduct } from "@/types/marketplace";
import hero from "@/assets/marketplace-hero.jpg";
import { mediaUrls, uploadListingMedia, imageToDataUrl } from "@/lib/product-media";
import { generateListingDescription } from "@/lib/describe.functions";
import { useServerFn } from "@tanstack/react-start";
import { lovable } from "@/integrations/lovable/index";
import { countryCodes, buildPhone, toIntl, whatsappLink, callLink } from "@/lib/phone";

type DbProduct = { id:string; title:string; price_ksh:number; location:string|null; condition:string|null; images:string[]; is_vip:boolean; category_slug:string; seller_id:string; views:number; description?:string|null; subcategory?:string|null; video_url?:string|null };
async function toCards(rows: DbProduct[]): Promise<CardProduct[]> {
 const firsts=await mediaUrls(rows.map(r=>r.images?.[0]??""));
 let i=0; const urls=rows.map(r=>r.images?.[0]?firsts[i++]:undefined);
 return rows.map((r,k)=>({id:r.id,title:r.title,price:Number(r.price_ksh),location:r.location,condition:r.condition,image:urls[k]??"/placeholder.svg",seller:"Vroomever seller",vip:r.is_vip,category:r.category_slug,views:r.views}));
}
function useLiveProducts(category?: string) {
 const [items,setItems]=useState<CardProduct[]|null>(null);
 useEffect(()=>{let alive=true;(async()=>{let q=supabase.from("products").select("id,title,price_ksh,location,condition,images,is_vip,category_slug,seller_id,views").eq("status","active").order("is_vip",{ascending:false}).order("created_at",{ascending:false}).limit(24); if(category)q=q.eq("category_slug",category); const {data}=await q; const cards=await toCards((data??[]) as DbProduct[]); if(alive)setItems(cards);})();return()=>{alive=false};},[category]);
 return items;
}
function LiveGrid({ category }: { category?: string }) {
 const live=useLiveProducts(category);
 if(live===null)return <p className="text-sm text-muted-foreground">Loading listings…</p>;
 const strict=category?live.filter(p=>p.category===category):live;
 if(strict.length===0)return <p className="rounded-card border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No approved listings here yet.</p>;
 return <ProductGrid items={strict}/>;
}

export function PageTitle({ eyebrow, title, copy, action }: { eyebrow?: string; title: string; copy?: string; action?: React.ReactNode }) {
 return <div className="mb-7 grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><div className="min-w-0">{eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}<h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>{copy && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{copy}</p>}</div>{action&&<div className="flex min-w-0 flex-wrap gap-2">{action}</div>}</div>;
}
export const Seo = (title: string, description: string) => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] });

export function HomePage() { return <SiteShell>
 <section className="relative isolate min-h-[660px] overflow-hidden bg-surface-strong text-surface-foreground">
  <img src={hero} alt="Shop and sell across Kenya with Vrumever" width={1600} height={1000} className="absolute inset-0 h-full w-full object-cover object-center" />
  <div className="absolute inset-0 bg-gradient-to-r from-surface-strong via-surface-strong/82 to-transparent" />
  <div className="dot-grid absolute inset-0 opacity-20" />
  <div className="relative mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-7xl items-center px-4 py-16 sm:min-h-[660px] sm:px-5 sm:py-24"><div className="max-w-2xl">
   <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary"><Sparkles className="size-3.5" /> Kenya’s marketplace, reimagined</span>
   <h1 className="mt-7 font-display text-5xl font-bold leading-[1.05] md:text-7xl">Find remarkable.<br/><span className="text-primary">Trade confidently.</span></h1>
   <p className="mt-6 max-w-xl text-lg leading-relaxed text-surface-muted">Discover trusted sellers, standout products and better deals from every corner of Kenya.</p>
   <div className="mt-8 grid max-w-sm gap-3 sm:flex sm:max-w-none sm:flex-wrap"><Button asChild size="lg"><Link to="/auth" search={{ role: "buyer", mode: "login" }}>Explore marketplace <ArrowRight /></Link></Button><Button asChild size="lg" variant="glass"><Link to="/auth" search={{ role: "seller", mode: "login" }}><Plus /> Start selling</Link></Button></div>
    <div className="mt-10 grid grid-cols-3 gap-4 text-sm"><span><strong className="block font-display text-2xl">24K+</strong><span className="text-surface-muted">live listings</span></span><span><strong className="block font-display text-2xl">8.2K</strong><span className="text-surface-muted">verified sellers</span></span><span><strong className="block font-display text-2xl">47</strong><span className="text-surface-muted">counties reached</span></span></div>
  </div></div>
 </section>
 <section className="mx-auto max-w-7xl px-5 py-16"><PageTitle eyebrow="Explore" title="Everything you need, one marketplace" copy="Browse curated categories from trusted sellers near you."/><CategoryGrid /></section>
 <section className="border-y border-border bg-muted/45"><div className="mx-auto max-w-7xl px-5 py-16"><PageTitle eyebrow="VIP spotlight" title="Extraordinary finds, front and centre" action={<Button asChild variant="outline"><Link to="/dashboard">View all <ArrowRight /></Link></Button>}/><LiveGrid /></div></section>
 <section className="mx-auto max-w-7xl px-5 py-16"><div className="grid gap-6 md:grid-cols-3">{([[ShieldCheck,"Trade with confidence","Verified seller profiles and transparent listing details."],[MessageCircle,"Connect directly","Reach sellers instantly by call or WhatsApp."],[Zap,"Sell without friction","Create polished listings and reach buyers across Kenya."]] as [LucideIcon,string,string][]).map(([Icon,t,c])=><div className="rounded-card border border-border bg-card p-7 shadow-card" key={t as string}><Icon className="size-8 text-primary"/><h3 className="mt-5 font-display text-xl font-bold">{t as string}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c as string}</p></div>)}</div></section>
 </SiteShell>;
}
function CategoryGrid() { return <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{categories.map((cat)=><Link key={cat.slug} to="/category/$category" params={{category:cat.slug}} className="group flex min-h-32 min-w-[145px] snap-start flex-col items-center justify-center rounded-card border border-white/60 bg-white/55 p-4 text-center shadow-sm backdrop-blur-xl card-3d hover:border-primary/40 hover:bg-white/75"><span className="grid size-16 place-items-center">{categoryImages[cat.slug]?<img src={categoryImages[cat.slug]} alt="" loading="lazy" width={64} height={64} className="size-16 object-contain drop-shadow-lg transition group-hover:scale-110"/>:<cat.icon className="size-6 text-primary"/>}</span><span className="mt-3 text-xs font-semibold leading-tight">{cat.name}</span></Link>)}</div> }
function ProductGrid({ items }: { items: CardProduct[] }) { return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{items.map(p=><ProductCard key={p.id} product={p}/>)}</div> }

export function DashboardPage() {
 const nav=useNavigate();
 const [sessionReady,setSessionReady]=useState(false);
 const [firstName,setFirstName]=useState("");
 useEffect(()=>{supabase.auth.getSession().then(async({data})=>{if(!data.session){nav({to:"/auth",search:{role:"buyer",mode:"login"},replace:true});return;} const {data:roleRow}=await getMyRoleRow(); const {data:prof}=await supabase.from("profiles").select("full_name").eq("id",data.session.user.id).maybeSingle(); const profile={role:roleRow?.role,full_name:prof?.full_name}; if(profile?.role==="seller"){nav({to:"/seller/dashboard",replace:true});return;} const name=(profile?.full_name||"").trim().split(/\s+/)[0] || data.session.user.email?.split("@")[0] || "there"; setFirstName(name); setSessionReady(true);});},[nav]);
 if(!sessionReady)return null;
 return <SiteShell dashboardMode="buyer"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-10">
 <div className="relative overflow-hidden rounded-card bg-surface-strong p-5 text-surface-foreground sm:p-7 md:p-10"><div className="dot-grid absolute inset-0 opacity-20"/><div className="relative max-w-2xl"><p className="text-sm text-primary">Welcome back, {firstName}</p><h1 className="mt-2 font-display text-3xl font-bold md:text-5xl">What are you looking for?</h1><div className="mt-7 grid grid-cols-[auto_minmax(0,1fr)] items-center rounded-card bg-background p-2 sm:grid-cols-[auto_minmax(0,1fr)_auto]"><Search className="m-3 size-5 text-muted-foreground"/><Input className="h-11 min-w-0 border-0 shadow-none" placeholder="Search the marketplace"/><Button className="col-span-2 mt-2 sm:col-span-1 sm:mt-0">Search</Button></div></div></div>
 <div className="py-10"><PageTitle title="Browse categories"/><CategoryGrid/></div>
 <div className="pb-12"><PageTitle eyebrow="Recommended" title="Fresh picks for you" action={<Button variant="outline"><Filter/> Filters</Button>}/><LiveGrid/></div>
 </div></SiteShell>;
}


export function CategoryPage({ slug }: { slug: string }) { const cat=categories.find(c=>c.slug===slug) ?? categories[0]!; return <SiteShell><div className="mx-auto max-w-7xl px-4 py-7 sm:px-5 sm:py-10"><div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4"><span className="grid size-16 shrink-0 place-items-center rounded-card bg-secondary text-primary">{categoryImages[cat.slug]?<img src={categoryImages[cat.slug]} alt="" width={56} height={56} className="size-14 object-contain drop-shadow-md"/>:<cat.icon/>}</span><PageTitle eyebrow="Category" title={cat.name} copy="Approved listings across Kenya" /></div><div className="mb-8 flex gap-2 overflow-x-auto pb-2">{cat.subcategories.map(s=><Button key={s} variant="outline" className="shrink-0">{s}</Button>)}</div><div className="grid gap-8 lg:grid-cols-[240px_1fr]"><aside className="h-fit rounded-card border border-border bg-card p-5"><h3 className="font-semibold">Filters</h3>{["Location","Price range","Condition","Verified sellers"].map(x=><div key={x} className="border-b border-border py-4 text-sm font-medium">{x}<ChevronRight className="float-right size-4 text-muted-foreground"/></div>)}</aside><div><LiveGrid category={cat.slug}/></div></div></div></SiteShell> }

export function ProductPage({ id }: { id: string }) {
 const sample=undefined as undefined|{title:string;price:number;location:string;condition:string;vip?:boolean;seller:string;image:string};
 const [p,setP]=useState<null|{title:string;price:number;location:string|null;condition:string|null;vip:boolean;description:string;seller:string;sellerId:string|null;phone:string|null;photos:string[];video:string|null}>(sample?{title:sample.title,price:sample.price,location:sample.location,condition:sample.condition,vip:!!sample.vip,description:"Exceptionally clean and well maintained. Available for viewing. Serious buyers are welcome to contact the seller directly.",seller:sample.seller,sellerId:null,phone:null,photos:[sample.image],video:null}:null);
 const [missing,setMissing]=useState(false);
 const [active,setActive]=useState(0);
 const [liked,setLiked]=useState(false);
 useEffect(()=>{if(sample)return;(async()=>{
  const {data}=await supabase.from("products").select("*").eq("id",id).eq("status","active").maybeSingle();
  if(!data){setMissing(true);return;}
  const [{data:prof},photos,vid]=await Promise.all([supabase.from("profiles").select("full_name,phone").eq("id",data.seller_id).maybeSingle(),mediaUrls(data.images??[]),data.video_url?mediaUrls([data.video_url]):Promise.resolve([])]);
  setP({title:data.title,price:Number(data.price_ksh),location:data.location,condition:data.condition,vip:data.is_vip,description:data.description||"",seller:prof?.full_name||"Vroomever seller",sellerId:data.seller_id,phone:toIntl((data as {contact_phone?:string|null}).contact_phone)??toIntl(prof?.phone),photos,video:vid[0]??null});
  const {data:{session}}=await supabase.auth.getSession();
  if(session){const {data:f}=await supabase.from("favorites").select("product_id").eq("user_id",session.user.id).eq("product_id",id).maybeSingle();setLiked(!!f);}
 })();},[id,sample]);
 const toggleFav=async()=>{const {data:{session}}=await supabase.auth.getSession(); if(!session){window.location.href="/auth?role=buyer&mode=login";return;} if(sample){setLiked(!liked);return;} if(liked){await supabase.from("favorites").delete().eq("user_id",session.user.id).eq("product_id",id);setLiked(false);}else{await supabase.from("favorites").insert({user_id:session.user.id,product_id:id});setLiked(true);}};
 const reportListing=async()=>{const {data:{session}}=await supabase.auth.getSession(); if(!session){window.location.href="/auth?role=buyer&mode=login";return;} const reason=window.prompt("What is wrong with this listing?"); if(!reason?.trim())return; const {error}=await supabase.from("reports").insert({reporter_id:session.user.id,product_id:id,reason:reason.trim().slice(0,500)}); window.alert(error?error.message:"Thanks — our team will review this listing.");};
 if(missing)return <SiteShell><div className="mx-auto max-w-3xl px-5 py-20 text-center"><h1 className="font-display text-3xl font-bold">Listing not available</h1><p className="mt-3 text-muted-foreground">It may be awaiting approval or was removed.</p><Button asChild className="mt-6"><Link to="/dashboard">Back to marketplace</Link></Button></div></SiteShell>;
 if(!p)return <SiteShell><div className="mx-auto max-w-7xl px-5 py-20 text-sm text-muted-foreground">Loading listing…</div></SiteShell>;
 const photos=p.photos.length?p.photos:["/placeholder.svg"];
 const wa=p.phone?whatsappLink(p.phone,"Hi, I'm interested in "+p.title+" on Vroomever"):null;
 return <SiteShell><div className="mx-auto max-w-7xl px-5 py-8"><div className="grid gap-8 lg:grid-cols-[1.35fr_.65fr]"><div><div className="relative overflow-hidden rounded-card bg-muted"><img src={photos[active]} alt={p.title} width={1200} height={900} className="aspect-[4/3] w-full object-cover"/><span className="absolute bottom-4 right-4 rounded-full bg-surface-strong/80 px-3 py-1.5 text-xs text-surface-foreground">{active+1} / {photos.length} photos</span></div>{photos.length>1&&<div className="mt-3 grid grid-cols-5 gap-3">{photos.map((src,i)=><button type="button" onClick={()=>setActive(i)} key={i} className={`aspect-[4/3] overflow-hidden rounded-md border-2 bg-muted ${i===active?"border-primary":"border-border"}`}><img src={src} alt={`${p.title} photo ${i+1}`} loading="lazy" className="h-full w-full object-cover"/></button>)}</div>}{p.video&&<video src={p.video} controls className="mt-4 w-full rounded-card bg-muted"/>}<div className="mt-8"><h2 className="font-display text-2xl font-bold">Description</h2><p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">{p.description||"No description provided."}</p></div></div><aside><div className="sticky top-24 rounded-card border border-border bg-card p-6 shadow-elevated">{p.vip&&<Badge className="bg-vip text-vip-foreground"><Sparkles/> VIP listing</Badge>}<p className="mt-4 text-sm text-primary">{p.condition}</p><h1 className="mt-2 font-display text-3xl font-bold">{p.title}</h1><p className="mt-4 font-display text-3xl font-bold text-primary">{formatKsh(p.price)}</p><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4"/>{p.location}</p><div className="my-6 border-y border-border py-5"><p className="text-xs text-muted-foreground">SELLER</p><Link to="/seller/$id" params={{id:p.sellerId??"prestige-motors"}} className="mt-2 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-secondary"><Store/></span><span><strong className="block">{p.seller}</strong><small className="flex items-center gap-1 text-primary"><BadgeCheck className="size-3"/> Seller</small></span></Link></div>{wa?<Button asChild className="w-full" size="lg"><a href={wa} target="_blank" rel="noreferrer"><MessageCircle/> WhatsApp seller</a></Button>:<Button className="w-full" size="lg" disabled><MessageCircle/> WhatsApp seller</Button>}{p.phone&&<Button asChild variant="outline" size="lg" className="mt-3 w-full"><a href={callLink(p.phone)}><Phone/> Call +{p.phone}</a></Button>}<Button variant="ghost" className="mt-3 w-full" onClick={()=>void toggleFav()}><Heart className={liked?"fill-current text-destructive":""}/> {liked?"Saved":"Save to favorites"}</Button>{!sample&&<Button variant="ghost" size="sm" className="mt-2 w-full text-muted-foreground" onClick={()=>void reportListing()}>Report this listing</Button>}<p className="mt-5 text-center text-xs text-muted-foreground"><ShieldCheck className="mr-1 inline size-3"/>Never pay in advance. Meet in a safe place.</p></div></aside></div></div></SiteShell>;
}

export function SellerPage() { return <SiteShell><div className="mx-auto max-w-7xl px-4 py-7 sm:px-5 sm:py-10"><div className="rounded-card border border-border bg-card p-5 shadow-card sm:p-7 md:flex md:items-center md:justify-between"><div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 sm:gap-5"><div className="grid size-16 shrink-0 place-items-center rounded-full bg-secondary text-primary sm:size-20"><Store className="size-8 sm:size-9"/></div><div className="min-w-0"><p className="flex items-center gap-1 text-sm text-primary"><BadgeCheck className="size-4"/> Verified business</p><h1 className="font-display text-2xl font-bold sm:text-3xl">Prestige Motors KE</h1><p className="mt-1 text-sm text-muted-foreground">Karen, Nairobi · Member since 2022</p></div></div><Button className="mt-5 w-full md:mt-0 md:w-auto"><MessageCircle/> Contact seller</Button></div><div className="py-10"><PageTitle title="Seller listings" copy="18 active listings · Usually responds within 10 minutes"/><LiveGrid/></div></div></SiteShell> }

export function FavoritesPage() {
 const [rows,setRows]=useState<CardProduct[]>([]);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){setLoading(false);return;}
  const {data}=await supabase
    .from("favorites")
    .select("product_id, products(id,title,price_ksh,location,condition,seller_id,images)")
    .eq("user_id",session.user.id);
  const imgs=await mediaUrls((data??[]).map((row:any)=>row.products?.images?.[0]??"/placeholder.svg"));
  const mapped:CardProduct[]=(data??[]).map((row:any,idx:number)=>{
    const prod=row.products;
    return {
      id: prod?.id ?? "",
      title: prod?.title ?? "",
      price: Number(prod?.price_ksh ?? 0),
      location: prod?.location ?? null,
      condition: prod?.condition ?? null,
      image: imgs[idx] ?? "/placeholder.svg",
      seller: "VroomEver seller",
    };
  });
  setRows(mapped);setLoading(false);
 })();},[]);
 return <SiteShell><div className="mx-auto max-w-7xl px-5 py-10"><PageTitle eyebrow="Your shortlist" title="Saved favorites" copy="Keep an eye on the listings you love."/>{loading?<p className="text-sm text-muted-foreground">Loading favorites…</p>:rows.length?<ProductGrid items={rows}/>:<p className="text-sm text-muted-foreground">You haven’t saved any listings yet.</p>}</div></SiteShell>;
}

export function ProfilePage() {
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [userId,setUserId]=useState<string|null>(null);
 const [fullName,setFullName]=useState("");
 const [phone,setPhone]=useState("");
 const [email,setEmail]=useState("");
 useEffect(()=>{(async()=>{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){setLoading(false);return;}
  setUserId(session.user.id);
  setEmail(session.user.email ?? "");
  const {data}=await supabase.from("profiles").select("full_name,phone").eq("id",session.user.id).maybeSingle();
  setFullName(data?.full_name ?? "");
  setPhone(data?.phone ?? "");
  setLoading(false);
 })();},[]);
 const save=async()=>{if(!userId)return;setSaving(true);await supabase.from("profiles").update({full_name:fullName,phone}).eq("id",userId);setSaving(false);};
 if(loading)return <SiteShell><div className="mx-auto max-w-4xl px-5 py-10"><p className="text-sm text-muted-foreground">Loading profile…</p></div></SiteShell>;
 return <SiteShell><div className="mx-auto max-w-4xl px-5 py-10"><PageTitle eyebrow="Account" title="Your profile" copy="Manage how buyers and sellers see you."/><div className="glass-panel grid gap-6 rounded-card p-6 md:grid-cols-2"><label className="text-sm font-semibold">Full name<Input className="mt-2" value={fullName} onChange={e=>setFullName(e.target.value)}/></label><label className="text-sm font-semibold">Email<Input className="mt-2" value={email} readOnly/></label><label className="text-sm font-semibold">Phone<Input className="mt-2" value={phone} onChange={e=>setPhone(e.target.value)}/></label><div className="md:col-span-2"><Button onClick={()=>void save()} disabled={saving}>{saving?"Saving…":"Save changes"}</Button></div></div></div></SiteShell>;
}

/* =========================================================================
   AUTH PAGE — signup, login, buyer, seller. Same component for all four.
   ========================================================================= */

export function AuthPage({
  signup = false,
  lockedRole,
}: {
  signup?: boolean;
  lockedRole?: "buyer" | "seller";
}) {
  const nav = useNavigate();
  const [role, setRole] = useState<"buyer" | "seller">(lockedRole ?? "buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [forgot, setForgot] = useState(false);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const withTimeout = <T,>(p: Promise<T>, ms = 20000) =>
    Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error("__timeout__")), ms))]);

  const resend = async () => {
    if (!pendingEmail || cooldown > 0) return;
    setError(""); setInfo("");
    try {
      const { error: e } = await withTimeout(supabase.auth.resend({ type: "signup", email: pendingEmail, options: { emailRedirectTo: `${window.location.origin}/auth/confirm?role=${role}` } }));
      if (e) throw e;
      setInfo(`A new confirmation email was sent to ${pendingEmail}. Check your inbox and spam folder.`);
    } catch (err) {
      const m = err instanceof Error ? err.message : "";
      setError(m === "__timeout__" ? "The email service is slow right now. Wait a minute, then try resending." : friendly(m || "Could not resend the email."));
    } finally {
      setCooldown(60);
    }
  };

  const sendReset = async (email: string) => {
    const { error: e } = await withTimeout(supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password?role=${role}` }));
    if (e && /rate limit/i.test(e.message)) throw e;
    setInfo(`If an account exists for ${email}, a password reset link is on its way. Check your inbox and spam folder.`);
    setCooldown(60);
  };

  const signupRole = role;
  const friendly = (msg: string) => {
    const m = msg.toLowerCase();
    if (m.includes("weak") || m.includes("pwned") || m.includes("easy to guess")) return "That password is too common. Use at least 8 characters mixing words, numbers and symbols (e.g. Nairobi!Market72).";
    if (m.includes("invalid login")) return "Wrong email or password. Please check and try again.";
    if (m.includes("email not confirmed")) return "Please confirm your email first — open the link we sent you, then sign in.";
    if (m.includes("already registered") || m.includes("already been registered")) return "This email already has an account. Please sign in instead.";
    if (m.includes("rate limit")) return "Too many attempts. Please wait a few minutes and try again.";
    if (m.includes("password should be")) return "Password must be at least 6 characters.";
    return msg;
  };

  const routeByRole = async (session: { user: { id: string } } | null) => {
    if (!session) {
      nav({ to: "/auth", search: { role: signupRole, mode: "login" } });
      return;
    }
    const { data: profile, error: profileError } = await getMyRoleRow();
    if (profileError) throw profileError;
    const actualRole =
      profile?.role === "admin" ? "admin" : profile?.role === "seller" ? "seller" : "buyer";
    nav({
      to:
        actualRole === "seller"
          ? "/seller/dashboard"
          : actualRole === "admin"
            ? "/masteradmin"
            : "/dashboard",
      replace: true,
    });
  };

  // Finish Google/Apple sign-in: apply the Buyer/Seller choice made before leaving.
  useEffect(() => {
    const finish = async () => {
      const chosen = sessionStorage.getItem("vroomever:oauthRole");
      if (!chosen) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      sessionStorage.removeItem("vroomever:oauthRole");
      const { data: me } = await getMyRoleRow();
      if (chosen === "seller" && me?.role === "buyer") await supabase.rpc("become_seller");
      await routeByRole(data.session);
    };
    void finish();
    const { data: sub } = supabase.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_IN") void finish(); });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const social = async (provider: "google" | "apple") => {
    setError(""); setInfo("");
    sessionStorage.setItem("vroomever:oauthRole", signupRole);
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth?role=${signupRole}&mode=login` });
    if (result.error) { sessionStorage.removeItem("vroomever:oauthRole"); setError(`${provider === "google" ? "Google" : "Apple"} sign-in failed. Please try again.`); return; }
    if (result.redirected) return;
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      sessionStorage.removeItem("vroomever:oauthRole");
      const { data: me } = await getMyRoleRow();
      if (signupRole === "seller" && me?.role === "buyer") await supabase.rpc("become_seller");
      await routeByRole(data.session);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setTimedOut(false);
    setLoading(true);

    const form = new FormData(e.currentTarget as HTMLFormElement);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();

    try {
      if (forgot) {
        await sendReset(email);
        return;
      }
      if (signup) {
        const { data, error: signUpError } = await withTimeout(supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role: signupRole }, emailRedirectTo: `${window.location.origin}/auth/confirm?role=${signupRole}` },
        }));
        if (signUpError) throw signUpError;
        if (data.user && (data.user.identities?.length ?? 0) === 0) {
          throw new Error("This email is already used. Please log in or use another email.");
        }

        const session = data.session;
        if (!session) {
          setPendingEmail(email);
          setCooldown(60);
          setInfo(`Your ${signupRole.toUpperCase()} account was created. Check your email to confirm it, then sign in using the ${signupRole === "seller" ? "Seller" : "Buyer"} login form.`);
          return;
        }

        const { data: signedIn, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        await routeByRole(signedIn.session ?? session);
        return;
      }

      // Login path — each form only accepts its own account type
      const { data, error: signInError } = await withTimeout(supabase.auth.signInWithPassword({ email, password }));
      if (signInError) {
        if (/email not confirmed/i.test(signInError.message)) setPendingEmail(email);
        throw signInError;
      }
      const { data: roleRow } = await getMyRoleRow();
      const actual = roleRow?.role ?? "buyer";
      const expected = role;
      if (actual === "admin") {
        await supabase.auth.signOut();
        throw new Error("This is an administrator account. Please sign in through the Master Admin login at /masteradmin/login.");
      }
      if (actual !== expected) {
        await supabase.auth.signOut();
        setRole(actual);
        throw new Error(actual === "seller"
          ? "This email is registered as a SELLER account. Please use the Seller login form below."
          : "This email is registered as a BUYER account. Please use the Buyer login form below.");
      }
      await routeByRole(data.session);
    } catch (err) {
      if (err instanceof Error && err.message === "__timeout__") {
        if (signup) {
          setPendingEmail(email);
          setTimedOut(true);
          setError("This is taking longer than usual. Your account may still have been created. Check your email, resend the confirmation, or try signing in.");
        } else {
          setError("The request timed out. Check your connection and try again.");
        }
        return;
      }
      setError(err instanceof Error ? friendly(err.message) : "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-surface-strong text-surface-foreground lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={hero}
          alt="Vrumever marketplace"
          width={1600}
          height={1000}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-surface-strong/55" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Brand inverted />
          <div>
            <p className="max-w-md font-display text-4xl font-bold">
              Kenya’s marketplace for remarkable finds.
            </p>
            <p className="mt-4 text-surface-muted">Discover • Connect • Trade</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <form onSubmit={submit} className="w-full max-w-md">
          <div className="lg:hidden">
            <Brand inverted />
          </div>
          <p className="mt-10 text-sm text-primary">{signup ? "Join Vrumever" : "Welcome back"}</p>
          <h1 className="mt-2 font-display text-4xl font-bold">
            {signup ? "Create your account" : role === "seller" ? "Seller sign in" : "Buyer sign in"}
          </h1>
          <p className="mt-2 text-sm text-surface-muted">
            {signup
              ? "Choose your account type below."
              : "Your saved items and conversations await."}
          </p>

          {!signup && (
            <div className="mt-7 grid grid-cols-2 gap-2 rounded-card border border-white/10 bg-white/5 p-1">
              {(["buyer","seller"] as const).map((r) => (
                <button key={r} type="button" onClick={() => { setRole(r); setError(""); }} className={`rounded-lg py-2.5 text-sm font-semibold transition ${role === r ? "bg-primary text-primary-foreground" : "text-surface-muted"}`}>
                  {r === "buyer" ? "Buyer login" : "Seller login"}
                </button>
              ))}
            </div>
          )}
          {signup && (
            <>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <button
                  type="button"

                  onClick={() => setRole("buyer")}
                  className={`rounded-card border p-4 text-left transition ${signupRole === "buyer" ? "border-primary bg-primary/20 ring-2 ring-primary" : "border-surface-muted/30 bg-transparent opacity-70 hover:opacity-100"}`}
                >
                  <UserRound className="size-5 text-primary" />
                  <strong className="mt-2 block">Buyer</strong>
                  <small className="mt-1 block text-surface-muted">Browse, save and connect</small>
                </button>
                <button
                  type="button"

                  onClick={() => setRole("seller")}
                  className={`rounded-card border p-4 text-left transition ${signupRole === "seller" ? "border-primary bg-primary/20 ring-2 ring-primary" : "border-surface-muted/30 bg-transparent opacity-70 hover:opacity-100"}`}
                >
                  <Store className="size-5 text-primary" />
                  <strong className="mt-2 block">Seller</strong>
                  <small className="mt-1 block text-surface-muted">Sell and grow your store</small>
                </button>
              </div>
              <label className="mt-5 block text-sm">
                Full name
                <Input
                  name="fullName"
                  className="mt-2 h-11 bg-background text-foreground"
                  required
                  autoComplete="name"
                />
              </label>
            </>
          )}

          <label className="mt-5 block text-sm">
            Email address
            <Input
              name="email"
              type="email"
              className="mt-2 h-11 bg-background text-foreground"
              required
              autoComplete="email"
            />
          </label>

          {!forgot && (
          <label className="mt-5 block text-sm">
            Password
            <Input
              name="password"
              type="password"
              className="mt-2 h-11 bg-background text-foreground"
              required
              minLength={8}
              autoComplete={signup ? "new-password" : "current-password"}
            />
          </label>
          )}

          {signup && (
            <label className="mt-5 flex gap-3 text-sm text-surface-muted">
              <Checkbox required className="mt-0.5" /> I accept the Terms & Conditions and the
              relevant buyer or seller terms.
            </label>
          )}

          {error && (
            <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}
          {info && (
            <p className="mt-4 rounded-md bg-primary/10 p-3 text-sm text-primary">{info}</p>
          )}
          {pendingEmail && !forgot && (
            <div className="mt-4 rounded-md border border-primary/30 bg-white/5 p-4 text-sm">
              <p className="font-semibold">Confirmation email status</p>
              <p className="mt-1 text-surface-muted">
                Sent to <strong className="text-surface-foreground">{pendingEmail}</strong>. Open the link in that email, then sign in with the {signupRole === "seller" ? "Seller" : "Buyer"} login form. Didn't get it? Check spam, then resend.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => void resend()} disabled={cooldown > 0}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend confirmation email"}
                </Button>
                {timedOut && (
                  <>
                    <Button type="button" size="sm" variant="ghost" onClick={() => nav({ to: "/auth", search: { role: signupRole, mode: "login" } })}>Try signing in</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => { setPendingEmail(""); setTimedOut(false); setError(""); setInfo(""); }}>Use a different email</Button>
                  </>
                )}
              </div>
            </div>
          )}

          {!signup && (
            <button type="button" onClick={() => { setForgot(!forgot); setError(""); setInfo(""); }} className="mt-4 block text-sm font-semibold text-primary">
              {forgot ? "Back to sign in" : "Forgot password?"}
            </button>
          )}
          <Button size="lg" className="mt-7 w-full" type="submit" disabled={loading || (forgot && cooldown > 0)}>
            {loading ? "Please wait…" : forgot ? (cooldown > 0 ? `Send again in ${cooldown}s` : "Send reset link") : signup ? "Create account" : "Sign in"}
            <ArrowRight />
          </Button>
          {!forgot && <div className="mt-4 grid gap-2">
            <div className="flex items-center gap-3 text-xs text-surface-muted"><span className="h-px flex-1 bg-white/10" />or continue as {signupRole === "seller" ? "SELLER" : "BUYER"} with<span className="h-px flex-1 bg-white/10" /></div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" className="bg-background text-foreground" onClick={() => void social("google")}>Google</Button>
              <Button type="button" variant="outline" className="bg-background text-foreground" onClick={() => void social("apple")}>Apple</Button>
            </div>
          </div>}

          <p className="mt-6 text-center text-sm text-surface-muted">
            {signup ? "Already a member? " : "New to Vrumever? "}
            <Link
              to="/auth"
              search={{ role: signup ? signupRole : role, mode: signup ? "login" : "signup" }}
              className="font-semibold text-primary"
            >
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const steps=["Category","Subcategory","Details","Media","Review","Subscription","Payment","Publish"];
export function SellPage() {
  const nav=useNavigate();
  const [authorized,setAuthorized]=useState(false);
  const [step,setStep]=useState(0);
  const [categorySlug,setCategorySlug]=useState(categories[0]!.slug);
  const [title,setTitle]=useState("");
  const [price,setPrice]=useState("");
  const [location,setLocation]=useState("");
  const [description,setDescription]=useState("");
  const [condition,setCondition]=useState("Brand New");
  const [subcategory,setSubcategory]=useState("");
  const [phoneCode,setPhoneCode]=useState("254");
  const [phoneNum,setPhoneNum]=useState("");
  const [photos,setPhotos]=useState<File[]>([]);
  const [video,setVideo]=useState<File|null>(null);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{supabase.auth.getSession().then(async({data})=>{if(!data.session){nav({to:"/auth",search:{role:"seller",mode:"login"},replace:true});return;} const {data:profile}=await getMyRoleRow(); const sellerProfile=null as null|{user_id:string}; if(profile?.role!=="seller" && !sellerProfile){nav({to:"/auth",search:{role:"seller",mode:"login"},replace:true});return;} if(profile?.role!=="seller" && sellerProfile){await supabase.rpc("become_seller");} setAuthorized(true);});},[nav]);
  const publish=async()=>{
    const {data:sessionData}=await supabase.auth.getSession();
    const sellerId=sessionData.session?.user.id;
    if(!sellerId){nav({to:"/auth",search:{role:"seller",mode:"login"}});return;}
    if(!title.trim()||!price||Number(price)<0){setError("Add a valid title and price before publishing.");return;}
    if(!photos.length){setError("Add at least one photo before publishing.");return;}
    const contactPhone=buildPhone(phoneCode,phoneNum);
    if(!contactPhone){setError("Add a valid WhatsApp / call number with its country code.");return;}
    setSaving(true);setError("");
    let imagePaths:string[]=[]; let videoPath:string|null=null;
    try{ imagePaths=await uploadListingMedia(sellerId,photos.slice(0,5)); if(video){videoPath=(await uploadListingMedia(sellerId,[video]))[0]??null;} }catch(e){setError(e instanceof Error?e.message:"Photo upload failed.");setSaving(false);return;}
    const {data:category}=await supabase.from("categories").select("slug").eq("slug",categorySlug).maybeSingle();
    if(!category){setError("Category is not available in the database. Apply the latest schema first.");setSaving(false);return;}
    const {error:insertError}=await supabase.from("products").insert({
      seller_id:sellerId,category_slug:category.slug,title:title.trim(),description:description.trim(),
      price_ksh:Number(price),location:location.trim(),condition,status:"pending",subcategory:subcategory||null,images:imagePaths,video_url:videoPath,contact_phone:contactPhone
    });
    if(insertError){setError(insertError.message);setSaving(false);return;}
    setStep(7);setSaving(false);
  };
  const next=()=>{setError("");if(step===2&&!buildPhone(phoneCode,phoneNum)){setError("Select your country code and enter a valid WhatsApp number (also used for calls).");return;}setStep(Math.min(7,step+1));};
  if(!authorized)return null;
  return <SiteShell><div className="mx-auto max-w-5xl px-4 py-7 sm:px-5 sm:py-10"><PageTitle eyebrow="Seller studio" title="Create a new listing" copy="Build a clear, trustworthy listing buyers will love."/><div className="mb-6"><div className="flex items-center gap-3 rounded-card border border-border bg-card p-3 sm:hidden"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{step+1}</span><div className="min-w-0"><p className="text-xs text-muted-foreground">Step {step+1} of {steps.length}</p><p className="truncate font-semibold">{steps[step]}</p></div></div><div className="hidden overflow-x-auto sm:block"><div className="flex min-w-[720px] items-center">{steps.map((s,i)=><div key={s} className="flex flex-1 items-center"><span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${i<=step?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground"}`}>{i<step?<Check className="size-4"/>:i+1}</span><span className="ml-2 text-xs font-medium">{s}</span>{i<steps.length-1&&<div className="mx-3 h-px flex-1 bg-border"/>}</div>)}</div></div></div><div className="rounded-card border border-border bg-card p-4 shadow-card sm:p-6 md:p-9"><SellStep step={step} categorySlug={categorySlug} setCategorySlug={setCategorySlug} title={title} setTitle={setTitle} price={price} setPrice={setPrice} location={location} setLocation={setLocation} description={description} setDescription={setDescription} condition={condition} setCondition={setCondition} photos={photos} setPhotos={setPhotos} video={video} setVideo={setVideo} subcategory={subcategory} setSubcategory={setSubcategory} phoneCode={phoneCode} setPhoneCode={setPhoneCode} phoneNum={phoneNum} setPhoneNum={setPhoneNum}/>{error&&<p className="mt-5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<div className="mt-8 grid grid-cols-2 gap-3"><Button variant="outline" disabled={step===0||saving} onClick={()=>setStep(step-1)}><ArrowLeft/>Back</Button>{step<6?<Button onClick={next}>Continue<ArrowRight/></Button>:step===6?<Button onClick={publish} disabled={saving}>{saving?"Saving…":"Publish listing"}<Check/></Button>:<Button asChild><Link to="/seller/listings">View listings</Link></Button>}</div></div></div></SiteShell>
}

function SellStep({step,categorySlug,setCategorySlug,title,setTitle,price,setPrice,location,setLocation,description,setDescription,condition,setCondition,photos,setPhotos,video,setVideo,subcategory,setSubcategory,phoneCode,setPhoneCode,phoneNum,setPhoneNum}:{step:number;categorySlug:string;setCategorySlug:(x:string)=>void;title:string;setTitle:(x:string)=>void;price:string;setPrice:(x:string)=>void;location:string;setLocation:(x:string)=>void;description:string;setDescription:(x:string)=>void;condition:string;setCondition:(x:string)=>void;photos:File[];setPhotos:(x:File[])=>void;video:File|null;setVideo:(x:File|null)=>void;subcategory:string;setSubcategory:(x:string)=>void;phoneCode:string;setPhoneCode:(x:string)=>void;phoneNum:string;setPhoneNum:(x:string)=>void}) {
 const cat=categories.find(c=>c.slug===categorySlug)??categories[0]!;
 const previews=useMemo(()=>photos.map(f=>URL.createObjectURL(f)),[photos]);
 useEffect(()=>()=>previews.forEach(u=>URL.revokeObjectURL(u)),[previews]);
 const describe=useServerFn(generateListingDescription);
 const [aiBusy,setAiBusy]=useState(false); const [aiErr,setAiErr]=useState("");
 const writeWithAi=async()=>{ if(title.trim().length<2){setAiErr("Add a title first so the AI knows what you're selling.");return;} setAiBusy(true);setAiErr(""); try{ const imgs=await Promise.all(photos.slice(0,3).map(f=>imageToDataUrl(f))); const r=await describe({data:{title,category:cat.name,subcategory,condition,price,location,notes:description,photos:imgs}}); setDescription(r.description);}catch(e){setAiErr(e instanceof Error?e.message:"AI description failed.");} finally{setAiBusy(false);} };
 const addPhotos=(list:FileList|null)=>{ if(!list)return; const imgs=Array.from(list).filter(f=>f.type.startsWith("image/")); setPhotos([...photos,...imgs].slice(0,5)); };
 if(step===0)return <><h2 className="font-display text-2xl font-bold">What are you selling?</h2><div className="mt-6 flex gap-4 overflow-x-auto pb-3 snap-x">{categories.map(c=><button type="button" key={c.slug} onClick={()=>setCategorySlug(c.slug)} className={`min-w-[155px] snap-start rounded-card border p-4 text-left backdrop-blur-xl transition ${categorySlug===c.slug?"border-primary bg-primary/10":"border-border bg-white/50 hover:border-primary/60"}`}>{categoryImages[c.slug]?<img src={categoryImages[c.slug]} alt="" loading="lazy" width={48} height={48} className="mb-3 size-12 object-contain drop-shadow-md"/>:<c.icon className="mb-4 text-primary"/>}<strong className="text-sm">{c.name}</strong></button>)}</div></>;
 if(step===1)return <><h2 className="font-display text-2xl font-bold">Choose a subcategory</h2><div className="mt-6 flex gap-3 overflow-x-auto pb-3">{cat.subcategories.map(x=><button type="button" key={x} onClick={()=>setSubcategory(x)} className={`shrink-0 rounded-card border px-5 py-4 text-left backdrop-blur-xl hover:border-primary ${subcategory===x?"border-primary bg-primary/10":"border-border bg-white/50"}`}>{x}<ChevronRight className="ml-3 inline size-4"/></button>)}</div></>;
 if(step===2)return <><h2 className="font-display text-2xl font-bold">Describe your item</h2><div className="mt-6 grid gap-5 md:grid-cols-2"><label className="text-sm font-semibold md:col-span-2">Title<Input value={title} onChange={e=>setTitle(e.target.value)} className="mt-2" placeholder="e.g. Toyota Land Cruiser V8, 2018"/></label><label className="text-sm font-semibold">Price (KSh)<Input value={price} onChange={e=>setPrice(e.target.value)} className="mt-2" type="number" min="0" placeholder="0"/></label><label className="text-sm font-semibold">Location<Input value={location} onChange={e=>setLocation(e.target.value)} className="mt-2" placeholder="Area, county"/></label><label className="text-sm font-semibold">Condition<select value={condition} onChange={e=>setCondition(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3"><option>Brand New</option><option>Used</option><option>Foreign Used</option><option>Refurbished</option><option>Service Available</option></select></label><div className="text-sm font-semibold"><span>WhatsApp & call number</span><div className="mt-2 grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-2"><select aria-label="Country code" value={phoneCode} onChange={e=>setPhoneCode(e.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm">{countryCodes.map(c=><option key={c.code+c.label} value={c.code}>{c.label}</option>)}</select><Input value={phoneNum} onChange={e=>setPhoneNum(e.target.value)} inputMode="tel" placeholder="712 345 678" aria-label="WhatsApp number"/></div><p className="mt-1 text-xs font-normal text-muted-foreground">Buyers tap WhatsApp or Call on this listing to reach +{phoneCode} {phoneNum||"…"} directly.</p></div><div className="md:col-span-2"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">Description</span><Button type="button" size="sm" variant="outline" onClick={()=>void writeWithAi()} disabled={aiBusy}><WandSparkles/>{aiBusy?"Writing…":description?"Improve with AI":"Write with AI"}</Button></div><Textarea value={description} onChange={e=>setDescription(e.target.value)} className="mt-2 min-h-40" placeholder="Jot down key facts (year, size, defects…) then tap “Write with AI” — tip: add photos first in the next step for a richer description."/>{aiErr&&<p className="mt-2 text-sm text-destructive">{aiErr}</p>}<p className="mt-1 text-xs text-muted-foreground">AI-powered. Always check the text is accurate before publishing.</p></div></div></>;
 if(step===3)return <><h2 className="font-display text-2xl font-bold">Add photos and video</h2><p className="mt-2 text-sm text-muted-foreground">Up to 5 photos ({photos.length}/5) and 1 video. The first photo is your cover.</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">{previews.map((src,i)=><div className="relative aspect-square overflow-hidden rounded-card bg-secondary" key={src}><img src={src} alt={`Photo ${i+1}`} className="h-full w-full object-cover"/>{i===0&&<span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">Cover</span>}<button type="button" aria-label="Remove photo" onClick={()=>setPhotos(photos.filter((_,x)=>x!==i))} className="absolute right-2 top-2 rounded-full bg-background/90 p-1"><X className="size-4"/></button></div>)}{photos.length<5&&<label className="grid aspect-square cursor-pointer place-items-center rounded-card border border-dashed border-primary text-center text-primary"><input type="file" accept="image/*" multiple className="hidden" onChange={e=>{addPhotos(e.target.files);e.target.value="";}}/><span><ImagePlus className="mx-auto"/><small className="mt-2 block">Add photo</small></span></label>}</div>{video?<div className="mt-5 flex items-center justify-between rounded-card border border-border p-4"><span className="flex items-center gap-3 text-sm"><FileVideo/>{video.name} (1/1)</span><button type="button" aria-label="Remove video" onClick={()=>setVideo(null)}><X className="size-4"/></button></div>:<label className="mt-5 flex w-full cursor-pointer items-center justify-center gap-3 rounded-card border border-dashed border-border p-6"><input type="file" accept="video/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f){ if(f.size>50*1024*1024){alert("Video must be under 50MB");} else setVideo(f);} e.target.value="";}}/><FileVideo/>Add one video</label>}</>;
 if(step===4)return <><h2 className="font-display text-2xl font-bold">Review your listing</h2><div className="mt-6 grid gap-5 rounded-card bg-muted p-5 md:grid-cols-[180px_1fr]"><div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-card bg-secondary">{previews[0]?<img src={previews[0]} alt="Cover" className="h-full w-full object-cover"/>:<Camera/>}</div><div><Badge>Pending review</Badge><h3 className="mt-3 font-display text-xl font-bold">{title||"Your listing title"}</h3><p className="mt-2 text-muted-foreground">{cat.name} · {location||"Kenya"} · Photos {photos.length}/5 · Video {video?1:0}/1</p>{description&&<p className="mt-3 line-clamp-4 whitespace-pre-line text-sm text-muted-foreground">{description}</p>}<p className="mt-4 font-display text-2xl font-bold text-primary">KSh {Number(price||0).toLocaleString("en-KE")}</p></div></div></>;
 if(step===5)return <><h2 className="font-display text-2xl font-bold">Choose a seller package</h2><div className="mt-6 grid gap-4 md:grid-cols-3">{packages.map(p=><PackageCard key={p.name} p={p}/>)}</div></>;
 if(step===6)return <PaymentPanel/>;
 return <div className="py-12 text-center"><span className="mx-auto grid size-20 place-items-center rounded-full bg-secondary text-primary"><CheckCircle2 className="size-10"/></span><h2 className="mt-6 font-display text-3xl font-bold">Saved to VroomEver</h2><p className="mx-auto mt-3 max-w-md text-muted-foreground">Your listing is now stored in the marketplace database with pending moderation status.</p></div>;
}

function PackageCard({p}:{p:(typeof packages)[number]}) { return <div className={`relative rounded-card border p-5 ${p.popular?"border-primary bg-secondary":"border-border"}`}>{p.popular&&<Badge className="absolute -top-3 left-4">Most popular</Badge>}<h3 className="font-display text-xl font-bold">{p.name}</h3><p className="mt-2 text-sm text-muted-foreground">{p.description}</p><p className="mt-5 font-display text-2xl font-bold">{formatKsh(p.price)}<small className="text-xs font-normal text-muted-foreground"> / {p.cadence}</small></p><p className="mt-3 text-xs">Up to {p.limit} active listings</p></div> }
export function SubscriptionsPage() { return <SiteShell><div className="mx-auto max-w-6xl px-5 py-12"><PageTitle eyebrow="Seller plans" title="Choose the runway for your business" copy="Flexible listing capacity with transparent placeholder pricing."/><div className="grid gap-5 md:grid-cols-3">{packages.map(p=><div key={p.name} className={`rounded-card border p-7 shadow-card ${p.popular?"border-primary bg-secondary":"border-border bg-card"}`}><PackageCard p={p}/><Button asChild className="mt-6 w-full"><Link to="/subscriptions/payment" search={{plan:p.name.toLowerCase()}}>Choose {p.name}</Link></Button></div>)}</div><p className="mt-6 text-center text-xs text-muted-foreground">Stage 1 demo pricing. Packages and limits are centrally configurable.</p></div></SiteShell> }
function PaymentPanel() { const [state,setState]=useState<"idle"|"loading"|"success"|"failed">("idle"); const simulate=(success=true)=>{setState("loading");setTimeout(()=>setState(success?"success":"failed"),1000)}; return <div><h2 className="font-display text-2xl font-bold">Complete payment</h2><p className="mt-2 text-sm text-muted-foreground">Simulation only — no real payment will be processed.</p><div className="mt-6 grid gap-6 lg:grid-cols-2"><div className="rounded-card border border-border p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground"><Zap/></span><div><strong>M-Pesa STK Push</strong><p className="text-xs text-muted-foreground">Prompt sent to your phone</p></div></div><Input className="mt-5" defaultValue="+254 712 345 678"/><Button className="mt-4 w-full" onClick={()=>simulate(true)}>Send STK prompt</Button></div><div className="rounded-card border border-border p-5"><div className="flex items-center gap-3"><WalletCards className="text-primary"/><strong>Debit or credit card</strong></div><Input className="mt-5" placeholder="Card number"/><div className="mt-3 grid grid-cols-2 gap-3"><Input placeholder="MM / YY"/><Input placeholder="CVC"/></div><Button variant="outline" className="mt-4 w-full" onClick={()=>simulate(false)}>Pay by card</Button></div></div>{state!=="idle"&&<div className={`mt-5 rounded-card p-4 text-sm ${state==="success"?"bg-secondary text-primary":state==="failed"?"bg-destructive/10 text-destructive":"bg-muted"}`}>{state==="loading"&&"Simulating secure payment..."}{state==="success"&&"Payment simulation successful. Your plan is ready."}{state==="failed"&&"Payment simulation failed. Try again or choose M-Pesa."}</div>}</div> }
export function PaymentPage() { return <SiteShell><div className="mx-auto max-w-4xl px-5 py-12"><PageTitle eyebrow="Secure checkout" title="Activate your seller package"/><div className="rounded-card border border-border bg-card p-7 shadow-card"><PaymentPanel/></div></div></SiteShell> }
export function VipPage() { return <SiteShell><div className="mx-auto max-w-6xl px-5 py-12"><PageTitle eyebrow="VIP promotion" title="Put your best listings in the spotlight" copy="VIP listings appear in featured positions across the marketplace."/><div className="grid gap-4 md:grid-cols-4">{vipOptions.map((o,i)=><div key={o.duration} className={`rounded-card border p-6 ${i===1?"border-vip bg-accent":"border-border bg-card"}`}><Sparkles className="text-vip"/><h3 className="mt-5 font-display text-xl font-bold">{o.duration}</h3><p className="mt-2 text-sm text-muted-foreground">Featured dashboard placement and VIP badge.</p><p className="mt-6 font-display text-2xl font-bold">{formatKsh(o.price)}</p><Button variant="vip" className="mt-5 w-full">Promote listing</Button></div>)}</div></div></SiteShell> }

export function SellerDashboardPage() { const [authorized,setAuthorized]=useState(false); useEffect(()=>{supabase.auth.getSession().then(async({data})=>{if(!data.session){window.location.href="/auth?role=seller";return;} const {data:profile}=await getMyRoleRow(); const sellerProfile=null as null|{user_id:string}; if(profile?.role!=="seller" && !sellerProfile){window.location.href="/auth?role=seller";return;} if(profile?.role!=="seller" && sellerProfile){await supabase.rpc("become_seller");} setAuthorized(true);});},[]); if(!authorized)return null; const stats=[[Eye,"6,824","Listing views"],[MessageCircle,"148","Enquiries"],[Heart,"391","Favorites"],[PackageCheck,"12 / 50","Active listings"]] as const; return <SiteShell dashboardMode="seller"><div className="mx-auto max-w-7xl px-4 py-7 sm:px-5 sm:py-10"><PageTitle eyebrow="Seller workspace" title="Grow your storefront" copy="Performance and listing health at a glance." action={<Button asChild><Link to="/sell"><Plus/>New listing</Link></Button>}/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([Icon,n,l])=><div className="rounded-card border border-border bg-card p-5 shadow-card" key={l}><Icon className="text-primary"/><strong className="mt-4 block font-display text-3xl">{n}</strong><span className="text-sm text-muted-foreground">{l}</span></div>)}</div><div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.6fr]"><div className="rounded-card border border-border bg-card p-6"><h2 className="font-display text-xl font-bold">Listing performance</h2><div className="mt-8 grid h-56 grid-cols-12 items-end gap-1.5 sm:gap-3">{[45,72,50,86,66,94,78,103,88,120,104,135].map((h,i)=><div key={i} className="flex-1 rounded-t bg-primary/70" style={{height:h}}/>)}</div></div><div className="rounded-card border border-border bg-card p-6"><h2 className="font-display text-xl font-bold">Plan usage</h2><p className="mt-2 text-sm text-muted-foreground">Silver · renews in 18 days</p><div className="mt-6 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full w-1/4 bg-primary"/></div><p className="mt-2 text-xs">12 of 50 listings used</p><Button asChild variant="outline" className="mt-6 w-full"><Link to="/subscriptions">Manage plan</Link></Button></div></div></div></SiteShell> }
export function SellerListingsPage() {
 const [rows,setRows]=useState<Array<{id:string;title:string;price:number;status:string;created_at:string}>>([]);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{supabase.auth.getSession().then(async({data})=>{const sellerId=data.session?.user.id;if(!sellerId){window.location.href="/auth?role=seller";return;}const {data:items}=await supabase.from("products").select("id,title,price_ksh,status,created_at").eq("seller_id",sellerId).order("created_at",{ascending:false});setRows((items??[]).map(x=>({...x,price:Number(x.price_ksh)})));setLoading(false);});},[]);
 return <SiteShell><div className="mx-auto max-w-7xl px-4 py-7 sm:px-5 sm:py-10"><PageTitle eyebrow="Seller workspace" title="Your listings" copy="Live listings stored in the VroomEver database." action={<Button asChild><Link to="/sell"><Plus/>Add listing</Link></Button>}/>{loading?<p className="text-sm text-muted-foreground">Loading your listings…</p>:<div className="overflow-hidden rounded-card border border-border bg-card"><div className="hidden grid-cols-[1fr_auto_auto] gap-4 border-b border-border bg-muted/50 px-5 py-3 text-xs font-bold uppercase text-muted-foreground sm:grid"><span>Listing</span><span>Status</span><span>Price</span></div>{rows.length?rows.map(p=><div key={p.id} className="grid gap-3 border-b border-border px-4 py-4 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4 sm:px-5"><div className="min-w-0"><strong className="block truncate">{p.title}</strong><small className="text-muted-foreground">{new Date(p.created_at).toLocaleString()}</small></div><Badge variant="outline" className="w-fit">{p.status}</Badge><span className="font-semibold">{formatKsh(p.price)}</span></div>):<div className="p-8 text-center text-sm text-muted-foreground">No database listings yet. Create your first listing.</div>}</div>}</div></SiteShell>
}

export function LegalPage({type}:{type:"terms"|"privacy"|"seller"|"buyer"}) {
 const content={
  terms:{title:"Terms & Conditions",sections:[
   ["Using VroomEver","VroomEver is a Kenyan marketplace that helps buyers and sellers discover listings and communicate directly. By creating or using an account, you agree to these terms and to applicable Kenyan law."],
   ["Accounts and security","Provide accurate registration details, keep your password private, and do not create accounts for deceptive or unlawful purposes. You are responsible for activity performed through your account."],
   ["Listings and seller duties","Sellers must own or have authority to sell what they list, use accurate descriptions and prices, disclose material defects, and keep contact details reasonably reachable. Counterfeit, stolen, unsafe or unlawful goods are not permitted."],
   ["Buyer responsibilities","Buyers should review listing details, verify the seller and item, inspect goods where practical, and agree delivery and payment arrangements carefully. VroomEver does not take possession of listed goods unless a specific VroomEver service says otherwise."],
   ["Communication and transactions","Users are responsible for their agreements, payments, delivery, inspection and collection arrangements. Never share passwords, one-time codes or unnecessary financial information with another user."],
   ["Safety, reports and enforcement","Report suspicious listings, impersonation, fraud or unsafe conduct through the available reporting channels. VroomEver may restrict or remove accounts or listings that breach these terms or applicable law."],
   ["Fees and promotions","Any seller package, promotional placement or other paid feature will show its applicable price and conditions before activation. A marketplace listing does not itself guarantee a sale."],
   ["Intellectual property and user content","You retain rights in content you lawfully upload, while granting VroomEver the limited permission needed to host, display and operate the marketplace. Do not upload material that infringes another person's rights."],
   ["Privacy and legal compliance","Personal information is handled according to VroomEver's privacy notice. Users must comply with applicable Kenyan consumer, advertising, data-protection and other relevant laws."],
   ["Changes and contact","VroomEver may update these terms as the service develops. Continued use after an update means the revised terms apply from their effective date. Contact VroomEver through the support channel shown on the platform for questions."]
  ]},
  privacy:{title:"Privacy Policy",sections:[
   ["Information collected","VroomEver may process account details, listing information, contact details, device information and activity needed to operate and secure the marketplace."],
   ["How information is used","Information is used to authenticate users, publish listings, facilitate communication, improve the service, prevent abuse and provide support."],
   ["Sharing","Information may be shared with service providers needed to operate VroomEver or where required by law. VroomEver does not make another user's private account credentials publicly available."],
   ["Your choices","Users may request correction of inaccurate account information and should avoid publishing sensitive personal information in public listings."],
   ["Security and retention","VroomEver applies reasonable technical and organizational safeguards. Information is retained only as needed for legitimate operational, security, legal and support purposes."]
  ]},
  seller:{title:"Seller Terms",sections:[
   ["Accurate listings","Describe each product or service truthfully, including condition, location, price and important limitations."],
   ["Proof and lawful ownership","Only list items or services you are legally entitled to offer. Keep relevant ownership, authorization or compliance records where applicable."],
   ["Buyer communication","Respond respectfully, avoid deceptive claims, and never request passwords, OTPs or unrelated sensitive credentials."],
   ["Fulfilment and disputes","Agree payment, collection, delivery, inspection and refund terms clearly with buyers. Keep evidence of material transaction communications."],
   ["Moderation","VroomEver may pause, reject or remove listings that violate platform rules, applicable law or safety requirements."]
  ]},
  buyer:{title:"Buyer Terms",sections:[
   ["Review before buying","Check the listing, seller information, condition, price and location before committing."],
   ["Safe communication","Use sensible precautions when meeting sellers and do not disclose passwords, OTPs or unnecessary financial credentials."],
   ["Payments and delivery","Confirm the agreed payment recipient, amount and delivery or collection arrangement before sending funds."],
   ["Reports","Report suspicious, misleading, counterfeit, stolen or unsafe listings so VroomEver can review them."],
   ["Your agreement with the seller","The purchase agreement is between the buyer and seller unless VroomEver expressly provides a separate transaction service."]

  ]}
 }[type];
 return <SiteShell><article className="mx-auto max-w-3xl px-5 py-14"><PageTitle eyebrow="VroomEver legal" title={content.title} copy="Effective September 2026 · VroomEver marketplace terms"/>{content.sections.map(([s,p],i)=><section key={s} className="border-t border-border py-6"><h2 className="font-display text-xl font-bold">{i+1}. {s}</h2><p className="mt-3 leading-7 text-muted-foreground">{p}</p></section>)}</article></SiteShell>
}

