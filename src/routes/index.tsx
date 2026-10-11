import { createFileRoute } from "@tanstack/react-router";
import { CategoryGrid, LiveGrid, PageTitle, Seo } from "@/components/vroomever/marketplace-pages";
import { SiteShell } from "@/components/vroomever/site-shell";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => Seo("Buyers Market — VRUMEVER", "Browse real, approved seller listings across Kenya on VRUMEVER."),
  component: BuyersMarket,
});

function BuyersMarket() {
  return <SiteShell>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-10">
      <section className="relative overflow-hidden rounded-card bg-primary p-5 text-primary-foreground sm:p-7 md:p-10" aria-labelledby="buyers-market-title">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative max-w-2xl">
          <h1 id="buyers-market-title" className="font-display text-3xl font-bold md:text-5xl">What are you looking for?</h1>
          <div className="mt-7 grid grid-cols-[auto_minmax(0,1fr)] items-center rounded-card bg-background p-2 text-foreground sm:grid-cols-[auto_minmax(0,1fr)_auto]">
            <Search className="m-3 size-5 text-muted-foreground" />
            <Input aria-label="Search the marketplace" className="h-11 min-w-0 border-0 text-foreground caret-primary shadow-none" placeholder="Search the marketplace" />
            <Button className="col-span-2 mt-2 sm:col-span-1 sm:mt-0">Search</Button>
          </div>
        </div>
      </section>
      <section className="py-10" aria-label="Categories"><PageTitle title="Browse categories" /><CategoryGrid /></section>
      <section className="pb-12" aria-label="Marketplace products"><PageTitle eyebrow="Recommended" title="Fresh picks for you" /><LiveGrid all /></section>
    </div>
  </SiteShell>;
}
