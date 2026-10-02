import { supabase } from "@/integrations/supabase/client";

export type AppRole = "buyer" | "seller" | "admin";

const rank = (roles: string[]): AppRole | null =>
  roles.includes("admin") ? "admin" : roles.includes("seller") ? "seller" : roles.length ? "buyer" : null;

/**
 * Reads the signed-in user's highest role. Uses the get_my_role function when the
 * database has it, and falls back to reading the user_roles table (or a legacy
 * profiles.role column) on databases where that function was never installed.
 */
export async function getMyRoleRow(): Promise<{ data: { role: AppRole } | null; error: Error | null }> {
  const { data, error } = await supabase.rpc("get_my_role");
  if (!error) return { data: data ? { role: data as AppRole } : null, error: null };

  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return { data: null, error: null };

  const { data: rows, error: rolesError } = await supabase.from("user_roles").select("role").eq("user_id", uid);
  if (!rolesError) {
    const role = rank((rows ?? []).map((r) => String(r.role)));
    if (role) return { data: { role }, error: null };
  }

  const { data: prof, error: profError } = await (supabase.from("profiles") as unknown as {
    select: (c: string) => { eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: { role?: string } | null; error: { message: string } | null }> } };
  }).select("role").eq("id", uid).maybeSingle();
  if (!profError && prof?.role) return { data: { role: rank([prof.role]) ?? "buyer" }, error: null };

  // Last resort: the role chosen at sign-up (stored with the account)
  const metaRole = String(userData.user?.user_metadata?.["role"] ?? "");
  if (metaRole === "seller" || metaRole === "buyer") return { data: { role: metaRole }, error: null };
  if (rolesError && profError) return { data: null, error: new Error(rolesError.message) };
  return { data: { role: "buyer" }, error: null };
}
