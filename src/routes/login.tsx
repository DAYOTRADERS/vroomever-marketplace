import { createFileRoute } from "@tanstack/react-router";
import { AuthPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/login")({
  head: () => Seo("Sign in — Vrumever", "Sign in to your Vrumever account to save favorites, contact sellers and manage listings."),
  component: () => <AuthPage />,
});
