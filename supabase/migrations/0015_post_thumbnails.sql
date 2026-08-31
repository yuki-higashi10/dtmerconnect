-- 楽曲投稿・MIDI/パッチ共有の任意サムネイル画像
alter table posts add column if not exists thumbnail_url text;
grant update (thumbnail_url) on public.posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('thumbnails', 'thumbnails', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- パスは "{user_id}/{post_id}.拡張子" とし、先頭フォルダ名が自分のuser_idと一致する場合のみ書き込み可能
create policy "thumbnails are publicly readable"
on storage.objects for select
using (bucket_id = 'thumbnails');

create policy "users can upload their own thumbnails"
on storage.objects for insert
with check (
  bucket_id = 'thumbnails'
  and (storage.foldername(name))[1] = auth.uid()::text
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

create policy "users can update their own thumbnails"
on storage.objects for update
using (bucket_id = 'thumbnails' and (storage.foldername(name))[1] = auth.uid()::text)
with check (
  bucket_id = 'thumbnails'
  and (storage.foldername(name))[1] = auth.uid()::text
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

create policy "users can delete their own thumbnails"
on storage.objects for delete
using (bucket_id = 'thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);
