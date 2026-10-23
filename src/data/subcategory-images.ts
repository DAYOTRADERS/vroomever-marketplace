// 3D subcategory artwork. Files are named "<category-slug>-<subcategory-slug>.webp".
const files = import.meta.glob("@/assets/subcategories/*.webp", { eager: true, import: "default" }) as Record<string, string>;
const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const byFile: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split("/").pop()!.replace(".webp", ""), url]),
);

// Exact category match first, then any category with the same subcategory name (for admin-added categories).
export function subcategoryImage(categorySlug: string, name: string): string | undefined {
  const sub = toSlug(name);
  return byFile[`${categorySlug}-${sub}`] ?? Object.entries(byFile).find(([k]) => k.endsWith(`-${sub}`))?.[1];
}
