ALTER TABLE public.products ADD COLUMN IF NOT EXISTS contact_phone text;

CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  topic text NOT NULL DEFAULT 'help',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT support_len CHECK (char_length(message) BETWEEN 5 AND 2000 AND char_length(name) <= 100 AND char_length(email) <= 255)
);
GRANT INSERT ON public.support_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO service_role;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone sends support" ON public.support_messages FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'open' AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "Sender or admin reads" ON public.support_messages FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update support" ON public.support_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete support" ON public.support_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));