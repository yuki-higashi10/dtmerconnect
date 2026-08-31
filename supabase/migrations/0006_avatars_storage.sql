-- アバター画像用のStorageバケット
-- 公開読み取り可、書き込みは本人(本登録済みユーザー)のみ
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- パスは "{user_id}/ファイル名" とし、先頭フォルダ名が自分のuser_idと一致する場合のみ書き込み可能にする
create policy "avatar images are publicly readable"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "users can upload their own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

create policy "users can update their own avatar"
on storage.objects for update
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

create policy "users can delete their own avatar"
on storage.objects for delete
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
