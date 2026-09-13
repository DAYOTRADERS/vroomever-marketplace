import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/buyer-terms")({
  head: () => Seo("Buyer Terms — Vroomever", "Guidance and protections for buyers shopping on the Vroomever marketplace."),
  component: () => <LegalPage type="buyer" />,
});
