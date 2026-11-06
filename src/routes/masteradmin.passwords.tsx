import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginPasswords } from "@/components/vroomever/staff-pages";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/passwords")({
  head: () => Seo("Login passwords — VRUMEVER Admin", "VRUMEVER master admin: reset passwords for admin and staff logins."),
  component: AdminLoginPasswords,
});
