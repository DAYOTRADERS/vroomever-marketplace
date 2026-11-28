import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/privacy")({
  head: () => Seo("Privacy Policy — VRUMEX", "How VRUMEX collects, uses and protects your personal information."),
  component: () => <LegalPage type="privacy" />,
});
