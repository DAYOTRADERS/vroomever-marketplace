import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/terms")({
  head: () => Seo("Terms & Conditions — VRUMEX", "The terms that govern the use of the VRUMEX marketplace in Kenya."),
  component: () => <LegalPage type="terms" />,
});
