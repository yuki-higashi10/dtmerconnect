-- フォロー機能
create table follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references users(id) on delete cascade,
  followed_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, followed_id),
  constraint no_self_follow check (follower_id <> followed_id)
);

create index follows_follower_id_idx on follows(follower_id);
create index follows_followed_id_idx on follows(followed_id);

alter table follows enable row level security;

create policy "follows are publicly readable" on follows for select using (true);

create policy "authenticated users can follow" on follows
  for insert
  with check (
    auth.uid() = follower_id
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

create policy "users can unfollow" on follows
  for delete
  using (auth.uid() = follower_id);

-- フォロワー数・フォロー数(集計値)
alter table users add column if not exists follower_count integer not null default 0;
alter table users add column if not exists following_count integer not null default 0;

create or replace function public.handle_follow_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    update public.users set following_count = following_count + 1 where id = new.follower_id;
    update public.users set follower_count = follower_count + 1 where id = new.followed_id;
  else
    update public.users set following_count = following_count - 1 where id = old.follower_id;
    update public.users set follower_count = follower_count - 1 where id = old.followed_id;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists on_follow_insert on follows;
create trigger on_follow_insert
  after insert on follows
  for each row execute function public.handle_follow_change();

drop trigger if exists on_follow_delete on follows;
create trigger on_follow_delete
  after delete on follows
  for each row execute function public.handle_follow_change();
