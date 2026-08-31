-- 楽曲投稿に「使用DAW」を追加(任意入力、DAW別コミュニティに対応しないケースもあるためFKにはしない)
alter table posts add column if not exists used_daw text;

-- 楽曲投稿の音声ファイルを想定し、patchesバケットのサイズ上限を引き上げる
update storage.buckets
set file_size_limit = 20971520
where id = 'patches';
