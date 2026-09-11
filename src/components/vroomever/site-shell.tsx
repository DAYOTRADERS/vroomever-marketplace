import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, LayoutDashboard, Menu, Moon, Plus, Search, Sun, UserRound, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteShell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  const active = (target: string) => path === target;
  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-5 px-4 lg:px-6">
        <Brand />
        <div className="relative hidden max-w-xl flex-1 md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-11 rounded-full bg-muted/70 pl-10 shadow-none" placeholder="Search cars, phones, property..." />
        </div>
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <Button asChild variant="ghost"><Link to="/dashboard" className={active("/dashboard") ? "text-primary" : ""}>Marketplace</Link></Button>
          <Button asChild variant="ghost" size="icon"><Link to="/favorites" aria-label="Favorites"><Heart /></Link></Button>
          <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun /> : <Moon />}</Button>
          <Button asChild variant="outline"><Link to="/login"><UserRound /> Sign in</Link></Button>
          <Button asChild><Link to="/sell"><Plus /> Sell</Link></Button>
        </nav>
        <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X /> : <Menu />}</Button>
      </div>
      {menu && <nav className="grid gap-1 border-t border-border p-4 lg:hidden">
        <Button asChild variant="ghost" className="justify-start"><Link to="/dashboard"><LayoutDashboard /> Marketplace</Link></Button>
        <Button asChild variant="ghost" className="justify-start"><Link to="/favorites"><Heart /> Favorites</Link></Button>
        <Button asChild variant="ghost" className="justify-start"><Link to="/profile"><UserRound /> Profile</Link></Button>
        <Button asChild><Link to="/sell"><Plus /> Sell an item</Link></Button>
      </nav>}
    </header>
    <main>{children}</main>
    <footer className="border-t border-border bg-surface-strong py-12 text-surface-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-4">
        <div className="md:col-span-2"><Brand inverted /><p className="mt-4 max-w-sm text-sm text-surface-muted">Kenya’s trusted marketplace for remarkable finds, serious sellers and better deals.</p></div>
        <div><strong className="text-sm">Marketplace</strong><div className="mt-3 grid gap-2 text-sm text-surface-muted"><Link to="/dashboard">Browse</Link><Link to="/sell">Sell</Link><Link to="/subscriptions">Seller packages</Link></div></div>
        <div><strong className="text-sm">Legal</strong><div className="mt-3 grid gap-2 text-sm text-surface-muted"><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/buyer-terms">Buyer terms</Link><Link to="/seller-terms">Seller terms</Link></div></div>
      </div>
    </footer>
  </div>;
}
