import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getMyRoleRow } from "@/lib/roles";

/**
 * Browser-only admin setup that needs nothing but the public key.
 * Used when the server has no secret key configured (e.g. an external host).
 */

/** Server errors that mean "the secret key isn't configured here" — fall back to the browser path. */
export function isServerKeyMissing(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /Missing Supabase environment|SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|Failed to fetch|HTTP 5\d\d|Internal Server Error|Unexpected token/i.test(msg);
}

export async function adminExistsPublic(): Promise<boolean> {
  const { data, error } = await (supabase as any).rpc("admin_exists");
  if (error) throw new Error(error.message);
  return Boolean(data);
}

/** A throwaway auth client so signing up a new admin never replaces the current session. */
function isolatedClient() {
  const c = supabase as any;
  const url: string = c.supabaseUrl;
  const key: string = c.supabaseKey;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "vroomever-admin-setup" },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export async function createAdminInBrowser(input: { fullName: string; email: string; password: string }, firstAdmin: boolean) {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (fullName.length < 2) throw new Error("Please enter the administrator's full name.");
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");

  if (!firstAdmin) {
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) throw new Error("An administrator already exists. Sign in at /masteradmin/login first, then return here to create more admins.");
    const { data: me } = await getMyRoleRow();
    if (me?.role !== "admin") throw new Error("Only a signed-in administrator can create more admin accounts. Sign in at /masteradmin/login first.");
  }

  const { data, error } = await isolatedClient().auth.signUp({
    email,
    password: input.password,
    options: {
      data: { full_name: fullName, role: "buyer", ...(firstAdmin ? { admin_bootstrap: "true" } : {}) },
      emailRedirectTo: `${window.location.origin}/masteradmin/login`,
    },
  });
  if (error) throw new Error(error.message);
  if (!data.user || (data.user.identities?.length ?? 0) === 0) {
    throw new Error("This email is already registered. Use a different email for the administrator.");
  }

  if (firstAdmin) {
    if (!(await adminExistsPublic())) throw new Error("The account was created but administrator access could not be granted. Please contact support.");
  } else {
    const { error: roleError } = await (supabase as any).rpc("admin_set_user_role", { target_user_id: data.user.id, target_role: "admin" });
    if (roleError) throw new Error("Account created, but admin access failed: " + roleError.message);
  }
  return { email, needsConfirmation: !data.session };
}
