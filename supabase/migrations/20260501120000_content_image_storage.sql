insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-images',
  'content-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read content images" on storage.objects;
create policy "public can read content images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'content-images');

drop policy if exists "editors can insert content images" on storage.objects;
create policy "editors can insert content images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'content-images'
  and public.current_user_has_permission('content.edit')
);

drop policy if exists "editors can update content images" on storage.objects;
create policy "editors can update content images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'content-images'
  and public.current_user_has_permission('content.edit')
)
with check (
  bucket_id = 'content-images'
  and public.current_user_has_permission('content.edit')
);

drop policy if exists "editors can delete content images" on storage.objects;
create policy "editors can delete content images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'content-images'
  and public.current_user_has_permission('content.edit')
);
