-- 1. Lock down function execution
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_media_limits() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.become_seller() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, text) TO authenticated;

-- 2. Audit log
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  target_table text,
  target_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_admin_action(_action text, _table text, _target text, _details jsonb)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.audit_logs (actor_id, actor_email, action, target_table, target_id, details)
  VALUES (auth.uid(), (SELECT email FROM auth.users WHERE id = auth.uid()), _action, _table, _target, _details);
$$;
REVOKE EXECUTE ON FUNCTION public.log_admin_action(text, text, text, jsonb) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.audit_admin_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rec jsonb; tid text;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  rec := to_jsonb(COALESCE(NEW, OLD));
  tid := COALESCE(rec->>'id', rec->>'slug', rec->>'product_id');
  PERFORM public.log_admin_action(lower(TG_OP), TG_TABLE_NAME, tid,
    jsonb_build_object('title', rec->>'title', 'name', rec->>'name', 'status', rec->>'status'));
  RETURN COALESCE(NEW, OLD);
END; $$;
REVOKE EXECUTE ON FUNCTION public.audit_admin_changes() FROM PUBLIC, anon, authenticated;

-- 3. Reports
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users file reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id AND status = 'open');
CREATE POLICY "Reporter or admin reads" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update reports" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete reports" ON public.reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Full admin control on remaining tables
CREATE POLICY "Admins update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage payments" ON public.payments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete payments" ON public.payments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete subscriptions" ON public.subscriptions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read favorites" ON public.favorites FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT DELETE ON public.payments, public.subscriptions TO authenticated;

-- 5. Admin delete user
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Administrator access required'; END IF;
  IF target_user_id = auth.uid() THEN RAISE EXCEPTION 'You cannot delete your own account'; END IF;
  PERFORM public.log_admin_action('delete', 'users', target_user_id::text,
    jsonb_build_object('email', (SELECT email FROM auth.users WHERE id = target_user_id)));
  DELETE FROM public.products WHERE seller_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;
  RETURN true;
END; $$;
REVOKE EXECUTE ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;

-- log role changes too
CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user_id uuid, target_role text)
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Administrator access required'; END IF;
  IF target_role NOT IN ('buyer','seller','admin') THEN RAISE EXCEPTION 'Invalid role'; END IF;
  IF target_user_id = auth.uid() AND target_role <> 'admin' THEN RAISE EXCEPTION 'You cannot remove your own administrator access'; END IF;
  DELETE FROM public.user_roles WHERE user_id = target_user_id AND role IN ('seller','admin');
  INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'buyer') ON CONFLICT DO NOTHING;
  IF target_role IN ('seller','admin') THEN INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'seller') ON CONFLICT DO NOTHING; END IF;
  IF target_role = 'admin' THEN INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'admin') ON CONFLICT DO NOTHING; END IF;
  PERFORM public.log_admin_action('set_role', 'users', target_user_id::text, jsonb_build_object('role', target_role));
  RETURN true;
END; $function$;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, text) FROM PUBLIC, anon;

CREATE TRIGGER audit_products AFTER UPDATE OR DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.audit_admin_changes();
CREATE TRIGGER audit_categories AFTER INSERT OR UPDATE OR DELETE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.audit_admin_changes();
CREATE TRIGGER audit_packages AFTER INSERT OR UPDATE OR DELETE ON public.subscription_packages FOR EACH ROW EXECUTE FUNCTION public.audit_admin_changes();
CREATE TRIGGER audit_payments AFTER UPDATE OR DELETE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.audit_admin_changes();
CREATE TRIGGER audit_subscriptions AFTER UPDATE OR DELETE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.audit_admin_changes();
CREATE TRIGGER audit_reports AFTER UPDATE OR DELETE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.audit_admin_changes();