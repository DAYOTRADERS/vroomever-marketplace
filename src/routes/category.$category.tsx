import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, Seo } from "@/components/vroomever/marketplace-pages";
import { categories } from "@/data/marketplace";

export const Route = createFileRoute("/category/$category")({
  head: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.category);
    const name = cat?.name ?? "Category";
    return Seo(`${name} — VRUMEVER`, `Browse ${name.toLowerCase()} listings from verified sellers across Kenya on VRUMEVER.`);
  },
  component: CategoryRoute,
});

function CategoryRoute() {
  const { category } = Route.useParams();
  return <CategoryPage slug={category} />;
}
