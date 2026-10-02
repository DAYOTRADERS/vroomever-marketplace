import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, LayoutDashboard, LayoutGrid, Menu, Moon, Plus, Search, Store, Sun, UserRound, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRoleRow, type AppRole } from "@/lib/roles";
import { useEffect, useState, type ReactNode } from "react";
import { Brand } from "./brand";
import { AccountMenu } from "./account-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteShell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  const active = (target: string) => path === target;
  const [role, setRole] = useState<AppRole | null>(null);
  useEffect(() => {
    const load = () => getMyRoleRow().then(({ data }) => setRole(data?.role ?? null)).catch(() => setRole(null));
    load();
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === "SIGNED_IN" || e === "SIGNED_OUT" || e === "USER_UPDATED") load(); });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => { setMenu(false); }, [path]);
  const canSell = role === "seller" || role === "admin";
  const dash = role === "seller" || role === "admin" ? "/seller/dashboard" : "/dashboard";
  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid h-18 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:flex sm:gap-5 lg:px-6">
        <Brand />
        <div className="relative hidden max-w-xl flex-1 md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-11 rounded-full bg-muted/70 pl-10 shadow-none" placeholder="Search cars, phones, property..." />
        </div>
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <Button asChild variant="ghost"><Link to="/dashboard" className={active("/dashboard") ? "text-primary" : ""}>Marketplace</Link></Button>
          <Button asChild variant="ghost" size="icon"><Link to="/favorites" aria-label="Favorites"><Heart /></Link></Button>
          <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun /> : <Moon />}</Button>
          <AccountMenu />
          {canSell && <Button asChild className="glow-ring hover:-translate-y-0.5"><Link to="/sell"><Plus /> Sell</Link></Button>}
        </nav>
        <div className="shrink-0 sm:ml-auto lg:hidden"><AccountMenu /></div>
      </div>
    </header>
    {menu && <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in" onClick={() => setMenu(false)} aria-label="Close menu" />
      <nav className="dock-glass absolute inset-x-3 bottom-24 max-h-[75dvh] overflow-y-auto rounded-[1.75rem] p-4 animate-scale-in">
        <div className="mb-4 flex items-center justify-between"><strong className="font-display text-lg">Menu</strong><Button variant="ghost" size="icon" className="text-surface-foreground" onClick={() => setMenu(false)} aria-label="Close menu"><X /></Button></div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-surface-muted" />
          <Input className="h-11 rounded-full border-white/10 bg-white/10 pl-10 text-surface-foreground" placeholder="Search marketplace" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([["/", "Home", Home], ["/dashboard", "Marketplace", LayoutGrid], ["/favorites", "Favorites", Heart], ["/profile", "Profile", UserRound], [dash, "Dashboard", LayoutDashboard], ...(canSell ? [["/seller/listings", "Listings", Store]] : [])] as [string, string, typeof Home][]).map(([to, label, Icon]) => (
            <Link key={label} to={to} className={`grid place-items-center gap-1.5 rounded-2xl border p-3 text-xs font-semibold transition hover:-translate-y-0.5 hover:border-primary/60 ${active(to) ? "border-primary/60 bg-primary/20 text-primary" : "border-white/10 bg-white/5"}`}><Icon className="size-5" />{label}</Link>
          ))}
          <button onClick={() => setDark(!dark)} className="grid place-items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs font-semibold transition hover:-translate-y-0.5 hover:border-primary/60">{dark ? <Sun className="size-5" /> : <Moon className="size-5" />}{dark ? "Light" : "Dark"}</button>
        </div>
        {canSell && <Button asChild className="mt-4 w-full glow-ring"><Link to="/sell"><Plus /> Sell an item</Link></Button>}
        <div className="mt-4 rounded-2xl bg-background p-2 text-foreground"><AccountMenu /></div>
      </nav>
    </div>}
    <nav className="dock-glass fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 items-center rounded-[1.5rem] px-2 py-2 lg:hidden" aria-label="Quick navigation">
      {([["/", "Home", Home], ["/dashboard", "Browse", LayoutGrid], ["/favorites", "Saved", Heart], ["/profile", "Me", UserRound]] as const).slice(0, 2).map(([to, label, Icon]) => <Link key={label} to={to} className={`grid place-items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold ${active(to) ? "text-primary" : ""}`}><Icon className="size-5" />{label}</Link>)}
      <button onClick={() => setMenu(!menu)} aria-label={menu ? "Close menu" : "Open menu"} className="mx-auto -mt-8 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground glow-ring transition hover:scale-105 active:scale-95">{menu ? <X /> : <Menu />}</button>
      {([["/favorites", "Saved", Heart], ["/profile", "Me", UserRound]] as const).map(([to, label, Icon]) => <Link key={label} to={to} className={`grid place-items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold ${active(to) ? "text-primary" : ""}`}><Icon className="size-5" />{label}</Link>)}
    </nav>
    <main className="pb-24 lg:pb-0">{children}</main>
    <footer className="border-t border-border bg-surface-strong py-10 text-surface-foreground sm:py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-5 md:grid-cols-4">
        <div className="md:col-span-2"><Brand inverted /><p className="mt-4 max-w-sm text-sm text-surface-muted">Kenya’s trusted marketplace for remarkable finds, serious sellers and better deals.</p></div>
        <div><strong className="text-sm">Marketplace</strong><div className="mt-3 grid gap-2 text-sm text-surface-muted"><Link to="/dashboard">Browse</Link>{canSell && <Link to="/sell">Sell</Link>}<Link to="/subscriptions">Seller packages</Link></div></div>
        <div><strong className="text-sm">Legal</strong><div className="mt-3 grid gap-2 text-sm text-surface-muted"><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/buyer-terms">Buyer terms</Link><Link to="/seller-terms">Seller terms</Link></div></div>
      </div>
    </footer>
  </div>;
}
