INSERT INTO public.categories (slug, name, subcategories, position) VALUES
('cars','Cars & Vehicles',ARRAY['Cars','Vehicle Parts','Motorcycles','Buses','Trucks','Heavy Machinery','Boats','Personal Mobility','Car Services']::text[],0),
('property','Property',ARRAY['Houses for Sale','Apartments','Land','Commercial','Short Lets','Property Services']::text[],1),
('phones-tablets','Phones & Tablets',ARRAY['Smartphones','Tablets','Accessories','Smart Watches','Feature Phones','Repairs']::text[],2),
('electronics','Electronics',ARRAY['TVs','Audio','Cameras','Computers','Gaming','Accessories','Other Electronics']::text[],3),
('fashion','Fashion',ARRAY['Women''s Clothing','Men''s Clothing','Shoes','Bags','Watches','Jewellery','Accessories']::text[],4),
('furniture','Furniture',ARRAY['Sofas','Beds','Dining','Office Furniture','Outdoor','Décor','Storage']::text[],5),
('home-appliances','Home Appliances',ARRAY['Fridges','Cookers','Washing Machines','Microwaves','Small Appliances','Air Conditioners']::text[],6),
('food-stuff','Food Stuff',ARRAY['Cereals','Fresh Produce','Beverages','Dairy','Meat & Poultry','Snacks','Wholesale Food']::text[],7),
('agriculture','Agriculture & Farming',ARRAY['Farm Machinery','Livestock','Seeds','Fertilizer','Animal Feed','Farm Tools','Produce']::text[],8),
('gem-stones','Gemstones & Jewellery',ARRAY['Cut Gemstones','Rough Stones','Gold','Silver','Minerals','Jewellery']::text[],9),
('beauty','Beauty & Personal Care',ARRAY['Skincare','Hair Care','Fragrance','Makeup','Personal Care','Salon Equipment']::text[],10),
('repair-construction','Repair & Construction',ARRAY['Building Materials','Power Tools','Plumbing','Electrical','Hand Tools','Contractors']::text[],11),
('commercial-equipment','Commercial Equipment',ARRAY['Restaurant Equipment','Medical Equipment','Printing','Retail Equipment','Industrial Tools']::text[],12),
('business-industry','Business & Industry',ARRAY['Manufacturing','Agriculture','Office Equipment','Wholesale','Business Sales']::text[],13),
('babies-kids','Babies & Kids',ARRAY['Baby Clothing','Toys','Prams','Kids Furniture','School Supplies','Maternity']::text[],14),
('animals-pets','Animals & Pets',ARRAY['Dogs','Cats','Farm Animals','Birds','Pet Food','Pet Services']::text[],15),
('leisure-sports','Leisure & Sports',ARRAY['Sports Equipment','Musical Instruments','Books','Gaming','Camping','Collectibles']::text[],16),
('jobs','Jobs',ARRAY['Technology','Sales','Hospitality','Construction','Healthcare','Remote Work']::text[],17),
('services','Services',ARRAY['Cleaning','Transport','Photography','Events','Tutoring','Health & Wellness','Professional']::text[],18),
('health-medical','Health & Medical',ARRAY['Medical Supplies','Fitness & Wellness','Mobility Aids','Dental','Pharmacy Products','Care Services']::text[],19),
('office-school','Office & School',ARRAY['Stationery','Office Furniture','Printers','School Supplies','Books','Business Supplies']::text[],20)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, subcategories = EXCLUDED.subcategories, position = EXCLUDED.position;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN NULL
    WHEN public.has_role(auth.uid(), 'admin') THEN 'admin'
    WHEN public.has_role(auth.uid(), 'seller') THEN 'seller'
    ELSE 'buyer' END
$$;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_users()
RETURNS TABLE (id uuid, full_name text, email text, role text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  RETURN QUERY
  SELECT u.id, p.full_name, u.email::text,
    CASE WHEN EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin') THEN 'admin'
         WHEN EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'seller') THEN 'seller'
         ELSE 'buyer' END,
    u.created_at
  FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
  ORDER BY u.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_users() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_users() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user_id uuid, target_role text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  IF target_role NOT IN ('buyer','seller','admin') THEN RAISE EXCEPTION 'Invalid role'; END IF;
  IF target_user_id = auth.uid() AND target_role <> 'admin' THEN
    RAISE EXCEPTION 'You cannot remove your own administrator access';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = target_user_id AND role IN ('seller','admin');
  INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'buyer') ON CONFLICT DO NOTHING;
  IF target_role IN ('seller','admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'seller') ON CONFLICT DO NOTHING;
  END IF;
  IF target_role = 'admin' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(target_full_name text DEFAULT '')
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('vroomever:first-admin', 0));
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'An administrator already exists';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin'), (uid, 'seller'), (uid, 'buyer') ON CONFLICT DO NOTHING;
  IF coalesce(trim(target_full_name), '') <> '' THEN
    UPDATE public.profiles SET full_name = trim(target_full_name), updated_at = now() WHERE id = uid;
  END IF;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.bootstrap_first_admin(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.become_seller()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'seller') ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.become_seller() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.become_seller() TO authenticated;

DROP POLICY IF EXISTS "Sellers create own products" ON public.products;
CREATE POLICY "Sellers create own products" ON public.products FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = seller_id AND public.has_role(auth.uid(), 'seller') AND (status = 'pending' OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Product media is public" ON storage.objects FOR SELECT USING (bucket_id = 'product-media');
CREATE POLICY "Users upload own product media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own product media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-media' AND (storage.foldername(name))[1] = auth.uid()::text);