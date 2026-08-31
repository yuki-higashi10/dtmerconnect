-- MIDI/プリセット/試聴音源用のStorageバケット
-- 公開読み取り可(試聴はゲストも可)、書き込みは本人(本登録済みユーザー)のみ
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'patches',
  'patches',
  true,
  10485760,
  array[
    'audio/midi', 'audio/x-midi',
    'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/ogg',
    'application/octet-stream'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- パスは "{user_id}/{post_id}/ファイル名" とし、先頭フォルダ名が自分のuser_idと一致する場合のみ書き込み可能
create policy "patch files are publicly readable"
on storage.objects for select
using (bucket_id = 'patches');

create policy "users can upload their own patch files"
on storage.objects for insert
with check (
  bucket_id = 'patches'
  and (storage.foldername(name))[1] = auth.uid()::text
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

create policy "users can update their own patch files"
on storage.objects for update
using (bucket_id = 'patches' and (storage.foldername(name))[1] = auth.uid()::text)
with check (
  bucket_id = 'patches'
  and (storage.foldername(name))[1] = auth.uid()::text
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

create policy "users can delete their own patch files"
on storage.objects for delete
using (bucket_id = 'patches' and (storage.foldername(name))[1] = auth.uid()::text);

-- attachmentsへの書き込みは、対象投稿の投稿者本人(本登録済み)のみ許可
create policy "users can insert attachments for own posts"
on attachments
for insert
with check (
  exists (
    select 1 from posts
    where posts.id = attachments.post_id
      and posts.user_id = auth.uid()
  )
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

-- ダウンロード: posts.download_count を自動更新
create or replace function public.handle_download_insert()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.posts set download_count = download_count + 1 where id = new.post_id;
  return new;
end;
$$;

drop trigger if exists on_download_insert on public.downloads;
create trigger on_download_insert
  after insert on public.downloads
  for each row execute function public.handle_download_insert();
