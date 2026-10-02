import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

const Input = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(128),
});

async function adminCount(admin: any): Promise<number> {
  const { count } = await admin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
  if (count) return count;
  const legacy = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin");
  return legacy.error ? 0 : legacy.count ?? 0;
}

async function isAdmin(admin: any, uid: string): Promise<boolean> {
  const { data } = await admin.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
  if (data) return true;
  const legacy = await admin.from("profiles").select("role").eq("id", uid).maybeSingle();
  return !legacy.error && legacy.data?.role === "admin";
}

/** Whether any administrator exists yet (decides first-admin vs. invite mode). */
export const getAdminSetupState = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return { adminExists: (await adminCount(supabaseAdmin)) > 0 };
});

/**
 * Creates a ready-to-use administrator account.
 * - When no administrator exists yet, anyone may create the first one.
 * - Afterwards the caller must be a signed-in administrator.
 */
export const createAdminAccount = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;

    if ((await adminCount(admin)) > 0) {
      const token = (getRequestHeader("authorization") ?? "").replace(/^Bearer\s+/i, "");
      if (!token) throw new Error("An administrator already exists. Sign in at /masteradmin/login first, then return here to create more admins.");
      const { data: caller } = await admin.auth.getUser(token);
      if (!caller?.user || !(await isAdmin(admin, caller.user.id))) {
        throw new Error("Only a signed-in administrator can create more admin accounts. Sign in at /masteradmin/login first.");
      }
    }

    const { data: created, error } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, role: "buyer" },
    });
    if (error || !created?.user) throw new Error(error?.message ?? "Could not create the account.");
    const uid = created.user.id;

    await admin.from("profiles").upsert({ id: uid, full_name: data.fullName }, { onConflict: "id" });
    const { error: roleError } = await admin.from("user_roles").upsert(
      ["admin", "seller", "buyer"].map((role) => ({ user_id: uid, role })),
      { onConflict: "user_id,role" },
    );
    // Legacy databases that keep the role on profiles
    const legacy = await admin.from("profiles").update({ role: "admin" }).eq("id", uid);
    if (roleError && legacy.error) {
      await admin.auth.admin.deleteUser(uid);
      throw new Error("The account could not be given administrator access: " + roleError.message);
    }
    return { email: data.email };
  });
