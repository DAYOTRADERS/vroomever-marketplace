import { createFileRoute } from "@tanstack/react-router";
import { VipPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/vip")({
  head: () => Seo("VIP promotions — VRUMEVER", "Promote your listing to featured placements across VRUMEVER from 3 to 30 days."),
  component: VipPage,
});
