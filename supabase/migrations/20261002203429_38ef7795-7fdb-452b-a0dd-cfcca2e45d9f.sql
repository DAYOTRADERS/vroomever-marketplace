ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS ai_topic text,
  ADD COLUMN IF NOT EXISTS ai_urgency text,
  ADD COLUMN IF NOT EXISTS ai_suggested_reply text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE public.support_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.support_messages(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin boolean NOT NULL DEFAULT false,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.support_replies TO authenticated;
GRANT ALL ON public.support_replies TO service_role;
ALTER TABLE public.support_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner or admin reads replies" ON public.support_replies FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.support_messages m WHERE m.id = message_id AND m.user_id = auth.uid()));
CREATE POLICY "Owner or admin replies" ON public.support_replies FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND (
    (is_admin AND public.has_role(auth.uid(), 'admin')) OR
    (NOT is_admin AND EXISTS (SELECT 1 FROM public.support_messages m WHERE m.id = message_id AND m.user_id = auth.uid()))));
CREATE POLICY "Admins delete replies" ON public.support_replies FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.support_reply_touch()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.support_messages
     SET updated_at = now(),
         status = CASE WHEN NEW.is_admin AND status = 'open' THEN 'in_progress'
                       WHEN NOT NEW.is_admin AND status = 'resolved' THEN 'open'
                       ELSE status END
   WHERE id = NEW.message_id;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.support_reply_touch() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER support_reply_touch AFTER INSERT ON public.support_replies
  FOR EACH ROW EXECUTE FUNCTION public.support_reply_touch();