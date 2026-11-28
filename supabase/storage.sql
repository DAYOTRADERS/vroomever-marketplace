insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', false)
on conflict (id) do update set public = false;

drop policy if exists "product media owner read" on storage.objects;
create policy "product media owner read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "product media owner upload" on storage.objects;
create policy "product media owner upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "product media owner update" on storage.objects;
create policy "product media owner update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "product media owner delete" on storage.objects;
create policy "product media owner delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
