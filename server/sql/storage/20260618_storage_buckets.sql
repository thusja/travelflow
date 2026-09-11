begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-images',
  'profile-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-images',
  'review-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Profile images: only owner can access under {user_id}/ path.
drop policy if exists profile_images_select_own on storage.objects;
create policy profile_images_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists profile_images_insert_own on storage.objects;
create policy profile_images_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists profile_images_update_own on storage.objects;
create policy profile_images_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists profile_images_delete_own on storage.objects;
create policy profile_images_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Review images: anyone can read, owner can write under {user_id}/ path.
drop policy if exists review_images_select_public on storage.objects;
create policy review_images_select_public on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'review-images');

drop policy if exists review_images_insert_own on storage.objects;
create policy review_images_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists review_images_update_own on storage.objects;
create policy review_images_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists review_images_delete_own on storage.objects;
create policy review_images_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

commit;
