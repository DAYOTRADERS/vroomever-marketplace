import { createFileRoute } from "@tanstack/react-router";
import { SellerPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/seller/$id")({
  head: () => Seo("Seller storefront — Vroomever", "View this verified seller's active listings, response time and contact options."),
  component: SellerPage,
});
