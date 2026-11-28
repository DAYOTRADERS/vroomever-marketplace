import { createFileRoute } from "@tanstack/react-router";
import { CategoryGrid, FilterMenu, LiveGrid, MarketSearch, PageTitle, Seo } from "@/components/vroomever/marketplace-pages";
import { SiteShell } from "@/components/vroomever/site-shell";
import { MarketHome } from "@/components/vroomever/market-home";

export const Route = createFileRoute("/")({
  head: () => Seo("Buyers Market — VRUMEVER", "Browse real, approved seller listings across Kenya on VRUMEVER."),
  component: BuyersMarket,
});

function BuyersMarket() {
  return <SiteShell><MarketHome /></SiteShell>;
}
