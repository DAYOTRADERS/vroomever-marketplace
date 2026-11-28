import { createFileRoute } from "@tanstack/react-router";
import { ProductPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/product/$id")({
  head: () => Seo("Listing — VRUMEVER", "View this approved listing on VRUMEVER."),
  component: ProductRoute,
});

function ProductRoute() {
  const { id } = Route.useParams();
  return <ProductPage id={id} />;
}
