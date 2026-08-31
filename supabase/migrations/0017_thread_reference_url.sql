-- コミュニティ投稿(スレッド)に参考URLを添付できるようにする
alter table posts add column if not exists reference_url text;
grant update (reference_url) on public.posts to authenticated;
