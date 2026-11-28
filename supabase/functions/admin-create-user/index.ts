import { withSupabase } from "npm:@supabase/server@^1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(
  withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
    }

    const callerId = ctx.userClaims?.sub;
    if (!callerId) {
      return Response.json({ error: "Administrator authentication is required." }, { status: 401, headers: corsHeaders });
    }

    const { data: callerProfile, error: callerProfileError } = await ctx.supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", callerId)
      .maybeSingle();

    if (callerProfileError) {
      console.error("Caller profile lookup failed:", callerProfileError);
      return Response.json({ error: callerProfileError.message }, { status: 500, headers: corsHeaders });
    }

    if (callerProfile?.role !== "admin") {
      return Response.json(
        { error: "Only an authenticated administrator can create another administrator account." },
        { status: 403, headers: corsHeaders },
      );
    }

    let body: { email?: string; fullName?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid request body." }, { status: 400, headers: corsHeaders });
    }

    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.fullName ?? "").trim();
    const password = String(body.password ?? "");

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Enter a valid administrator email." }, { status: 400, headers: corsHeaders });
    }
    if (fullName.length < 2) {
      return Response.json({ error: "Enter the administrator's full name." }, { status: 400, headers: corsHeaders });
    }
    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters." }, { status: 400, headers: corsHeaders });
    }

    try {
      const { data: invited, error: inviteError } =
        await ctx.supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role: "admin" },
        });

      if (inviteError) {
        console.error("Admin invitation failed:", inviteError);
        return Response.json(
          { error: inviteError.message, code: inviteError.code ?? "admin_creation_failed" },
          { status: inviteError.status && inviteError.status >= 400 ? inviteError.status : 400, headers: corsHeaders },
        );
      }

      if (!invited.user) {
        return Response.json({ error: "Administrator invitation could not be created." }, { status: 500, headers: corsHeaders });
      }

      const { error: profileError } = await ctx.supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: invited.user.id,
            full_name: fullName,
            role: "admin",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

      if (profileError) {
        console.error("Admin profile creation failed:", profileError);
        await ctx.supabaseAdmin.auth.admin.deleteUser(invited.user.id);
        return Response.json(
          { error: "Administrator invitation was created but the admin role could not be assigned." },
          { status: 500, headers: corsHeaders },
        );
      }

      return Response.json(
        {
          success: true,
          message: "Administrator account created.",
          user: { id: invited.user.id, email: invited.user.email },
        },
        { status: 200, headers: corsHeaders },
      );
    } catch (error) {
      console.error("Unexpected admin creation error:", error);
      return Response.json(
        { error: error instanceof Error ? error.message : "Administrator creation failed." },
        { status: 500, headers: corsHeaders },
      );
    }
  }),
);
