-- パッチノート: 初期スキーマ
-- dtm-app-data-schema.md の定義に対応

create extension if not exists pgcrypto;

create type post_section as enum ('daw_community', 'track', 'midi_patch');
create type thread_type as enum ('question', 'tips', 'casual', 'setup');
create type attachment_file_type as enum ('midi', 'preset', 'audio_preview');

-- 1. users
create table users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  avatar_url text,
  is_guest boolean not null default false,
  total_likes_received integer not null default 0,
  badge_level integer not null default 1,
  created_at timestamptz not null default now()
);

-- 2. daw_channels(マスタデータ)
create table daw_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null
);

-- 3. posts(3セクション共通)
create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  section post_section not null,
  daw_channel_id uuid references daw_channels(id),
  thread_type thread_type,
  title text not null,
  body text,
  tags text[] not null default '{}',
  bpm integer,
  key text,
  is_resolved boolean not null default false,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  download_count integer not null default 0,
  created_at timestamptz not null default now(),
  constraint daw_community_fields_check check (
    (section = 'daw_community' and daw_channel_id is not null and thread_type is not null)
    or (section <> 'daw_community' and daw_channel_id is null and thread_type is null)
  )
);

create index posts_section_idx on posts(section);
create index posts_daw_channel_id_idx on posts(daw_channel_id);
create index posts_user_id_idx on posts(user_id);

-- 4. attachments
create table attachments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  file_type attachment_file_type not null,
  file_url text not null,
  daw_or_synth text
);

create index attachments_post_id_idx on attachments(post_id);

-- 5. comments
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index comments_post_id_idx on comments(post_id);

-- 6. likes(二重いいね防止)
create table likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index likes_post_id_idx on likes(post_id);

-- 7. downloads(集計ログ、MIDI/パッチのみ)
create table downloads (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index downloads_post_id_idx on downloads(post_id);

-- NOTE: like_count / comment_count / download_count / users.total_likes_received の更新方法
-- (都度再計算 or トリガーで加算) はスキーマメモ上も未確定。現時点ではアプリ側での更新を想定し、
-- トリガーは追加していない。認証まわりの実装時に方針を決めて追加する。

-- Row Level Security
-- 個人情報を含まないため全テーブルで公開読み取りを許可。
-- 書き込み(insert/update/delete)ポリシーは未定義 = デフォルトで拒否。
-- 認証(誰が投稿者/コメント主か)の仕組みを実装する際に、ユーザー本人のみ書き込み可能な
-- ポリシーを追加する。

alter table users enable row level security;
alter table daw_channels enable row level security;
alter table posts enable row level security;
alter table attachments enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table downloads enable row level security;

create policy "users are publicly readable" on users for select using (true);
create policy "daw_channels are publicly readable" on daw_channels for select using (true);
create policy "posts are publicly readable" on posts for select using (true);
create policy "attachments are publicly readable" on attachments for select using (true);
create policy "comments are publicly readable" on comments for select using (true);
create policy "likes are publicly readable" on likes for select using (true);
create policy "downloads are publicly readable" on downloads for select using (true);
