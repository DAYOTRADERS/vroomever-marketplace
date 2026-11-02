CREATE TABLE public.staff_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  actor_email text,
  actor_role text NOT NULL,
  action text NOT NULL,
  target_table text,
  target_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.staff_activity TO authenticated;
GRANT ALL ON public.staff_activity TO service_role;
ALTER TABLE public.staff_activity ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.staff_role_of(_uid uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN public.has_role(_uid, 'secretary') THEN 'secretary'
    WHEN public.has_role(_uid, 'customer_care') THEN 'customer_care'
    ELSE NULL END
$$;

CREATE POLICY "Admins read staff activity" ON public.staff_activity FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff log own activity" ON public.staff_activity FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() AND actor_role = public.staff_role_of(auth.uid()));

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN NULL
    WHEN public.has_role(auth.uid(), 'admin') THEN 'admin'
    WHEN public.has_role(auth.uid(), 'secretary') THEN 'secretary'
    WHEN public.has_role(auth.uid(), 'customer_care') THEN 'customer_care'
    WHEN public.has_role(auth.uid(), 'seller') THEN 'seller'
    ELSE 'buyer' END
$$;

-- Customer care: support inbox
CREATE POLICY "Customer care reads support" ON public.support_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'customer_care'));
CREATE POLICY "Customer care updates support" ON public.support_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'customer_care')) WITH CHECK (public.has_role(auth.uid(), 'customer_care'));
CREATE POLICY "Customer care reads replies" ON public.support_replies FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'customer_care'));
CREATE POLICY "Customer care replies" ON public.support_replies FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND is_admin AND public.has_role(auth.uid(), 'customer_care'));
CREATE POLICY "Customer care reads roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'customer_care'));

-- Secretary: products and payments
CREATE POLICY "Secretary reads products" ON public.products FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'secretary'));
CREATE POLICY "Secretary moderates products" ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'secretary')) WITH CHECK (public.has_role(auth.uid(), 'secretary'));
CREATE POLICY "Secretary reads payments" ON public.payments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'secretary'));
CREATE POLICY "Secretary reads product media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-media' AND public.has_role(auth.uid(), 'secretary'));

-- Secretaries may only change moderation fields
CREATE OR REPLACE FUNCTION public.secretary_moderation_only()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') OR NEW.seller_id = auth.uid()
     OR NOT public.has_role(auth.uid(), 'secretary') THEN
    RETURN NEW;
  END IF;
  IF NEW.status NOT IN ('active','rejected','pending') THEN
    RAISE EXCEPTION 'Secretaries can only approve or reject listings';
  END IF;
  IF (to_jsonb(NEW) - 'status' - 'rejection_reason' - 'updated_at') IS DISTINCT FROM (to_jsonb(OLD) - 'status' - 'rejection_reason' - 'updated_at') THEN
    RAISE EXCEPTION 'Secretaries can only change a listing status and reason';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER products_secretary_moderation_only BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.secretary_moderation_only();

-- Automatic staff activity log
CREATE OR REPLACE FUNCTION public.log_staff_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r text; rec jsonb; act text; det jsonb;
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  r := public.staff_role_of(auth.uid());
  IF r IS NULL THEN RETURN NEW; END IF;
  rec := to_jsonb(NEW);
  IF TG_TABLE_NAME = 'products' THEN
    act := CASE rec->>'status' WHEN 'active' THEN 'approved listing' WHEN 'rejected' THEN 'rejected listing' ELSE 'updated listing' END;
    det := jsonb_build_object('title', rec->>'title', 'status', rec->>'status', 'reason', rec->>'rejection_reason');
  ELSIF TG_TABLE_NAME = 'support_replies' THEN
    act := 'replied to message';
    det := jsonb_build_object('message_id', rec->>'message_id', 'body', left(rec->>'body', 300));
  ELSE
    act := 'set message ' || COALESCE(rec->>'status', 'updated');
    det := jsonb_build_object('name', rec->>'name', 'status', rec->>'status');
  END IF;
  INSERT INTO public.staff_activity (actor_id, actor_email, actor_role, action, target_table, target_id, details)
  VALUES (auth.uid(), (SELECT email FROM auth.users WHERE id = auth.uid()), r, act, TG_TABLE_NAME, rec->>'id', det);
  RETURN NEW;
END $$;
CREATE TRIGGER products_staff_activity AFTER UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.log_staff_activity();
CREATE TRIGGER support_replies_staff_activity AFTER INSERT ON public.support_replies FOR EACH ROW EXECUTE FUNCTION public.log_staff_activity();
CREATE TRIGGER support_messages_staff_activity AFTER UPDATE ON public.support_messages FOR EACH ROW EXECUTE FUNCTION public.log_staff_activity();