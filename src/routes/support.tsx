import { createFileRoute } from "@tanstack/react-router";
import { SupportPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/support")({
  head: () => Seo("Contact support — Vroomever", "Send the Vroomever team a question, problem or report and get help fast."),
  component: SupportPage,
});
