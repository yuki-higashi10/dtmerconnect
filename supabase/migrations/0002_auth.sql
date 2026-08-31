-- ゲスト(匿名認証)/本登録ユーザーの連携
-- public.users.id を auth.users.id と同一にし、匿名→本登録の引き継ぎを auth.uid() の連続性で実現する

alter table public.users
  add constraint users_id_fkey foreign key (id) references auth.users(id) on delete cascade;

-- auth.users に新規ユーザー(匿名含む)が作成されたら public.users にも行を作る
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, display_name, is_guest)
  values (
    new.id,
    'guest_' || substr(new.id::text, 1, 8),
    coalesce(new.is_anonymous, true)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- 匿名ユーザーがメール本登録などで恒久アカウントに切り替わったら is_guest を false にする
create or replace function public.handle_auth_user_verified()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if old.is_anonymous = true and new.is_anonymous = false then
    update public.users set is_guest = false where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_auth_user_verified();

-- 書き込み権限: ログイン(本登録)ユーザーのみ投稿・コメント・いいね・ダウンロードログを作成可能
-- auth.jwt() ->> 'is_anonymous' は匿名認証セッションのJWTに含まれるクレーム
create policy "authenticated users can insert own posts" on posts
  for insert
  with check (
    auth.uid() = user_id
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

create policy "authenticated users can insert own comments" on comments
  for insert
  with check (
    auth.uid() = user_id
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

create policy "authenticated users can insert own likes" on likes
  for insert
  with check (
    auth.uid() = user_id
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

create policy "users can delete own likes" on likes
  for delete
  using (auth.uid() = user_id);

create policy "authenticated users can insert own downloads" on downloads
  for insert
  with check (
    auth.uid() = user_id
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );
