import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/terms")({
  head: () => Seo("Terms & Conditions — VRUMEVER", "The terms that govern the use of the VRUMEVER marketplace in Kenya."),
  component: () => <LegalPage type="terms" />,
});
