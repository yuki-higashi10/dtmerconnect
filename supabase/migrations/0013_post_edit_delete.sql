-- 投稿の編集・削除は投稿者本人のみ許可する
-- 編集可能なのは内容フィールドのみ(集計値・区分・投稿者id等は対象外)
revoke update on public.posts from authenticated;
grant update (
  title, body, tags, bpm, key, used_daw, genre, target_synth, sound_category, streaming_links, thread_type
) on public.posts to authenticated;

create policy "users can update own posts" on posts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own posts" on posts
  for delete
  using (auth.uid() = user_id);
