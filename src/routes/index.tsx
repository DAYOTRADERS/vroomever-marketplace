import { createFileRoute } from "@tanstack/react-router";
import { HomePage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/")({
  head: () => Seo("Vrumever — Discover, Connect, Trade", "Kenya’s modern marketplace for trusted sellers and remarkable finds."),
  component: HomePage,
});
