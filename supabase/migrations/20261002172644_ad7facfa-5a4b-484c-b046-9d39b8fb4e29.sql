DROP POLICY IF EXISTS "product media public read" ON storage.objects;
CREATE POLICY "product media public read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'product-media');
DROP POLICY IF EXISTS "product media owner upload" ON storage.objects;
CREATE POLICY "product media owner upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-media' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "product media owner delete" ON storage.objects;
CREATE POLICY "product media owner delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-media' AND (storage.foldername(name))[1] = auth.uid()::text);