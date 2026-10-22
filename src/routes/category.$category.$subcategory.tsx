import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, Seo } from "@/components/vroomever/marketplace-pages";
import { categories } from "@/data/marketplace";

export const Route = createFileRoute("/category/$category/$subcategory")({
  head: ({ params }) => {
    const category = categories.find((item) => item.slug === params.category);
    const subcategory = category?.subcategories.find(
      (item) =>
        item.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ===
        params.subcategory,
    );
    const title = subcategory ? `${subcategory} — ${category?.name ?? "Category"}` : "Category";
    return Seo(`${title} — VRUMEVER`, `Browse ${title.toLowerCase()} listings from verified sellers across Kenya on VRUMEVER.`);
  },
  component: SubcategoryRoute,
});

function SubcategoryRoute() {
  const { category, subcategory } = Route.useParams();
  return <CategoryPage slug={category} subcategorySlug={subcategory} />;
}
