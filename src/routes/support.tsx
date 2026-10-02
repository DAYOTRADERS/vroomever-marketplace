import { createFileRoute } from "@tanstack/react-router";
import { Seo } from "@/components/vroomever/marketplace-pages";
import { SupportPage } from "@/components/vroomever/support-page";

export const Route = createFileRoute("/support")({
  head: () => Seo("Contact support — VRUMEVER", "Send the VRUMEVER team a question, problem or report and get help fast."),
  component: SupportPage,
});
