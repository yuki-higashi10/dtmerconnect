-- 「全般」をdaw_channelsの通常の1行として追加する(特別扱いしない)
insert into daw_channels (name, color)
values ('全般', '#cbd5e1')
on conflict (name) do nothing;
