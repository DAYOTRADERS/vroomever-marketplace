import { createFileRoute } from "@tanstack/react-router";
import { AdminOverview } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/")({
  head: () => Seo("Control center — Vroomever Admin", "Vroomever master admin overview: platform health, moderation queue and revenue."),
  component: AdminOverview,
});
