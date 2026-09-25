import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/dashboard")({
  head: () => Seo("Buyer dashboard — Vroomever", "Browse fresh listings, categories and recommended picks from verified Kenyan sellers."),
  component: DashboardPage,
});
