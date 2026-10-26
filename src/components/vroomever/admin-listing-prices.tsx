import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useCategories } from "@/lib/use-categories";
import { useListingPrices } from "@/lib/use-listing-prices";
import { validListingPrices } from "@/lib/listing-pricing";
import { subcategoryImage } from "@/data/subcategory-images";
import { subcategoryIcon } from "@/data/subcategory-icons";
export function AdminListingPrices({ category }: { category: string }) {
  const categories=useCategories();
  const cat=categories.find(c=>c.slug===category);
  const {data,error}=useListingPrices();
  return <section><h1 className="mb-4 font-display text-2xl font-bold">{cat?.name ?? category} · Listing prices</h1>{error&&<p className="text-destructive">Prices could not load. Please try again.</p>}<div className="grid gap-3 md:grid-cols-2">{cat?.subcategories.map(name=>{const p=data?.find(r=>r.category_slug===category&&r.subcategory===name);return p?<PriceEditor key={name} category={category} name={name} monthly={p.monthly_ksh} annual={p.annual_ksh}/>:<p key={name}>Loading {name}…</p>;})}</div></section>;
}
function PriceEditor({category,name,monthly,annual}:{category:string;name:string;monthly:number;annual:number}) {
  const [m,setM]=useState(monthly),[a,setA]=useState(annual),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  const query=useQueryClient();
  useEffect(()=>{setM(monthly);setA(annual);},[monthly,annual]);
  const save=async()=>{
    if(!validListingPrices(m,a)){setMessage("Use whole KSh amounts from 150 to 2,500; monthly must be cheaper than annual.");return;}
    setBusy(true);
    const {data,error}=await supabase.from("subcategory_prices").update({monthly_ksh:m,annual_ksh:a}).eq("category_slug",category).eq("subcategory",name).select();
    setMessage(error?error.message:data?.length?"Prices saved.":"Not saved. Sign in as an administrator.");
    if(!error)await query.invalidateQueries({queryKey:["subcategory-prices"]});
    setBusy(false);
  };
  const img=subcategoryImage(category,name),Icon=subcategoryIcon(name);
  return <div className="min-w-0 rounded-card border border-border bg-card p-3"><div className="mb-3 flex min-w-0 items-center gap-3">{img?<img src={img} alt="" width={40} height={40} className="size-10 shrink-0 object-contain"/>:<Icon className="size-8 shrink-0 text-primary"/>}<h2 className="min-w-0 break-words font-semibold">{name}</h2></div><div className="grid grid-cols-2 gap-2"><label className="min-w-0 text-xs">Monthly (KSh)<Input aria-label={`${name} monthly price`} type="number" min={150} max={2500} value={m} onChange={e=>setM(Number(e.target.value))}/></label><label className="min-w-0 text-xs">Annual (KSh)<Input aria-label={`${name} annual price`} type="number" min={150} max={2500} value={a} onChange={e=>setA(Number(e.target.value))}/></label></div><Button className="mt-3" size="sm" onClick={()=>void save()} disabled={busy}>{busy?"Saving…":"Save prices"}</Button>{message&&<p role="status" className="mt-2 break-words text-xs">{message}</p>}</div>;
}