import { createFileRoute } from "@tanstack/react-router";
import { SecretaryPage } from "@/components/vroomever/staff-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/secretaryadmin")({
  head: () => Seo("Secretary desk — VRUMEVER", "VRUMEVER secretary desk for listing approvals and payment records."),
  component: SecretaryPage,
});
