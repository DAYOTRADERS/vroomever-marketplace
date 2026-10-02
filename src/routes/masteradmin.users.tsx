import { createFileRoute } from "@tanstack/react-router";
import { AdminUsers } from "@/components/vroomever/admin-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/users")({
  head: () => Seo("Users — VRUMEVER Admin", "VRUMEVER master admin: users management and moderation."),
  component: AdminUsers,
});
