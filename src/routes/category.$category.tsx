import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, Seo } from "@/components/vroomever/marketplace-pages";
import { categories } from "@/data/marketplace";

export const Route = createFileRoute("/category/$category")({
  validateSearch: (s: Record<string, unknown>): { sub?: string; make?: string } => ({
    ...(typeof s["sub"] === "string" && s["sub"] ? { sub: s["sub"] } : {}),
    ...(typeof s["make"] === "string" && s["make"] ? { make: s["make"] } : {}),
  }),
  head: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.category);
    const name = cat?.name ?? "Category";
    return Seo(`${name} — VRUMEVER`, `Browse ${name.toLowerCase()} listings from verified sellers across Kenya on VRUMEVER.`);
  },
  component: CategoryRoute,
});

function CategoryRoute() {
  const { category } = Route.useParams();
  const { sub, make } = Route.useSearch();
  return <CategoryPage slug={category} sub={sub ?? ""} make={make ?? ""} />;
}
