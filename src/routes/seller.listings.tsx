import { createFileRoute } from "@tanstack/react-router";
import { SellerListingsPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/seller/listings")({
  head: () => Seo("My listings — Vroomever", "Edit, hide, promote and manage every listing in your Vroomever storefront."),
  component: SellerListingsPage,
});
