-- 自分のアカウントを管理者にする(一時的な作業用SQL、実行後は削除してOKです)
-- メールアドレスが違う場合は書き換えてから実行してください
update public.users set is_admin = true
where id = (select id from auth.users where email = 'azuma.rapatomo@gmail.com');
