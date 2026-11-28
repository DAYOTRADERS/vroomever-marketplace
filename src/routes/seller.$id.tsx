import { createFileRoute } from "@tanstack/react-router";
import { SellerPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/seller/$id")({
  head: () => Seo("Seller storefront — VRUMEVER", "View this seller's approved listings and contact options on VRUMEVER."),
  component: SellerStorefront,
});

function SellerStorefront() {
  const { id } = Route.useParams();
  return <SellerPage id={id} />;
}
