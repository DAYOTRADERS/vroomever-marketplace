import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type CategoryRow = { slug: string; name: string; subcategories: string[] };

export const getPublicCategories = createServerFn({ method: "GET" }).handler(async (): Promise<CategoryRow[]> => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Category configuration unavailable");
  const db = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { fetch: (input, init) => {
      const h = new Headers(init?.headers);
      if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
      h.set("apikey", key);
      return fetch(input, { ...init, headers: h });
    } },
  });
  const { data, error } = await db.from("categories").select("slug,name,subcategories").order("position");
  if (error) throw error;
  return (data ?? []).map((r) => ({ slug: r.slug, name: r.name, subcategories: r.subcategories ?? [] }));
});