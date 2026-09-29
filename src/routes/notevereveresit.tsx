import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginPage } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/notevereveresit")({
  head: () => Seo("Administrator account — VroomEver", "Sign in or create the VroomEver administrator account."),
  component: AdminLoginPage,
});
