import { createFileRoute } from "@tanstack/react-router";
import { CategoryGrid, Seo } from "@/components/vroomever/marketplace-pages";
import { SiteShell } from "@/components/vroomever/site-shell";

export const Route = createFileRoute("/categories")({
  head: () => Seo("Categories — VRUMEX", "Browse marketplace categories and approved seller listings across Kenya."),
  component: CategoriesPage,
});

function CategoriesPage() {
  return <SiteShell><section className="mx-auto max-w-7xl px-4 py-6 sm:px-5"><h1 className="mb-5 font-display text-3xl font-bold">Categories</h1><CategoryGrid /></section></SiteShell>;
}