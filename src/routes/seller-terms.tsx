import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/seller-terms")({
  head: () => Seo("Seller Terms — VRUMEVER", "Rules and responsibilities for sellers trading on the VRUMEVER marketplace."),
  component: () => <LegalPage type="seller" />,
});
