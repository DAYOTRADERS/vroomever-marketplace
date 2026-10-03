import { createFileRoute } from "@tanstack/react-router";
import { Seo } from "@/components/vroomever/marketplace-pages";
import { Home3D } from "@/components/vroomever/home-3d";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => Seo("VRUMEX — Discover, Connect, Trade", "Kenya’s modern marketplace for trusted sellers and remarkable finds."),
  component: Home3D,
});
