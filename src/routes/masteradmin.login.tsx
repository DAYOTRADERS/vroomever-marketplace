import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginPage } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/login")({
  head: () => Seo("Admin sign in — VRUMEVER", "Secure sign in for VRUMEVER master administrators."),
  component: AdminLoginPage,
});
