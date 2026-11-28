import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type CategoryRow = { slug: string; name: string; subcategories: string[] };

// This loader runs before the root route renders. It must never take the entire
// storefront offline just because optional category data cannot be fetched.
export const getPublicCategories = createServerFn({ method: "GET" }).handler(async (): Promise<CategoryRow[]> => {
  const url =
    process.env["SUPABASE_URL"] ||
    process.env["VITE_SUPABASE_URL"] ||
    "https://hooxnftxqfwhxnapobfx.supabase.co";
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["SUPABASE_ANON_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_ANON_KEY"] ||
    "sb_publishable_0ywr_mrAvrqauGlyZ9OH5w_AnQHRFau";

  try {
    const db = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (input, init) => {
          const h = new Headers(
            typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
          );
          if (init?.headers) new Headers(init.headers).forEach((value, name) => h.set(name, value));
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { data, error } = await db
      .from("categories")
      .select("slug,name,subcategories")
      .order("position");

    if (error) {
      console.error("[categories] Unable to load live categories; continuing with an empty initial list.", error);
      return [];
    }

    return (data ?? []).map((r) => ({
      slug: r.slug,
      name: r.name,
      subcategories: r.subcategories ?? [],
    }));
  } catch (error) {
    console.error("[categories] Category loader failed; storefront will continue rendering.", error);
    return [];
  }
});
