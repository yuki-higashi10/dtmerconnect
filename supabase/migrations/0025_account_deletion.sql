-- アカウント削除(退会)機能
-- 投稿・コメント・いいねなどのコミュニティ資産は残し、表示のみ「削除済みユーザー」に匿名化する。
-- 認証情報(auth.users)は完全に削除し、二度とログインできない状態にする。

alter table users add column if not exists is_deleted boolean not null default false;

-- 退会済みユーザーは表示名が「削除済みユーザー」で重複しうるため、一意制約は
-- 「退会していないユーザーの間でのみ」有効にする(部分一意インデックスに置き換え)
drop index if exists public.users_display_name_lower_key;
create unique index users_display_name_lower_key on public.users (lower(display_name)) where not is_deleted;

-- auth.users削除時にpublic.usersまで連鎖削除されると投稿等の紐付けが失われるため、この外部キーは廃止する。
-- (public.usersの行はauth.users作成時のトリガーhandle_new_auth_userで作られ、以降は独立して管理する)
alter table public.users drop constraint if exists users_id_fkey;

-- 本人がアカウントを削除する。プロフィールは匿名化して残し、認証情報(auth.users)のみ削除する。
-- SECURITY DEFINERにより、通常はクライアントから触れないauth.usersの削除まで安全に実行する。
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  update public.users
    set display_name = '削除済みユーザー',
        avatar_url = null,
        bio = null,
        used_daws = '{}',
        activity_area = null,
        sns_links = '[]'::jsonb,
        is_deleted = true
    where id = v_uid;

  delete from auth.users where id = v_uid;
end;
$$;

grant execute on function public.delete_account() to authenticated;
