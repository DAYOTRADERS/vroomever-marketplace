import { createClient } from "@supabase/supabase-js";

const env = import.meta.env as Record<string, string | undefined>;

// Keep deployment environment variables supported, but use the configured
// Vrumever Supabase project as a safe browser fallback so the app does not
// become disconnected when Vercel/Netlify environment variables are missing.
// This is the publishable browser key, never a secret/service-role key.
const supabaseUrl =
  env.NEXT_PUBLIC_SUPABASE_URL ??
  env.VITE_SUPABASE_URL ??
  "https://hooxnftxqfwhxnapobfx.supabase.co";

const supabasePublishableKey =
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_0ywr_mrAvrqauGlyZ9OH5w_AnQHRFau";

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
