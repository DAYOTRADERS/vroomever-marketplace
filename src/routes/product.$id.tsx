import { createFileRoute } from "@tanstack/react-router";
import { ProductPage, Seo } from "@/components/vroomever/marketplace-pages";
import { products } from "@/data/marketplace";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => {
    const p = products.find((x) => x.id === params.id);
    return Seo(`${p?.title ?? "Listing"} — Vroomever`, p ? `${p.title} in ${p.location}. ${p.condition}, listed by ${p.seller} on Vroomever.` : "View this listing on Vroomever.");
  },
  component: ProductRoute,
});

function ProductRoute() {
  const { id } = Route.useParams();
  return <ProductPage id={id} />;
}
