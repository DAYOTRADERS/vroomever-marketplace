import { createFileRoute } from "@tanstack/react-router";
import { HomePage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/")({
  head: () => Seo("Vroomever — Kenya's Marketplace for Remarkable Finds", "Discover, connect and trade across Kenya. Browse cars, phones, property, furniture and more from verified sellers."),
  component: HomePage,
});
