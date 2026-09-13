import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionsPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/subscriptions/")({
  head: () => Seo("Seller packages — Vroomever", "Compare Bronze, Silver and Gold seller packages with transparent listing limits and pricing."),
  component: SubscriptionsPage,
});
