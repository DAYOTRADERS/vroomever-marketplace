import { createServerFn } from "@tanstack/react-start";

/** Reports only whether server settings are present — never their values. */
export const getServerConfigStatus = createServerFn({ method: "GET" }).handler(async () => ({
  url: Boolean(process.env["SUPABASE_URL"]),
  secret: Boolean(process.env["SUPABASE_SECRET_KEY"] || process.env["SUPABASE_SERVICE_ROLE_KEY"]),
  ai: Boolean(process.env["LOVABLE_API_KEY"]),
}));
