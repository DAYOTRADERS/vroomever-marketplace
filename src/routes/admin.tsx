import { createFileRoute } from "@tanstack/react-router";
import { AdminDatabasePage } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/admin")({
  head: () => Seo("Admin database — Vroomever", "Restricted Vroomever administration for users and products."),
  component: AdminDatabasePage,
});
