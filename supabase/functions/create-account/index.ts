import { withSupabase } from "npm:@supabase/server@^1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(
  withSupabase({ auth: "none" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
    }

    try {
      const body = await req.json();
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      const fullName = String(body.fullName ?? "").trim();
      const role = body.role === "seller" ? "seller" : body.role === "buyer" ? "buyer" : null;

      if (!role) return Response.json({ error: "Choose Buyer or Seller." }, { status: 400, headers: corsHeaders });
      if (!email || !email.includes("@")) return Response.json({ error: "Enter a valid email address." }, { status: 400, headers: corsHeaders });
      if (password.length < 8) return Response.json({ error: "Password must be at least 8 characters." }, { status: 400, headers: corsHeaders });
      if (fullName.length < 2) return Response.json({ error: "Enter your full name." }, { status: 400, headers: corsHeaders });

      const { data, error } = await ctx.supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role },
      });

      if (error) {
        return Response.json(
          { error: error.message, code: error.code ?? "account_creation_failed" },
          { status: error.status && error.status >= 400 ? error.status : 400, headers: corsHeaders },
        );
      }

      return Response.json(
        { success: true, user: { id: data.user?.id, email: data.user?.email, role } },
        { status: 201, headers: corsHeaders },
      );
    } catch (error) {
      console.error("Account creation error:", error);
      return Response.json(
        { error: error instanceof Error ? error.message : "Account creation failed." },
        { status: 500, headers: corsHeaders },
      );
    }
  }),
);
