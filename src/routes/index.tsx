import { createFileRoute } from "@tanstack/react-router";
import { LiveGrid, Seo } from "@/components/vroomever/marketplace-pages";
import { SiteShell } from "@/components/vroomever/site-shell";

export const Route = createFileRoute("/")({
  head: () => Seo("Buyers Market — VRUMEVER", "Browse real, approved seller listings across Kenya on VRUMEVER."),
  component: BuyersMarket,
});

function BuyersMarket() {
  return <SiteShell>
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-10" aria-labelledby="buyers-market-title">
      <h1 id="buyers-market-title" className="mb-7 font-display text-3xl font-bold">Products</h1>
      <LiveGrid all />
    </section>
  </SiteShell>;
}
