-- 表示名の重複禁止(大文字・小文字だけの違いは同一視する)
-- 日本語(ひらがな・カタカナ・漢字)にはlower()による大文字小文字の変換は影響しない
create unique index if not exists users_display_name_lower_key on public.users (lower(display_name));

-- 本人のみ display_name / avatar_url を更新可能にする
-- (total_likes_received・badge_level・is_guest は自己申告での書き換えを許可しない)
revoke update on public.users from authenticated;
grant update (display_name, avatar_url) on public.users to authenticated;

create policy "users can update own profile" on users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
