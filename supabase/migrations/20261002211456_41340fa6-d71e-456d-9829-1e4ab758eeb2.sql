DROP POLICY IF EXISTS "Product media readable when listed, by owner or admin" ON storage.objects;
CREATE POLICY "Product media readable when listed" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'product-media' AND EXISTS (SELECT 1 FROM public.products pr WHERE pr.status = 'active' AND (name = ANY(pr.images) OR pr.video_url = name)));
CREATE POLICY "Product media readable by owner or admin" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-media' AND ((storage.foldername(name))[1] = (select auth.uid()::text) OR public.has_role((select auth.uid()), 'admin')));