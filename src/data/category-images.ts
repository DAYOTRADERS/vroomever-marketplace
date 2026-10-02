// 3D category artwork, keyed by category slug.
const files = import.meta.glob("@/assets/categories/*.png", { eager: true, import: "default" }) as Record<string, string>;
export const categoryImages: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split("/").pop()!.replace(".png", ""), url]),
);
