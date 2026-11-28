import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LifeBuoy, LogIn, LogOut, Moon, Shield, Store, Sun, UserRound } from "lucide-react";
import { SiteShell } from "@/components/vroomever/site-shell";
import { Seo } from "@/components/vroomever/marketplace-pages";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  head: () => Seo("Settings — VRUMEX", "Manage your VRUMEX account, appearance and help options."),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  const { dark, toggleTheme } = useTheme();
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);
  const row = "flex min-h-14 w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 text-left font-semibold";
  return <SiteShell>
    <section className="mx-auto max-w-xl px-4 py-6 sm:px-5">
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <div className="mt-5 grid gap-2">
        {signedIn ? <>
          <Link to="/profile" className={row}><UserRound className="size-5" />My profile</Link>
          <Link to="/seller/listings" className={row}><Store className="size-5" />My listings</Link>
        </> : <Link to="/login" className={row}><LogIn className="size-5" />Sign in or create account</Link>}
        <Button type="button" variant="ghost" onClick={toggleTheme} className={`${row} h-auto justify-start text-base`}>{dark ? <Sun className="size-5" /> : <Moon className="size-5" />}{dark ? "Light mode" : "Dark mode"}</Button>
        <Link to="/support" className={row}><LifeBuoy className="size-5" />Contact support</Link>
        <Link to="/privacy" className={row}><Shield className="size-5" />Privacy & terms</Link>
        {signedIn && <Button variant="ghost" className="mt-2 justify-start text-destructive" onClick={async () => { await supabase.auth.signOut(); void navigate({ to: "/" }); }}><LogOut /> Sign out</Button>}
      </div>
    </section>
  </SiteShell>;
}
