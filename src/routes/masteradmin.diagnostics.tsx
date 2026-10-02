import { createFileRoute } from "@tanstack/react-router";
import { AdminDiagnostics } from "@/components/vroomever/admin-diagnostics";
import { Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/masteradmin/diagnostics")({
  head: () => Seo("Setup diagnostics — VRUMEVER Admin", "VRUMEVER master admin: database connection, schema and role checks."),
  component: AdminDiagnostics,
});
