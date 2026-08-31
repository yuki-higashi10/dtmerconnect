# データ構造案(DTMコミュニティアプリ)

## 全体の考え方
- 「DAW別コミュニティ」「楽曲投稿」「MIDI/パッチ共有」の3セクションを、1つの `posts` テーブルに `section`(区分)を持たせて統合管理する
- ゲスト/ログインユーザーを1つの `users` テーブルで扱い、`is_guest` で区別する(匿名認証でゲストにも仮IDを発行)
- いいね数は都度集計せず、集計値をユーザー側に持たせて称号判定を軽くする

---

## 1. users(ユーザー)

| カラム名 | 型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| display_name | text | 表示名(ゲストは自動生成の仮名も可) |
| avatar_url | text | アイコン画像 |
| is_guest | boolean | ゲストかどうか |
| total_likes_received | integer | 累計いいね獲得数(称号判定に使用) |
| badge_level | integer | 称号レベル(total_likes_receivedから算出、更新時に保存) |
| created_at | timestamp | 登録日時 |

**称号レベル(確定・5段階)**
| レベル | 必要いいね数 | 称号名 |
|---|---|---|
| 1 | 0〜 | ブロンズ |
| 2 | 100〜 | シルバー |
| 3 | 300〜 | ゴールド |
| 4 | 500〜 | プラチナ |
| 5 | 1000〜 | ダイヤモンド |

---

## 2. daw_channels(DAWチャンネル、マスタデータ)

| カラム名 | 型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| name | text | Ableton Live / Logic Pro / FL Studio / Cubase / Pro Tools / Studio One |
| color | text | UI表示用のアクセントカラー |

固定リストなので初期データとして投入(アプリ側からの追加編集はしない想定)。

---

## 3. posts(投稿) — 3セクション共通テーブル

| カラム名 | 型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| user_id | uuid | 投稿者(users参照) |
| section | enum | `daw_community` / `track` / `midi_patch` |
| daw_channel_id | uuid | DAW別コミュニティの場合のみ使用(それ以外はnull) |
| thread_type | enum | DAW別コミュニティの場合のみ使用: `question` / `tips` / `casual` / `setup` |
| title | text | タイトル |
| body | text | 本文 |
| tags | text[] | フリータグ(検索用) |
| bpm | integer | MIDI/パッチ・楽曲投稿で使用(任意) |
| key | text | MIDI/パッチ・楽曲投稿で使用(任意) |
| is_resolved | boolean | 質問スレッドの解決済みフラグ |
| like_count | integer | いいね数(集計値、更新のたびに再計算 or トリガーで加算) |
| comment_count | integer | コメント数(集計値) |
| download_count | integer | ダウンロード数(MIDI/パッチのみ) |
| created_at | timestamp | 投稿日時 |

---

## 4. attachments(添付ファイル)

| カラム名 | 型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| post_id | uuid | posts参照 |
| file_type | enum | `midi` / `preset` / `audio_preview`(試聴用音源) |
| file_url | text | ストレージ上のファイルURL |
| daw_or_synth | text | 対応DAW/対応シンセ名(パッチの場合) |

1投稿に複数ファイル(MIDI本体+試聴音源など)を紐づけられる構成。

---

## 5. comments(コメント)

| カラム名 | 型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| post_id | uuid | posts参照 |
| user_id | uuid | users参照 |
| body | text | コメント本文 |
| created_at | timestamp | 投稿日時 |

---

## 6. likes(いいね)

| カラム名 | 型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| post_id | uuid | posts参照 |
| user_id | uuid | users参照 |
| created_at | timestamp | いいね日時 |

`post_id + user_id` に一意制約(二重いいね防止)。追加時に `posts.like_count` と投稿者の `users.total_likes_received` を加算。

---

## 7. downloads(ダウンロードログ、MIDI/パッチのみ)

| カラム名 | 型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| post_id | uuid | posts参照 |
| user_id | uuid | users参照(ゲストの場合は仮IDでも可) |
| created_at | timestamp | ダウンロード日時 |

集計用ログ。個人特定より「人気度の可視化」目的なので、匿名IDでの記録でも問題なし。

---

## 権限まわり(ゲスト/ログイン)

| 操作 | ゲスト | ログインユーザー |
|---|---|---|
| 閲覧・検索 | ○ | ○ |
| 試聴(プレビュー) | ○ | ○ |
| ダウンロード | × | ○ |
| 投稿・コメント・いいね | × | ○ |

---

## 確定事項
- 称号レベルは5段階(0/100/300/500/1000いいね、0いいねからブロンズ)で確定
- 試聴はゲスト可、ダウンロードはログイン必須で確定
