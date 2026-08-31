-- マイページのプロフィール編集用フィールドを追加
alter table users add column if not exists bio text;
alter table users add column if not exists used_daws text[] not null default '{}';
alter table users add column if not exists activity_area text;
alter table users add column if not exists sns_links jsonb not null default '[]'::jsonb;

-- 既存の「本人のみdisplay_name/avatar_urlを更新可能」ポリシーに、新しい編集可能カラムを追加する
grant update (bio, used_daws, activity_area, sns_links) on public.users to authenticated;
