import { createFileRoute } from "@tanstack/react-router";
import { AdminProducts } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/products")({
  head: () => Seo("Products — Vroomever Admin", "Vroomever master admin: products management and moderation."),
  component: AdminProducts,
});
