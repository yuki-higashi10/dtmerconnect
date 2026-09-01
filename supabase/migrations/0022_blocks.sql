-- ブロック機能
create table blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references users(id) on delete cascade,
  blocked_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id <> blocked_id)
);

create index blocks_blocker_id_idx on blocks(blocker_id);
create index blocks_blocked_id_idx on blocks(blocked_id);

alter table blocks enable row level security;

-- 自分がブロックしたユーザーの一覧(マイページの「ブロック中のユーザー」)は本人のみ閲覧可能。
-- ブロックされた側からは見えない(RLSの外側からは public.is_blocked() 経由でのみ判定できる)。
create policy "users can view own blocks" on blocks
  for select
  using (auth.uid() = blocker_id);

create policy "authenticated users can block" on blocks
  for insert
  with check (
    auth.uid() = blocker_id
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

create policy "users can unblock" on blocks
  for delete
  using (auth.uid() = blocker_id);

-- 2ユーザー間にブロック関係があるか(どちら向きでも)を判定する。
-- SECURITY DEFINERでblocksテーブルのRLSをバイパスして参照する(ブロックされた側の視点でもチェックできるようにするため)。
create or replace function public.is_blocked(user_a uuid, user_b uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = user_a and blocked_id = user_b)
       or (blocker_id = user_b and blocked_id = user_a)
  );
$$;

grant execute on function public.is_blocked(uuid, uuid) to authenticated, anon;

-- 投稿の実際の所有者に基づいてコメント可否を判定する(コメント元のpost_idはRLSで隠れていても
-- SECURITY DEFINERにより正しく所有者を参照できる)。
create or replace function public.can_comment_on_post(p_post_id uuid, p_commenter_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not public.is_blocked(p_commenter_id, p.user_id)
  from public.posts p
  where p.id = p_post_id;
$$;

grant execute on function public.can_comment_on_post(uuid, uuid) to authenticated, anon;

-- ブロックしている/されている相手の投稿は一覧・検索・ホームなどどこにも表示しない
create policy "blocked users hidden from each other" on posts
  as restrictive
  for select
  using (not public.is_blocked(auth.uid(), user_id));

-- ブロックしている/されている相手からのコメントを禁止する
create policy "blocked users cannot comment" on comments
  as restrictive
  for insert
  with check (public.can_comment_on_post(post_id, auth.uid()));

-- ブロックしている/されている相手をフォローすることを禁止する
create policy "blocked users cannot follow" on follows
  as restrictive
  for insert
  with check (not public.is_blocked(auth.uid(), followed_id));
