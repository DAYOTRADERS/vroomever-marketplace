import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { STAFF_ROLES } from "@/lib/staff";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Only administrators can manage staff logins.");
}

const CreateInput = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(STAFF_ROLES),
});

export const createStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => CreateInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;
    const { data: created, error } = await admin.auth.admin.createUser({
      email: data.email, password: data.password, email_confirm: true,
      user_metadata: { full_name: data.fullName, staff: data.role },
    });
    if (error || !created?.user) throw new Error(error?.message ?? "Could not create the login.");
    const uid = created.user.id;
    await admin.from("user_roles").delete().eq("user_id", uid);
    const { error: roleError } = await admin.from("user_roles").insert({ user_id: uid, role: data.role });
    if (roleError) { await admin.auth.admin.deleteUser(uid); throw new Error(roleError.message); }
    await admin.from("profiles").upsert({ id: uid, full_name: data.fullName }, { onConflict: "id" });
    await admin.rpc("log_admin_action", { _action: "create staff login", _table: "user_roles", _target: uid, _details: { email: data.email, role: data.role } }).then(() => null, () => null);
    return { email: data.email, role: data.role };
  });

export const listStaffAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;
    const { data: roles } = await admin.from("user_roles").select("user_id,role,created_at").in("role", [...STAFF_ROLES]);
    const out: { id: string; email: string; fullName: string; role: string; createdAt: string }[] = [];
    for (const r of roles ?? []) {
      const { data: u } = await admin.auth.admin.getUserById(r.user_id);
      out.push({ id: r.user_id, email: u?.user?.email ?? "", fullName: String(u?.user?.user_metadata?.full_name ?? ""), role: r.role, createdAt: r.created_at });
    }
    return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

export const deleteStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", data.id);
    const list = (roles ?? []).map((r: { role: string }) => r.role);
    if (!list.length || list.some((r: string) => !(STAFF_ROLES as readonly string[]).includes(r))) throw new Error("Only staff logins can be removed here.");
    const { error } = await admin.auth.admin.deleteUser(data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin and staff logins, for the admin password reset page. */
export const listLoginAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;
    const { data: roles } = await admin.from("user_roles").select("user_id,role,created_at").in("role", ["admin", ...STAFF_ROLES]);
    const out: { id: string; email: string; fullName: string; role: string; lastSignIn: string | null; isMe: boolean }[] = [];
    for (const r of roles ?? []) {
      const { data: u } = await admin.auth.admin.getUserById(r.user_id);
      out.push({ id: r.user_id, email: u?.user?.email ?? "", fullName: String(u?.user?.user_metadata?.full_name ?? ""), role: r.role, lastSignIn: u?.user?.last_sign_in_at ?? null, isMe: r.user_id === context.userId });
    }
    return out.sort((a, b) => (a.role === "admin" ? -1 : 1) - (b.role === "admin" ? -1 : 1) || a.email.localeCompare(b.email));
  });

export const resetLoginPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), password: z.string().min(8).max(128) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", data.id);
    const list = (roles ?? []).map((r: { role: string }) => r.role);
    const allowed = ["admin", ...STAFF_ROLES] as string[];
    if (!list.length || !list.every((r: string) => allowed.includes(r))) throw new Error("Only admin and staff passwords can be reset here.");
    const { error } = await admin.auth.admin.updateUserById(data.id, { password: data.password });
    if (error) throw new Error(error.message);
    await admin.from("audit_logs").insert({ actor_id: context.userId, actor_email: (context.claims as any)?.email ?? null, action: "reset login password", target_table: "auth.users", target_id: data.id, details: { role: list[0] } }).then(() => null, () => null);
    return { ok: true };
  });
