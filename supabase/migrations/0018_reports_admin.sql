-- 通報・モデレーション機能

-- 管理者フラグ(クライアントからは更新不可。GRANTしないため直接SQLでのみ変更する)
alter table users add column if not exists is_admin boolean not null default false;

create type report_reason as enum ('spam', 'inappropriate', 'copyright', 'harassment', 'other');

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references users(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  reason report_reason not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint report_target_check check (
    (post_id is not null and comment_id is null) or (post_id is null and comment_id is not null)
  )
);

create index reports_post_id_idx on reports(post_id);
create index reports_comment_id_idx on reports(comment_id);

alter table reports enable row level security;

-- 通報の閲覧は管理者のみ
create policy "admins can view reports" on reports
  for select
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

-- 通報の作成は本登録済みユーザーが自分名義でのみ可能
create policy "authenticated users can create reports" on reports
  for insert
  with check (
    auth.uid() = reporter_id
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

-- 通報の却下(削除)は管理者のみ
create policy "admins can delete reports" on reports
  for delete
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

-- 管理者は任意の投稿・コメントを削除できる(投稿者本人による削除ポリシーとは別に追加)
create policy "admins can delete any post" on posts
  for delete
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

create policy "admins can delete any comment" on comments
  for delete
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

-- 管理者が投稿削除時に添付ファイル(patchesバケット)をクリーンアップできるようにする
create policy "admins can delete any patch file"
on storage.objects for delete
using (
  bucket_id = 'patches'
  and exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin)
);

-- コメント削除時に posts.comment_count を減算する
create or replace function public.handle_comment_delete()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;

drop trigger if exists on_comment_delete on public.comments;
create trigger on_comment_delete
  after delete on public.comments
  for each row execute function public.handle_comment_delete();
