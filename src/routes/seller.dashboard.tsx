import { createFileRoute } from "@tanstack/react-router";
import { SellerDashboardPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/seller/dashboard")({
  head: () => Seo("Seller dashboard — Vrumever", "Track listing views, enquiries, favorites and plan usage for your Vrumever storefront."),
  component: SellerDashboardPage,
});
