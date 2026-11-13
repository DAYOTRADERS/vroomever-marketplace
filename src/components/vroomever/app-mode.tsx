import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, Info, Plus, Search, Settings, ShoppingCart, UserRound, Smartphone, Apple, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setMarketFilters } from "@/lib/market-filters";
import { detectAppMode } from "@/lib/app-mode";

/** App-only top bar: a search field replaces the website header. */
export function AppTopSearch() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  return <header className="sticky top-0 z-50 bg-brand-bright px-3 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] shadow-lg">
    <form className="relative" onSubmit={(e) => { e.preventDefault(); if (!q.trim()) return; setMarketFilters({ q }); void navigate({ to: "/search", search: { q } as any }); }}>
      <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search VRUMEX" aria-label="Search marketplace" className="h-12 rounded-full border-0 bg-background pl-11 text-base shadow-inner" />
    </form>
  </header>;
}

const items = [
  ["/", "Home", Home],
  ["/favorites", "Cart", ShoppingCart],
  ["/sell", "Post", Plus],
  ["/about", "About", Info],
  ["/profile", "Profile", UserRound],
  ["/settings", "Settings", Settings],
] as const;

/** Floating bottom menu for the app. Hides while scrolling up, shows while scrolling down. */
export function AppBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [shown, setShown] = useState(true);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => { const y = window.scrollY; if (Math.abs(y - last) > 6) { setShown(y > last || y < 40); last = y; } };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <nav aria-label="App menu" className={`fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-50 transition-all duration-300 ${shown ? "translate-y-0 opacity-100" : "translate-y-[140%] opacity-0"}`}>
    <div className="mx-auto grid max-w-md grid-cols-6 items-end rounded-3xl border border-border/60 bg-background/90 px-1 py-2 shadow-2xl backdrop-blur-xl">
      {items.map(([to, label, Icon]) => {
        const on = path === to;
        if (to === "/sell") return <Link key={to} to={to} aria-label="Post a listing" className="flex flex-col items-center gap-1 text-[10px] font-bold text-primary"><span className="-mt-7 grid size-12 place-items-center rounded-full bg-brand-bright text-primary-foreground shadow-lg ring-4 ring-background"><Icon className="size-6" /></span>{label}</Link>;
        return <Link key={to} to={to} className={`flex flex-col items-center gap-1 rounded-2xl py-1 text-[10px] font-semibold transition ${on ? "text-brand-bright" : "text-muted-foreground"}`}><Icon className={`size-5 transition ${on ? "scale-110" : ""}`} />{label}</Link>;
      })}
    </div>
  </nav>;
}

/** Blue launch screen that types the VRUMEX name letter by letter. Shown once per app open. */
export function AppSplash() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (!detectAppMode() || sessionStorage.getItem("vrumex-splash") === "1") return;
    sessionStorage.setItem("vrumex-splash", "1");
    setShow(true);
    const t1 = setTimeout(() => setLeaving(true), 2600);
    const t2 = setTimeout(() => setShow(false), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (!show) return null;
  return <div aria-hidden className={`app-splash fixed inset-0 z-[100] grid place-items-center overflow-hidden ${leaving ? "app-splash-leave" : ""}`}>
    <div className="app-splash-ring" /><div className="app-splash-ring app-splash-ring-2" />
    <div className="relative text-center" style={{ perspective: "800px" }}>
      <div className="flex justify-center gap-1">
        {"VRUMEX".split("").map((ch, i) => <span key={i} className="app-splash-letter font-display text-6xl font-black" style={{ animationDelay: `${0.15 + i * 0.22}s` }}>{ch}</span>)}
      </div>
      <p className="app-splash-tag mt-4 font-display text-[11px] font-extrabold uppercase tracking-[0.35em]">Discover • Connect • Trade</p>
      <div className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-surface-foreground/20"><div className="app-splash-bar h-full rounded-full bg-surface-foreground" /></div>
    </div>
  </div>;
}

/** Footer buttons to install the app on Android or iPhone. */
export function InstallAppButtons() {
  const [prompt, setPrompt] = useState<any>(null);
  const [help, setHelp] = useState<null | "ios" | "android">(null);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  const android = async () => {
    if (prompt) { prompt.prompt(); await prompt.userChoice.catch(() => null); setPrompt(null); }
    else setHelp("android");
  };
  return <div>
    <strong className="text-sm">Get the app</strong>
    <div className="mt-3 flex flex-wrap gap-2">
      <Button type="button" variant="secondary" size="sm" onClick={android}><Smartphone /> Android</Button>
      <Button type="button" variant="secondary" size="sm" onClick={() => setHelp("ios")}><Apple /> iPhone</Button>
    </div>
    {help && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[90] grid place-items-end bg-foreground/50 p-3 sm:place-items-center" onClick={() => setHelp(null)}>
      <div className="w-full max-w-sm rounded-3xl bg-background p-5 text-foreground shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><strong className="font-display text-lg">Install VRUMEX on {help === "ios" ? "iPhone" : "Android"}</strong><Button variant="ghost" size="icon" onClick={() => setHelp(null)} aria-label="Close"><X /></Button></div>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          {help === "ios" ? <><li>Open this site in <b>Safari</b>.</li><li>Tap the <b>Share</b> button.</li><li>Choose <b>Add to Home Screen</b>, then <b>Add</b>.</li></> : <><li>Open this site in <b>Chrome</b>.</li><li>Tap the <b>⋮</b> menu.</li><li>Choose <b>Install app</b> or <b>Add to Home screen</b>.</li></>}
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">The VRUMEX icon appears on your home screen and opens as an app.</p>
      </div>
    </div>}
  </div>;
}
