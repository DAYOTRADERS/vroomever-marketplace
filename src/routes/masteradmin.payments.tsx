import { createFileRoute } from "@tanstack/react-router";
import { AdminPayments } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/payments")({
  head: () => Seo("Payments — VRUMEVER Admin", "VRUMEVER master admin: payments management and moderation."),
  component: AdminPayments,
});
