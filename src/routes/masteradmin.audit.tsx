import { createFileRoute } from "@tanstack/react-router";
import { AdminAudit } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/audit")({
  head: () => Seo("Audit — VRUMEVER Admin", "VRUMEVER master admin: audit management and moderation."),
  component: AdminAudit,
});
