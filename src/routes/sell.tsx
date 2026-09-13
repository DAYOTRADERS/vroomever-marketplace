import { createFileRoute } from "@tanstack/react-router";
import { SellPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/sell")({
  head: () => Seo("Create a listing — Vroomever", "Post your item in minutes: choose a category, add photos and video, pick a package and publish."),
  component: SellPage,
});
