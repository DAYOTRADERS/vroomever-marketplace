import { createFileRoute } from "@tanstack/react-router";
import { VipPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/vip")({
  head: () => Seo("VIP promotions — Vroomever", "Promote your listing to featured placements across Vroomever from 3 to 30 days."),
  component: VipPage,
});
