import { useEffect, useSyncExternalStore } from "react";
import { Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { categories as fallback, type Category } from "@/data/marketplace";

// Categories saved by admins in the database; the static list only supplies icons
// and a first paint before the database answers.
let current: Category[] = fallback;
let loaded = false;
const listeners = new Set<() => void>();

export async function refreshCategories() {
  const { data, error } = await supabase.from("categories").select("slug,name,subcategories,position").order("position");
  if (error || !data) return;
  loaded = true;
  current = data.map((r) => ({
    slug: r.slug,
    name: r.name,
    subcategories: r.slug === "cars" ? Array.from(new Set([...(r.subcategories ?? []), "Bicycles"])) : (r.subcategories ?? []),
    icon: fallback.find((c) => c.slug === r.slug)?.icon ?? Tag,
  }));
  listeners.forEach((l) => l());
}

export function useCategories(): Category[] {
  const list = useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => current,
    () => fallback,
  );
  useEffect(() => { if (!loaded) void refreshCategories(); }, []);
  return list;
}
