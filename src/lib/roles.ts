import { supabase } from "@/integrations/supabase/client";

export type AppRole = "buyer" | "seller" | "admin";

/** Reads the signed-in user's highest role from the user_roles table. */
export async function getMyRoleRow(): Promise<{ data: { role: AppRole } | null; error: Error | null }> {
  const { data, error } = await supabase.rpc("get_my_role");
  if (error) return { data: null, error: new Error(error.message) };
  return { data: data ? { role: data as AppRole } : null, error: null };
}
