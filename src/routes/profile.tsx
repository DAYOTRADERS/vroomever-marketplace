import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/profile")({
  head: () => Seo("Your profile — VRUMEVER", "Manage your VRUMEVER account details, contact information and public profile."),
  component: ProfilePage,
});
