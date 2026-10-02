import { createFileRoute } from "@tanstack/react-router";
import { FavoritesPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/favorites")({
  head: () => Seo("Saved favorites — VRUMEVER", "Keep track of the VRUMEVER listings you love and revisit them any time."),
  component: FavoritesPage,
});
