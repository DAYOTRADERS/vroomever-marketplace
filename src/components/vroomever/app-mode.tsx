import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, Heart, Info, LayoutGrid, Plus, Search, Settings, UserRound, Smartphone, Apple, X, Compass, Link2, ShoppingBag, ArrowUp, ArrowRight } from "lucide-react";
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
    <form className="relative" onSubmit={(e) => { e.preventDefault(); if (!q.trim()) return; setMarketFilters({ q }); void navigate({ to: "/search", search: { q } }); }}>
      <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search VRUMEX" aria-label="Search marketplace" className="h-12 rounded-full border-0 bg-background pl-11 text-base shadow-inner" />
    </form>
  </header>;
}

const items = [
  ["/", "Home", Home],
  ["/categories", "Categories", LayoutGrid],
  ["/favorites", "Favorite", Heart],
  ["/sell", "Post", Plus],
  ["/about", "About", Info],
  ["/profile", "Profile", UserRound],
  ["/settings", "Settings", Settings],
] as const;

/** Floating bottom menu for the app. Hides while scrolling up, shows while scrolling down. */
export function AppBottomNav({ mobileOnly = false }: { mobileOnly?: boolean }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [shown, setShown] = useState(true);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => { const y = window.scrollY; if (Math.abs(y - last) > 6) { setShown(y > last || y < 40); last = y; } };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <nav aria-label="App menu" inert={!shown} className={`app-dock fixed inset-x-2 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-50 ${mobileOnly ? "lg:hidden" : ""} ${shown ? "" : "app-dock-hidden"}`}>
    <div className="app-dock-surface mx-auto grid max-w-md grid-cols-7 items-center">
      {items.map(([to, label, Icon]) => {
        const on = to === "/" ? path === to : path === to || path.startsWith(`${to}/`);
        if (to === "/sell") return <Link key={to} to={to} aria-label="Post a listing" aria-current={on ? "page" : undefined} className="app-dock-item app-dock-post"><span className="app-dock-post-icon"><Icon className="size-6" strokeWidth={2} /></span><span>{label}</span></Link>;
        return <Link key={to} to={to} aria-current={on ? "page" : undefined} className="app-dock-item"><span className="app-dock-icon"><Icon className="size-5" strokeWidth={on ? 2.2 : 1.7} /></span><span>{label}</span></Link>;
      })}
    </div>
  </nav>;
}

/** Blue launch screen that types the VRUMEX name letter by letter. Shown once per app open. */
export function AppSplash() {
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [scene, setScene] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const finish = () => { delete document.documentElement.dataset["appLaunch"]; setShow(false); };
  useEffect(() => {
    if (!detectAppMode()) { setShow(false); return; }
    document.documentElement.dataset["appLaunch"] = "pending";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 700 : scene === 0 ? 3800 : 4600;
    const t1 = setTimeout(() => { if (scene === 0) setScene(1); else setLeaving(true); }, duration);
    const t2 = scene === 1 ? setTimeout(finish, duration + (reduced ? 150 : 400)) : undefined;
    return () => { clearTimeout(t1); if (t2) clearTimeout(t2); };
  }, [scene]);
  if (!show) return null;
  return <div aria-label="Opening VRUMEX" className={`app-splash fixed inset-0 z-[100] place-items-center overflow-hidden ${leaving ? "app-splash-leave" : ""}`} onTouchStart={e => setTouchStart(e.touches[0]?.clientY ?? null)} onTouchEnd={e => { const end = e.changedTouches[0]?.clientY; if (touchStart !== null && end !== undefined && touchStart - end > 45) { if (scene === 0) setScene(1); else finish(); } setTouchStart(null); }}>
    <div className="app-splash-grid" aria-hidden="true" />
    <Button variant="ghost" size="icon" onClick={finish} aria-label="Open marketplace" className="app-splash-skip"><ArrowRight /></Button>
    <div key={scene} className="app-splash-stage relative text-center">
      {scene === 0 ? <>
        <div role="status" aria-label="VRUMEX" className="app-splash-word flex justify-center">
          {"VRUMEX".split("").map((ch, i) => <span key={i} aria-hidden="true" className="app-splash-letter font-display font-black"><span>{ch}</span>{Array.from({ length: 6 }, (_, layer) => <span key={layer} className="app-letter-depth">{ch}</span>)}</span>)}
        </div>
        <div className="app-bounce-loader" aria-hidden="true">{[0, 1, 2, 3].map(i => <span key={i} />)}</div>
      </> : <div role="status" aria-label="Discover, Connect, Trade" className="app-launch-journey">
        <div className="app-journey-track" aria-hidden="true" />
        <div className="app-journey-step app-journey-discover"><span className="app-journey-icon"><Compass strokeWidth={1.6} /></span><span>Discover</span></div>
        <div className="app-journey-step app-journey-connect"><span className="app-journey-icon"><Link2 strokeWidth={1.6} /></span><span>Connect</span></div>
        <div className="app-journey-step app-journey-trade"><span className="app-journey-icon"><ShoppingBag strokeWidth={1.6} /></span><span>Trade</span></div>
      </div>}
    </div>
    <div className="app-splash-progress" aria-hidden="true">{[0, 1].map(i => <span key={i} data-active={i === scene} />)}<ArrowUp className="ml-3 size-4" /></div>
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
