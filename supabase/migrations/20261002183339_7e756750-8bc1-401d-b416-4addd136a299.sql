CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE chosen public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;

  chosen := CASE WHEN NEW.raw_user_meta_data->>'role' = 'seller' THEN 'seller'::public.app_role ELSE 'buyer'::public.app_role END;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, chosen) ON CONFLICT DO NOTHING;
  IF chosen = 'seller' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'buyer') ON CONFLICT DO NOTHING;
  END IF;

  -- First administrator only: granted when the /notevereveresit form requests it
  -- and no administrator exists yet. Later admins must be promoted by an admin.
  IF NEW.raw_user_meta_data->>'admin_bootstrap' = 'true' THEN
    PERFORM pg_advisory_xact_lock(hashtextextended('vroomever:first-admin', 0));
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'admin'), (NEW.id, 'seller'), (NEW.id, 'buyer')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;