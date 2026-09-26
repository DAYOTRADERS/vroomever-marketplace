import { createFileRoute } from "@tanstack/react-router";
import { SellerListingsPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/seller/listings")({
  head: () => Seo("My listings — Vrumever", "Edit, hide, promote and manage every listing in your Vrumever storefront."),
  component: SellerListingsPage,
});
