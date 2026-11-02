import { createFileRoute } from "@tanstack/react-router";
import { AdminMonitor } from "@/components/vroomever/staff-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/monitor")({
  head: () => Seo("Staff monitor — VRUMEVER Admin", "VRUMEVER master admin: customer care and secretary activity."),
  component: AdminMonitor,
});
