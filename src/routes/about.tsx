import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/vroomever/site-shell";
import { Seo } from "@/components/vroomever/marketplace-pages";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => Seo("About VRUMEX — Kenya's trusted marketplace", "Learn how VRUMEX connects buyers and reviewed sellers across Kenya."),
  component: AboutPage,
});

function AboutPage() {
  return <SiteShell>
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-5">
      <h1 className="font-display text-3xl font-bold">About VRUMEX</h1>
      <p className="mt-4 text-muted-foreground">VRUMEX is Kenya’s trusted marketplace for remarkable finds, serious sellers and better deals. Every listing is reviewed by our team before it goes live, so buyers see only approved products.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[["Discover","Browse approved listings across every category."],["Connect","Sign in to call or WhatsApp sellers directly."],["Trade","Sellers post with weekly, monthly or yearly plans."]].map(([t,d])=><div key={t} className="rounded-2xl border border-border bg-card p-4"><strong className="font-display">{t}</strong><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>)}
      </div>
      <div className="mt-6 flex flex-wrap gap-2"><Button asChild><Link to="/support">Contact support</Link></Button><Button asChild variant="outline"><Link to="/terms">Terms</Link></Button><Button asChild variant="outline"><Link to="/privacy">Privacy</Link></Button></div>
    </section>
  </SiteShell>;
}
