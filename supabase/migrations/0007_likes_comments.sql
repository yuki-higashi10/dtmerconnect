-- いいね: posts.like_count と、投稿者の users.total_likes_received を自動更新
-- (users.badge_level は既存のトリガーで total_likes_received の変更時に自動再計算される)
create or replace function public.handle_like_change()
returns trigger
language plpgsql
security definer
as $$
declare
  target_post_id uuid;
  target_user_id uuid;
  delta integer;
begin
  if tg_op = 'INSERT' then
    target_post_id := new.post_id;
    delta := 1;
  else
    target_post_id := old.post_id;
    delta := -1;
  end if;

  update public.posts
    set like_count = like_count + delta
    where id = target_post_id
    returning user_id into target_user_id;

  if target_user_id is not null then
    update public.users
      set total_likes_received = total_likes_received + delta
      where id = target_user_id;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists on_like_insert on public.likes;
create trigger on_like_insert
  after insert on public.likes
  for each row execute function public.handle_like_change();

drop trigger if exists on_like_delete on public.likes;
create trigger on_like_delete
  after delete on public.likes
  for each row execute function public.handle_like_change();

-- コメント: posts.comment_count を自動更新
create or replace function public.handle_comment_insert()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  return new;
end;
$$;

drop trigger if exists on_comment_insert on public.comments;
create trigger on_comment_insert
  after insert on public.comments
  for each row execute function public.handle_comment_insert();
