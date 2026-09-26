import { createFileRoute } from "@tanstack/react-router";
import { AuthPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: search.role === "seller" ? "seller" : "buyer",
    mode: search.mode === "signup" ? "signup" : "login",
  }),
  head: () => Seo("Vrumever — Account", "Sign in or create a Vrumever buyer or seller account."),
  component: AuthRoute,
});

function AuthRoute() {
  const search = Route.useSearch();
  return <AuthPage signup={search.mode === "signup"} lockedRole={search.role} />;
}
