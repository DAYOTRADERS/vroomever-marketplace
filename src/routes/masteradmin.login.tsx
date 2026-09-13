import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginPage } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/login")({
  head: () => Seo("Admin sign in — Vroomever", "Restricted access to the Vroomever master admin control center."),
  component: AdminLoginPage,
});
