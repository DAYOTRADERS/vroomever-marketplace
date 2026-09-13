import { createFileRoute } from "@tanstack/react-router";
import { FavoritesPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/favorites")({
  head: () => Seo("Saved favorites — Vroomever", "Keep track of the Vroomever listings you love and revisit them any time."),
  component: FavoritesPage,
});
