import { createFileRoute } from "@tanstack/react-router";
import { AdminVip } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/vip")({
  head: () => Seo("Vip — VRUMEVER Admin", "VRUMEVER master admin: vip management and moderation."),
  component: AdminVip,
});
