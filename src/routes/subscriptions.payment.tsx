import { createFileRoute } from "@tanstack/react-router";
import { PaymentPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/subscriptions/payment")({
  validateSearch: (search: Record<string, unknown>) => ({ plan: typeof search['plan'] === "string" ? search['plan'] : "silver" }),
  head: () => Seo("Checkout — Vroomever", "Activate your Vroomever seller package with M-Pesa or card."),
  component: PaymentPage,
});
