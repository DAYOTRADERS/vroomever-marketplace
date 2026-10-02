import { createFileRoute } from "@tanstack/react-router";
import { AdminEntryPage } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/")({
  head: () => Seo("Control center — VRUMEVER Admin", "VRUMEVER master admin overview: platform health, moderation queue and revenue."),
  component: AdminEntryPage,
});
