-- 表示名にスペース(半角/全角問わず空白文字全般)を含められないようにする
-- (メンション機能で「@表示名」を空白区切りのトークンとして解析しているため)
alter table users add constraint display_name_no_whitespace check (display_name !~ '\s');
