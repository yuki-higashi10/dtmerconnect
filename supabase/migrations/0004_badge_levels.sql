-- 称号システムの見直し(11段階 -> 5段階 + 無称号)
-- badge_level: 1=無称号, 2=ブロンズ, 3=シルバー, 4=ゴールド, 5=プラチナ, 6=ダイヤモンド
create or replace function public.compute_badge_level(likes integer)
returns integer
language sql
immutable
as $$
  select case
    when likes >= 1000 then 6
    when likes >= 500 then 5
    when likes >= 300 then 4
    when likes >= 100 then 3
    when likes >= 50 then 2
    else 1
  end;
$$;

create or replace function public.sync_badge_level()
returns trigger
language plpgsql
as $$
begin
  new.badge_level := public.compute_badge_level(new.total_likes_received);
  return new;
end;
$$;

drop trigger if exists on_users_badge_level on public.users;
create trigger on_users_badge_level
  before insert or update of total_likes_received on public.users
  for each row execute function public.sync_badge_level();

-- 既存行のbadge_levelを新しい基準で再計算
update public.users set badge_level = public.compute_badge_level(total_likes_received);
