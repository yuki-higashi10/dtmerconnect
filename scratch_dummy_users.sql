-- 検証用の仮ユーザーを「本登録済み」扱いにする(一時的な作業用SQL、実行後は削除してOKです)
update auth.users
set is_anonymous = false, updated_at = now()
where id in ('1f06f306-6faa-48c6-9c40-80edc61808d1', 'ddf48d95-8a13-46cf-8cf4-a5a8239ec350');

update public.users set display_name = 'テストユーザーA', bio = '検証用の仮アカウントです'
where id = '1f06f306-6faa-48c6-9c40-80edc61808d1';

update public.users set display_name = 'テストユーザーB', bio = '検証用の仮アカウントです'
where id = 'ddf48d95-8a13-46cf-8cf4-a5a8239ec350';
