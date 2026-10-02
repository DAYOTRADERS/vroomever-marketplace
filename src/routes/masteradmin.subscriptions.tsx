import { createFileRoute } from "@tanstack/react-router";
import { AdminSubscriptions } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/subscriptions")({
  head: () => Seo("Subscriptions — VRUMEVER Admin", "VRUMEVER master admin: subscriptions management and moderation."),
  component: AdminSubscriptions,
});
