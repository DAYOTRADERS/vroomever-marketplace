// Single canonical browser Supabase client.
// Every application file imports `supabase` from "@/lib/supabase" so there is
// exactly one connection, one anon/publishable key, and one session store.
// Do not create another browser client anywhere else.
export { supabase } from "@/integrations/supabase/client";
