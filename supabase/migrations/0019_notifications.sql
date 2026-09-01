-- 通知機能

create type notification_type as enum ('like', 'comment', 'follow', 'announcement');

create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references users(id) on delete cascade,
  actor_id uuid references users(id) on delete cascade,
  type notification_type not null,
  post_id uuid references posts(id) on delete cascade,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_recipient_id_idx on notifications(recipient_id);
create index notifications_recipient_unread_idx on notifications(recipient_id) where not is_read;

alter table notifications enable row level security;

create policy "users can view own notifications" on notifications
  for select
  using (auth.uid() = recipient_id);

-- 既読フラグ以外はクライアントから変更不可
revoke update on notifications from authenticated;
grant update (is_read) on notifications to authenticated;

create policy "users can mark own notifications read" on notifications
  for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- INSERTは直接許可しない。すべて下記のトリガー/関数(SECURITY DEFINER)経由でのみ作成される。

-- いいね通知(自分の投稿への他人からのいいねのみ)
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

  if tg_op = 'INSERT' and target_user_id is not null and target_user_id <> new.user_id then
    insert into public.notifications (recipient_id, actor_id, type, post_id)
    values (target_user_id, new.user_id, 'like', target_post_id);
  end if;

  return coalesce(new, old);
end;
$$;

-- コメント通知(自分の投稿への他人からのコメントのみ)
create or replace function public.handle_comment_insert()
returns trigger
language plpgsql
security definer
as $$
declare
  target_user_id uuid;
begin
  update public.posts
    set comment_count = comment_count + 1
    where id = new.post_id
    returning user_id into target_user_id;

  if target_user_id is not null and target_user_id <> new.user_id then
    insert into public.notifications (recipient_id, actor_id, type, post_id)
    values (target_user_id, new.user_id, 'comment', new.post_id);
  end if;

  return new;
end;
$$;

-- フォロー通知
create or replace function public.handle_follow_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    update public.users set following_count = following_count + 1 where id = new.follower_id;
    update public.users set follower_count = follower_count + 1 where id = new.followed_id;
    insert into public.notifications (recipient_id, actor_id, type)
    values (new.followed_id, new.follower_id, 'follow');
  else
    update public.users set following_count = following_count - 1 where id = old.follower_id;
    update public.users set follower_count = follower_count - 1 where id = old.followed_id;
  end if;
  return coalesce(new, old);
end;
$$;

-- 運営からのお知らせを全登録ユーザー(ゲスト除く)に一斉送信する。管理者のみ実行可能。
create or replace function public.send_announcement_notification(p_message text)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.users where id = auth.uid() and is_admin) then
    raise exception 'not authorized';
  end if;

  insert into public.notifications (recipient_id, actor_id, type, message)
  select id, null, 'announcement', p_message
  from public.users
  where is_guest = false;
end;
$$;

grant execute on function public.send_announcement_notification(text) to authenticated;
