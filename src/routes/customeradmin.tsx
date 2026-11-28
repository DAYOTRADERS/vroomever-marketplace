import { createFileRoute } from "@tanstack/react-router";
import { CustomerCarePage } from "@/components/vroomever/staff-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/customeradmin")({
  head: () => Seo("Customer care — VRUMEVER", "VRUMEVER customer care desk for seller and buyer messages."),
  component: CustomerCarePage,
});
