function createSupabaseClient() {
  // Preferred: environment variables injected by Vercel.
  // Fallback: the project's public URL and publishable key.
  // The publishable key is public by design and safe in a browser bundle.
  const SUPABASE_URL =
    import.meta.env['VITE_SUPABASE_URL'] ||
    process.env['SUPABASE_URL'] ||
    'https://hooxnftxqfwhxnapobfx.supabase.co';

  const SUPABASE_PUBLISHABLE_KEY =
    import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ||
    import.meta.env['VITE_SUPABASE_ANON_KEY'] ||
    process.env['SUPABASE_PUBLISHABLE_KEY'] ||
    process.env['SUPABASE_ANON_KEY'] ||
    'sb_publishable_0ywr_mrAvrqauGlyZ9OH5w_AnQHRFau';

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
    },
    auth: {
      storage: brokeredPreviewStorage(),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
