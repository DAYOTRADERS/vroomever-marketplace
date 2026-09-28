import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getSecretKey() {
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys) as Record<string, string>;
      if (parsed.default) return parsed.default;
    } catch {
      // Fall through to the legacy injected variable.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const secretKey = getSecretKey();
  if (!supabaseUrl || !secretKey) {
    return json({ error: "Server administrator service is not configured." }, 500);
  }

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Bootstrap rule:
  // - If there are NO admin profiles, this request is allowed to create the FIRST admin.
  // - Once an admin exists, only an authenticated admin may create another admin.
  const { count: adminCount, error: adminCountError } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (adminCountError) {
    return json({ error: "Unable to check administrator status." }, 500);
  }

  const hasExistingAdmin = (adminCount ?? 0) > 0;
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (hasExistingAdmin) {
    if (!token) return json({ error: "Administrator authentication is required before another admin account can be created." }, 401);

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "Invalid authentication session." }, 401);

    const { data: callerProfile, error: callerProfileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (callerProfileError || callerProfile?.role !== "admin") {
      return json({ error: "Administrator access required." }, 403);
    }
  }

  let body: { email?: string; fullName?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const fullName = String(body.fullName ?? "").trim();
  const password = String(body.password ?? "");

  if (!email || !email.includes("@")) return json({ error: "Enter a valid administrator email." }, 400);
  if (fullName.length < 2) return json({ error: "Enter the administrator's full name." }, 400);
  if (password.length < 8) return json({ error: "Administrator password must be at least 8 characters." }, 400);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "admin" },
  });

  if (createError) return json({ error: createError.message }, 400);
  if (!created.user) return json({ error: "Administrator account was not created." }, 500);

  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      { id: created.user.id, full_name: fullName, role: "admin", updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return json({ error: "Administrator account could not be assigned the admin role." }, 500);
  }

  return json({
    success: true,
    message: "Administrator account created.",
    user: { id: created.user.id, email: created.user.email },
  });
});
