import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteShell } from "@/components/vroomever/site-shell";
import { LiveGrid, MarketSearch, PageTitle, Seo } from "@/components/vroomever/marketplace-pages";
import { setMarketFilters } from "@/lib/market-filters";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  head: () => Seo("Search listings — VRUMEX", "Search approved marketplace listings across Kenya."),
  component: SearchResultsPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm">{error instanceof Error ? error.message : String(error)}</div>
  ),
});

function SearchResultsPage() {
  const { q } = Route.useSearch();
  useEffect(() => { setMarketFilters({ q }); }, [q]);
  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-5 sm:py-6">
        <MarketSearch className="mb-4 border border-border" />
        <PageTitle
          title={q.trim() ? `Results for “${q.trim()}”` : "Search the marketplace"}
          copy={q.trim() ? "Approved listings matching your search, including related brands and categories." : "Type what you are looking for to see matching listings."}
        />
        <LiveGrid all />
      </div>
    </SiteShell>
  );
}
