DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;
CREATE POLICY "Users read own profile or admin" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_public_profile(_id uuid)
RETURNS TABLE(full_name text, location text, id_verified boolean, created_at timestamptz, phone text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.full_name, p.location, p.id_verified, p.created_at,
    CASE WHEN EXISTS (SELECT 1 FROM public.products pr WHERE pr.seller_id = p.id AND pr.status = 'active') THEN p.phone END
  FROM public.profiles p WHERE p.id = _id;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "product media public read" ON storage.objects;
DROP POLICY IF EXISTS "Product media is public" ON storage.objects;
CREATE POLICY "Product media readable when listed, by owner or admin" ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'product-media' AND (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    OR public.has_role((select auth.uid()), 'admin')
    OR EXISTS (SELECT 1 FROM public.products pr WHERE pr.status = 'active' AND (name = ANY(pr.images) OR pr.video_url = name))
  )
);