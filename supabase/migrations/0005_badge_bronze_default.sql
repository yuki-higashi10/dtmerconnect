-- 「無称号」を廃止し、0いいねから「ブロンズ」として扱う(5段階)
-- badge_level: 1=ブロンズ, 2=シルバー, 3=ゴールド, 4=プラチナ, 5=ダイヤモンド
create or replace function public.compute_badge_level(likes integer)
returns integer
language sql
immutable
as $$
  select case
    when likes >= 1000 then 5
    when likes >= 500 then 4
    when likes >= 300 then 3
    when likes >= 100 then 2
    else 1
  end;
$$;

-- 既存行のbadge_levelを新しい基準で再計算
update public.users set badge_level = public.compute_badge_level(total_likes_received);
