import { createFileRoute } from "@tanstack/react-router";
import { AuthPage, Seo } from "@/components/vroomever/marketplace-pages";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: search["role"] === "seller" ? "seller" : search["role"] === "buyer" ? "buyer" : undefined,
    mode: search["mode"] === "signup" ? "signup" : "login",
  }),
  head: () => Seo("VRUMEVER — Account", "Sign in or create a VRUMEVER buyer or seller account."),
  component: AuthRoute,
});

function AuthRoute() {
  const search = Route.useSearch();
  const role = search.role === "seller" || search.role === "buyer" ? search.role : undefined;
  return <AuthPage key={`${search.mode}-${role ?? ""}`} signup={search.mode === "signup"} {...(role ? { lockedRole: role } : {})} />;
}
