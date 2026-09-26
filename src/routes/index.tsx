import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Seo } from "@/components/vroomever/marketplace-pages";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => Seo("Vrumever — Sign in", "Sign in or create your Vrumever marketplace account."),
  component: EntryGate,
});

function EntryGate() {
  const navigate = useNavigate();
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      navigate({ to: data.session ? "/dashboard" : "/login", replace: true });
    });
    return () => { mounted = false; };
  }, [navigate]);
  return null;
}
