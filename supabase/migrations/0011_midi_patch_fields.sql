-- MIDI/パッチ投稿を種別(MIDI/パッチ)で出し分けるための項目を追加
alter table posts add column if not exists midi_patch_type text; -- 'midi' | 'patch'(midi_patchセクションのみ使用)
alter table posts add column if not exists genre text;
alter table posts add column if not exists target_synth text; -- パッチのみ: 対応シンセ/プラグイン名
alter table posts add column if not exists sound_category text; -- パッチのみ: 音色カテゴリ

-- 既存のmidi_patch投稿(このカラム追加前のデータ)には暫定で 'patch' を設定しておく
update posts set midi_patch_type = 'patch' where section = 'midi_patch' and midi_patch_type is null;
