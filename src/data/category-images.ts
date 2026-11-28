// 3D category artwork, keyed by category slug.
const files = import.meta.glob("@/assets/categories/*.png", { eager: true, import: "default" }) as Record<string, string>;
export const categoryImages: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split("/").pop()!.replace(".png", ""), url]),
);

// Finds artwork for admin-added categories whose slug differs, by matching words in the slug or name.
export function categoryImageFor(cat: { slug: string; name: string }): string | undefined {
  if (categoryImages[cat.slug]) return categoryImages[cat.slug];
  const words = `${cat.slug} ${cat.name}`.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
  const key = Object.keys(categoryImages).find((k) => words.some((w) => k.includes(w)));
  return key ? categoryImages[key] : undefined;
}
