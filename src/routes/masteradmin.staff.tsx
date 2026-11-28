import { createFileRoute } from "@tanstack/react-router";
import { AdminStaffLogins } from "@/components/vroomever/staff-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/staff")({
  head: () => Seo("Staff logins — VRUMEVER Admin", "VRUMEVER master admin: create customer care and secretary logins."),
  component: AdminStaffLogins,
});
