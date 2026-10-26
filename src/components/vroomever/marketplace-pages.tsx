import { Link, useNavigate } from "@tanstack/react-router";
import {
 ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Bell, Camera, Check, CheckCircle2, ChevronLeft, ChevronRight,
 CircleDollarSign, Clock3, Eye, FileVideo, Filter, Heart, ImagePlus, ListChecks, MapPin, MessageCircle,
 PackageCheck, Phone, Play, Plus, Search, ShieldCheck, Sparkles, Star, Store, UploadCloud, UserRound, UsersRound,
 WalletCards, WandSparkles, X, Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { getMyRoleRow } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { compactBrands, countSubcategories, canContactSeller } from "@/lib/marketplace-options";
import { Brand } from "./brand";
import { ProductCard } from "./product-card";
import { SiteShell } from "./site-shell";
import { ListingMedia } from "./listing-media";
import { useCategories } from "@/lib/use-categories";
import { formatKsh, packages, vipOptions } from "@/data/marketplace";
import { categoryImageFor } from "@/data/category-images";
import { subcategoryIcon } from "@/data/subcategory-icons";
import { subcategoryImage } from "@/data/subcategory-images";
import { makesFor } from "@/data/car-makes";
import { useMarketFilters, setMarketFilters, activeFilterCount, type MarketFilters } from "@/lib/market-filters";
import type { CardProduct } from "@/types/marketplace";
import hero from "@/assets/marketplace-hero.jpg";
import { mediaUrls, uploadListingMedia, imageToDataUrl } from "@/lib/product-media";
import { generateListingDescription } from "@/lib/describe.functions";
import { useServerFn } from "@tanstack/react-start";
import { lovable } from "@/integrations/lovable/index";
import { MarketHome } from "./market-home";
import { useListingPrices } from "@/lib/use-listing-prices";
import type { ListingCadence } from "@/lib/listing-pricing";
import { countryCodes, buildPhone, toIntl, whatsappLink, callLink } from "@/lib/phone";

type DbProduct = { id:string; title:string; price_ksh:number; location:string|null; condition:string|null; images:string[]; is_vip:boolean; category_slug:string; seller_id:string; views:number; description?:string|null; subcategory?:string|null; video_url?:string|null };
async function toCards(rows: DbProduct[]): Promise<CardProduct[]> {
 const firsts=await mediaUrls(rows.map(r=>r.images?.[0]??""));
 let i=0; const urls=rows.map(r=>r.images?.[0]?firsts[i++]:undefined);
 return rows.map((r,k)=>({id:r.id,title:r.title,price:Number(r.price_ksh),location:r.location,condition:r.condition,image:urls[k]??"/placeholder.svg",seller:"VRUMEX seller",vip:r.is_vip,category:r.category_slug,views:r.views}));
}
const liveCache=new Map<string,CardProduct[]>();
function useLiveProducts(category?: string, sellerId?: string, subcategory?: string, all = false, make?: string) {
 const f=useMarketFilters();
 const categories=useCategories();
 const fk=`${f.q}|${f.min}|${f.max}|${f.location}|${f.condition}|${f.sort}|${make??""}`;
 const key=`${category??""}|${sellerId??""}|${subcategory??""}${all?"|all":""}|${fk}`;
 const [items,setItems]=useState<CardProduct[]|null>(()=>liveCache.get(key)??null);
 useEffect(()=>{let alive=true; setItems(liveCache.get(key)??null);(async()=>{const rows:DbProduct[]=[]; const pageSize=all?100:24; let offset=0; do {let q=supabase.from("products").select("id,title,price_ksh,location,condition,images,is_vip,category_slug,seller_id,views,description,subcategory,brand").eq("status","active").or("listing_expires_at.is.null,listing_expires_at.gt."+new Date().toISOString()); if(category)q=q.eq("category_slug",category); if(sellerId)q=q.eq("seller_id",sellerId); if(subcategory)q=q.ilike("subcategory",subcategory); const term=f.q.trim().replace(/[%,()]/g," "); if(term){const matched=categories.filter(c=>`${c.name} ${c.subcategories.join(" ")}`.toLowerCase().includes(term.toLowerCase())).map(c=>c.slug);q=q.or(`title.ilike.%${term}%,description.ilike.%${term}%,subcategory.ilike.%${term}%${matched.length?`,category_slug.in.(${matched.join(",")})`:""}`);} if(f.condition&&category&&subcategory)q=q.eq("condition",f.condition); if(make)q=q.or(`brand.eq.${make},and(brand.is.null,title.ilike.%${make}%)`); const loc=f.location.trim().replace(/[%,()]/g," "); if(loc)q=q.ilike("location",`%${loc}%`); if(f.min&&!isNaN(+f.min))q=q.gte("price_ksh",+f.min); if(f.max&&!isNaN(+f.max))q=q.lte("price_ksh",+f.max); const ordered=f.sort==="recent"?q.order("is_vip",{ascending:false}).order("created_at",{ascending:false}):q.order("price_ksh",{ascending:f.sort==="price_asc"}); const {data,error}=await ordered.order("id",{ascending:false}).range(offset,offset+pageSize-1); if(error){if(alive)setItems([]);console.error("Listing search failed",error.message);break;} const batch=(data??[]) as DbProduct[]; rows.push(...batch); offset+=pageSize; const cards=await toCards(rows); liveCache.set(key,cards); if(alive)setItems(cards); if(!all||batch.length<pageSize)break;}while(alive);})();return()=>{alive=false};},[key,categories]);// eslint-disable-line react-hooks/exhaustive-deps
 return items;
}
export function LiveGrid({ category, sellerId, subcategory, all = false, make }: { category?: string; sellerId?: string; subcategory?: string; all?: boolean; make?: string }) {
 const live=useLiveProducts(category,sellerId,subcategory,all,make);
 if(live===null)return <p className="text-sm text-muted-foreground">Loading listings…</p>;
 const strict=category?live.filter(p=>p.category===category):live;
 if(strict.length===0)return <p className="rounded-card border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No approved listings match.</p>;
 return <ProductGrid items={strict}/>;
}

function MakeLogo({ name, src }: { name: string; src: string }) {
 const [bad,setBad]=useState(false); const ref=useRef<HTMLImageElement>(null);
 useEffect(()=>{const i=ref.current; if(i&&i.complete&&i.naturalWidth===0)setBad(true);},[]);
 return bad?<span className="grid size-10 place-items-center rounded-full bg-secondary text-sm font-bold text-primary">{name.slice(0,2).toUpperCase()}</span>:<img ref={ref} src={src} alt="" width={40} height={40} className="size-8 shrink-0 object-contain sm:size-9" onError={()=>setBad(true)}/>;
}
function useCategoryInventory(category: string) {
 const [rows,setRows]=useState<{subcategory:string|null;condition:string|null;location:string|null}[]|null>(null);
 useEffect(()=>{let alive=true;setRows(null);void(async()=>{const collected:{subcategory:string|null;condition:string|null;location:string|null}[]=[];for(let offset=0;alive;offset+=1000){const {data,error}=await supabase.from("products").select("subcategory,condition,location").eq("category_slug",category).eq("status","active").or("listing_expires_at.is.null,listing_expires_at.gt."+new Date().toISOString()).order("id").range(offset,offset+999);if(error)return;collected.push(...(data??[]));if((data??[]).length<1000)break;}if(alive)setRows(collected);})();return()=>{alive=false;};},[category]);
 return rows;
}
export function FilterMenu({ category, subcategory, make="", onMake }: {category?:string;subcategory?:string;make?:string;onMake?:(make:string)=>void}) {
 const f=useMarketFilters(); const n=activeFilterCount(f); const [open,setOpen]=useState(false);
 const inventory=useCategoryInventory(category??"");
 const relevant=inventory?.filter(r=>r.subcategory===subcategory)??[];
 const conditions=[...new Set(relevant.map(r=>r.condition).filter((v):v is string=>!!v))].sort();
 const locations=[...new Set(relevant.map(r=>r.location).filter((v):v is string=>!!v))].sort();
 const makes=subcategory?makesFor(subcategory):null;
 if(!category||!subcategory)return null;
 return <div className="mb-3 flex flex-wrap items-center gap-2">
  <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-xs" onClick={()=>setOpen(true)}><Filter className="size-3.5"/> Filters{n>0?` (${n})`:""}<ChevronRight className="size-3.5"/></Button>
  <label className="flex items-center gap-1.5 text-xs font-semibold">Sort<select aria-label="Sort listings" value={f.sort} onChange={e=>setMarketFilters({sort:e.target.value as MarketFilters["sort"]})} className="h-8 max-w-44 rounded-md border border-input bg-background px-2 text-xs"><option value="recent">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select></label>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent className="flex max-h-[90svh] w-[calc(100%-1.5rem)] max-w-xl flex-col gap-3 rounded-lg p-4">
   <DialogTitle className="pr-7">Filters · {subcategory}</DialogTitle><DialogDescription>Listing preferences</DialogDescription>
   <div className="grid min-h-0 grid-cols-2 gap-3 overflow-y-auto pb-1">
    <label className="min-w-0 text-xs font-semibold">Min price (KSh)<Input aria-label="Minimum price" type="number" min="0" value={f.min} onChange={e=>setMarketFilters({min:e.target.value})} className="mt-1 h-9" placeholder="0"/></label>
    <label className="min-w-0 text-xs font-semibold">Max price (KSh)<Input aria-label="Maximum price" type="number" min="0" value={f.max} onChange={e=>setMarketFilters({max:e.target.value})} className="mt-1 h-9" placeholder="Any"/></label>
    <label className="col-span-2 text-xs font-semibold">Region / location<Input list="listing-regions" aria-label="Filter location" value={f.location} onChange={e=>setMarketFilters({location:e.target.value})} className="mt-1 h-9" placeholder="Any region or town"/><datalist id="listing-regions">{locations.map(l=><option key={l} value={l}/>)}</datalist></label>
    {conditions.length>0&&<label className="col-span-2 text-xs font-semibold">{category==="services"||category==="jobs"?"Availability":"Condition"}<select aria-label="Filter condition" value={f.condition} onChange={e=>setMarketFilters({condition:e.target.value})} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"><option value="">Any</option>{conditions.map(c=><option key={c}>{c}</option>)}</select></label>}
    {makes&&onMake&&<label className="col-span-2 text-xs font-semibold">Brand<select aria-label="Filter brand" value={make} onChange={e=>onMake(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"><option value="">All brands</option>{makes.map(m=><option key={m.name}>{m.name}</option>)}</select></label>}
   </div><div className="flex justify-between gap-2 border-t border-border pt-3"><Button variant="ghost" size="sm" onClick={()=>{setMarketFilters({min:"",max:"",location:"",condition:"",sort:"recent"});onMake?.("");}}>Reset</Button><Button size="sm" onClick={()=>setOpen(false)}>Show listings</Button></div>
  </DialogContent></Dialog>
 </div>;
}
export function MarketSearch({ className="" }: { className?: string }) {
 const f=useMarketFilters(); const [v,setV]=useState(f.q);
 useEffect(()=>setV(f.q),[f.q]);
 useEffect(()=>{const t=setTimeout(()=>setMarketFilters({q:v}),300);return()=>clearTimeout(t);},[v]);
 return <form onSubmit={e=>{e.preventDefault();setMarketFilters({q:v});}} className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center rounded-card bg-background p-1.5 text-foreground ${className}`}><Search className="mx-3 size-5 text-muted-foreground"/><Input aria-label="Search the marketplace" value={v} onChange={e=>setV(e.target.value)} className="h-10 min-w-0 border-0 text-foreground caret-primary shadow-none" placeholder="Search the marketplace"/><Button type="submit">Search</Button></form>;
}

export function PageTitle({ eyebrow, title, copy, action }: { eyebrow?: string; title: string; copy?: string; action?: React.ReactNode }) {
 return <div className="mb-3 grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><div className="min-w-0">{eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}<h1 className="font-display text-2xl font-bold md:text-3xl">{title}</h1>{copy && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{copy}</p>}</div>{action&&<div className="flex min-w-0 flex-wrap gap-2">{action}</div>}</div>;
}
export const Seo = (title: string, description: string) => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] });

export function CategoryGrid() { const categories=useCategories(); return <div className="grid grid-cols-4 gap-2 pb-3 sm:flex sm:gap-4 sm:overflow-x-auto sm:snap-x sm:snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{categories.map((cat)=><Link key={cat.slug} to="/category/$category" params={{category:cat.slug}} className="group flex min-h-24 min-w-0 flex-col items-center justify-center rounded-card border border-white/60 bg-white/55 p-2 text-center shadow-sm backdrop-blur-xl card-3d hover:border-primary/40 hover:bg-white/75 sm:min-h-32 sm:min-w-[145px] sm:snap-start sm:p-4"><span className="grid size-11 place-items-center sm:size-16">{categoryImageFor(cat)?<img src={categoryImageFor(cat)} alt="" loading="lazy" width={64} height={64} className="size-11 object-contain drop-shadow-lg transition group-hover:scale-110 sm:size-16"/>:<cat.icon className="size-6 text-primary"/>}</span><span className="mt-2 text-[10px] font-semibold leading-tight sm:mt-3 sm:text-xs">{cat.name}</span></Link>)}</div> }
function ProductGrid({ items }: { items: CardProduct[] }) { return <div className="grid grid-cols-2 gap-3 sm:gap-5">{items.map(p=><ProductCard key={p.id} product={p}/>)}</div> }

export function DashboardPage() {
 const nav=useNavigate();
 const [sessionReady,setSessionReady]=useState(false);
 const [firstName,setFirstName]=useState("");
 useEffect(()=>{supabase.auth.getSession().then(async({data})=>{if(!data.session){nav({to:"/auth",search:{role:"buyer",mode:"login"},replace:true});return;} const {data:roleRow}=await getMyRoleRow(); const {data:prof}=await supabase.from("profiles").select("full_name").eq("id",data.session.user.id).maybeSingle(); const profile={role:roleRow?.role,full_name:prof?.full_name}; if(profile?.role==="seller"){nav({to:"/seller/dashboard",replace:true});return;} const name=(profile?.full_name||"").trim().split(/\s+/)[0] || data.session.user.email?.split("@")[0] || "there"; setFirstName(name); setSessionReady(true);});},[nav]);
 if(!sessionReady)return null;
 return <SiteShell dashboardMode="buyer" hideBackButton><MarketHome /></SiteShell>;
}




export function CategoryPage({ slug, sub = "", make = "" }: { slug: string; sub?: string; make?: string }) {
 const categories=useCategories();
 const navigate=useNavigate();
 const inventory=useCategoryInventory(slug);
 const counts=countSubcategories(inventory??[]);
 const [otherBrands,setOtherBrands]=useState(false);
 const cat=categories.find(c=>c.slug===slug);
 const subcategory=cat?.subcategories.includes(sub)?sub:"";
 const makes=subcategory?makesFor(subcategory):null;
 const activeMake=makes?.some(m=>m.name===make)?make:"";
 const brandChoices=compactBrands(makes??[]);
 useEffect(()=>{setMarketFilters({condition:""});setOtherBrands(false);},[slug,sub]);
 const [categoryImageFailed,setCategoryImageFailed]=useState(false);
 const tile="group flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 p-1 text-center text-[10px] font-semibold transition hover:bg-muted";
 const go=(s:{sub?:string;make?:string})=>navigate({to:"/category/$category",params:{category:cat?.slug ?? slug},search:s});
 const SubIcon=subcategory?subcategoryIcon(subcategory):null;
 if(!cat) return <SiteShell><p className="p-6">Category unavailable.</p></SiteShell>;
 if(!subcategory) return <SiteShell hideBackButton><div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/65 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="category-picker-title">
  <section className="relative flex max-h-[88svh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl animate-scale-in">
   <header className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary">{categoryImageFor(cat)&&!categoryImageFailed?<img src={categoryImageFor(cat)} alt="" width={44} height={44} onError={()=>setCategoryImageFailed(true)} className="size-10 object-contain"/>:<cat.icon className="size-7"/>}</span>
    <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-widest text-primary">Choose a subcategory</p><h1 id="category-picker-title" className="font-display text-xl font-bold sm:text-2xl">{cat.name}</h1></div>
    <Button type="button" variant="ghost" size="icon" onClick={()=>navigate({to:"/",replace:true})} className="shrink-0" aria-label="Close category popup" title="Close"><X className="size-5"/></Button>
   </header>
   <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4"><div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3 md:grid-cols-4">
    {cat.subcategories.map(s=>{const Icon=subcategoryIcon(s);const img=subcategoryImage(cat.slug,s);return <Button key={s} type="button" variant="ghost" onClick={()=>go({sub:s})} className="group h-auto min-w-0 flex-col gap-1.5 whitespace-normal p-2 text-center sm:p-2.5"><span className="grid h-14 w-full place-items-center text-primary">{img?<img src={img} alt="" width={56} height={56} loading="lazy" className="size-12 object-contain transition group-hover:scale-110"/>:<Icon className="size-8 transition group-hover:scale-110"/>}</span><span className="text-[11px] font-semibold leading-tight sm:text-xs">{s}</span><span className="text-[10px] text-muted-foreground">{inventory===null?"…":`${counts[s]??0} listings`}</span></Button>;})}
   </div></div>
   <footer className="border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-6">Select a subcategory to view matching listings.</footer>
  </section>
 </div></SiteShell>;
 return <SiteShell hideBackButton><div className="mx-auto min-h-[55vh] max-w-7xl px-4 py-5 sm:px-5 sm:py-8">
  <div className="mb-2 flex min-w-0 items-center gap-3"><Button type="button" variant="ghost" size="sm" onClick={()=>go(activeMake?{sub:subcategory}:{})}><ArrowLeft className="size-4"/> Back</Button>
   {activeMake ? <><MakeLogo name={activeMake} src={makes?.find(m=>m.name===activeMake)?.logo ?? ""}/><h1 className="min-w-0 break-words font-display text-xl font-bold">{activeMake} · {subcategory}</h1></> : <><span className="grid size-12 shrink-0 place-items-center">{subcategoryImage(cat.slug,subcategory)?<img src={subcategoryImage(cat.slug,subcategory)} alt="" width={48} height={48} className="size-12 object-contain"/>:SubIcon?<SubIcon className="size-8"/>:null}</span><h1 className="font-display text-xl font-bold">{subcategory}</h1></>}
  </div>
  <FilterMenu category={cat.slug} subcategory={subcategory} make={activeMake} onMake={m=>{void go({sub:subcategory,...(m?{make:m}:{})});}}/>
  {!activeMake&&makes&&<section aria-label={subcategory+" brands"} className="mb-3"><h2 className="mb-1 text-xs font-semibold">Browse by brand</h2><div className="grid max-w-lg grid-cols-4 gap-1">{brandChoices.visible.map(m=><Button variant="ghost" key={m.name} type="button" onClick={()=>go({sub:subcategory,make:m.name})} className={tile+" h-auto whitespace-normal"}><MakeLogo name={m.name} src={m.logo}/><span>{m.name}</span></Button>)}{brandChoices.others.length>0&&<Button variant="ghost" type="button" onClick={()=>setOtherBrands(true)} className={tile+" h-auto whitespace-normal"}><Plus className="size-6 text-primary"/><span>Others</span></Button>}</div></section>}
  <Dialog open={otherBrands} onOpenChange={setOtherBrands}><DialogContent className="flex max-h-[90svh] w-[calc(100%-1.5rem)] max-w-lg flex-col rounded-lg p-4"><DialogTitle>Other brands · {subcategory}</DialogTitle><DialogDescription>Vehicle brands</DialogDescription><div className="min-h-0 overflow-y-auto">{brandChoices.others.map(m=><Button key={m.name} variant="ghost" className="h-12 w-full justify-start gap-3 border-b border-border rounded-none" onClick={()=>{setOtherBrands(false);void go({sub:subcategory,make:m.name});}}><MakeLogo name={m.name} src={m.logo}/><span className="min-w-0 flex-1 truncate text-left">{m.name}</span><ChevronRight className="size-4"/></Button>)}</div><Button variant="outline" size="sm" onClick={()=>setOtherBrands(false)}><ArrowLeft className="size-4"/> Back</Button></DialogContent></Dialog>
  <LiveGrid category={cat.slug} subcategory={subcategory} {...(activeMake?{make:activeMake}:{})}/>
 </div></SiteShell>;
}

export function ProductPage({ id }: { id: string }) {
 const sample=undefined as undefined|{title:string;price:number;location:string;condition:string;vip?:boolean;seller:string;image:string};
 const [p,setP]=useState<null|{title:string;price:number;location:string|null;condition:string|null;vip:boolean;description:string;seller:string;sellerId:string|null;phone:string|null;photos:string[];video:string|null}>(sample?{title:sample.title,price:sample.price,location:sample.location,condition:sample.condition,vip:!!sample.vip,description:"Exceptionally clean and well maintained. Available for viewing. Serious buyers are welcome to contact the seller directly.",seller:sample.seller,sellerId:null,phone:null,photos:[sample.image],video:null}:null);
 const [missing,setMissing]=useState(false);
  const [active,setActive]=useState(0);
  const touchX=useRef(0);
 const [liked,setLiked]=useState(false);
 const [signedIn,setSignedIn]=useState(false);
 useEffect(()=>{
  void supabase.auth.getSession().then(({data})=>setSignedIn(!!data.session));
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setSignedIn(!!session));
  return()=>subscription.unsubscribe();
 },[]);
 useEffect(()=>{if(sample)return;(async()=>{
  const {data}=await supabase.from("products").select("title,price_ksh,location,condition,is_vip,description,seller_id,images,video_url").eq("id",id).eq("status","active").maybeSingle();
  if(!data){setMissing(true);return;}
  const [{data:prof},photos,vid]=await Promise.all([supabase.rpc("get_public_profile",{_id:data.seller_id}).maybeSingle(),mediaUrls(data.images??[]),data.video_url?mediaUrls([data.video_url]):Promise.resolve([])]);
  const {data:contact}=signedIn?await supabase.from("products").select("contact_phone").eq("id",id).eq("status","active").maybeSingle():{data:null};
  setP({title:data.title,price:Number(data.price_ksh),location:data.location,condition:data.condition,vip:data.is_vip,description:data.description||"",seller:prof?.full_name||"VRUMEX seller",sellerId:data.seller_id,phone:signedIn?(toIntl(contact?.contact_phone)??toIntl(prof?.phone)):null,photos,video:vid[0]??null});
   setActive(0);
  const {data:{session}}=await supabase.auth.getSession();
  if(session){const {data:f}=await supabase.from("favorites").select("product_id").eq("user_id",session.user.id).eq("product_id",id).maybeSingle();setLiked(!!f);}
 })();},[id,sample,signedIn]);
 const toggleFav=async()=>{const {data:{session}}=await supabase.auth.getSession(); if(!session){window.location.href="/auth?role=buyer&mode=login";return;} if(sample){setLiked(!liked);return;} if(liked){await supabase.from("favorites").delete().eq("user_id",session.user.id).eq("product_id",id);setLiked(false);}else{await supabase.from("favorites").insert({user_id:session.user.id,product_id:id});setLiked(true);}};
 const reportListing=async()=>{const {data:{session}}=await supabase.auth.getSession(); if(!session){window.location.href="/auth?role=buyer&mode=login";return;} const reason=window.prompt("What is wrong with this listing?"); if(!reason?.trim())return; const {error}=await supabase.from("reports").insert({reporter_id:session.user.id,product_id:id,reason:reason.trim().slice(0,500)}); window.alert(error?error.message:"Thanks — our team will review this listing.");};
 useEffect(()=>{if(id)void supabase.rpc("record_product_view",{_product_id:id});},[id]);
 const logEnquiry=(channel:"whatsapp"|"call",e:{preventDefault:()=>void})=>{if(!signedIn){e.preventDefault();window.location.href="/auth?role=buyer&mode=login";return;} if(!p?.sellerId)return;void supabase.auth.getSession().then(({data})=>supabase.from("product_enquiries").insert({product_id:id,seller_id:p.sellerId ?? "",buyer_id:data.session?.user.id??null,channel}));};
 if(missing)return <SiteShell><div className="mx-auto max-w-3xl px-5 py-20 text-center"><h1 className="font-display text-3xl font-bold">Listing not available</h1><p className="mt-3 text-muted-foreground">It may be awaiting approval or was removed.</p><Button asChild className="mt-6"><Link to="/dashboard">Back to marketplace</Link></Button></div></SiteShell>;
 if(!p)return <SiteShell><div className="mx-auto max-w-7xl px-5 py-20 text-sm text-muted-foreground">Loading listing…</div></SiteShell>;
  const photos=p.photos.length?p.photos:["/placeholder.svg"];
  const total=photos.length+(p.video?1:0);
  const isVideoActive=active>=photos.length;
  const wa=canContactSeller(signedIn)&&p.phone?whatsappLink(p.phone,"Hi, I'm interested in "+p.title+" on VRUMEX"):null;
   return <SiteShell><div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-5 sm:py-4"><div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,.65fr)] lg:gap-8"><div className="min-w-0"><div className="relative overflow-hidden rounded-card bg-muted" onTouchStart={(e)=>{touchX.current=e.touches[0]?.clientX ?? 0;}} onTouchEnd={(e)=>{if(total<2)return;const dx=(e.changedTouches[0]?.clientX ?? touchX.current)-touchX.current;if(Math.abs(dx)<40)return;setActive((a)=>dx<0?(a+1)%total:(a-1+total)%total);}}>{isVideoActive?<video src={p.video ?? undefined} controls className="aspect-[4/3] max-h-[72svh] w-full bg-surface-strong object-contain"/>:<img src={photos[active]} alt={p.title} width={1200} height={900} className="aspect-[4/3] max-h-[72svh] w-full object-contain"/>}{total>1&&<button type="button" aria-label="Previous photo" onClick={()=>setActive((a)=>(a-1+total)%total)} className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface-strong/80 p-2 text-surface-foreground shadow-elevated backdrop-blur transition hover:scale-110 hover:bg-surface-strong sm:left-3"><ChevronLeft className="size-5"/></button>}{total>1&&<button type="button" aria-label="Next photo" onClick={()=>setActive((a)=>(a+1)%total)} className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface-strong/80 p-2 text-surface-foreground shadow-elevated backdrop-blur transition hover:scale-110 hover:bg-surface-strong sm:right-3"><ChevronRight className="size-5"/></button>}<span className="absolute bottom-2 right-2 rounded-full bg-surface-strong/80 px-2.5 py-1 text-xs text-surface-foreground sm:bottom-4 sm:right-4 sm:px-3">{active+1} / {total} {isVideoActive?"video":"photos"}</span></div>{total>1&&<div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:thin] sm:gap-3">{Array.from({length:total},(_,i)=>i).map((i)=>{const isVid=i>=photos.length;return <button type="button" key={i} ref={(el)=>{if(el&&i===active)el.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});}} onClick={()=>setActive(i)} className={`relative aspect-[4/3] w-20 shrink-0 snap-center overflow-hidden rounded-md border-2 bg-muted sm:w-24 ${i===active?"border-primary":"border-border"}`}>{isVid?<span className="grid h-full w-full place-items-center bg-secondary text-primary"><Play className="size-6"/></span>:<img src={photos[i]} alt={`${p.title} photo ${i+1}`} loading="lazy" className="h-full w-full object-cover"/>}</button>;})}</div>}<div className="mt-7 min-w-0 sm:mt-8"><h2 className="font-display text-xl font-bold sm:text-2xl">Description</h2><p className="mt-4 break-words whitespace-pre-line leading-relaxed text-muted-foreground">{p.description||"No description provided."}</p></div></div><aside className="min-w-0"><div className="rounded-card border border-border bg-card p-4 shadow-elevated sm:p-6 lg:sticky lg:top-24">{p.vip&&<Badge className="bg-vip text-vip-foreground"><Sparkles/> VIP listing</Badge>}<p className="mt-4 text-sm text-primary">{p.condition}</p><h1 className="mt-2 break-words font-display text-2xl font-bold sm:text-3xl">{p.title}</h1><p className="mt-4 break-words font-display text-2xl font-bold text-primary sm:text-3xl">{formatKsh(p.price)}</p><p className="mt-3 flex min-w-0 items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4 shrink-0"/><span className="truncate">{p.location}</span></p><div className="my-6 border-y border-border py-5"><p className="text-xs text-muted-foreground">SELLER</p><Link to="/seller/$id" params={{id:p.sellerId??""}} className="mt-2 flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary"><Store/></span><span className="min-w-0"><strong className="block truncate">{p.seller}</strong><small className="flex items-center gap-1 text-primary"><BadgeCheck className="size-3"/> Seller</small></span></Link></div>{!canContactSeller(signedIn)?<Button asChild className="w-full" size="lg"><Link to="/auth" search={{role:"buyer",mode:"login"}}><Phone/> Show number</Link></Button>:wa?<Button asChild className="w-full" size="lg"><a href={wa} target="_blank" rel="noreferrer" onClick={(e)=>logEnquiry("whatsapp",e)}><MessageCircle/> WhatsApp seller</a></Button>:<Button className="w-full" size="lg" disabled><MessageCircle/> WhatsApp seller</Button>}{canContactSeller(signedIn)&&p.phone&&<Button asChild variant="outline" size="lg" className="mt-3 w-full"><a href={callLink(p.phone)} onClick={(e)=>logEnquiry("call",e)} className="min-w-0"><Phone className="shrink-0"/><span className="truncate">Call +{p.phone}</span></a></Button>}<Button variant="ghost" className="mt-3 w-full" onClick={()=>void toggleFav()}><Heart className={liked?"fill-current text-destructive":""}/> {liked?"Saved":"Save to favorites"}</Button>{!sample&&<Button variant="ghost" size="sm" className="mt-2 w-full text-muted-foreground" onClick={()=>void reportListing()}>Report this listing</Button>}<p className="mt-5 text-center text-xs text-muted-foreground"><ShieldCheck className="mr-1 inline size-3"/>Never pay in advance. Meet in a safe place.</p></div></aside></div></div></SiteShell>;
}

export function SellerPage({ id }: { id: string }) {
 const [prof,setProf]=useState<null|{full_name:string|null;location:string|null;id_verified:boolean;created_at:string}>(null);
 const [count,setCount]=useState<number|null>(null);
 useEffect(()=>{void supabase.rpc("get_public_profile",{_id:id}).maybeSingle().then(({data})=>setProf(data)); void supabase.from("products").select("id",{count:"exact",head:true}).eq("seller_id",id).eq("status","active").then(({count})=>setCount(count??0));},[id]);
 return <SiteShell><div className="mx-auto max-w-7xl px-4 py-7 sm:px-5 sm:py-10"><div className="rounded-card border border-border bg-card p-5 shadow-card sm:p-7"><div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 sm:gap-5"><div className="grid size-16 shrink-0 place-items-center rounded-full bg-secondary text-primary sm:size-20"><Store className="size-8 sm:size-9"/></div><div className="min-w-0">{prof?.id_verified&&<p className="flex items-center gap-1 text-sm text-primary"><BadgeCheck className="size-4"/> Verified seller</p>}<h1 className="font-display text-2xl font-bold sm:text-3xl">{prof?.full_name||"VRUMEX seller"}</h1><p className="mt-1 text-sm text-muted-foreground">{[prof?.location,prof?`Member since ${new Date(prof.created_at).getFullYear()}`:null].filter(Boolean).join(" · ")}</p></div></div></div><div className="py-10"><PageTitle title="Seller listings" copy={count===null?"Loading…":`${count} active listing${count===1?"":"s"}`}/><LiveGrid sellerId={id}/></div></div></SiteShell>;
}

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
      seller: "VRUMEX seller",
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
      const chosen = sessionStorage.getItem("vrumex:oauthRole");
      if (!chosen) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      sessionStorage.removeItem("vrumex:oauthRole");
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
    const host = window.location.hostname;
    if (host.endsWith(".vercel.app")) { setError(`${provider === "google" ? "Google" : "Apple"} sign-in only works on the VRUMEX site published from Lovable or the custom domain vrumex.com. Please sign in with email and password here.`); return; }
    sessionStorage.setItem("vrumex:oauthRole", signupRole);
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth?role=${signupRole}&mode=login` });
    if (result.error) { sessionStorage.removeItem("vrumex:oauthRole"); setError(`${provider === "google" ? "Google" : "Apple"} sign-in failed. Please try again.`); return; }
    if (result.redirected) return;
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      sessionStorage.removeItem("vrumex:oauthRole");
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
          alt="VRUMEX marketplace"
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
          <p className="mt-10 text-sm text-primary">{signup ? "Join VRUMEX" : "Welcome back"}</p>
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
              <Checkbox required className="mt-0.5" />
              <span>I accept the <a href="/terms" target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-2">Terms & Conditions</a> and the <a href={signupRole === "seller" ? "/seller-terms" : "/buyer-terms"} target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-2">{signupRole === "seller" ? "Seller terms" : "Buyer terms"}</a>.</span>
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
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => void social("google")} className="flex h-11 items-center justify-center gap-2.5 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
                Continue with Google
              </button>
              <button type="button" onClick={() => void social("apple")} className="flex h-11 items-center justify-center gap-2.5 rounded-full border border-surface-muted/40 bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current"><path d="M16.37 12.62c-.02-2.1 1.72-3.11 1.8-3.16-.98-1.43-2.5-1.63-3.04-1.65-1.29-.13-2.52.76-3.18.76-.65 0-1.66-.74-2.73-.72-1.4.02-2.7.82-3.42 2.08-1.46 2.53-.37 6.28 1.05 8.33.7 1 1.52 2.13 2.6 2.09 1.05-.04 1.44-.67 2.7-.67 1.26 0 1.62.67 2.72.65 1.13-.02 1.84-1.02 2.52-2.03.8-1.16 1.13-2.29 1.14-2.35-.02-.01-2.18-.84-2.2-3.33zM14.3 6.45c.57-.7.96-1.66.85-2.62-.83.03-1.83.55-2.42 1.24-.53.61-1 1.6-.87 2.54.92.07 1.87-.47 2.44-1.16z"/></svg>
                Continue with Apple
              </button>
            </div>
          </div>}

          <p className="mt-6 text-center text-sm text-surface-muted">
            {signup ? "Already a member? " : "New to VRUMEX? "}
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
  const [categorySlug,setCategorySlug]=useState(useCategories()[0]?.slug ?? "cars");
  const [brand,setBrand]=useState("");
  const [cadence,setCadence]=useState<ListingCadence>("monthly");
  const [paymentComplete,setPaymentComplete]=useState(false);
  const [paymentMethod,setPaymentMethod]=useState<"mpesa"|"card">("mpesa");
  const {data:listingPrices}=useListingPrices();

  const [title,setTitle]=useState("");
  const [price,setPrice]=useState("");
  const [location,setLocation]=useState("");
  const [description,setDescription]=useState("");
  const [condition,setCondition]=useState("Brand New");
  const [subcategory,setSubcategory]=useState("");
  const selectedPrice=listingPrices?.find(p=>p.category_slug===categorySlug && p.subcategory===subcategory);
  const [phoneCode,setPhoneCode]=useState("254");
  const [phoneNum,setPhoneNum]=useState("");
  const [photos,setPhotos]=useState<File[]>([]);
  const [video,setVideo]=useState<File|null>(null);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{supabase.auth.getSession().then(async({data})=>{if(!data.session){nav({to:"/auth",search:{role:"seller",mode:"login"},replace:true});return;} const {data:profile}=await getMyRoleRow(); const sellerProfile=null as null|{user_id:string}; if(profile?.role!=="seller" && profile?.role!=="admin" && !sellerProfile){nav({to:"/auth",search:{role:"seller",mode:"login"},replace:true});return;} if(profile?.role!=="seller" && sellerProfile){await supabase.rpc("become_seller");} setAuthorized(true);});},[nav]);
  const publish=async()=>{
    const {data:sessionData}=await supabase.auth.getSession();
    const sellerId=sessionData.session?.user.id;
    if(!sellerId){nav({to:"/auth",search:{role:"seller",mode:"login"}});return;}
    if(!title.trim()||!price||Number(price)<0){setError("Add a valid title and price before publishing.");return;}
    if(!paymentComplete||!selectedPrice){setError("Choose a listing package and complete the payment simulation first.");return;}
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
      price_ksh:Number(price),location:location.trim(),condition,status:"pending",subcategory:subcategory||null,images:imagePaths,video_url:videoPath,contact_phone:contactPhone,brand:brand||null,listing_cadence:cadence,listing_payment_method:paymentMethod
    });
    if(insertError){setError(insertError.message);setSaving(false);return;}
    setStep(7);setSaving(false);
  };
  const next=()=>{setError("");if(step===1&&!subcategory){setError("Choose a subcategory.");return;}if(step===5&&!selectedPrice){setError("Listing prices are still loading. Please try again.");return;}if(step===2&&!buildPhone(phoneCode,phoneNum)){setError("Select your country code and enter a valid WhatsApp number (also used for calls).");return;}setStep(Math.min(7,step+1));};
  if(!authorized)return null;
  return <SiteShell><div className="mx-auto max-w-5xl px-4 py-7 sm:px-5 sm:py-10"><PageTitle eyebrow="Seller studio" title="Create a new listing" copy="Build a clear, trustworthy listing buyers will love."/><div className="mb-6"><div className="flex items-center gap-3 rounded-card border border-border bg-card p-3 sm:hidden"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{step+1}</span><div className="min-w-0"><p className="text-xs text-muted-foreground">Step {step+1} of {steps.length}</p><p className="truncate font-semibold">{steps[step]}</p></div></div><div className="hidden overflow-x-auto sm:block"><div className="flex min-w-[720px] items-center">{steps.map((s,i)=><div key={s} className="flex flex-1 items-center"><span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${i<=step?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground"}`}>{i<step?<Check className="size-4"/>:i+1}</span><span className="ml-2 text-xs font-medium">{s}</span>{i<steps.length-1&&<div className="mx-3 h-px flex-1 bg-border"/>}</div>)}</div></div></div><div className="rounded-card border border-border bg-card p-4 shadow-card sm:p-6 md:p-9"><SellStep step={step} categorySlug={categorySlug} setCategorySlug={x=>{setCategorySlug(x);setPaymentComplete(false);}} title={title} setTitle={setTitle} price={price} setPrice={setPrice} location={location} setLocation={setLocation} description={description} setDescription={setDescription} condition={condition} setCondition={setCondition} photos={photos} setPhotos={setPhotos} video={video} setVideo={setVideo} subcategory={subcategory} setSubcategory={x=>{setSubcategory(x);setPaymentComplete(false);}} phoneCode={phoneCode} setPhoneCode={setPhoneCode} phoneNum={phoneNum} setPhoneNum={setPhoneNum} brand={brand} setBrand={setBrand} cadence={cadence} setCadence={x=>{setCadence(x);setPaymentComplete(false);}} paymentComplete={paymentComplete} setPaymentComplete={setPaymentComplete} setPaymentMethod={setPaymentMethod}/>{error&&<p className="mt-5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<div className="mt-8 grid grid-cols-2 gap-3"><Button variant="outline" disabled={step===0||saving} onClick={()=>setStep(step-1)}><ArrowLeft/>Back</Button>{step<6?<Button onClick={next}>Continue<ArrowRight/></Button>:step===6?<Button onClick={publish} disabled={saving||!paymentComplete}>{saving?"Saving…":"Publish listing"}<Check/></Button>:<Button asChild><Link to="/seller/listings">View listings</Link></Button>}</div></div></div></SiteShell>
}

function SellStep({step,categorySlug,setCategorySlug,title,setTitle,price,setPrice,location,setLocation,description,setDescription,condition,setCondition,photos,setPhotos,video,setVideo,subcategory,setSubcategory,phoneCode,setPhoneCode,phoneNum,setPhoneNum,brand,setBrand,cadence,setCadence,paymentComplete,setPaymentComplete,setPaymentMethod}:{setPaymentMethod:(method:"mpesa"|"card")=>void;brand:string;setBrand:(x:string)=>void;cadence:ListingCadence;setCadence:(x:ListingCadence)=>void;paymentComplete:boolean;setPaymentComplete:(x:boolean)=>void;step:number;categorySlug:string;setCategorySlug:(x:string)=>void;title:string;setTitle:(x:string)=>void;price:string;setPrice:(x:string)=>void;location:string;setLocation:(x:string)=>void;description:string;setDescription:(x:string)=>void;condition:string;setCondition:(x:string)=>void;photos:File[];setPhotos:(x:File[])=>void;video:File|null;setVideo:(x:File|null)=>void;subcategory:string;setSubcategory:(x:string)=>void;phoneCode:string;setPhoneCode:(x:string)=>void;phoneNum:string;setPhoneNum:(x:string)=>void}) {
 const categories=useCategories();
 const cat=categories.find(c=>c.slug===categorySlug)??categories[0];
 const {data:listingPrices}=useListingPrices();
 const selectedPrice=listingPrices?.find(p=>p.category_slug===categorySlug && p.subcategory===subcategory);
 const previews=useMemo(()=>photos.map(f=>URL.createObjectURL(f)),[photos]);
 useEffect(()=>()=>previews.forEach(u=>URL.revokeObjectURL(u)),[previews]);
 const describe=useServerFn(generateListingDescription);
 const [aiBusy,setAiBusy]=useState(false); const [aiErr,setAiErr]=useState("");
 const writeWithAi=async()=>{ if(title.trim().length<2){setAiErr("Add a title first so the AI knows what you're selling.");return;} setAiBusy(true);setAiErr(""); try{ const imgs=await Promise.all(photos.slice(0,3).map(f=>imageToDataUrl(f))); const r=await describe({data:{title,category:cat?.name ?? categorySlug,subcategory,condition,price,location,notes:description,photos:imgs}}); setDescription(r.description);}catch(e){setAiErr(e instanceof Error?e.message:"AI description failed.");} finally{setAiBusy(false);} };
 const addPhotos=(list:FileList|null)=>{ if(!list)return; const imgs=Array.from(list).filter(f=>f.type.startsWith("image/")); setPhotos([...photos,...imgs].slice(0,5)); };
 if(!cat)return <p>Loading categories…</p>;
 if(step===0)return <><h2 className="font-display text-2xl font-bold">What are you selling?</h2><div className="mt-6 flex gap-4 overflow-x-auto pb-3 snap-x">{categories.map(c=><button type="button" key={c.slug} onClick={()=>{setCategorySlug(c.slug);setSubcategory("");setBrand("");}} className={`min-w-[155px] snap-start rounded-card border p-4 text-left backdrop-blur-xl transition ${categorySlug===c.slug?"border-primary bg-primary/10":"border-border bg-white/50 hover:border-primary/60"}`}>{categoryImageFor(c)?<img src={categoryImageFor(c)} alt="" loading="lazy" width={48} height={48} className="mb-3 size-12 object-contain drop-shadow-md"/>:<c.icon className="mb-4 text-primary"/>}<strong className="text-sm">{c.name}</strong></button>)}</div></>;
 if(step===1)return <><h2 className="font-display text-xl font-bold">Choose a subcategory</h2><div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">{cat.subcategories.map(x=><Button variant={subcategory===x?"secondary":"ghost"} key={x} onClick={()=>{setSubcategory(x);setBrand("");}} className="h-auto flex-col whitespace-normal p-2 text-xs">{subcategoryImage(cat.slug,x)&&<img src={subcategoryImage(cat.slug,x)} alt="" width={48} height={48} className="mb-1 size-12 object-contain"/>}{x}</Button>)}</div>{makesFor(subcategory)&&<div className="mt-4"><h3 className="text-sm font-semibold">Vehicle brand</h3><div className="mt-2 grid grid-cols-4 gap-1 sm:grid-cols-8">{makesFor(subcategory)?.map(m=><Button key={m.name} variant={brand===m.name?"secondary":"ghost"} onClick={()=>setBrand(m.name)} className="h-auto flex-col whitespace-normal p-1 text-[11px]"><MakeLogo name={m.name} src={m.logo}/>{m.name}</Button>)}</div></div>}</>;
 if(step===2)return <><h2 className="font-display text-2xl font-bold">Describe your item</h2><div className="mt-6 grid gap-5 md:grid-cols-2"><label className="text-sm font-semibold md:col-span-2">Title<Input value={title} onChange={e=>setTitle(e.target.value)} className="mt-2" placeholder="e.g. Toyota Land Cruiser V8, 2018"/></label><label className="text-sm font-semibold">Price (KSh)<Input value={price} onChange={e=>setPrice(e.target.value)} className="mt-2" type="number" min="0" placeholder="0"/></label><label className="text-sm font-semibold">Location<Input value={location} onChange={e=>setLocation(e.target.value)} className="mt-2" placeholder="Area, county"/></label><label className="text-sm font-semibold">Condition<select value={condition} onChange={e=>setCondition(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3"><option>Brand New</option><option>Used</option><option>Foreign Used</option><option>Refurbished</option><option>Service Available</option></select></label><div className="text-sm font-semibold"><span>WhatsApp & call number</span><div className="mt-2 grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-2"><select aria-label="Country code" value={phoneCode} onChange={e=>setPhoneCode(e.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm">{countryCodes.map(c=><option key={c.code+c.label} value={c.code}>{c.label}</option>)}</select><Input value={phoneNum} onChange={e=>setPhoneNum(e.target.value)} inputMode="tel" placeholder="712 345 678" aria-label="WhatsApp number"/></div><p className="mt-1 text-xs font-normal text-muted-foreground">Buyers tap WhatsApp or Call on this listing to reach +{phoneCode} {phoneNum||"…"} directly.</p></div><div className="md:col-span-2"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">Description</span><Button type="button" size="sm" variant="outline" onClick={()=>void writeWithAi()} disabled={aiBusy}><WandSparkles/>{aiBusy?"Writing…":description?"Improve with AI":"Write with AI"}</Button></div><Textarea value={description} onChange={e=>setDescription(e.target.value)} className="mt-2 min-h-40" placeholder="Jot down key facts (year, size, defects…) then tap “Write with AI” — tip: add photos first in the next step for a richer description."/>{aiErr&&<p className="mt-2 text-sm text-destructive">{aiErr}</p>}<p className="mt-1 text-xs text-muted-foreground">AI-powered. Always check the text is accurate before publishing.</p></div></div></>;
 if(step===3)return <><h2 className="font-display text-2xl font-bold">Add photos and video</h2><p className="mt-2 text-sm text-muted-foreground">Up to 5 photos ({photos.length}/5) and 1 video. The first photo is your cover.</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">{previews.map((src,i)=><div className="relative aspect-square overflow-hidden rounded-card bg-secondary" key={src}><img src={src} alt={`Photo ${i+1}`} className="h-full w-full object-cover"/>{i===0&&<span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">Cover</span>}<button type="button" aria-label="Remove photo" onClick={()=>setPhotos(photos.filter((_,x)=>x!==i))} className="absolute right-2 top-2 rounded-full bg-background/90 p-1"><X className="size-4"/></button></div>)}{photos.length<5&&<label className="grid aspect-square cursor-pointer place-items-center rounded-card border border-dashed border-primary text-center text-primary"><input type="file" accept="image/*" multiple className="hidden" onChange={e=>{addPhotos(e.target.files);e.target.value="";}}/><span><ImagePlus className="mx-auto"/><small className="mt-2 block">Add photo</small></span></label>}</div>{video?<div className="mt-5 flex items-center justify-between rounded-card border border-border p-4"><span className="flex items-center gap-3 text-sm"><FileVideo/>{video.name} (1/1)</span><button type="button" aria-label="Remove video" onClick={()=>setVideo(null)}><X className="size-4"/></button></div>:<label className="mt-5 flex w-full cursor-pointer items-center justify-center gap-3 rounded-card border border-dashed border-border p-6"><input type="file" accept="video/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f){ if(f.size>50*1024*1024){alert("Video must be under 50MB");} else setVideo(f);} e.target.value="";}}/><FileVideo/>Add one video</label>}</>;
 if(step===4)return <><h2 className="font-display text-2xl font-bold">Review your listing</h2><div className="mt-6 grid gap-5 rounded-card bg-muted p-5 md:grid-cols-[180px_1fr]"><div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-card bg-secondary">{previews[0]?<img src={previews[0]} alt="Cover" className="h-full w-full object-cover"/>:<Camera/>}</div><div><Badge>Pending review</Badge><h3 className="mt-3 font-display text-xl font-bold">{title||"Your listing title"}</h3><p className="mt-2 text-muted-foreground">{cat.name} · {location||"Kenya"} · Photos {photos.length}/5 · Video {video?1:0}/1</p>{description&&<p className="mt-3 line-clamp-4 whitespace-pre-line text-sm text-muted-foreground">{description}</p>}<p className="mt-4 font-display text-2xl font-bold text-primary">KSh {Number(price||0).toLocaleString("en-KE")}</p></div></div></>;
 if(step===5)return <><h2 className="font-display text-xl font-bold">Listing package · {subcategory}</h2>{selectedPrice?<div className="mt-4 grid grid-cols-2 gap-3">{(["monthly","annual"] as const).map(c=><Button key={c} variant={cadence===c?"secondary":"outline"} onClick={()=>setCadence(c)} className="h-auto flex-col whitespace-normal p-4"><span>{c==="monthly"?"Monthly · 1 month":"Annual · 1 year"}</span><strong className="text-lg">{formatKsh(c==="monthly"?selectedPrice.monthly_ksh:selectedPrice.annual_ksh)}</strong></Button>)}</div>:<p className="mt-3">Loading listing prices…</p>}<p className="mt-3 text-xs text-muted-foreground">Listing fee only, separate from your item price. Payment is simulated; no money is charged.</p></>;
 if(step===6)return <><p className="mb-3 font-semibold">{subcategory} · {cadence} · {selectedPrice?formatKsh(cadence==="monthly"?selectedPrice.monthly_ksh:selectedPrice.annual_ksh):"Loading…"}</p><PaymentPanel onResult={(success,method)=>{setPaymentComplete(success);setPaymentMethod(method);}}/>{paymentComplete&&<p className="mt-3 text-primary">Ready to submit for admin approval.</p>}</>;
 return <div className="py-12 text-center"><span className="mx-auto grid size-20 place-items-center rounded-full bg-secondary text-primary"><CheckCircle2 className="size-10"/></span><h2 className="mt-6 font-display text-3xl font-bold">Saved to VRUMEX</h2><p className="mx-auto mt-3 max-w-md text-muted-foreground">Your listing is now stored in the marketplace database with pending moderation status.</p></div>;
}

function PackageCard({p}:{p:(typeof packages)[number]}) { return <div className={`relative rounded-card border p-5 ${p.popular?"border-primary bg-secondary":"border-border"}`}>{p.popular&&<Badge className="absolute -top-3 left-4">Most popular</Badge>}<h3 className="font-display text-xl font-bold">{p.name}</h3><p className="mt-2 text-sm text-muted-foreground">{p.description}</p><p className="mt-5 font-display text-2xl font-bold">{formatKsh(p.price)}<small className="text-xs font-normal text-muted-foreground"> / {p.cadence}</small></p><p className="mt-3 text-xs">Up to {p.limit} active listings</p></div> }
export function SubscriptionsPage() {
 const categories=useCategories();const {data:prices,error}=useListingPrices();
 return <SiteShell dashboardMode="seller"><div className="mx-auto max-w-7xl px-4 py-4 sm:px-5"><PageTitle title="Subcategory listing packages"/><p className="mb-4 text-sm text-muted-foreground">Monthly and annual listing fees. Payments are simulated; no real money is charged.</p>{error&&<p>Unable to load prices. Please try again.</p>}{categories.map(c=><section key={c.slug} className="mb-5"><h2 className="mb-2 text-lg font-semibold">{c.name}</h2><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{c.subcategories.map(sub=>{const price=prices?.find(p=>p.category_slug===c.slug&&p.subcategory===sub);return <div key={sub} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-b border-border py-2">{subcategoryImage(c.slug,sub)&&<img src={subcategoryImage(c.slug,sub)} alt="" width={40} height={40} className="size-10 object-contain"/>}<div className="min-w-0"><strong className="block text-sm">{sub}</strong><p className="text-xs text-muted-foreground">{price?`${formatKsh(price.monthly_ksh)} / month · ${formatKsh(price.annual_ksh)} / year`:"Loading…"}</p></div></div>;})}</div></section>)}<Button asChild><Link to="/sell"><Plus/>Post a listing</Link></Button></div></SiteShell>;
}
function PaymentPanel({onResult}:{onResult?:(success:boolean,method:"mpesa"|"card")=>void}={}) { const [state,setState]=useState<"idle"|"loading"|"success"|"failed">("idle"); const simulate=(method:"mpesa"|"card")=>{setState("loading");onResult?.(false,method);setTimeout(()=>{setState("success");onResult?.(true,method);},1000)}; return <div><h2 className="font-display text-2xl font-bold">Complete payment</h2><p className="mt-2 text-sm text-muted-foreground">Simulation only — no real payment will be processed.</p><div className="mt-6 grid gap-6 lg:grid-cols-2"><div className="rounded-card border border-border p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground"><Zap/></span><div><strong>M-Pesa STK Push</strong><p className="text-xs text-muted-foreground">Simulated phone prompt</p></div></div><Input className="mt-5" placeholder="Your M-Pesa phone number"/><Button className="mt-4 w-full" onClick={()=>simulate("mpesa")}>Send STK prompt</Button></div><div className="rounded-card border border-border p-5"><div className="flex items-center gap-3"><WalletCards className="text-primary"/><strong>Debit or credit card</strong></div><Input className="mt-5" placeholder="Test card number only"/><div className="mt-3 grid grid-cols-2 gap-3"><Input placeholder="MM / YY"/><Input placeholder="CVC"/></div><Button variant="outline" className="mt-4 w-full" onClick={()=>simulate("card")}>Pay by card</Button></div></div>{state!=="idle"&&<div className={`mt-5 rounded-card p-4 text-sm ${state==="success"?"bg-secondary text-primary":state==="failed"?"bg-destructive/10 text-destructive":"bg-muted"}`}>{state==="loading"&&"Simulating secure payment..."}{state==="success"&&"Payment simulation successful. Your plan is ready."}{state==="failed"&&"Payment simulation failed. Try again or choose M-Pesa."}</div>}</div> }
export function PaymentPage() { return <SiteShell><div className="mx-auto max-w-4xl px-5 py-12"><PageTitle eyebrow="Secure checkout" title="Activate your seller package"/><div className="rounded-card border border-border bg-card p-7 shadow-card"><PaymentPanel/></div></div></SiteShell> }
export function VipPage() { return <SiteShell><div className="mx-auto max-w-6xl px-5 py-12"><PageTitle eyebrow="VIP promotion" title="Put your best listings in the spotlight" copy="VIP listings appear in featured positions across the marketplace."/><div className="grid gap-4 md:grid-cols-4">{vipOptions.map((o,i)=><div key={o.duration} className={`rounded-card border p-6 ${i===1?"border-vip bg-accent":"border-border bg-card"}`}><Sparkles className="text-vip"/><h3 className="mt-5 font-display text-xl font-bold">{o.duration}</h3><p className="mt-2 text-sm text-muted-foreground">Featured dashboard placement and VIP badge.</p><p className="mt-6 font-display text-2xl font-bold">{formatKsh(o.price)}</p><Button variant="vip" className="mt-5 w-full">Promote listing</Button></div>)}</div></div></SiteShell> }

export function SellerDashboardPage() {
 const [authorized,setAuthorized]=useState(false);
 const [d,setD]=useState<null|{views:number;enquiries:number;favorites:number;active:number;pending:number;rejected:number;total:number;limit:number|null;plan:string|null;expires:string|null;months:number[]}>(null);
 useEffect(()=>{supabase.auth.getSession().then(async({data})=>{if(!data.session){window.location.href="/auth?role=seller";return;} const {data:profile}=await getMyRoleRow(); if(profile?.role!=="seller"&&profile?.role!=="admin"){window.location.href="/auth?role=seller";return;} setAuthorized(true);
  const uid=data.session.user.id;
  const {data:prods}=await supabase.from("products").select("id,status,views").eq("seller_id",uid);
  const ids=(prods??[]).map(p=>p.id);
  const since=new Date();since.setMonth(since.getMonth()-11,1);since.setHours(0,0,0,0);
  const [{count:favCount},{data:enq},{data:sub}]=await Promise.all([
   ids.length?supabase.from("favorites").select("product_id",{count:"exact",head:true}).in("product_id",ids):Promise.resolve({count:0}),
   supabase.from("product_enquiries").select("created_at").eq("seller_id",uid),
   supabase.from("subscriptions").select("expires_at,status,subscription_packages(name,listing_limit)").eq("user_id",uid).eq("status","active").order("created_at",{ascending:false}).limit(1).maybeSingle(),
  ]);
  const months=Array.from({length:12},()=>0);
  for(const e of enq??[]){const t=new Date(e.created_at); if(t<since)continue; const idx=(t.getFullYear()-since.getFullYear())*12+t.getMonth()-since.getMonth(); if(idx>=0&&idx<12)months[idx]=(months[idx] ?? 0)+1;}
  const pkg=(sub as {subscription_packages?:{name:string;listing_limit:number}|null}|null)?.subscription_packages??null;
  const list=prods??[];
  setD({views:list.reduce((a,p)=>a+(p.views??0),0),enquiries:(enq??[]).length,favorites:favCount??0,active:list.filter(p=>p.status==="active").length,pending:list.filter(p=>p.status==="pending").length,rejected:list.filter(p=>p.status==="rejected").length,total:list.length,limit:pkg?.listing_limit??null,plan:pkg?.name??null,expires:sub?.expires_at??null,months});
 });},[]);
 if(!authorized)return null;
 const stats=d?[[Eye,d.views.toLocaleString(),"Listing views"],[MessageCircle,d.enquiries.toLocaleString(),"Enquiries (WhatsApp & calls)"],[Heart,d.favorites.toLocaleString(),"Favorites"],[PackageCheck,d.limit?`${d.active} / ${d.limit}`:String(d.active),"Active listings"]] as const:[];
 const max=d?Math.max(1,...d.months):1;
 const monthLabel=(i:number)=>{const t=new Date();t.setMonth(t.getMonth()-11+i,1);return t.toLocaleString(undefined,{month:"short"});};
 const days=d?.expires?Math.max(0,Math.ceil((new Date(d.expires).getTime()-Date.now())/86400000)):null;
 return <SiteShell dashboardMode="seller"><div className="mx-auto max-w-7xl px-4 py-7 sm:px-5 sm:py-10"><PageTitle eyebrow="Seller workspace" title="Grow your storefront" copy="Your real listing numbers from the VRUMEX database." action={<Button asChild><Link to="/sell"><Plus/>New listing</Link></Button>}/>
 {!d?<p className="text-sm text-muted-foreground">Loading your numbers…</p>:<>
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([Icon,n,l])=><div className="rounded-card border border-border bg-card p-5 shadow-card" key={l}><Icon className="text-primary"/><strong className="mt-4 block font-display text-3xl">{n}</strong><span className="text-sm text-muted-foreground">{l}</span></div>)}</div>
 <p className="mt-3 text-xs text-muted-foreground">{d.total} listing{d.total===1?"":"s"} in total · {d.pending} awaiting admin approval · {d.rejected} rejected{d.rejected?" — see the reasons in Your listings":""}</p>
 <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.6fr]"><div className="rounded-card border border-border bg-card p-6"><h2 className="font-display text-xl font-bold">Enquiries per month</h2>{d.enquiries===0?<p className="mt-8 text-sm text-muted-foreground">No enquiries yet. Buyers tapping WhatsApp or Call on your listings will show here.</p>:<div className="mt-8 grid h-56 grid-cols-12 items-end gap-1.5 sm:gap-3">{d.months.map((h,i)=><div key={i} className="flex h-full flex-col justify-end text-center"><div className="rounded-t bg-primary/70" style={{height:`${(h/max)*85}%`}} title={`${h} enquiries`}/><small className="mt-1 text-[10px] text-muted-foreground">{monthLabel(i)}</small></div>)}</div>}</div>
 <div className="rounded-card border border-border bg-card p-6"><h2 className="font-display text-xl font-bold">Plan usage</h2>{d.plan?<><p className="mt-2 text-sm text-muted-foreground">{d.plan}{days!==null?` · renews in ${days} day${days===1?"":"s"}`:""}</p><div className="mt-6 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{width:`${Math.min(100,(d.active/(d.limit||1))*100)}%`}}/></div><p className="mt-2 text-xs">{d.active} of {d.limit} listings used</p></>:<p className="mt-2 text-sm text-muted-foreground">No active plan yet.</p>}<Button asChild variant="outline" className="mt-6 w-full"><Link to="/subscriptions">{d.plan?"Manage plan":"Choose a plan"}</Link></Button></div></div></>}
 </div></SiteShell>;
}
export function SellerListingsPage() {
 const [rows,setRows]=useState<Array<{id:string;title:string;price:number;status:string;created_at:string;rejection_reason:string|null;images:string[]|null;video_url:string|null;description:string|null;category_slug:string;subcategory:string|null;brand:string|null;listing_cadence:string|null;listing_fee_ksh:number|null;listing_expires_at:string|null}>>([]);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{supabase.auth.getSession().then(async({data})=>{const sellerId=data.session?.user.id;if(!sellerId){window.location.href="/auth?role=seller";return;}const {data:items}=await supabase.from("products").select("id,title,price_ksh,status,created_at,rejection_reason,images,video_url,description,category_slug,subcategory,brand,listing_cadence,listing_fee_ksh,listing_expires_at").eq("seller_id",sellerId).order("created_at",{ascending:false});setRows((items??[]).map(x=>({...x,price:Number(x.price_ksh)})));setLoading(false);});},[]);
 return <SiteShell dashboardMode="seller"><div className="mx-auto max-w-7xl px-4 py-4 sm:px-5 sm:py-5"><PageTitle eyebrow="Seller workspace" title="Your listings" copy="Live listings stored in the VRUMEX database." action={<Button asChild><Link to="/sell"><Plus/>Add listing</Link></Button>}/>{loading?<p className="text-sm text-muted-foreground">Loading your listings…</p>:<div className="overflow-hidden rounded-card border border-border bg-card"><div className="hidden grid-cols-[1fr_auto_auto] gap-4 border-b border-border bg-muted/50 px-5 py-3 text-xs font-bold uppercase text-muted-foreground sm:grid"><span>Listing</span><span>Status</span><span>Price</span></div>{rows.length?rows.map(p=><div key={p.id} className="grid gap-3 border-b border-border px-4 py-4 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4 sm:px-5"><div className="min-w-0"><strong className="block truncate">{p.title}</strong><small className="block text-muted-foreground">{[p.category_slug,p.subcategory,p.brand].filter(Boolean).join(" · ")}</small><small className="text-muted-foreground">{new Date(p.created_at).toLocaleString()}</small>{p.listing_fee_ksh!==null&&<p className="mt-1 text-xs text-muted-foreground">Listing fee: {formatKsh(p.listing_fee_ksh)} · {p.listing_cadence} · Expires {p.listing_expires_at?new Date(p.listing_expires_at).toLocaleDateString():"—"} · Simulated</p>}{p.status==="pending"&&<small className="block text-muted-foreground">Waiting for admin approval before it appears in the marketplace.</small>}{p.status==="rejected"&&<small className="block text-destructive">Rejected: {p.rejection_reason||"No reason given"}</small>}<div className="mt-2"><ListingMedia images={p.images} video={p.video_url}/></div>{p.description&&<p className="mt-2 whitespace-pre-line text-xs text-muted-foreground">{p.description}</p>}</div><Badge variant="outline" className="w-fit">{p.status}</Badge><span className="font-semibold">{formatKsh(p.price)}</span></div>):<div className="p-8 text-center text-sm text-muted-foreground">No database listings yet. Create your first listing.</div>}</div>}</div></SiteShell>
}

export function LegalPage({type}:{type:"terms"|"privacy"|"seller"|"buyer"}) {
 const content={
  terms:{title:"Terms & Conditions",sections:[
   ["Using VRUMEX","VRUMEX is a Kenyan marketplace that helps buyers and sellers discover listings and communicate directly. By creating or using an account, you agree to these terms and to applicable Kenyan law."],
   ["Accounts and security","Provide accurate registration details, keep your password private, and do not create accounts for deceptive or unlawful purposes. You are responsible for activity performed through your account."],
   ["Listings and seller duties","Sellers must own or have authority to sell what they list, use accurate descriptions and prices, disclose material defects, and keep contact details reasonably reachable. Counterfeit, stolen, unsafe or unlawful goods are not permitted."],
   ["Buyer responsibilities","Buyers should review listing details, verify the seller and item, inspect goods where practical, and agree delivery and payment arrangements carefully. VRUMEX does not take possession of listed goods unless a specific VRUMEX service says otherwise."],
   ["Communication and transactions","Users are responsible for their agreements, payments, delivery, inspection and collection arrangements. Never share passwords, one-time codes or unnecessary financial information with another user."],
   ["Safety, reports and enforcement","Report suspicious listings, impersonation, fraud or unsafe conduct through the available reporting channels. VRUMEX may restrict or remove accounts or listings that breach these terms or applicable law."],
   ["Fees and promotions","Any seller package, promotional placement or other paid feature will show its applicable price and conditions before activation. A marketplace listing does not itself guarantee a sale."],
   ["Intellectual property and user content","You retain rights in content you lawfully upload, while granting VRUMEX the limited permission needed to host, display and operate the marketplace. Do not upload material that infringes another person's rights."],
   ["Privacy and legal compliance","Personal information is handled according to VRUMEX's privacy notice. Users must comply with applicable Kenyan consumer, advertising, data-protection and other relevant laws."],
   ["Changes and contact","VRUMEX may update these terms as the service develops. Continued use after an update means the revised terms apply from their effective date. Contact VRUMEX through the support channel shown on the platform for questions."]
  ]},
  privacy:{title:"Privacy Policy",sections:[
   ["Information collected","VRUMEX may process account details, listing information, contact details, device information and activity needed to operate and secure the marketplace."],
   ["How information is used","Information is used to authenticate users, publish listings, facilitate communication, improve the service, prevent abuse and provide support."],
   ["Sharing","Information may be shared with service providers needed to operate VRUMEX or where required by law. VRUMEX does not make another user's private account credentials publicly available."],
   ["Your choices","Users may request correction of inaccurate account information and should avoid publishing sensitive personal information in public listings."],
   ["Security and retention","VRUMEX applies reasonable technical and organizational safeguards. Information is retained only as needed for legitimate operational, security, legal and support purposes."]
  ]},
  seller:{title:"Seller Terms",sections:[
   ["Accurate listings","Describe each product or service truthfully, including condition, location, price and important limitations."],
   ["Proof and lawful ownership","Only list items or services you are legally entitled to offer. Keep relevant ownership, authorization or compliance records where applicable."],
   ["Buyer communication","Respond respectfully, avoid deceptive claims, and never request passwords, OTPs or unrelated sensitive credentials."],
   ["Fulfilment and disputes","Agree payment, collection, delivery, inspection and refund terms clearly with buyers. Keep evidence of material transaction communications."],
   ["Moderation","VRUMEX may pause, reject or remove listings that violate platform rules, applicable law or safety requirements."]
  ]},
  buyer:{title:"Buyer Terms",sections:[
   ["Review before buying","Check the listing, seller information, condition, price and location before committing."],
   ["Safe communication","Use sensible precautions when meeting sellers and do not disclose passwords, OTPs or unnecessary financial credentials."],
   ["Payments and delivery","Confirm the agreed payment recipient, amount and delivery or collection arrangement before sending funds."],
   ["Reports","Report suspicious, misleading, counterfeit, stolen or unsafe listings so VRUMEX can review them."],
   ["Your agreement with the seller","The purchase agreement is between the buyer and seller unless VRUMEX expressly provides a separate transaction service."]

  ]}
 }[type];
 return <SiteShell><article className="mx-auto max-w-3xl px-5 py-14"><PageTitle eyebrow="VRUMEX legal" title={content.title} copy="Effective September 2026 · VRUMEX marketplace terms"/>{content.sections.map(([s,p],i)=><section key={s} className="border-t border-border py-6"><h2 className="font-display text-xl font-bold">{i+1}. {s}</h2><p className="mt-3 leading-7 text-muted-foreground">{p}</p></section>)}</article></SiteShell>
}

