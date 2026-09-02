-- 退会(アカウント削除)したユーザーの投稿・コメントを、一覧・検索・詳細ページなど
-- すべての公開画面から表示されなくする。
--
-- 物理削除ではなくRLSポリシーによる論理的な非表示にすることで、
-- postsをON DELETE CASCADEで参照しているreports(通報履歴)などの管理記録は失われない。
-- 管理者(is_admin)は通報対応などの目的で従来通り閲覧できるようにする。

drop policy if exists "posts are publicly readable" on posts;
create policy "posts are publicly readable" on posts
  for select
  using (
    not exists (select 1 from public.users u where u.id = posts.user_id and u.is_deleted)
    or exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin)
  );

drop policy if exists "comments are publicly readable" on comments;
create policy "comments are publicly readable" on comments
  for select
  using (
    not exists (select 1 from public.users u where u.id = comments.user_id and u.is_deleted)
    or exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin)
  );
