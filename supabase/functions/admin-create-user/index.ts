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
    } catch {}
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const secretKey = getSecretKey();
  if (!supabaseUrl || !secretKey) return json({ error: "Server administrator service is not configured." }, 500);

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Administrator authentication is required." }, 401);

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "Invalid authentication session." }, 401);

  const { data: callerProfile, error: callerProfileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (callerProfileError || callerProfile?.role !== "admin") {
    return json({ error: "Only an authenticated administrator can create another administrator account." }, 403);
  }

  let body: { email?: string; fullName?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const fullName = String(body.fullName ?? "").trim();

  if (!email || !email.includes("@")) return json({ error: "Enter a valid administrator email." }, 400);
  if (fullName.length < 2) return json({ error: "Enter the administrator's full name." }, 400);

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role: "admin" },
    redirectTo: "https://vroomever-marketplace.vercel.app/masteradmin",
  });

  if (inviteError) return json({ error: inviteError.message }, 400);
  if (!invited.user) return json({ error: "Administrator invitation could not be created." }, 500);

  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      { id: invited.user.id, full_name: fullName, role: "admin", updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );

  if (profileError) {
    await admin.auth.admin.deleteUser(invited.user.id);
    return json({ error: "Administrator invitation was created but the admin role could not be assigned." }, 500);
  }

  return json({
    success: true,
    message: "Administrator invitation sent.",
    user: { id: invited.user.id, email: invited.user.email },
  });
});
