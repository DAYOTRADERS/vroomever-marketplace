import { createFileRoute } from "@tanstack/react-router";
import { AuthPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/signup")({
  head: () => Seo("Create an account — VRUMEVER", "Join VRUMEVER as a buyer or seller and start trading across Kenya today."),
  component: () => <AuthPage signup />,
});
