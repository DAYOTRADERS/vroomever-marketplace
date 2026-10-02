import { createFileRoute } from "@tanstack/react-router";
import { Seo } from "@/components/vroomever/marketplace-pages";
import { SupportPage } from "@/components/vroomever/support-page";

export const Route = createFileRoute("/support")({
  head: () => Seo("Contact support — Vroomever", "Send the Vroomever team a question, problem or report and get help fast."),
  component: SupportPage,
});
