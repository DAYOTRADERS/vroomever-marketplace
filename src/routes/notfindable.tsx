import { createFileRoute } from "@tanstack/react-router";
import { AdminBootstrapPage } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/notfindable")({
  head: () => Seo("Admin setup — Vroomever", "Restricted administrator account setup."),
  component: AdminBootstrapPage,
});
