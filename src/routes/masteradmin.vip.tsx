import { createFileRoute } from "@tanstack/react-router";
import { AdminVip } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/vip")({
  head: () => Seo("Vip — Vroomever Admin", "Vroomever master admin: vip management and moderation."),
  component: AdminVip,
});
