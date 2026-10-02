import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getMyRoleRow, type AppRole } from "@/lib/roles";

type Account = { name: string; email: string; role: AppRole; phone?: string | null; location?: string | null };

/** Shows "Sign in" when signed out, or a profile menu with the account details and sign out. */
export function AccountMenu() {
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) { setAccount(null); setReady(true); return; }
      const [{ data: roleRow }, { data: prof }] = await Promise.all([
        getMyRoleRow(),
        supabase.from("profiles").select("full_name, phone, location").eq("id", user.id).maybeSingle(),
      ]);
      setAccount({
        name: prof?.full_name || String(user.user_metadata?.["full_name"] ?? "") || user.email?.split("@")[0] || "Account",
        email: user.email ?? "",
        role: roleRow?.role ?? "buyer",
        phone: prof?.phone ?? null,
        location: prof?.location ?? null,
      });
      setReady(true);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") load();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!ready) return <div className="h-10 w-24" />;
  if (!account) return <Button asChild variant="outline"><Link to="/login"><UserRound /> Sign in</Link></Button>;

  const dash = account.role === "seller" ? "/seller/dashboard" : account.role === "admin" ? "/masteradmin" : "/dashboard";
  const initials = account.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="relative min-w-0">
      <Button variant="outline" onClick={() => setOpen(!open)} aria-label="Account menu" className="max-w-full justify-start rounded-full py-1 pl-1 pr-3 text-sm">
        <span className="grid size-8 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{initials}</span>
        <span className="min-w-0 max-w-28 truncate font-medium">{account.name.split(" ")[0]}</span>
      </Button>
      {open && (
        <div className="absolute left-0 right-auto z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-card border border-border bg-popover p-4 text-popover-foreground shadow-card sm:left-auto sm:right-0">
          <strong className="block truncate">{account.name}</strong>
          <span className="block truncate text-sm text-muted-foreground">{account.email}</span>
          <span className="mt-2 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold uppercase text-primary">{account.role}</span>
          {(account.phone || account.location) && (
            <p className="mt-2 text-xs text-muted-foreground">{[account.phone, account.location].filter(Boolean).join(" · ")}</p>
          )}
          <div className="mt-4 grid gap-1">
            <Button asChild variant="ghost" className="justify-start" onClick={() => setOpen(false)}><Link to={dash}><LayoutDashboard /> My dashboard</Link></Button>
            <Button asChild variant="ghost" className="justify-start" onClick={() => setOpen(false)}><Link to="/profile"><UserRound /> Profile details</Link></Button>
            <Button variant="ghost" className="justify-start text-destructive" onClick={signOut}><LogOut /> Sign out</Button>
          </div>
        </div>
      )}
    </div>
  );
}
