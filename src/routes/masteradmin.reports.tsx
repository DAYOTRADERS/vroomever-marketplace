import { createFileRoute } from "@tanstack/react-router";
import { AdminReports } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/reports")({
  head: () => Seo("Reports — VRUMEVER Admin", "VRUMEVER master admin: reports management and moderation."),
  component: AdminReports,
});
