import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { categories as fallback, type Category } from "@/data/marketplace";
import type { CategoryRow } from "./categories.functions";

// Request-local initial names are fetched before rendering; static data only supplies icons.
export const InitialCategoriesContext = createContext<CategoryRow[]>([]);
let current: Category[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function toCategories(data: CategoryRow[]): Category[] {
  const mapped = data.map((r) => ({
    slug: r.slug,
    name: r.name,
    subcategories: r.subcategories ?? [],
    icon: fallback.find((c) => c.slug === r.slug)?.icon ?? Tag,
  }));
  const leisure = mapped.filter((c) => /leisure/i.test(c.name));
  return mapped.filter((c) => !/leisure/i.test(c.name) || c.slug === "leisure-sports" || (leisure.length === 1 && c === leisure[0]));
}

export async function refreshCategories() {
  const { data, error } = await supabase.from("categories").select("slug,name,subcategories,position").order("position");
  if (error || !data) return;
  loaded = true;
  current = toCategories(data.map(r => ({ ...r, subcategories: r.subcategories ?? [] })));
  listeners.forEach((l) => l());
}

export function useCategories(): Category[] {
  const initialRows = useContext(InitialCategoriesContext);
  const initial = useMemo(() => toCategories(initialRows), [initialRows]);
  const list = useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => loaded ? current : initial,
    () => initial,
  );
  useEffect(() => { if (!loaded) void refreshCategories(); }, []);
  return list;
}
