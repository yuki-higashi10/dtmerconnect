-- 楽曲投稿: 視聴数(再生ボタンを押した回数)と配信SNS/音楽配信サイトのリンクを追加
alter table posts add column if not exists play_count integer not null default 0;
alter table posts add column if not exists streaming_links jsonb not null default '[]'::jsonb;

-- 視聴数の加算はRLSを介さずSECURITY DEFINERで行う(ゲストも試聴可能なため)
create or replace function public.increment_play_count(target_post_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.posts set play_count = play_count + 1 where id = target_post_id;
end;
$$;

grant execute on function public.increment_play_count(uuid) to anon, authenticated;
