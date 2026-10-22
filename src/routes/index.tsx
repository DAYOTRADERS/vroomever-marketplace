import { createFileRoute } from "@tanstack/react-router";
import { CategoryGrid, FilterMenu, LiveGrid, MarketSearch, PageTitle, Seo } from "@/components/vroomever/marketplace-pages";
import { SiteShell } from "@/components/vroomever/site-shell";

export const Route = createFileRoute("/")({
  head: () => Seo("Buyers Market — VRUMEVER", "Browse real, approved seller listings across Kenya on VRUMEVER."),
  component: BuyersMarket,
});

function BuyersMarket() {
  return <SiteShell>
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-5 sm:py-5">
      <section className="relative overflow-hidden rounded-card bg-gradient-to-r from-primary/85 to-primary/60 p-4 text-primary-foreground sm:p-5" aria-labelledby="buyers-market-title">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative max-w-2xl">
          <h1 id="buyers-market-title" className="font-display text-xl font-bold md:text-3xl">What are you looking for?</h1>
          <MarketSearch className="mt-3" />
        </div>
      </section>
      <section className="py-6" aria-label="Categories"><PageTitle title="Browse categories" /><CategoryGrid /></section>
      <section className="pb-12" aria-label="Marketplace products"><PageTitle eyebrow="Recommended" title="Fresh picks for you" /><LiveGrid all /></section>
    </div>
  </SiteShell>;
}
