import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/seller-terms")({
  head: () => Seo("Seller Terms — Vroomever", "Rules and responsibilities for sellers trading on the Vroomever marketplace."),
  component: () => <LegalPage type="seller" />,
});
