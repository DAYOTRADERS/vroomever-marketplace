import { createFileRoute } from "@tanstack/react-router";
import { AdminSettings } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/settings")({
  head: () => Seo("Settings — Vroomever Admin", "Vroomever master admin: settings management and moderation."),
  component: AdminSettings,
});
