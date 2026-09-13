import { createFileRoute } from "@tanstack/react-router";
import { AdminAnalytics } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/analytics")({
  head: () => Seo("Analytics — Vroomever Admin", "Vroomever master admin: analytics management and moderation."),
  component: AdminAnalytics,
});
