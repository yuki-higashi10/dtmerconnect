-- ブックマーク(保存)機能
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index bookmarks_post_id_idx on bookmarks(post_id);
create index bookmarks_user_id_idx on bookmarks(user_id);

alter table bookmarks enable row level security;

-- 保存した投稿一覧は本人のみ閲覧可能
create policy "users can view own bookmarks" on bookmarks
  for select
  using (auth.uid() = user_id);

create policy "authenticated users can bookmark" on bookmarks
  for insert
  with check (
    auth.uid() = user_id
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

create policy "users can remove own bookmarks" on bookmarks
  for delete
  using (auth.uid() = user_id);
