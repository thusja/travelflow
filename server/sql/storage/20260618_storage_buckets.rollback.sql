begin;

drop policy if exists profile_images_select_own on storage.objects;
drop policy if exists profile_images_insert_own on storage.objects;
drop policy if exists profile_images_update_own on storage.objects;
drop policy if exists profile_images_delete_own on storage.objects;

drop policy if exists review_images_select_public on storage.objects;
drop policy if exists review_images_insert_own on storage.objects;
drop policy if exists review_images_update_own on storage.objects;
drop policy if exists review_images_delete_own on storage.objects;

-- Buckets are intentionally kept to avoid accidental data loss.

commit;
