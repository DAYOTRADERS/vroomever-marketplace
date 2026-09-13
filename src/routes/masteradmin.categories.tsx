import { createFileRoute } from "@tanstack/react-router";
import { AdminCategories } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/categories")({
  head: () => Seo("Categories — Vroomever Admin", "Vroomever master admin: categories management and moderation."),
  component: AdminCategories,
});
