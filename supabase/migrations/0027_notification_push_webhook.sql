-- notifications行がINSERTされるたびに、アプリのプッシュ送信API(/api/push/send)をHTTPで
-- 呼び出すためのWebhookをpg_net経由で構築する。
--
-- このマイグレーション自体はURL・シークレットの値を設定しない(デプロイ先ドメインや
-- 環境変数の値はマイグレーションファイルに含めるべきではないため)。適用後、Supabase側で
-- 以下のSQLを実行して値を設定すること(値はアプリの環境変数 PUSH_WEBHOOK_SECRET と一致させる):
--
--   update app_settings set value = 'https://<本番ドメイン>/api/push/send' where key = 'push_webhook_url';
--   update app_settings set value = '<PUSH_WEBHOOK_SECRETと同じ値>' where key = 'push_webhook_secret';

create extension if not exists pg_net with schema extensions;

create table if not exists app_settings (
  key text primary key,
  value text
);

-- ポリシーを一切追加しないことで、anon/authenticatedロールからのアクセスを遮断する
-- (SECURITY DEFINER関数はテーブル所有者権限で実行されるためRLSの影響を受けず参照できる)
alter table app_settings enable row level security;

insert into app_settings (key, value) values
  ('push_webhook_url', null),
  ('push_webhook_secret', null)
on conflict (key) do nothing;

create or replace function public.handle_notification_push()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_url text;
  v_secret text;
begin
  select value into v_url from public.app_settings where key = 'push_webhook_url';
  if v_url is null or v_url = '' then
    return new;
  end if;

  select value into v_secret from public.app_settings where key = 'push_webhook_secret';

  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || coalesce(v_secret, '')),
    body := jsonb_build_object('notification_id', new.id)
  );

  return new;
end;
$$;

drop trigger if exists on_notification_push on public.notifications;
create trigger on_notification_push
  after insert on public.notifications
  for each row execute function public.handle_notification_push();
