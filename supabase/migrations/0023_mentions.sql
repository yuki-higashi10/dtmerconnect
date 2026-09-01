-- メンション機能: 投稿本文・コメント本文中の「@表示名」を検出し、対象ユーザーに通知する
-- 表示名にスペースは使えない(0024でCHECK制約済み)が、「@yukiさん」のように文中では
-- 表示名の直後に区切り文字なく別の文字が続くことがあるため、「@」の後ろから次の空白までの
-- トークンに対して、前方一致する表示名のうち最長のものを採用する(結果として完全一致が最優先される)。
create or replace function public.notify_mentions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := new.user_id;
  v_post_id uuid;
  v_body text := new.body;
  v_token text;
  v_recipient record;
  v_notified uuid[] := '{}';
begin
  if tg_table_name = 'comments' then
    v_post_id := new.post_id;
  else
    v_post_id := new.id;
  end if;

  if v_body is null or v_body = '' then
    return new;
  end if;

  for v_token in
    select (regexp_matches(v_body, '@([^\s@]+)', 'g'))[1]
  loop
    select u.id, u.display_name into v_recipient
    from public.users u
    where length(u.display_name) <= length(v_token)
      and lower(left(v_token, length(u.display_name))) = lower(u.display_name)
    order by length(u.display_name) desc
    limit 1;

    if v_recipient.id is not null
       and v_recipient.id <> v_actor_id
       and not (v_recipient.id = any(v_notified))
       and not public.is_blocked(v_recipient.id, v_actor_id)
    then
      insert into public.notifications (recipient_id, actor_id, type, post_id)
      values (v_recipient.id, v_actor_id, 'mention', v_post_id);
      v_notified := v_notified || v_recipient.id;
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists on_comment_mention on public.comments;
create trigger on_comment_mention
  after insert on public.comments
  for each row execute function public.notify_mentions();

drop trigger if exists on_post_mention on public.posts;
create trigger on_post_mention
  after insert on public.posts
  for each row execute function public.notify_mentions();
