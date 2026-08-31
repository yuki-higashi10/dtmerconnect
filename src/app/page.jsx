"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Home,
  Search,
  Music2,
  MessageCircle,
  Heart,
  Download,
  Play,
  Pause,
  User,
  HelpCircle,
  Lightbulb,
  Coffee,
  Settings2,
  X,
  Medal,
  Award,
  Crown,
  Gem,
  Diamond,
  LogOut,
  Pencil,
  Trash2,
  ChevronRight,
  Upload,
  Flag,
  Shield,
  Menu,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

const C = {
  bg: "#0e1013",
  panel: "#181b21",
  panelHover: "#20242c",
  border: "#282c35",
  text: "#f0efea",
  muted: "#9aa0ac",
  amber: "#e8a33d",
  teal: "#4fd1c5",
  violet: "#a78bfa",
  rose: "#f472b6",
  lime: "#bef264",
  sky: "#7dd3fc",
  orange: "#fb923c",
  blue: "#60a5fa",
};

const CHANNELS = [
  { id: "ableton", name: "Ableton Live", color: C.amber },
  { id: "logic", name: "Logic Pro", color: C.blue },
  { id: "fl", name: "FL Studio", color: C.orange },
  { id: "cubase", name: "Cubase", color: C.teal },
  { id: "protools", name: "Pro Tools", color: C.violet },
  { id: "studioone", name: "Studio One", color: C.lime },
  { id: "general", name: "全般", color: "#cbd5e1" },
];

const THREAD_TYPES = {
  question: { label: "質問", icon: HelpCircle },
  tips: { label: "Tips", icon: Lightbulb },
  casual: { label: "雑談", icon: Coffee },
  setup: { label: "環境/機材紹介", icon: Settings2 },
};

const BADGES = [
  { min: 0, name: "ブロンズ", icon: Medal, color: "#cd7f32" },
  { min: 100, name: "シルバー", icon: Award, color: "#c7ccd1" },
  { min: 300, name: "ゴールド", icon: Crown, color: "#eab308" },
  { min: 500, name: "プラチナ", icon: Gem, color: "#e5e4e2" },
  { min: 1000, name: "ダイヤモンド", icon: Diamond, color: "#7dd3fc" },
];
function badgeFor(likes) {
  let b = BADGES[0];
  for (const cand of BADGES) if (likes >= cand.min) b = cand;
  return b;
}

const REPORT_REASONS = [
  { value: "spam", label: "スパム・広告" },
  { value: "inappropriate", label: "不適切なコンテンツ" },
  { value: "copyright", label: "著作権侵害" },
  { value: "harassment", label: "誹謗中傷・嫌がらせ" },
  { value: "other", label: "その他" },
];
function reportReasonLabel(value) {
  return REPORT_REASONS.find((r) => r.value === value)?.label ?? value;
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function avatarColor(seed) {
  const hue = hashString(seed) % 360;
  return `hsl(${hue}, 55%, 42%)`;
}

function AvatarCircle({ name, avatarUrl, size }) {
  const label = name || "?";
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={label}
        style={{ width: size, height: size, borderRadius: 999, objectFit: "cover" }}
      />
    );
  }
  const initial = Array.from(label)[0]?.toUpperCase() ?? "?";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: avatarColor(label),
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        fontWeight: 600,
      }}
    >
      {initial}
    </div>
  );
}

function Avatar({ name, avatarUrl, size = 28, userId, onOpenProfile }) {
  const [zoomed, setZoomed] = useState(false);
  const label = name || "?";
  const clickable = Boolean(userId && onOpenProfile);

  function handleClick(e) {
    e.stopPropagation();
    if (clickable) {
      onOpenProfile(userId);
    } else {
      setZoomed(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="shrink-0 rounded-full"
        style={{ width: size, height: size, padding: 0, border: "none", background: "transparent", cursor: "pointer" }}
        aria-label={clickable ? `${label}のプロフィールを表示` : `${label}のアイコンを拡大表示`}
      >
        <AvatarCircle name={name} avatarUrl={avatarUrl} size={size} />
      </button>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => {
            e.stopPropagation();
            setZoomed(false);
          }}
        >
          <AvatarCircle name={name} avatarUrl={avatarUrl} size={240} />
        </div>
      )}
    </>
  );
}

function AuthorLine({ name, likes, avatarUrl, avatarSize = 20, textClassName = "text-sm", userId, onOpenProfile }) {
  const badge = likes != null ? badgeFor(likes) : null;
  const clickable = Boolean(userId && onOpenProfile);
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Avatar name={name} avatarUrl={avatarUrl} size={avatarSize} userId={userId} onOpenProfile={onOpenProfile} />
      <span
        className={`${textClassName} truncate`}
        style={{ color: C.muted, cursor: clickable ? "pointer" : "inherit" }}
        onClick={
          clickable
            ? (e) => {
                e.stopPropagation();
                onOpenProfile(userId);
              }
            : undefined
        }
      >
        {name}
      </span>
      {badge && <badge.icon size={Math.round(avatarSize * 0.7)} color={badge.color} className="shrink-0" />}
    </div>
  );
}

function FileInputButton({ label, accept, onChange, disabled = false }) {
  return (
    <label
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
      style={{
        border: `1px solid ${C.border}`,
        color: C.text,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <Upload size={12} />
      {label}
      <input type="file" accept={accept} onChange={onChange} disabled={disabled} className="hidden" />
    </label>
  );
}

function LikeButton({ postId, liked, count, size = 14, onToggled }) {
  const { user, isGuest } = useAuth();
  const [busy, setBusy] = useState(false);

  async function toggle(e) {
    e.stopPropagation();
    if (isGuest || busy || !user) return;
    setBusy(true);
    const supabase = createClient();
    const nextLiked = !liked;
    const nextCount = nextLiked ? count + 1 : count - 1;
    onToggled(postId, nextLiked, nextCount);

    const { error } = nextLiked
      ? await supabase.from("likes").insert({ post_id: postId, user_id: user.id })
      : await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);

    if (error) {
      onToggled(postId, liked, count);
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isGuest || busy}
      className="flex items-center gap-1 text-sm"
      style={{ color: liked ? C.rose : C.muted, cursor: isGuest ? "default" : "pointer" }}
      title={isGuest ? "いいねするには本登録が必要です" : undefined}
    >
      <Heart size={size} fill={liked ? C.rose : "none"} />
      {count}
    </button>
  );
}

function ReportButton({ targetType, targetId }) {
  const { user, isGuest } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0].value);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(null); // null | "posting" | "done" | "error"
  const [errorMsg, setErrorMsg] = useState("");
  const [guestNotice, setGuestNotice] = useState(false);

  function handleClick() {
    if (isGuest || !user) {
      setGuestNotice(true);
      return;
    }
    setOpen((prev) => !prev);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("posting");
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      post_id: targetType === "post" ? targetId : null,
      comment_id: targetType === "comment" ? targetId : null,
      reason,
      comment: comment.trim() || null,
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    setStatus("done");
    setOpen(false);
  }

  if (status === "done") {
    return (
      <span className="text-xs" style={{ color: C.muted }}>
        通報しました
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1 text-xs font-medium"
        style={{ color: C.muted }}
      >
        <Flag size={12} /> 通報する
      </button>
      {guestNotice && (
        <div className="text-xs mt-1" style={{ color: C.muted }}>
          通報するには本登録が必要です
        </div>
      )}
      {open && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 mt-2 p-3 rounded-lg"
          style={{ background: C.bg, border: `1px solid ${C.border}` }}
        >
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-transparent outline-none text-sm px-2 py-1.5 rounded-lg"
            style={{ border: `1px solid ${C.border}`, color: C.text, colorScheme: "dark" }}
          >
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="詳細(任意)"
            rows={2}
            maxLength={500}
            className="bg-transparent outline-none text-sm px-2 py-1.5 rounded-lg resize-none"
            style={{ border: `1px solid ${C.border}`, color: C.text }}
          />
          {status === "error" && (
            <div className="text-xs" style={{ color: C.rose }}>
              {errorMsg}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: C.muted }}>
              キャンセル
            </button>
            <button
              type="submit"
              disabled={status === "posting"}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: C.rose, color: C.bg }}
            >
              {status === "posting" ? "送信中..." : "通報する"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function seededNotes(seed, count = 14) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const notes = [];
  let x = 0;
  for (let i = 0; i < count; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    const pitch = h % 8;
    h = (h * 1103515245 + 12345) >>> 0;
    const dur = 1 + (h % 3);
    notes.push({ pitch, dur, x });
    x += dur + (h % 2);
  }
  return { notes, totalWidth: Math.max(x, 1) };
}

function PianoRoll({ seed, color, height = 44 }) {
  const { notes, totalWidth } = useMemo(() => seededNotes(seed), [seed]);
  return (
    <div
      style={{
        position: "relative",
        height,
        borderRadius: 6,
        overflow: "hidden",
        background: C.bg,
        border: `1px solid ${C.border}`,
      }}
    >
      {notes.map((n, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(n.x / totalWidth) * 100}%`,
            width: `${(n.dur / totalWidth) * 100}%`,
            top: `${(n.pitch / 8) * 100}%`,
            height: `${100 / 8}%`,
            background: color,
            borderRadius: 2,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

// ---------- mock data ----------
const THREADS = [
  { id: "t1", channel: "ableton", type: "question", title: "サイドチェインの掛かりが浅い気がする", author: "kenta_dtm", likes: 6, comments: 2, resolved: true },
  { id: "t2", channel: "ableton", type: "tips", title: "純正Wavetableでファンクギター風の音作り", author: "yuki", likes: 15, comments: 3 },
  { id: "t3", channel: "cubase", type: "question", title: "周りにCubase勢がいなくて相談できません", author: "misaki_c", likes: 12, comments: 4 },
  { id: "t4", channel: "logic", type: "tips", title: "純正ディレイだけで空間を作るコツ", author: "aoi_sound", likes: 18, comments: 5 },
  { id: "t5", channel: "fl", type: "setup", title: "今の自宅制作環境を紹介します", author: "trap_nori", likes: 9, comments: 1 },
  { id: "t6", channel: "studioone", type: "casual", title: "みんな1日何時間くらい作業してる?", author: "haru_piano", likes: 21, comments: 8 },
  { id: "t7", channel: "protools", type: "question", title: "レイテンシーが気になる時の設定は?", author: "shin_rec", likes: 4, comments: 1 },
  { id: "t8", channel: "general", type: "casual", title: "DTM始めたきっかけ教えてください", author: "yuki", likes: 19, comments: 11 },
  { id: "t9", channel: "general", type: "question", title: "おすすめのオーディオインターフェースは?", author: "kenta_dtm", likes: 8, comments: 3 },
];

const TRACKS = [
  { id: "tr1", title: "夜明けのローファイ", author: "yuu_beats", bpm: 86, key: "Am", likes: 34, comments: 6 },
  { id: "tr2", title: "エモいピアノバラード", author: "haru_piano", bpm: 72, key: "Emaj", likes: 51, comments: 9 },
  { id: "tr3", title: "重低音トラップビート", author: "trap_nori", bpm: 140, key: "F#m", likes: 40, comments: 5 },
];

const PATCHES = [
  { id: "p1", title: "Lo-fiドラムグルーヴMIDI", author: "yuu_beats", target: "Ableton Drum Rack", bpm: 86, key: "Am", likes: 24, comments: 3, downloads: 58 },
  { id: "p2", title: "808ベースライン雛形3種", author: "trap_nori", target: "Serum", bpm: 140, key: "F#m", likes: 41, comments: 7, downloads: 120 },
  { id: "p3", title: "エモいピアノコード進行4小節", author: "haru_piano", target: "Studio One", bpm: 128, key: "Emaj", likes: 33, comments: 4, downloads: 77 },
];

const THREADS_PAGE_SIZE = 20;

function timeStr(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// フリーワード検索: タイトル・タグ・ジャンル・(パッチの場合)対応シンセ/プラグイン名を対象にする
function matchesSearchQuery(post, query, { includeTargetSynth = false } = {}) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (post.title?.toLowerCase().includes(q)) return true;
  if (post.genre?.toLowerCase().includes(q)) return true;
  if (post.tags?.some((tag) => tag.toLowerCase().includes(q))) return true;
  if (includeTargetSynth && post.targetSynth?.toLowerCase().includes(q)) return true;
  return false;
}

async function signOutAndBecomeGuest() {
  const supabase = createClient();
  await supabase.auth.signOut();
  await supabase.auth.signInAnonymously();
}

const ATTACHMENT_FILE_MAX_BYTES = 20 * 1024 * 1024;
const MIDI_EXTENSIONS = ["mid", "midi"];
const AUDIO_EXTENSIONS = ["mp3", "wav", "m4a", "ogg"];

function useSectionPosts(section) {
  const { user, isGuest } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    const supabase = createClient();
    return supabase
      .from("posts")
      .select(
        "id, user_id, title, body, bpm, key, used_daw, genre, tags, midi_patch_type, target_synth, sound_category, streaming_links, thumbnail_url, created_at, like_count, comment_count, download_count, play_count, users(display_name, total_likes_received, avatar_url), attachments(id, file_type, file_url)",
      )
      .eq("section", section)
      .order("created_at", { ascending: false })
      .limit(60)
      .then(async ({ data, error }) => {
        if (!error && data) {
          let likedIds = new Set();
          if (user && !isGuest && data.length > 0) {
            const { data: likedRows } = await supabase
              .from("likes")
              .select("post_id")
              .eq("user_id", user.id)
              .in(
                "post_id",
                data.map((p) => p.id),
              );
            likedIds = new Set((likedRows ?? []).map((r) => r.post_id));
          }
          setPosts(
            data.map((p) => ({
              id: p.id,
              userId: p.user_id,
              title: p.title,
              body: p.body,
              bpm: p.bpm,
              key: p.key,
              usedDaw: p.used_daw,
              genre: p.genre,
              tags: p.tags ?? [],
              midiPatchType: p.midi_patch_type,
              targetSynth: p.target_synth,
              soundCategory: p.sound_category,
              streamingLinks: p.streaming_links ?? [],
              thumbnailUrl: p.thumbnail_url,
              createdAt: p.created_at,
              author: p.users?.display_name ?? "unknown",
              authorLikes: p.users?.total_likes_received ?? 0,
              authorAvatarUrl: p.users?.avatar_url ?? null,
              likes: p.like_count,
              liked: likedIds.has(p.id),
              comments: p.comment_count,
              downloads: p.download_count,
              playCount: p.play_count,
              attachments: p.attachments ?? [],
            })),
          );
        }
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { posts, setPosts, loading, reload: load };
}

// patchesバケットの公開URLから、削除に必要なストレージ上のパスを取り出す
// マイページの「自分の投稿」一覧用に、posts行を各種一覧/詳細モーダルと同じ形へ整形する
function mapMyPost(p, likedIds) {
  const base = {
    id: p.id,
    userId: p.user_id,
    title: p.title,
    body: p.body,
    author: p.users?.display_name ?? "unknown",
    authorLikes: p.users?.total_likes_received ?? 0,
    authorAvatarUrl: p.users?.avatar_url ?? null,
    likes: p.like_count,
    liked: likedIds.has(p.id),
    comments: p.comment_count,
    attachments: p.attachments ?? [],
    thumbnailUrl: p.thumbnail_url,
  };
  if (p.section === "daw_community") {
    return {
      kind: "thread",
      data: { ...base, type: p.thread_type, resolved: p.is_resolved, referenceUrl: p.reference_url },
    };
  }
  if (p.section === "track") {
    return {
      kind: "track",
      data: {
        ...base,
        bpm: p.bpm,
        key: p.key,
        usedDaw: p.used_daw,
        genre: p.genre,
        tags: p.tags ?? [],
        streamingLinks: p.streaming_links ?? [],
        playCount: p.play_count,
      },
    };
  }
  return {
    kind: "patch",
    data: {
      ...base,
      bpm: p.bpm,
      key: p.key,
      genre: p.genre,
      tags: p.tags ?? [],
      midiPatchType: p.midi_patch_type,
      targetSynth: p.target_synth,
      soundCategory: p.sound_category,
      downloads: p.download_count,
    },
  };
}

// ホーム画面の「フォロー中の新着」用: フォロー中ユーザーの全セクションの投稿を新着順に取得する
function useFollowingFeed() {
  const { user, isGuest } = useAuth();
  const [posts, setPosts] = useState([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  function load() {
    if (!user || isGuest) {
      return Promise.resolve().then(() => {
        setPosts([]);
        setFollowingCount(0);
        setLoading(false);
      });
    }
    const supabase = createClient();
    return supabase
      .from("follows")
      .select("followed_id")
      .eq("follower_id", user.id)
      .then(async ({ data: followRows, error }) => {
        const followedIds = (followRows ?? []).map((r) => r.followed_id);
        setFollowingCount(followedIds.length);
        if (error || followedIds.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }
        const { data, error: postsError } = await supabase
          .from("posts")
          .select(
            "id, user_id, section, thread_type, title, body, bpm, key, used_daw, genre, tags, midi_patch_type, target_synth, sound_category, streaming_links, thumbnail_url, reference_url, is_resolved, like_count, comment_count, download_count, play_count, users(display_name, total_likes_received, avatar_url), attachments(id, file_type, file_url)",
          )
          .in("user_id", followedIds)
          .order("created_at", { ascending: false })
          .limit(20);
        if (postsError || !data) {
          setPosts([]);
          setLoading(false);
          return;
        }
        let likedIds = new Set();
        if (data.length > 0) {
          const { data: likedRows } = await supabase
            .from("likes")
            .select("post_id")
            .eq("user_id", user.id)
            .in(
              "post_id",
              data.map((p) => p.id),
            );
          likedIds = new Set((likedRows ?? []).map((r) => r.post_id));
        }
        setPosts(data.map((p) => mapMyPost(p, likedIds)));
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isGuest]);

  return { posts, followingCount, loading, reload: load };
}

function extractPatchesStoragePath(url) {
  const marker = "/object/public/patches/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length).split("?")[0];
}

async function uploadAttachment(supabase, userId, postId, fileType, file) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${postId}/${fileType}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("patches")
    .upload(path, file, { contentType: file.type || "application/octet-stream" });
  if (uploadError) return { error: uploadError };

  const { data: urlData } = supabase.storage.from("patches").getPublicUrl(path);
  const { error: attachError } = await supabase.from("attachments").insert({
    post_id: postId,
    file_type: fileType,
    file_url: urlData.publicUrl,
  });
  return { error: attachError };
}

async function uploadThumbnail(supabase, userId, postId, file) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${postId}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("thumbnails")
    .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
  if (uploadError) return { error: uploadError };

  const { data: urlData } = supabase.storage.from("thumbnails").getPublicUrl(path);
  const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
  const { error: updateError } = await supabase.from("posts").update({ thumbnail_url: publicUrl }).eq("id", postId);
  return { error: updateError, url: publicUrl };
}

export default function App() {
  const { user, isGuest, profile } = useAuth();
  const [view, setView] = useState("home"); // home | channel | tracks | patches | mypage | search | profile | followList | admin
  const [viewedUserId, setViewedUserId] = useState(null);
  const [followListUserId, setFollowListUserId] = useState(null);
  const [followListTab, setFollowListTab] = useState("followers");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [threadTab, setThreadTab] = useState("all");
  const [nowPlaying, setNowPlaying] = useState(null); // {id,title,author,seed,color,audioUrl}
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [detail, setDetail] = useState(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const [dawChannelIds, setDawChannelIds] = useState({}); // { ableton: uuid, ... }
  const [channelThreads, setChannelThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadsPage, setThreadsPage] = useState(0);
  const [threadsTotalCount, setThreadsTotalCount] = useState(0);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [postStatus, setPostStatus] = useState(null); // null | "posting" | "error"
  const [postError, setPostError] = useState("");

  const tracksState = useSectionPosts("track");
  const patchesState = useSectionPosts("midi_patch");
  const followingFeed = useFollowingFeed();
  const [showNewTrackForm, setShowNewTrackForm] = useState(false);
  const [trackPostStatus, setTrackPostStatus] = useState(null);
  const [trackPostError, setTrackPostError] = useState("");
  const [showNewPatchForm, setShowNewPatchForm] = useState(false);
  const [patchPostStatus, setPatchPostStatus] = useState(null);
  const [patchPostError, setPatchPostError] = useState("");

  const [trackGenreFilter, setTrackGenreFilter] = useState("all");
  const [trackSort, setTrackSort] = useState("newest"); // "newest" | "likes" | "plays"
  const [trackSearchQuery, setTrackSearchQuery] = useState("");
  const [patchGenreFilter, setPatchGenreFilter] = useState("all");
  const [patchSort, setPatchSort] = useState("newest"); // "newest" | "likes" | "downloads"
  const [patchSearchQuery, setPatchSearchQuery] = useState("");

  const [myPosts, setMyPosts] = useState([]);

  function loadMyPosts() {
    if (!user || isGuest) {
      return Promise.resolve().then(() => setMyPosts([]));
    }
    const supabase = createClient();
    return supabase
      .from("posts")
      .select(
        "id, user_id, section, thread_type, title, body, bpm, key, used_daw, genre, tags, midi_patch_type, target_synth, sound_category, streaming_links, thumbnail_url, is_resolved, like_count, comment_count, download_count, play_count, users(display_name, total_likes_received, avatar_url), attachments(id, file_type, file_url)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (error || !data) return;
        let likedIds = new Set();
        if (data.length > 0) {
          const { data: likedRows } = await supabase
            .from("likes")
            .select("post_id")
            .eq("user_id", user.id)
            .in(
              "post_id",
              data.map((p) => p.id),
            );
          likedIds = new Set((likedRows ?? []).map((r) => r.post_id));
        }
        setMyPosts(data.map((p) => mapMyPost(p, likedIds)));
      });
  }

  useEffect(() => {
    loadMyPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isGuest]);

  const [threadComments, setThreadComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentStatus, setCommentStatus] = useState(null); // null | "posting" | "error"
  const [commentError, setCommentError] = useState("");

  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editStatus, setEditStatus] = useState(null); // null | "posting" | "error"
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (isPlaying && nowPlaying && !nowPlaying.audioUrl) {
      timerRef.current = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 1.2));
      }, 200);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, nowPlaying]);

  // 実際の音声ファイルがある場合は <audio> の再生状態をReactの状態と同期する
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !nowPlaying?.audioUrl) return;
    if (el.src !== nowPlaying.audioUrl) {
      el.src = nowPlaying.audioUrl;
    }
    if (isPlaying) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [nowPlaying, isPlaying]);

  // DAWチャンネル名 -> Supabase上のUUIDを対応付ける
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("daw_channels")
      .select("id, name")
      .then(({ data }) => {
        if (!data) return;
        const byName = {};
        data.forEach((row) => {
          byName[row.name] = row.id;
        });
        const map = {};
        CHANNELS.forEach((c) => {
          if (byName[c.name]) map[c.id] = byName[c.name];
        });
        setDawChannelIds(map);
      });
  }, []);

  function loadChannelThreads(channelKey, tab, page) {
    const dawChannelId = dawChannelIds[channelKey];
    if (!dawChannelId) return Promise.resolve();
    const supabase = createClient();
    const from = page * THREADS_PAGE_SIZE;
    const to = from + THREADS_PAGE_SIZE - 1;
    let query = supabase
      .from("posts")
      .select(
        "id, user_id, thread_type, title, body, reference_url, is_resolved, like_count, comment_count, users(display_name, total_likes_received, avatar_url)",
        { count: "exact" },
      )
      .eq("section", "daw_community")
      .eq("daw_channel_id", dawChannelId);
    if (tab !== "all") {
      query = query.eq("thread_type", tab);
    }
    return query
      .order("created_at", { ascending: false })
      .range(from, to)
      .then(async ({ data, error, count }) => {
        if (!error && data) {
          let likedIds = new Set();
          if (user && !isGuest && data.length > 0) {
            const { data: likedRows } = await supabase
              .from("likes")
              .select("post_id")
              .eq("user_id", user.id)
              .in(
                "post_id",
                data.map((p) => p.id),
              );
            likedIds = new Set((likedRows ?? []).map((r) => r.post_id));
          }
          setChannelThreads(
            data.map((p) => ({
              id: p.id,
              userId: p.user_id,
              channel: channelKey,
              type: p.thread_type,
              title: p.title,
              body: p.body,
              referenceUrl: p.reference_url,
              author: p.users?.display_name ?? "unknown",
              authorLikes: p.users?.total_likes_received ?? 0,
              authorAvatarUrl: p.users?.avatar_url ?? null,
              likes: p.like_count,
              liked: likedIds.has(p.id),
              comments: p.comment_count,
              resolved: p.is_resolved,
            })),
          );
          setThreadsTotalCount(count ?? 0);
        }
        setThreadsLoading(false);
      });
  }

  // どの一覧(thread/track/patch)にある投稿でも、いいね・コメント数・DL数の変化を
  // その一覧と、開いている詳細モーダルの両方に反映する
  function applyPostPatch(kind, postId, patch) {
    if (kind === "thread") {
      setChannelThreads((prev) => prev.map((t) => (t.id === postId ? { ...t, ...patch } : t)));
    } else if (kind === "track") {
      tracksState.setPosts((prev) => prev.map((t) => (t.id === postId ? { ...t, ...patch } : t)));
    } else if (kind === "patch") {
      patchesState.setPosts((prev) => prev.map((t) => (t.id === postId ? { ...t, ...patch } : t)));
    }
    setDetail((prev) => (prev && prev.data.id === postId ? { ...prev, data: { ...prev.data, ...patch } } : prev));
    setMyPosts((prev) =>
      prev.map((mp) => (mp.data.id === postId ? { ...mp, data: { ...mp.data, ...patch } } : mp)),
    );
  }

  async function loadComments(postId) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("comments")
      .select("id, user_id, body, created_at, users(display_name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (!error && data) {
      setThreadComments(
        data.map((c) => ({
          id: c.id,
          authorId: c.user_id,
          body: c.body,
          author: c.users?.display_name ?? "unknown",
          authorAvatarUrl: c.users?.avatar_url ?? null,
        })),
      );
    }
    setCommentsLoading(false);
  }

  function openDetail(kind, data, interactive) {
    setDetail({ kind, data, interactive });
    setThreadComments([]);
    setCommentText("");
    setCommentStatus(null);
    setCommentError("");
    setIsEditingDetail(false);
    setDeleteConfirm(false);
    setEditStatus(null);
    setEditError("");
    if (interactive) {
      setCommentsLoading(true);
      loadComments(data.id);
    }
  }

  function closeDetail() {
    setDetail(null);
    setIsEditingDetail(false);
    setDeleteConfirm(false);
  }

  function openProfile(userId) {
    if (!userId) return;
    setDetail(null);
    setIsEditingDetail(false);
    setDeleteConfirm(false);
    setViewedUserId(userId);
    setView("profile");
  }

  function openFollowList(userId, tab) {
    if (!userId) return;
    setDetail(null);
    setIsEditingDetail(false);
    setDeleteConfirm(false);
    setFollowListUserId(userId);
    setFollowListTab(tab === "following" ? "following" : "followers");
    setView("followList");
  }

  async function handleUpdateThread(postId, { type, title, body, referenceUrl }) {
    setEditStatus("posting");
    setEditError("");
    const supabase = createClient();
    const { error } = await supabase
      .from("posts")
      .update({ thread_type: type, title, body: body || null, reference_url: referenceUrl || null })
      .eq("id", postId);
    if (error) {
      setEditStatus("error");
      setEditError(error.message);
      return;
    }
    setEditStatus(null);
    setIsEditingDetail(false);
    applyPostPatch("thread", postId, { type, title, body: body || null, referenceUrl: referenceUrl || null });
  }

  async function handleUpdateTrack(postId, { title, body, bpm, key, usedDaw, genre, tags, streamingLinks, thumbnailFile }) {
    setEditStatus("posting");
    setEditError("");
    const supabase = createClient();
    const { error } = await supabase
      .from("posts")
      .update({
        title,
        body: body || null,
        bpm,
        key,
        used_daw: usedDaw || null,
        genre: genre || null,
        tags: tags && tags.length > 0 ? tags : [],
        streaming_links: streamingLinks && streamingLinks.length > 0 ? streamingLinks : [],
      })
      .eq("id", postId);
    if (error) {
      setEditStatus("error");
      setEditError(error.message);
      return;
    }
    let thumbnailUrl;
    if (thumbnailFile) {
      const { error: thumbError, url } = await uploadThumbnail(supabase, user.id, postId, thumbnailFile);
      if (thumbError) {
        setEditStatus("error");
        setEditError(thumbError.message);
        return;
      }
      thumbnailUrl = url;
    }
    setEditStatus(null);
    setIsEditingDetail(false);
    applyPostPatch("track", postId, {
      title,
      body: body || null,
      bpm,
      key,
      usedDaw,
      genre,
      tags,
      streamingLinks,
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
    });
  }

  async function handleUpdatePatch(postId, { title, body, genre, tags, bpm, key, targetSynth, soundCategory, thumbnailFile }) {
    setEditStatus("posting");
    setEditError("");
    const supabase = createClient();
    const { error } = await supabase
      .from("posts")
      .update({
        title,
        body: body || null,
        genre: genre || null,
        tags: tags && tags.length > 0 ? tags : [],
        bpm,
        key,
        target_synth: targetSynth,
        sound_category: soundCategory,
      })
      .eq("id", postId);
    if (error) {
      setEditStatus("error");
      setEditError(error.message);
      return;
    }
    let thumbnailUrl;
    if (thumbnailFile) {
      const { error: thumbError, url } = await uploadThumbnail(supabase, user.id, postId, thumbnailFile);
      if (thumbError) {
        setEditStatus("error");
        setEditError(thumbError.message);
        return;
      }
      thumbnailUrl = url;
    }
    setEditStatus(null);
    setIsEditingDetail(false);
    applyPostPatch("patch", postId, {
      title,
      body: body || null,
      genre,
      tags,
      bpm,
      key,
      targetSynth,
      soundCategory,
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
    });
  }

  async function handleDeletePost() {
    if (!detail) return;
    setEditStatus("posting");
    setEditError("");
    const supabase = createClient();

    if (detail.data.attachments?.length > 0) {
      const paths = detail.data.attachments.map((a) => extractPatchesStoragePath(a.file_url)).filter(Boolean);
      if (paths.length > 0) {
        await supabase.storage.from("patches").remove(paths);
      }
    }

    const { error } = await supabase.from("posts").delete().eq("id", detail.data.id);
    if (error) {
      setEditStatus("error");
      setEditError(error.message);
      return;
    }

    const postId = detail.data.id;
    if (detail.kind === "thread") setChannelThreads((prev) => prev.filter((t) => t.id !== postId));
    if (detail.kind === "track") tracksState.setPosts((prev) => prev.filter((t) => t.id !== postId));
    if (detail.kind === "patch") patchesState.setPosts((prev) => prev.filter((t) => t.id !== postId));
    setMyPosts((prev) => prev.filter((mp) => mp.data.id !== postId));
    closeDetail();
  }

  async function handleSubmitComment(e) {
    e.preventDefault();
    const body = commentText.trim();
    if (!body || !detail) return;
    setCommentStatus("posting");
    setCommentError("");
    const supabase = createClient();
    const { error } = await supabase.from("comments").insert({
      post_id: detail.data.id,
      user_id: user.id,
      body,
    });
    if (error) {
      setCommentStatus("error");
      setCommentError(error.message);
      return;
    }
    setCommentText("");
    setCommentStatus(null);
    applyPostPatch(detail.kind, detail.data.id, { comments: (detail.data.comments ?? 0) + 1 });
    await loadComments(detail.data.id);
  }

  useEffect(() => {
    if (view === "channel" && activeChannel && dawChannelIds[activeChannel]) {
      loadChannelThreads(activeChannel, threadTab, threadsPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, activeChannel, dawChannelIds, threadTab, threadsPage]);

  function selectThreadTab(tab) {
    setThreadTab(tab);
    setThreadsPage(0);
    setChannelThreads([]);
    setThreadsLoading(true);
  }

  async function handleCreateThread({ type, title, body, referenceUrl }) {
    setPostStatus("posting");
    setPostError("");
    const supabase = createClient();
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      section: "daw_community",
      daw_channel_id: dawChannelIds[activeChannel],
      thread_type: type,
      title,
      body: body || null,
      reference_url: referenceUrl || null,
    });
    if (error) {
      setPostStatus("error");
      setPostError(error.message);
      return;
    }
    setPostStatus(null);
    setShowNewThreadForm(false);
    setThreadsPage(0);
    await loadChannelThreads(activeChannel, threadTab, 0);
  }

  async function handleCreateTrack({ title, body, bpm, key, usedDaw, genre, tags, streamingLinks, thumbnailFile, files }) {
    setTrackPostStatus("posting");
    setTrackPostError("");
    const supabase = createClient();
    const { data: inserted, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        section: "track",
        title,
        body: body || null,
        bpm,
        key,
        used_daw: usedDaw || null,
        genre: genre || null,
        tags: tags && tags.length > 0 ? tags : null,
        streaming_links: streamingLinks && streamingLinks.length > 0 ? streamingLinks : [],
      })
      .select("id")
      .single();

    if (error) {
      setTrackPostStatus("error");
      setTrackPostError(error.message);
      return;
    }

    const postId = inserted.id;
    if (thumbnailFile) {
      const { error: thumbError } = await uploadThumbnail(supabase, user.id, postId, thumbnailFile);
      if (thumbError) {
        setTrackPostStatus("error");
        setTrackPostError(thumbError.message);
        return;
      }
    }
    for (const [fileType, file] of Object.entries(files || {})) {
      if (!file) continue;
      const { error: attachError } = await uploadAttachment(supabase, user.id, postId, fileType, file);
      if (attachError) {
        setTrackPostStatus("error");
        setTrackPostError(attachError.message);
        return;
      }
    }

    setTrackPostStatus(null);
    setShowNewTrackForm(false);
    await tracksState.reload();
  }

  async function handleCreatePatch({ midiPatchType, title, body, genre, tags, bpm, key, targetSynth, soundCategory, thumbnailFile, files }) {
    setPatchPostStatus("posting");
    setPatchPostError("");
    const supabase = createClient();
    const { data: inserted, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        section: "midi_patch",
        midi_patch_type: midiPatchType,
        title,
        body: body || null,
        genre: genre || null,
        tags: tags && tags.length > 0 ? tags : null,
        bpm,
        key,
        target_synth: targetSynth,
        sound_category: soundCategory,
      })
      .select("id")
      .single();

    if (error) {
      setPatchPostStatus("error");
      setPatchPostError(error.message);
      return;
    }

    const postId = inserted.id;
    if (thumbnailFile) {
      const { error: thumbError } = await uploadThumbnail(supabase, user.id, postId, thumbnailFile);
      if (thumbError) {
        setPatchPostStatus("error");
        setPatchPostError(thumbError.message);
        return;
      }
    }
    for (const [fileType, file] of Object.entries(files || {})) {
      if (!file) continue;
      const { error: attachError } = await uploadAttachment(supabase, user.id, postId, fileType, file);
      if (attachError) {
        setPatchPostStatus("error");
        setPatchPostError(attachError.message);
        return;
      }
    }

    setPatchPostStatus(null);
    setShowNewPatchForm(false);
    await patchesState.reload();
  }

  function handleDownloadClick(postId, currentCount) {
    const supabase = createClient();
    supabase
      .from("downloads")
      .insert({ post_id: postId, user_id: user.id })
      .then(({ error }) => {
        if (!error) applyPostPatch("patch", postId, { downloads: currentCount + 1 });
      });
  }

  function play(item, color) {
    const audioAttachment = item.attachments?.find((a) => a.file_type === "audio_preview");
    setNowPlaying({ ...item, color, audioUrl: audioAttachment?.file_url ?? null });
    setIsPlaying(true);
    setProgress(0);
    setAudioDuration(0);
  }

  // 楽曲投稿の再生ボタンを押した回数(視聴数)を加算する。実データ(attachmentsを持つ)のみ対象。
  function playTrack(item, color) {
    play(item, color);
    if (item.attachments !== undefined) {
      const supabase = createClient();
      supabase.rpc("increment_play_count", { target_post_id: item.id }).then(({ error }) => {
        if (!error) applyPostPatch("track", item.id, { playCount: (item.playCount ?? 0) + 1 });
      });
    }
  }

  function openChannel(channelKey) {
    setView("channel");
    setActiveChannel(channelKey);
    setThreadTab("all");
    setThreadsPage(0);
    setShowNewThreadForm(false);
    setChannelThreads([]);
    setThreadsLoading(true);
  }

  const channelColor = (id) => CHANNELS.find((c) => c.id === id)?.color ?? C.muted;

  const navItem = (id, icon, label, onClick) => {
    const Icon = icon;
    const active = view === id;
    return (
      <button
        onClick={onClick ?? (() => setView(id))}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full text-left"
        style={{ background: active ? C.panelHover : "transparent", color: active ? C.text : C.muted }}
      >
        <Icon size={17} />
        {label}
      </button>
    );
  };

  const renderSidebarNav = (closeMenu = () => {}) => {
    const goto = (id) => {
      setView(id);
      closeMenu();
    };
    const gotoChannel = (channelKey) => {
      openChannel(channelKey);
      closeMenu();
    };
    return (
      <>
        {navItem("home", Home, "ホーム", () => goto("home"))}
        {navItem("search", Search, "検索", () => goto("search"))}

        <div className="text-xs uppercase mt-4 mb-1 px-3" style={{ color: C.muted }}>
          DAW別コミュニティ
        </div>
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            onClick={() => gotoChannel(c.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left"
            style={{
              background: view === "channel" && activeChannel === c.id ? C.panelHover : "transparent",
              color: view === "channel" && activeChannel === c.id ? C.text : C.muted,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: 999, background: c.color, display: "inline-block" }} />
            {c.name}
          </button>
        ))}

        <div className="text-xs uppercase mt-4 mb-1 px-3" style={{ color: C.muted }}>
          共有
        </div>
        {navItem("tracks", Music2, "楽曲投稿", () => goto("tracks"))}
        {navItem("patches", Download, "MIDI/パッチ共有", () => goto("patches"))}

        <div className="mt-auto">
          {profile?.is_admin && navItem("admin", Shield, "管理画面", () => goto("admin"))}
          {navItem("mypage", User, "マイページ", () => goto("mypage"))}
        </div>
      </>
    );
  };

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'Noto Sans JP', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Noto+Sans+JP:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .display-font{font-family:'Space Grotesk','Noto Sans JP',sans-serif}
        .mono-font{font-family:'JetBrains Mono',monospace}
        .row-scroll::-webkit-scrollbar{height:6px}
        .row-scroll::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
      `}</style>

      <div className="fixed top-3 right-3 z-30 hidden md:block">
        {isGuest ? (
          <button
            type="button"
            onClick={() => setView("mypage")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }}
          >
            ログイン
          </button>
        ) : (
          <button
            type="button"
            onClick={signOutAndBecomeGuest}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }}
          >
            <LogOut size={13} />
            ログアウト
          </button>
        )}
      </div>

      {/* mobile header (logo + hamburger menu) */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-3"
        style={{ height: 56, background: C.panel, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setMobileMenuOpen(true)} aria-label="メニュー" style={{ color: C.text }}>
            <Menu size={22} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="DTMer Connect" style={{ height: 28, width: "auto" }} />
        </div>
        {isGuest ? (
          <button
            type="button"
            onClick={() => setView("mypage")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}
          >
            ログイン
          </button>
        ) : (
          <button
            type="button"
            onClick={signOutAndBecomeGuest}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}
          >
            <LogOut size={13} />
            ログアウト
          </button>
        )}
      </header>

      {/* mobile menu drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 left-0 h-full flex flex-col p-4 gap-1"
            style={{ width: 260, maxWidth: "80%", background: C.panel, borderRight: `1px solid ${C.border}` }}
          >
            <div className="flex items-center justify-between mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="DTMer Connect" style={{ height: 32, width: "auto" }} />
              <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="閉じる" style={{ color: C.muted }}>
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1">
              {renderSidebarNav(() => setMobileMenuOpen(false))}
            </div>
          </div>
        </div>
      )}

      <div className="flex pt-14 md:pt-0" style={{ paddingBottom: nowPlaying ? 84 : 0 }}>
        {/* sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 p-4 gap-1 sticky top-0" style={{ height: "100vh" }}>
          <div className="flex items-center mb-4 px-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="DTMer Connect" style={{ height: 44, width: "auto" }} />
          </div>

          {renderSidebarNav()}
        </aside>

        {/* main */}
        <main className="flex-1 min-w-0 px-4 py-4 md:px-6">
          {view === "home" && (
            <div className="flex flex-col gap-6">
              <h1 className="display-font text-xl font-bold">ホーム</h1>

              {!isGuest && followingFeed.followingCount > 0 && followingFeed.posts.length > 0 && (
                <Row title="フォロー中の新着">
                  {followingFeed.posts.map((fp) =>
                    fp.kind === "thread" ? (
                      <ThreadCard
                        key={fp.data.id}
                        t={fp.data}
                        color={C.muted}
                        onOpen={() => openDetail("thread", fp.data, true)}
                        onOpenProfile={openProfile}
                      />
                    ) : fp.kind === "track" ? (
                      <TrackCard
                        key={fp.data.id}
                        tr={fp.data}
                        onPlay={() => playTrack(fp.data, C.teal)}
                        onOpen={() => openDetail("track", fp.data, true)}
                        onOpenProfile={openProfile}
                      />
                    ) : (
                      <PatchCard
                        key={fp.data.id}
                        p={fp.data}
                        onPlay={() => play(fp.data, C.amber)}
                        onOpen={() => openDetail("patch", fp.data, true)}
                        onOpenProfile={openProfile}
                      />
                    ),
                  )}
                </Row>
              )}
              {!isGuest && !followingFeed.loading && followingFeed.followingCount === 0 && (
                <div
                  className="text-sm px-4 py-3 rounded-xl"
                  style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.muted }}
                >
                  気になる投稿者をフォローしてみましょう
                </div>
              )}

              <Row title="今週の人気MIDI/パッチ">
                {PATCHES.map((p) => (
                  <PatchCard key={p.id} p={p} onPlay={() => play(p, C.amber)} onOpen={() => openDetail("patch", p, false)} onOpenProfile={openProfile} />
                ))}
              </Row>

              <Row title="新着Tips">
                {THREADS.filter((t) => t.type === "tips").map((t) => (
                  <ThreadCard key={t.id} t={t} color={channelColor(t.channel)} onOpen={() => openDetail("thread", t, false)} onOpenProfile={openProfile} />
                ))}
              </Row>

              <Row title="楽曲投稿の新着">
                {TRACKS.map((tr) => (
                  <TrackCard key={tr.id} tr={tr} onPlay={() => playTrack(tr, C.teal)} onOpen={() => openDetail("track", tr, false)} onOpenProfile={openProfile} />
                ))}
              </Row>
            </div>
          )}

          {view === "search" && (
            <div>
              <h1 className="display-font text-xl font-bold mb-3">検索</h1>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                <Search size={15} color={C.muted} />
                <input placeholder="MIDI・パッチ・お悩みを検索" className="bg-transparent outline-none text-sm flex-1" style={{ color: C.text }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CHANNELS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openChannel(c.id)}
                    className="p-4 rounded-xl text-left"
                    style={{ background: C.panel, border: `1px solid ${C.border}` }}
                  >
                    <span style={{ color: c.color }} className="font-medium text-sm">
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === "channel" && activeChannel && (() => {
            const totalPages = Math.max(1, Math.ceil(threadsTotalCount / THREADS_PAGE_SIZE));

            return (
              <div>
                <h1 className="display-font text-xl font-bold mb-1" style={{ color: channelColor(activeChannel) }}>
                  {CHANNELS.find((c) => c.id === activeChannel)?.name}
                </h1>
                <div className="flex gap-2 my-3 overflow-x-auto row-scroll">
                  {["all", ...Object.keys(THREAD_TYPES)].map((tt) => (
                    <button
                      key={tt}
                      onClick={() => selectThreadTab(tt)}
                      className="shrink-0 px-3 py-1 rounded-full text-xs"
                      style={{
                        background: threadTab === tt ? C.text : C.panel,
                        color: threadTab === tt ? C.bg : C.muted,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      {tt === "all" ? "すべて" : THREAD_TYPES[tt].label}
                    </button>
                  ))}
                </div>

                <div className="mb-3">
                  {isGuest ? (
                    <div
                      className="text-xs px-3 py-2 rounded-lg"
                      style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.muted }}
                    >
                      投稿するには本登録が必要です。マイページからメールアドレスを登録してください。
                    </div>
                  ) : !showNewThreadForm ? (
                    <button
                      onClick={() => setShowNewThreadForm(true)}
                      className="px-3 py-2 rounded-lg text-sm font-medium"
                      style={{ background: C.amber, color: C.bg }}
                    >
                      + 新規スレッド
                    </button>
                  ) : (
                    <NewThreadForm
                      onCancel={() => setShowNewThreadForm(false)}
                      onSubmit={handleCreateThread}
                      status={postStatus}
                      error={postError}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {threadsLoading && (
                    <div className="text-sm" style={{ color: C.muted }}>
                      読み込み中...
                    </div>
                  )}
                  {!threadsLoading && channelThreads.length === 0 && (
                    <div className="text-sm" style={{ color: C.muted }}>
                      まだスレッドがありません
                    </div>
                  )}
                  {channelThreads.map((t) => (
                    <ThreadRow
                      key={t.id}
                      t={t}
                      color={channelColor(t.channel)}
                      interactive
                      onLikeToggle={(postId, liked, count) => applyPostPatch("thread", postId, { liked, likes: count })}
                      onOpen={() => openDetail("thread", t, true)}
                      onOpenProfile={openProfile}
                    />
                  ))}
                </div>

                {threadsTotalCount > THREADS_PAGE_SIZE && (
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => {
                        setChannelThreads([]);
                        setThreadsLoading(true);
                        setThreadsPage((p) => Math.max(0, p - 1));
                      }}
                      disabled={threadsPage === 0}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        border: `1px solid ${C.border}`,
                        color: threadsPage === 0 ? C.muted : C.text,
                        opacity: threadsPage === 0 ? 0.5 : 1,
                      }}
                    >
                      前へ
                    </button>
                    <span className="text-xs" style={{ color: C.muted }}>
                      {threadsPage + 1} / {totalPages} ページ
                    </span>
                    <button
                      onClick={() => {
                        setChannelThreads([]);
                        setThreadsLoading(true);
                        setThreadsPage((p) => Math.min(totalPages - 1, p + 1));
                      }}
                      disabled={threadsPage + 1 >= totalPages}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        border: `1px solid ${C.border}`,
                        color: threadsPage + 1 >= totalPages ? C.muted : C.text,
                        opacity: threadsPage + 1 >= totalPages ? 0.5 : 1,
                      }}
                    >
                      次へ
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {view === "tracks" && (() => {
            const visibleTracks = tracksState.posts
              .filter((t) => matchesGenreFilter(t.genre, trackGenreFilter))
              .filter((t) => matchesSearchQuery(t, trackSearchQuery))
              .slice()
              .sort((a, b) => {
                if (trackSort === "likes") return (b.likes ?? 0) - (a.likes ?? 0);
                if (trackSort === "plays") return (b.playCount ?? 0) - (a.playCount ?? 0);
                return 0; // newest: クエリ側で既に新着順
              });

            return (
              <div>
                <h1 className="display-font text-xl font-bold mb-3">楽曲投稿</h1>
                <div className="mb-3">
                  {isGuest ? (
                    <div
                      className="text-xs px-3 py-2 rounded-lg"
                      style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.muted }}
                    >
                      投稿するには本登録が必要です。マイページからメールアドレスを登録してください。
                    </div>
                  ) : !showNewTrackForm ? (
                    <button
                      onClick={() => setShowNewTrackForm(true)}
                      className="px-3 py-2 rounded-lg text-sm font-medium"
                      style={{ background: C.amber, color: C.bg }}
                    >
                      + 新規投稿
                    </button>
                  ) : (
                    <PostForm
                      onCancel={() => setShowNewTrackForm(false)}
                      onSubmit={handleCreateTrack}
                      status={trackPostStatus}
                      error={trackPostError}
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                  <Search size={14} color={C.muted} />
                  <input
                    value={trackSearchQuery}
                    onChange={(e) => setTrackSearchQuery(e.target.value)}
                    placeholder="タイトル・タグ・ジャンルで検索"
                    className="bg-transparent outline-none text-sm flex-1"
                    style={{ color: C.text }}
                  />
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <select
                    value={trackGenreFilter}
                    onChange={(e) => setTrackGenreFilter(e.target.value)}
                    className="text-xs px-2 py-1.5 rounded-lg"
                    style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text, colorScheme: "dark" }}
                  >
                    <option value="all">すべてのジャンル</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                    <option value="その他">その他</option>
                  </select>
                  <select
                    value={trackSort}
                    onChange={(e) => setTrackSort(e.target.value)}
                    className="text-xs px-2 py-1.5 rounded-lg"
                    style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text, colorScheme: "dark" }}
                  >
                    <option value="newest">
                      新着順
                    </option>
                    <option value="likes">
                      いいねが多い順
                    </option>
                    <option value="plays">
                      視聴数が多い順
                    </option>
                  </select>
                </div>

                {tracksState.loading && (
                  <div className="text-sm mb-3" style={{ color: C.muted }}>
                    読み込み中...
                  </div>
                )}
                {!tracksState.loading && visibleTracks.length === 0 && (
                  <div className="text-sm mb-3" style={{ color: C.muted }}>
                    まだ投稿がありません
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {visibleTracks.map((tr) => (
                    <TrackCard
                      key={tr.id}
                      tr={tr}
                      onPlay={() => playTrack(tr, C.teal)}
                      onOpen={() => openDetail("track", tr, true)}
                      onOpenProfile={openProfile}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          {view === "patches" && (() => {
            const visiblePatches = patchesState.posts
              .filter((p) => matchesGenreFilter(p.genre, patchGenreFilter))
              .filter((p) => matchesSearchQuery(p, patchSearchQuery, { includeTargetSynth: true }))
              .slice()
              .sort((a, b) => {
                if (patchSort === "likes") return (b.likes ?? 0) - (a.likes ?? 0);
                if (patchSort === "downloads") return (b.downloads ?? 0) - (a.downloads ?? 0);
                return 0; // newest: クエリ側で既に新着順
              });

            return (
              <div>
                <h1 className="display-font text-xl font-bold mb-3">MIDI/パッチ共有</h1>
                <div className="mb-3">
                  {isGuest ? (
                    <div
                      className="text-xs px-3 py-2 rounded-lg"
                      style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.muted }}
                    >
                      投稿するには本登録が必要です。マイページからメールアドレスを登録してください。
                    </div>
                  ) : !showNewPatchForm ? (
                    <button
                      onClick={() => setShowNewPatchForm(true)}
                      className="px-3 py-2 rounded-lg text-sm font-medium"
                      style={{ background: C.amber, color: C.bg }}
                    >
                      + 新規投稿
                    </button>
                  ) : (
                    <MidiPatchPostForm
                      onCancel={() => setShowNewPatchForm(false)}
                      onSubmit={handleCreatePatch}
                      status={patchPostStatus}
                      error={patchPostError}
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                  <Search size={14} color={C.muted} />
                  <input
                    value={patchSearchQuery}
                    onChange={(e) => setPatchSearchQuery(e.target.value)}
                    placeholder="タイトル・タグ・ジャンル・対応シンセ/プラグインで検索"
                    className="bg-transparent outline-none text-sm flex-1"
                    style={{ color: C.text }}
                  />
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <select
                    value={patchGenreFilter}
                    onChange={(e) => setPatchGenreFilter(e.target.value)}
                    className="text-xs px-2 py-1.5 rounded-lg"
                    style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text, colorScheme: "dark" }}
                  >
                    <option value="all">すべてのジャンル</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                    <option value="その他">その他</option>
                  </select>
                  <select
                    value={patchSort}
                    onChange={(e) => setPatchSort(e.target.value)}
                    className="text-xs px-2 py-1.5 rounded-lg"
                    style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text, colorScheme: "dark" }}
                  >
                    <option value="newest">
                      新着順
                    </option>
                    <option value="likes">
                      いいねが多い順
                    </option>
                    <option value="downloads">
                      ダウンロードが多い順
                    </option>
                  </select>
                </div>

                {patchesState.loading && (
                  <div className="text-sm mb-3" style={{ color: C.muted }}>
                    読み込み中...
                  </div>
                )}
                {!patchesState.loading && visiblePatches.length === 0 && (
                  <div className="text-sm mb-3" style={{ color: C.muted }}>
                    まだ投稿がありません
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {visiblePatches.map((p) => (
                    <PatchCard key={p.id} p={p} onPlay={() => play(p, C.amber)} onOpen={() => openDetail("patch", p, true)} onOpenProfile={openProfile} />
                  ))}
                </div>
              </div>
            );
          })()}

          {view === "mypage" && (
            <div>
              <h1 className="display-font text-xl font-bold mb-4">マイページ</h1>
              <AuthPanel />
              {!isGuest && <ProfileEditor onOpenFollowList={openFollowList} />}
              <div className="text-xs uppercase mb-2" style={{ color: C.muted }}>
                自分の投稿
              </div>
              {isGuest ? (
                <div className="text-sm" style={{ color: C.muted }}>
                  まだ投稿はありません
                </div>
              ) : (
                <PostLinkList posts={myPosts} onOpenPost={openDetail} />
              )}
            </div>
          )}

          {view === "profile" && (
            <PublicProfileView
              key={viewedUserId}
              userId={viewedUserId}
              onOpenPost={openDetail}
              onOpenFollowList={openFollowList}
            />
          )}

          {view === "followList" && (
            <FollowListView
              key={`${followListUserId}-${followListTab}`}
              userId={followListUserId}
              initialTab={followListTab}
              onOpenProfile={openProfile}
              onBack={() => openProfile(followListUserId)}
            />
          )}

          {view === "admin" && profile?.is_admin && <AdminView />}
        </main>
      </div>

      {/* footer */}
      <footer
        className="px-4 py-6 md:px-6 pb-28 md:pb-6 text-xs flex flex-wrap gap-4"
        style={{ borderTop: `1px solid ${C.border}`, color: C.muted }}
      >
        <Link href="/terms" className="hover:underline" style={{ color: C.muted }}>
          利用規約
        </Link>
        <Link href="/privacy" className="hover:underline" style={{ color: C.muted }}>
          プライバシーポリシー
        </Link>
        <Link href="/about" className="hover:underline" style={{ color: C.muted }}>
          運営者情報
        </Link>
      </footer>

      {/* mobile bottom tabs */}
      <div
        className="md:hidden fixed left-0 right-0 flex justify-around py-2 z-20"
        style={{ bottom: nowPlaying ? 76 : 0, background: C.panel, borderTop: `1px solid ${C.border}` }}
      >
        {[
          { id: "home", icon: Home },
          { id: "search", icon: Search },
          { id: "patches", icon: Download },
          { id: "mypage", icon: User },
        ].map((n) => (
          <button key={n.id} onClick={() => setView(n.id)} style={{ color: view === n.id ? C.text : C.muted }}>
            <n.icon size={20} />
          </button>
        ))}
      </div>

      {/* now playing bar */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.target.duration ? (e.target.currentTime / e.target.duration) * 100 : 0)}
        onLoadedMetadata={(e) => setAudioDuration(e.target.duration || 0)}
        onEnded={() => setIsPlaying(false)}
        style={{ display: "none" }}
      />
      {nowPlaying && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-3 px-4"
          style={{ height: 76, background: C.panel, borderTop: `1px solid ${C.border}` }}
        >
          <div style={{ width: 44 }}>
            <PianoRoll seed={nowPlaying.id + nowPlaying.title} color={nowPlaying.color} height={36} />
          </div>
          <div className="min-w-0 hidden sm:block" style={{ width: 160 }}>
            <div className="text-sm truncate">{nowPlaying.title}</div>
            <div className="text-xs truncate" style={{ color: C.muted }}>
              {nowPlaying.author}
            </div>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 36, height: 36, background: C.text, color: C.bg }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="mono-font text-xs hidden sm:inline" style={{ color: C.muted }}>
              {nowPlaying.audioUrl ? timeStr((progress / 100) * audioDuration) : timeStr((progress / 100) * 30)}
            </span>
            <div className="flex-1 h-1 rounded-full" style={{ background: C.border }}>
              <div className="h-1 rounded-full" style={{ width: `${progress}%`, background: nowPlaying.color }} />
            </div>
            <span className="mono-font text-xs hidden sm:inline" style={{ color: C.muted }}>
              {nowPlaying.audioUrl ? timeStr(audioDuration) : "0:30"}
            </span>
          </div>
          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              setIsPlaying(false);
              setNowPlaying(null);
            }}
            style={{ color: C.muted }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* detail overlay */}
      {detail && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-0 sm:p-6" style={{ background: "rgba(0,0,0,0.6)" }} onClick={closeDetail}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md sm:rounded-xl p-4"
            style={{ background: C.panel, border: `1px solid ${C.border}` }}
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-semibold">{isEditingDetail ? "編集" : detail.data.title}</h2>
              <button onClick={closeDetail}>
                <X size={18} />
              </button>
            </div>

            {isEditingDetail ? (
              detail.kind === "thread" ? (
                <NewThreadForm
                  initialValues={{
                    type: detail.data.type,
                    title: detail.data.title,
                    body: detail.data.body,
                    referenceUrl: detail.data.referenceUrl,
                  }}
                  submitLabel="更新する"
                  onCancel={() => setIsEditingDetail(false)}
                  onSubmit={(vals) => handleUpdateThread(detail.data.id, vals)}
                  status={editStatus}
                  error={editError}
                />
              ) : detail.kind === "track" ? (
                <PostForm
                  initialValues={{
                    title: detail.data.title,
                    body: detail.data.body,
                    bpm: detail.data.bpm,
                    key: detail.data.key,
                    usedDaw: detail.data.usedDaw,
                    genre: detail.data.genre,
                    tags: detail.data.tags,
                    streamingLinks: detail.data.streamingLinks,
                    thumbnailUrl: detail.data.thumbnailUrl,
                  }}
                  hideFiles
                  submitLabel="更新する"
                  onCancel={() => setIsEditingDetail(false)}
                  onSubmit={(vals) => handleUpdateTrack(detail.data.id, vals)}
                  status={editStatus}
                  error={editError}
                />
              ) : (
                <MidiPatchPostForm
                  initialValues={{
                    midiPatchType: detail.data.midiPatchType,
                    title: detail.data.title,
                    body: detail.data.body,
                    genre: detail.data.genre,
                    tags: detail.data.tags,
                    bpm: detail.data.bpm,
                    key: detail.data.key,
                    targetSynth: detail.data.targetSynth,
                    soundCategory: detail.data.soundCategory,
                    thumbnailUrl: detail.data.thumbnailUrl,
                  }}
                  hideFiles
                  lockType
                  submitLabel="更新する"
                  onCancel={() => setIsEditingDetail(false)}
                  onSubmit={(vals) => handleUpdatePatch(detail.data.id, vals)}
                  status={editStatus}
                  error={editError}
                />
              )
            ) : (
              <>
            <div className="mb-3">
              <AuthorLine
                name={detail.data.author}
                likes={detail.data.authorLikes}
                avatarUrl={detail.data.authorAvatarUrl}
                avatarSize={24}
                textClassName="text-xs"
                userId={detail.data.userId}
                onOpenProfile={openProfile}
              />
            </div>

            {user && detail.data.userId === user.id && (
              <div className="flex items-center gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setIsEditingDetail(true)}
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: C.text }}
                >
                  <Pencil size={12} /> 編集
                </button>
                {deleteConfirm ? (
                  <span className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
                    本当に削除しますか?
                    <button
                      type="button"
                      onClick={handleDeletePost}
                      disabled={editStatus === "posting"}
                      className="font-medium"
                      style={{ color: C.rose }}
                    >
                      {editStatus === "posting" ? "削除中..." : "はい"}
                    </button>
                    <button type="button" onClick={() => setDeleteConfirm(false)} style={{ color: C.muted }}>
                      いいえ
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    className="flex items-center gap-1 text-xs font-medium"
                    style={{ color: C.rose }}
                  >
                    <Trash2 size={12} /> 削除
                  </button>
                )}
              </div>
            )}
            {user && !isGuest && detail.data.userId !== user.id && (
              <div className="mb-3">
                <ReportButton targetType="post" targetId={detail.data.id} />
              </div>
            )}
            {editStatus === "error" && editError && (
              <div className="text-xs mb-2" style={{ color: C.rose }}>
                {editError}
              </div>
            )}
            {(detail.kind === "patch" || detail.kind === "track") && (
              detail.data.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={detail.data.thumbnailUrl}
                  alt={detail.data.title}
                  style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8 }}
                />
              ) : (
                <PianoRoll seed={detail.data.id + detail.data.title} color={detail.kind === "patch" ? C.amber : C.teal} height={64} />
              )
            )}
            {(detail.data.bpm ||
              detail.data.key ||
              detail.data.usedDaw ||
              detail.data.genre ||
              detail.data.targetSynth ||
              detail.data.soundCategory) && (
              <div className="text-xs mt-2" style={{ color: C.muted }}>
                {[
                  detail.data.genre && `ジャンル: ${detail.data.genre}`,
                  detail.data.bpm && `BPM ${detail.data.bpm}`,
                  detail.data.key && `Key ${detail.data.key}`,
                  detail.data.usedDaw && `DAW: ${detail.data.usedDaw}`,
                  detail.data.targetSynth && `対応: ${detail.data.targetSynth}`,
                  detail.data.soundCategory && `カテゴリ: ${detail.data.soundCategory}`,
                ]
                  .filter(Boolean)
                  .join(" ・ ")}
              </div>
            )}
            {detail.data.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {detail.data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {detail.data.body && <div className="text-sm whitespace-pre-wrap mt-2">{detail.data.body}</div>}

            {detail.kind === "thread" && detail.data.referenceUrl && (
              <a
                href={detail.data.referenceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium mt-2 inline-block break-all"
                style={{ color: C.amber }}
              >
                参考URL ↗
              </a>
            )}

            {detail.kind === "track" && detail.data.attachments?.some((a) => a.file_type === "audio_preview") && (
              <button
                type="button"
                onClick={() => playTrack(detail.data, C.teal)}
                className="flex items-center gap-1 text-xs font-medium mt-2"
                style={{ color: C.teal }}
              >
                <Play size={12} /> 試聴
              </button>
            )}

            {detail.kind === "patch" && detail.data.attachments?.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                <div
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted }}
                >
                  {MIDI_PATCH_NOTICE}
                </div>
                {detail.data.attachments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between text-xs px-3 py-2 rounded-lg"
                    style={{ border: `1px solid ${C.border}` }}
                  >
                    <span style={{ color: C.muted }}>
                      {a.file_type === "midi" ? "MIDIファイル" : a.file_type === "preset" ? "プリセットファイル" : "試聴用音源"}
                    </span>
                    <div className="flex items-center gap-3">
                      {a.file_type === "audio_preview" && (
                        <button
                          type="button"
                          onClick={() => play(detail.data, C.amber)}
                          className="flex items-center gap-1 font-medium"
                          style={{ color: C.amber }}
                        >
                          <Play size={12} /> 試聴
                        </button>
                      )}
                      {isGuest ? (
                        <span style={{ color: C.muted }}>要ログイン</span>
                      ) : (
                        <a
                          href={`${a.file_url}?download`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => handleDownloadClick(detail.data.id, detail.data.downloads ?? 0)}
                          className="flex items-center gap-1 font-medium"
                          style={{ color: C.amber }}
                        >
                          <Download size={12} /> ダウンロード
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs mt-3" style={{ color: C.muted }}>
              {detail.interactive ? (
                <LikeButton
                  postId={detail.data.id}
                  liked={detail.data.liked}
                  count={detail.data.likes}
                  onToggled={(postId, liked, count) => applyPostPatch(detail.kind, postId, { liked, likes: count })}
                  size={13}
                />
              ) : (
                <span className="flex items-center gap-1">
                  <Heart size={13} /> {detail.data.likes}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MessageCircle size={13} /> {detail.data.comments}
              </span>
              {detail.kind === "patch" && (
                <span className="flex items-center gap-1">
                  <Download size={13} /> {detail.data.downloads}
                </span>
              )}
              {detail.kind === "track" && (
                <span className="flex items-center gap-1">
                  <Play size={13} /> {detail.data.playCount ?? 0}
                </span>
              )}
            </div>

            {detail.kind === "track" && detail.data.streamingLinks?.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                {detail.data.streamingLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium"
                    style={{ color: C.amber }}
                  >
                    {link.platform || "リンク"}で聴く ↗
                  </a>
                ))}
              </div>
            )}

            {detail.interactive && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                <div className="text-xs font-medium mb-2" style={{ color: C.muted }}>
                  コメント
                </div>
                <div className="flex flex-col gap-3 mb-3" style={{ maxHeight: 240, overflowY: "auto" }}>
                  {commentsLoading && (
                    <div className="text-xs" style={{ color: C.muted }}>
                      読み込み中...
                    </div>
                  )}
                  {!commentsLoading && threadComments.length === 0 && (
                    <div className="text-xs" style={{ color: C.muted }}>
                      まだコメントはありません
                    </div>
                  )}
                  {threadComments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <Avatar name={c.author} avatarUrl={c.authorAvatarUrl} size={22} userId={c.authorId} onOpenProfile={openProfile} />
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs"
                          style={{ color: C.muted, cursor: c.authorId ? "pointer" : "inherit" }}
                          onClick={c.authorId ? () => openProfile(c.authorId) : undefined}
                        >
                          {c.author}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{c.body}</div>
                        {user && !isGuest && c.authorId !== user.id && (
                          <div className="mt-1">
                            <ReportButton targetType="comment" targetId={c.id} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isGuest ? (
                  <div
                    className="text-xs px-3 py-2 rounded-lg"
                    style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted }}
                  >
                    コメントするには本登録が必要です。
                  </div>
                ) : (
                  <form onSubmit={handleSubmitComment} className="flex flex-col gap-2">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="コメントを入力"
                      rows={2}
                      maxLength={1000}
                      className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg resize-none"
                      style={{ border: `1px solid ${C.border}`, color: C.text }}
                    />
                    {commentStatus === "error" && (
                      <div className="text-xs" style={{ color: C.rose }}>
                        {commentError}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={commentStatus === "posting" || !commentText.trim()}
                      className="self-end px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ background: C.amber, color: C.bg }}
                    >
                      {commentStatus === "posting" ? "送信中..." : "コメントする"}
                    </button>
                  </form>
                )}
              </div>
            )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ title, children }) {
  return (
    <div>
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="flex gap-3 overflow-x-auto row-scroll pb-1">{children}</div>
    </div>
  );
}

function PatchCard({ p, onPlay, onOpen, onOpenProfile }) {
  return (
    <div className="shrink-0 w-44 p-3 rounded-xl cursor-pointer" style={{ background: C.panel, border: `1px solid ${C.border}` }} onClick={onOpen}>
      <div className="relative mb-2">
        {p.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.thumbnailUrl}
            alt={p.title}
            style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6 }}
          />
        ) : (
          <PianoRoll seed={p.id + p.title} color={C.amber} height={80} />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="absolute bottom-1 right-1 flex items-center justify-center rounded-full"
          style={{ width: 30, height: 30, background: C.amber, color: C.bg }}
        >
          <Play size={13} />
        </button>
      </div>
      <div className="text-sm truncate">{p.title}</div>
      <AuthorLine
        name={p.author}
        likes={p.authorLikes}
        avatarUrl={p.authorAvatarUrl}
        avatarSize={16}
        textClassName="text-xs"
        userId={p.userId}
        onOpenProfile={onOpenProfile}
      />
      <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: C.muted }}>
        <span className="flex items-center gap-1">
          <Heart size={12} /> {p.likes ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <Download size={12} /> {p.downloads ?? 0}
        </span>
      </div>
    </div>
  );
}

function TrackCard({ tr, onPlay, onOpen, onOpenProfile }) {
  return (
    <div className="shrink-0 w-44 p-3 rounded-xl cursor-pointer" style={{ background: C.panel, border: `1px solid ${C.border}` }} onClick={onOpen}>
      <div className="relative mb-2">
        {tr.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tr.thumbnailUrl}
            alt={tr.title}
            style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6 }}
          />
        ) : (
          <PianoRoll seed={tr.id + tr.title} color={C.teal} height={80} />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="absolute bottom-1 right-1 flex items-center justify-center rounded-full"
          style={{ width: 30, height: 30, background: C.teal, color: C.bg }}
        >
          <Play size={13} />
        </button>
      </div>
      <div className="text-sm truncate">{tr.title}</div>
      <AuthorLine
        name={tr.author}
        likes={tr.authorLikes}
        avatarUrl={tr.authorAvatarUrl}
        avatarSize={16}
        textClassName="text-xs"
        userId={tr.userId}
        onOpenProfile={onOpenProfile}
      />
      <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: C.muted }}>
        <span className="flex items-center gap-1">
          <Heart size={12} /> {tr.likes ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <Play size={12} /> {tr.playCount ?? 0}
        </span>
      </div>
    </div>
  );
}

function ThreadCard({ t, color, onOpen, onOpenProfile }) {
  const Icon = THREAD_TYPES[t.type].icon;
  return (
    <div className="shrink-0 w-56 p-3 rounded-xl cursor-pointer" style={{ background: C.panel, border: `1px solid ${C.border}` }} onClick={onOpen}>
      <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: C.muted }}>
        <Icon size={12} color={color} />
        {THREAD_TYPES[t.type].label}
      </div>
      <div className="text-sm mb-2">{t.title}</div>
      <AuthorLine
        name={t.author}
        likes={t.authorLikes}
        avatarUrl={t.authorAvatarUrl}
        avatarSize={16}
        textClassName="text-xs"
        userId={t.userId}
        onOpenProfile={onOpenProfile}
      />
    </div>
  );
}

const IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_MAX_BYTES = 2 * 1024 * 1024;

function AuthPanel() {
  const { user, profile, isGuest, loading, refreshProfile } = useAuth();
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState(null); // null | "sending" | "sent" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState(null); // null | "logging-in" | "error"
  const [loginError, setLoginError] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");

    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
      setAvatarError("jpg・png・webp形式の画像を選択してください");
      e.target.value = "";
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setAvatarError("画像サイズは2MB以下にしてください");
      e.target.value = "";
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setAvatarUploading(false);
      setAvatarError(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: dbError } = await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", user.id);

    setAvatarUploading(false);
    if (dbError) {
      setAvatarError(dbError.message);
      return;
    }
    await refreshProfile();
  }

  async function handleUpgrade(e) {
    e.preventDefault();
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setStatus("error");
      setErrorMsg("ユーザー名を入力してください");
      return;
    }

    setStatus("sending");
    setErrorMsg("");
    const supabase = createClient();

    const { error: nameError } = await supabase
      .from("users")
      .update({ display_name: trimmedName })
      .eq("id", user.id);

    if (nameError) {
      setStatus("error");
      setErrorMsg(
        nameError.code === "23505"
          ? "このユーザー名は既に使われています。別の名前をお試しください。"
          : nameError.message,
      );
      return;
    }

    const { error } = await supabase.auth.updateUser({ email, password });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginStatus("logging-in");
    setLoginError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) {
      setLoginStatus("error");
      setLoginError(
        error.message === "Invalid login credentials"
          ? "メールアドレスまたはパスワードが正しくありません"
          : error.message,
      );
      return;
    }
    setLoginStatus(null);
  }

  if (loading) {
    return (
      <div className="text-sm mb-4" style={{ color: C.muted }}>
        読み込み中...
      </div>
    );
  }

  const badge = badgeFor(profile?.total_likes_received ?? 0);

  return (
    <>
      <div className="p-4 rounded-xl mb-4 flex items-center gap-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
        <Avatar name={profile?.display_name ?? "ゲスト"} avatarUrl={avatarPreview ?? profile?.avatar_url} size={48} />
        <div>
          <div className="font-medium flex items-center gap-1.5">
            {profile?.display_name ?? "ゲスト"}
            <badge.icon size={16} color={badge.color} />
          </div>
          <div className="text-xs mono-font" style={{ color: C.muted }}>
            称号: {badge.name} (累計{profile?.total_likes_received ?? 0}いいね)
          </div>
          <div className="text-xs mt-1" style={{ color: isGuest ? C.amber : C.teal }}>
            {isGuest ? "ゲストとして利用中" : `ログイン済み${user?.email ? `(${user.email})` : ""}`}
          </div>
        </div>
      </div>

      {!isGuest && (
        <div className="p-4 rounded-xl mb-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
          <div className="text-sm font-medium mb-2">プロフィール画像</div>
          <FileInputButton
            label={avatarUploading ? "アップロード中..." : "画像を選択"}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            disabled={avatarUploading}
          />
          <div className="text-xs mt-1" style={{ color: C.muted }}>
            jpg・png・webp / 2MBまで
          </div>
          {avatarError && (
            <div className="text-xs mt-1" style={{ color: C.rose }}>
              {avatarError}
            </div>
          )}
        </div>
      )}
      {isGuest && (
        <div
          className="text-xs px-3 py-2 rounded-lg mb-4"
          style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.muted }}
        >
          プロフィール画像を設定するには本登録が必要です。
        </div>
      )}

      {isGuest && (
        <div className="p-4 rounded-xl mb-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background: authMode === "login" ? C.text : C.bg,
                color: authMode === "login" ? C.bg : C.muted,
                border: `1px solid ${C.border}`,
              }}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background: authMode === "register" ? C.text : C.bg,
                color: authMode === "register" ? C.bg : C.muted,
                border: `1px solid ${C.border}`,
              }}
            >
              新規登録
            </button>
          </div>

          {authMode === "login" ? (
            <>
              <div className="text-xs mb-3" style={{ color: C.muted }}>
                登録済みのメールアドレスとパスワードでログインします。
              </div>
              <form onSubmit={handleLogin} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
                  style={{ border: `1px solid ${C.border}`, color: C.text }}
                />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="パスワード"
                  className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
                  style={{ border: `1px solid ${C.border}`, color: C.text }}
                />
                {loginStatus === "error" && (
                  <div className="text-xs" style={{ color: C.rose }}>
                    {loginError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loginStatus === "logging-in"}
                  className="self-end px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: C.amber, color: C.bg }}
                >
                  {loginStatus === "logging-in" ? "ログイン中..." : "ログインする"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-xs mb-3" style={{ color: C.muted }}>
                新規登録すると投稿・コメント・いいねができるようになります。今の称号やいいね数はそのまま引き継がれます。
              </div>
              {status === "sent" ? (
                <div className="text-xs" style={{ color: C.teal }}>
                  確認メールを送信しました。メール内のリンクを開くと本登録が完了します。
                </div>
              ) : (
                <form onSubmit={handleUpgrade} className="flex flex-col gap-2">
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="ユーザー名 (例: yuki_dtm、ゆうき)"
                    className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
                    style={{ border: `1px solid ${C.border}`, color: C.text }}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
                    style={{ border: `1px solid ${C.border}`, color: C.text }}
                  />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワード (6文字以上)"
                    className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
                    style={{ border: `1px solid ${C.border}`, color: C.text }}
                  />
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="self-end px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: C.amber, color: C.bg }}
                  >
                    {status === "sending" ? "送信中..." : "本登録する"}
                  </button>
                </form>
              )}
              {status === "error" && (
                <div className="text-xs mt-2" style={{ color: C.rose }}>
                  {errorMsg}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

function ProfileInfoDisplay({ profile }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      {profile.bio ? (
        <div className="whitespace-pre-wrap">{profile.bio}</div>
      ) : (
        <div className="text-xs" style={{ color: C.muted }}>
          活動内容はまだ設定されていません
        </div>
      )}
      {profile.used_daws?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {profile.used_daws.map((d) => (
            <span
              key={d}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted }}
            >
              {d}
            </span>
          ))}
        </div>
      )}
      {profile.activity_area && (
        <div className="text-xs" style={{ color: C.muted }}>
          活動エリア: {profile.activity_area}
        </div>
      )}
      {profile.sns_links?.length > 0 && (
        <div className="flex flex-col gap-1">
          {profile.sns_links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium"
              style={{ color: C.amber }}
            >
              {link.platform || "リンク"} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function PostLinkList({ posts, onOpenPost }) {
  if (posts.length === 0) {
    return (
      <div className="text-sm" style={{ color: C.muted }}>
        まだ投稿はありません
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {posts.map((mp) => (
        <button
          key={mp.data.id}
          type="button"
          onClick={() => onOpenPost(mp.kind, mp.data, true)}
          className="w-full text-left p-3 rounded-lg flex items-center justify-between gap-2"
          style={{ background: C.panel, border: `1px solid ${C.border}` }}
        >
          <div className="min-w-0">
            <div className="text-sm truncate">{mp.data.title}</div>
            <div className="text-xs" style={{ color: C.muted }}>
              {mp.kind === "thread" ? "DAWコミュニティ" : mp.kind === "track" ? "楽曲投稿" : "MIDI/パッチ"}
            </div>
          </div>
          <ChevronRight size={14} color={C.muted} />
        </button>
      ))}
    </div>
  );
}

function PublicProfileView({ userId, onOpenPost, onOpenFollowList }) {
  const { user, isGuest, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [showGuestNotice, setShowGuestNotice] = useState(false);
  const [editing, setEditing] = useState(false);

  function load() {
    const supabase = createClient();
    return supabase
      .from("users")
      .select(
        "id, display_name, avatar_url, total_likes_received, badge_level, bio, used_daws, activity_area, sns_links, follower_count, following_count",
      )
      .eq("id", userId)
      .single()
      .then(async ({ data }) => {
        if (!data) {
          setProfile(null);
          setLoading(false);
          return;
        }
        setProfile(data);

        const { data: postRows } = await supabase
          .from("posts")
          .select(
            "id, user_id, section, thread_type, title, body, bpm, key, used_daw, genre, tags, midi_patch_type, target_synth, sound_category, streaming_links, thumbnail_url, reference_url, is_resolved, like_count, comment_count, download_count, play_count, users(display_name, total_likes_received, avatar_url), attachments(id, file_type, file_url)",
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        setPosts((postRows ?? []).map((p) => mapMyPost(p, new Set())));

        if (user && !isGuest && user.id !== userId) {
          const { data: followRow } = await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("followed_id", userId)
            .maybeSingle();
          setIsFollowing(!!followRow);
        } else {
          setIsFollowing(false);
        }
        setLoading(false);
      });
  }

  // userId が変わるたびに呼び出し側で key={userId} を指定して再マウントさせる想定のため、
  // ここではマウント時に一度だけ読み込む
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleFollow() {
    if (!user || isGuest || followBusy) return;
    setFollowBusy(true);
    const supabase = createClient();
    if (isFollowing) {
      const { error } = await supabase.from("follows").delete().eq("follower_id", user.id).eq("followed_id", userId);
      if (!error) {
        setIsFollowing(false);
        setProfile((prev) => (prev ? { ...prev, follower_count: Math.max(0, (prev.follower_count ?? 1) - 1) } : prev));
      }
    } else {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, followed_id: userId });
      if (!error) {
        setIsFollowing(true);
        setProfile((prev) => (prev ? { ...prev, follower_count: (prev.follower_count ?? 0) + 1 } : prev));
      }
    }
    setFollowBusy(false);
  }

  if (loading) {
    return (
      <div className="text-sm" style={{ color: C.muted }}>
        読み込み中...
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="text-sm" style={{ color: C.muted }}>
        ユーザーが見つかりませんでした
      </div>
    );
  }

  const badge = badgeFor(profile.total_likes_received ?? 0);
  const isOwnProfile = Boolean(user && user.id === userId);

  return (
    <div>
      <div className="p-4 rounded-xl mb-4 flex items-center gap-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
        <Avatar name={profile.display_name} avatarUrl={profile.avatar_url} size={56} />
        <div className="flex-1 min-w-0">
          <div className="font-medium flex items-center gap-1.5">
            {profile.display_name}
            <badge.icon size={16} color={badge.color} />
          </div>
          <div className="text-xs mono-font" style={{ color: C.muted }}>
            称号: {badge.name} (累計{profile.total_likes_received ?? 0}いいね)
          </div>
          <div className="flex items-center gap-3 text-xs mt-1" style={{ color: C.muted }}>
            <button
              type="button"
              onClick={() => onOpenFollowList?.(userId, "followers")}
              className="hover:underline"
              style={{ color: C.muted }}
            >
              フォロワー {profile.follower_count ?? 0}
            </button>
            <button
              type="button"
              onClick={() => onOpenFollowList?.(userId, "following")}
              className="hover:underline"
              style={{ color: C.muted }}
            >
              フォロー中 {profile.following_count ?? 0}
            </button>
          </div>
        </div>
        {isOwnProfile ? (
          !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs font-medium shrink-0"
              style={{ color: C.text }}
            >
              <Pencil size={12} /> 編集
            </button>
          )
        ) : (
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (isGuest) {
                  setShowGuestNotice(true);
                  return;
                }
                handleToggleFollow();
              }}
              disabled={followBusy}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: isFollowing ? "transparent" : C.amber,
                border: isFollowing ? `1px solid ${C.border}` : "none",
                color: isFollowing ? C.text : C.bg,
              }}
            >
              {isFollowing ? "フォロー中" : "フォローする"}
            </button>
            {showGuestNotice && (
              <div className="text-xs" style={{ color: C.muted }}>
                フォローするには本登録が必要です
              </div>
            )}
          </div>
        )}
      </div>

      {isOwnProfile && editing ? (
        <div className="p-4 rounded-xl mb-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
          <ProfileEditForm
            profile={profile}
            refreshProfile={async () => {
              await refreshProfile();
              await load();
            }}
            onCancel={() => setEditing(false)}
            onSaved={() => setEditing(false)}
          />
        </div>
      ) : (
        <div className="p-4 rounded-xl mb-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
          <ProfileInfoDisplay profile={profile} />
        </div>
      )}

      <div className="text-xs uppercase mb-2" style={{ color: C.muted }}>
        投稿一覧
      </div>
      <PostLinkList posts={posts} onOpenPost={onOpenPost} />
    </div>
  );
}

function FollowListView({ userId, initialTab, onOpenProfile, onBack }) {
  const [ownerName, setOwnerName] = useState("");
  const [tab, setTab] = useState(initialTab === "following" ? "following" : "followers");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  function load(activeTab) {
    const supabase = createClient();
    return supabase
      .from("users")
      .select("display_name")
      .eq("id", userId)
      .single()
      .then(async ({ data: owner }) => {
        setOwnerName(owner?.display_name ?? "");
        const relationColumn = activeTab === "following" ? "follower_id" : "followed_id";
        const targetColumn = activeTab === "following" ? "followed_id" : "follower_id";
        const { data: followRows } = await supabase.from("follows").select(targetColumn).eq(relationColumn, userId);
        const targetIds = (followRows ?? []).map((r) => r[targetColumn]);
        if (targetIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }
        const { data: userRows } = await supabase
          .from("users")
          .select("id, display_name, avatar_url, total_likes_received")
          .in("id", targetIds);
        setUsers(userRows ?? []);
        setLoading(false);
      });
  }

  useEffect(() => {
    load(initialTab === "following" ? "following" : "followers");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectTab(nextTab) {
    if (nextTab === tab) return;
    setTab(nextTab);
    setLoading(true);
    load(nextTab);
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-medium mb-3"
        style={{ color: C.muted }}
      >
        <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> プロフィールに戻る
      </button>

      <h1 className="display-font text-lg font-bold mb-3">{ownerName || "ユーザー"}</h1>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => selectTab("followers")}
          className="px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{
            background: tab === "followers" ? C.amber : "transparent",
            color: tab === "followers" ? C.bg : C.text,
            border: tab === "followers" ? "none" : `1px solid ${C.border}`,
          }}
        >
          フォロワー
        </button>
        <button
          type="button"
          onClick={() => selectTab("following")}
          className="px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{
            background: tab === "following" ? C.amber : "transparent",
            color: tab === "following" ? C.bg : C.text,
            border: tab === "following" ? "none" : `1px solid ${C.border}`,
          }}
        >
          フォロー中
        </button>
      </div>

      {loading ? (
        <div className="text-sm" style={{ color: C.muted }}>
          読み込み中...
        </div>
      ) : users.length === 0 ? (
        <div className="text-sm" style={{ color: C.muted }}>
          {tab === "followers" ? "まだフォロワーがいません" : "まだ誰もフォローしていません"}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((u) => {
            const badge = badgeFor(u.total_likes_received ?? 0);
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onOpenProfile(u.id)}
                className="flex items-center gap-3 p-3 rounded-xl text-left"
                style={{ background: C.panel, border: `1px solid ${C.border}` }}
              >
                <AvatarCircle name={u.display_name} avatarUrl={u.avatar_url} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    {u.display_name}
                    <badge.icon size={13} color={badge.color} />
                  </div>
                </div>
                <ChevronRight size={16} color={C.muted} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    const supabase = createClient();
    return supabase
      .from("reports")
      .select(
        "id, reason, comment, created_at, reporter:users(display_name), post:posts(id, title, section, user_id, users(display_name)), reported_comment:comments(id, body, post_id, user_id, users(display_name))",
      )
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }
        setReports(data ?? []);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function dismissReport(reportId) {
    setBusyId(reportId);
    const supabase = createClient();
    await supabase.from("reports").delete().eq("id", reportId);
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    setBusyId(null);
  }

  async function deleteTarget(report) {
    setBusyId(report.id);
    const supabase = createClient();
    if (report.post) {
      const { data: attachments } = await supabase.from("attachments").select("file_url").eq("post_id", report.post.id);
      const paths = (attachments ?? []).map((a) => extractPatchesStoragePath(a.file_url)).filter(Boolean);
      if (paths.length > 0) await supabase.storage.from("patches").remove(paths);
      await supabase.from("posts").delete().eq("id", report.post.id);
    } else {
      await supabase.from("comments").delete().eq("id", report.reported_comment.id);
    }
    // 投稿/コメント削除に伴い、関連する通報行はON DELETE CASCADEでDB側で自動的に削除される
    setReports((prev) => prev.filter((r) => r.id !== report.id));
    setBusyId(null);
  }

  if (loading) {
    return (
      <div className="text-sm" style={{ color: C.muted }}>
        読み込み中...
      </div>
    );
  }

  return (
    <div>
      <h1 className="display-font text-xl font-bold mb-4">管理画面</h1>
      {error && (
        <div className="text-sm mb-3" style={{ color: C.rose }}>
          {error}
        </div>
      )}
      {reports.length === 0 ? (
        <div className="text-sm" style={{ color: C.muted }}>
          通報はありません
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div key={r.id} className="p-4 rounded-xl" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: C.bg, color: C.rose, border: `1px solid ${C.border}` }}
                >
                  {reportReasonLabel(r.reason)}
                </span>
                <span className="text-xs" style={{ color: C.muted }}>
                  {new Date(r.created_at).toLocaleString("ja-JP")}
                </span>
              </div>
              <div className="text-xs mb-2" style={{ color: C.muted }}>
                通報者: {r.reporter?.display_name ?? "unknown"}
              </div>
              {r.comment && <div className="text-sm mb-2 whitespace-pre-wrap">{r.comment}</div>}
              <div className="p-3 rounded-lg mb-3 text-sm" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                {r.post ? (
                  <>
                    <div className="text-xs mb-1" style={{ color: C.muted }}>
                      対象: 投稿({r.post.section}) / 投稿者: {r.post.users?.display_name ?? "unknown"}
                    </div>
                    <div className="font-medium">{r.post.title}</div>
                  </>
                ) : (
                  <>
                    <div className="text-xs mb-1" style={{ color: C.muted }}>
                      対象: コメント / 投稿者: {r.reported_comment?.users?.display_name ?? "unknown"}
                    </div>
                    <div className="whitespace-pre-wrap">{r.reported_comment?.body}</div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => deleteTarget(r)}
                  disabled={busyId === r.id}
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: C.rose }}
                >
                  <Trash2 size={12} /> 投稿/コメントを削除
                </button>
                <button
                  type="button"
                  onClick={() => dismissReport(r.id)}
                  disabled={busyId === r.id}
                  className="text-xs font-medium"
                  style={{ color: C.muted }}
                >
                  却下
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileEditor({ onOpenFollowList }) {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);

  if (!profile) return null;

  return (
    <div className="p-4 rounded-xl mb-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">プロフィール</div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: C.text }}
          >
            <Pencil size={12} /> 編集
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs mb-3" style={{ color: C.muted }}>
        <button
          type="button"
          onClick={() => onOpenFollowList?.(user?.id, "followers")}
          className="hover:underline"
          style={{ color: C.muted }}
        >
          フォロワー {profile.follower_count ?? 0}
        </button>
        <button
          type="button"
          onClick={() => onOpenFollowList?.(user?.id, "following")}
          className="hover:underline"
          style={{ color: C.muted }}
        >
          フォロー中 {profile.following_count ?? 0}
        </button>
      </div>

      {editing ? (
        <ProfileEditForm profile={profile} refreshProfile={refreshProfile} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />
      ) : (
        <ProfileInfoDisplay profile={profile} />
      )}
    </div>
  );
}

function ProfileEditForm({ profile, refreshProfile, onCancel, onSaved }) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [usedDaws, setUsedDaws] = useState(profile.used_daws ?? []);
  const [activityArea, setActivityArea] = useState(profile.activity_area ?? "");
  const [snsLinks, setSnsLinks] = useState(
    profile.sns_links?.length > 0 ? profile.sns_links : [{ platform: "", url: "" }],
  );
  const [status, setStatus] = useState(null); // null | "saving" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  function toggleDaw(name) {
    setUsedDaws((prev) => (prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name]));
  }
  function updateLink(index, field, value) {
    setSnsLinks((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }
  function addLink() {
    setSnsLinks((prev) => [...prev, { platform: "", url: "" }]);
  }
  function removeLink(index) {
    setSnsLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setStatus("error");
      setErrorMsg("ユーザー名を入力してください");
      return;
    }
    setStatus("saving");
    setErrorMsg("");
    const supabase = createClient();
    const links = snsLinks
      .map((l) => ({ platform: l.platform.trim(), url: l.url.trim() }))
      .filter((l) => l.url);

    const { error } = await supabase
      .from("users")
      .update({
        display_name: trimmedName,
        bio: bio.trim() || null,
        used_daws: usedDaws,
        activity_area: activityArea.trim() || null,
        sns_links: links,
      })
      .eq("id", profile.id);

    if (error) {
      setStatus("error");
      setErrorMsg(
        error.code === "23505"
          ? "このユーザー名は既に使われています。別の名前をお試しください。"
          : error.message,
      );
      return;
    }
    setStatus(null);
    await refreshProfile();
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="ユーザー名"
        required
        maxLength={20}
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
        style={{ border: `1px solid ${C.border}`, color: C.text }}
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="活動内容(自己紹介、任意)"
        rows={3}
        maxLength={500}
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg resize-none"
        style={{ border: `1px solid ${C.border}`, color: C.text }}
      />
      <div>
        <div className="text-xs mb-1" style={{ color: C.muted }}>
          利用DAW(複数選択可)
        </div>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.filter((c) => c.id !== "general").map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleDaw(c.name)}
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background: usedDaws.includes(c.name) ? C.text : C.bg,
                color: usedDaws.includes(c.name) ? C.bg : C.muted,
                border: `1px solid ${C.border}`,
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <input
        value={activityArea}
        onChange={(e) => setActivityArea(e.target.value)}
        placeholder="活動エリア(任意, 例: 東京、オンライン中心)"
        maxLength={40}
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
        style={{ border: `1px solid ${C.border}`, color: C.text }}
      />
      <div className="flex flex-col gap-2">
        <div className="text-xs" style={{ color: C.muted }}>
          SNS/配信リンク(任意、複数追加可)
        </div>
        {snsLinks.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={link.platform}
              onChange={(e) => updateLink(i, "platform", e.target.value)}
              placeholder="プラットフォーム名(例: X)"
              maxLength={30}
              className="w-2/5 bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
              style={{ border: `1px solid ${C.border}`, color: C.text }}
            />
            <input
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              placeholder="URL"
              type="url"
              className="flex-1 bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
              style={{ border: `1px solid ${C.border}`, color: C.text }}
            />
            {snsLinks.length > 1 && (
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="shrink-0"
                style={{ color: C.muted }}
                aria-label="このリンクを削除"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addLink} className="self-start text-xs font-medium" style={{ color: C.amber }}>
          + リンクを追加
        </button>
      </div>
      {status === "error" && (
        <div className="text-xs" style={{ color: C.rose }}>
          {errorMsg}
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg text-sm" style={{ color: C.muted }}>
          キャンセル
        </button>
        <button
          type="submit"
          disabled={status === "saving"}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: C.amber, color: C.bg }}
        >
          {status === "saving" ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}

function PostForm({ onCancel, onSubmit, status, error, initialValues, submitLabel = "投稿する", hideFiles = false }) {
  const initialGenre = splitChoiceForEdit(initialValues?.genre, GENRES);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [body, setBody] = useState(initialValues?.body ?? "");
  const [bpm, setBpm] = useState(initialValues?.bpm != null ? String(initialValues.bpm) : "");
  const [key, setKey] = useState(initialValues?.key ?? "");
  const [usedDaw, setUsedDaw] = useState(initialValues?.usedDaw ?? "");
  const [genreChoice, setGenreChoice] = useState(initialGenre.choice);
  const [genreCustom, setGenreCustom] = useState(initialGenre.custom);
  const [tagsInput, setTagsInput] = useState(initialValues?.tags?.join(", ") ?? "");
  const [streamingLinks, setStreamingLinks] = useState(
    initialValues?.streamingLinks?.length > 0 ? initialValues.streamingLinks : [{ platform: "", url: "" }],
  );
  const [audioFile, setAudioFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(initialValues?.thumbnailUrl ?? null);
  const [thumbnailError, setThumbnailError] = useState("");

  function updateLink(index, field, value) {
    setStreamingLinks((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }
  function addLink() {
    setStreamingLinks((prev) => [...prev, { platform: "", url: "" }]);
  }
  function removeLink(index) {
    setStreamingLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function handleThumbnailChange(e) {
    const file = e.target.files?.[0] ?? null;
    setThumbnailError("");
    if (!file) return;
    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
      setThumbnailError("jpg・png・webp形式の画像を選択してください");
      e.target.value = "";
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setThumbnailError("画像サイズは2MB以下にしてください");
      e.target.value = "";
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  function handleFileChange(setter, allowedExt) {
    return (e) => {
      const file = e.target.files?.[0] ?? null;
      setFileError("");
      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!allowedExt.includes(ext)) {
          setFileError(`対応していないファイル形式です(対応: ${allowedExt.join(", ")})`);
          e.target.value = "";
          return;
        }
        if (file.size > ATTACHMENT_FILE_MAX_BYTES) {
          setFileError(`ファイルサイズは${Math.round(ATTACHMENT_FILE_MAX_BYTES / (1024 * 1024))}MB以下にしてください`);
          e.target.value = "";
          return;
        }
      }
      setter(file);
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const links = streamingLinks
      .map((l) => ({ platform: l.platform.trim(), url: l.url.trim() }))
      .filter((l) => l.url);
    onSubmit({
      title: title.trim(),
      body: body.trim(),
      bpm: bpm ? parseInt(bpm, 10) : null,
      key: key.trim() || null,
      usedDaw: usedDaw || null,
      genre: genreChoice === "その他" ? genreCustom.trim() || null : genreChoice || null,
      tags,
      thumbnailFile,
      streamingLinks: links,
      files: { audio_preview: audioFile },
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 rounded-xl flex flex-col gap-2"
      style={{ background: C.panel, border: `1px solid ${C.border}` }}
    >
      <div
        className="text-xs px-3 py-2 rounded-lg"
        style={{ background: C.bg, border: `1px solid ${C.rose}`, color: C.rose }}
      >
        オリジナル楽曲以外(カバー・他者の楽曲の使用など)の投稿は禁止されています。
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="曲名"
        required
        maxLength={100}
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
        style={{ border: `1px solid ${C.border}`, color: C.text }}
      />
      <select
        value={genreChoice}
        onChange={(e) => setGenreChoice(e.target.value)}
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
        style={{
          background: C.panel,
          border: `1px solid ${C.border}`,
          color: genreChoice ? C.text : C.muted,
          colorScheme: "dark",
        }}
      >
        <option value="">ジャンル(任意)</option>
        {GENRES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
        <option value="その他">その他</option>
      </select>
      {genreChoice === "その他" && (
        <input
          value={genreCustom}
          onChange={(e) => setGenreCustom(e.target.value)}
          placeholder="ジャンルを入力"
          maxLength={40}
          className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
          style={{ border: `1px solid ${C.border}`, color: C.text }}
        />
      )}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="コメント(任意)"
        rows={3}
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg resize-none"
        style={{ border: `1px solid ${C.border}`, color: C.text }}
      />
      <input
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        placeholder="タグ(カンマ区切りで複数入力可, 例: lofi, chill, 808)"
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
        style={{ border: `1px solid ${C.border}`, color: C.text }}
      />
      <div className="flex gap-2">
        <input
          value={bpm}
          onChange={(e) => setBpm(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="BPM(任意)"
          inputMode="numeric"
          className="flex-1 bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
          style={{ border: `1px solid ${C.border}`, color: C.text }}
        />
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Key(任意, 例: Am)"
          maxLength={10}
          className="flex-1 bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
          style={{ border: `1px solid ${C.border}`, color: C.text }}
        />
      </div>

      <select
        value={usedDaw}
        onChange={(e) => setUsedDaw(e.target.value)}
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
        style={{
          background: C.panel,
          border: `1px solid ${C.border}`,
          color: usedDaw ? C.text : C.muted,
          colorScheme: "dark",
        }}
      >
        <option value="">
          使用DAW(任意)
        </option>
        {CHANNELS.filter((c) => c.id !== "general").map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
        <option value="該当なし">
          該当なし
        </option>
        <option value="その他">
          その他
        </option>
      </select>

      <div className="flex items-center gap-3">
        {thumbnailPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailPreview}
            alt="サムネイル"
            style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
          />
        )}
        <div className="flex flex-col gap-1">
          <div className="text-xs" style={{ color: C.muted }}>
            サムネイル画像(任意、jpg・png・webp / 2MBまで)
          </div>
          <FileInputButton label="画像を選択" accept="image/jpeg,image/png,image/webp" onChange={handleThumbnailChange} />
        </div>
      </div>
      {thumbnailError && (
        <div className="text-xs" style={{ color: C.rose }}>
          {thumbnailError}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="text-xs" style={{ color: C.muted }}>
          配信SNS/音楽配信サイトのURL(任意、複数追加可)
        </div>
        {streamingLinks.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={link.platform}
              onChange={(e) => updateLink(i, "platform", e.target.value)}
              placeholder="プラットフォーム名(例: Spotify)"
              maxLength={30}
              className="w-2/5 bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
              style={{ border: `1px solid ${C.border}`, color: C.text }}
            />
            <input
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              placeholder="URL"
              type="url"
              className="flex-1 bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
              style={{ border: `1px solid ${C.border}`, color: C.text }}
            />
            {streamingLinks.length > 1 && (
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="shrink-0"
                style={{ color: C.muted }}
                aria-label="このリンクを削除"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addLink} className="self-start text-xs font-medium" style={{ color: C.amber }}>
          + リンクを追加
        </button>
      </div>

      {!hideFiles && (
        <div className="flex flex-col gap-1">
          <div className="text-xs" style={{ color: C.muted }}>
            オーディオファイル(任意、{Math.round(ATTACHMENT_FILE_MAX_BYTES / (1024 * 1024))}MBまで)
          </div>
          <FileInputButton
            label="ファイルを選択"
            accept={AUDIO_EXTENSIONS.map((e) => `.${e}`).join(",")}
            onChange={handleFileChange(setAudioFile, AUDIO_EXTENSIONS)}
          />
        </div>
      )}
      {hideFiles && (
        <div className="text-xs" style={{ color: C.muted }}>
          ※ 編集ではファイルの変更はできません(削除して投稿し直してください)
        </div>
      )}
      {fileError && (
        <div className="text-xs" style={{ color: C.rose }}>
          {fileError}
        </div>
      )}

      {status === "error" && error && (
        <div className="text-xs" style={{ color: C.rose }}>
          {error}
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg text-sm" style={{ color: C.muted }}>
          キャンセル
        </button>
        <button
          type="submit"
          disabled={status === "posting"}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: C.amber, color: C.bg }}
        >
          {status === "posting" ? "送信中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

const GENRES = [
  "Pop",
  "Rock",
  "Hip-Hop・Rap",
  "R&B",
  "Electronic・EDM",
  "House",
  "Techno",
  "Trance",
  "Dubstep",
  "Trap",
  "Lo-Fi",
  "Jazz",
  "Classical",
  "Funk",
  "Soul",
  "Ambient",
  "Ballad",
  "Metal",
  "Punk",
  "Reggae",
  "K-Pop",
  "J-Pop",
  "アニメ・ボーカロイド",
  "Chiptune",
  "Cinematic・Score",
  "Country",
  "Folk",
  "Latin",
  "World",
  "Experimental",
];

// フィルタの「その他」= 上記GENRESのいずれにも一致しない(自由入力された)ジャンル
function matchesGenreFilter(postGenre, filterValue) {
  if (filterValue === "all") return true;
  if (filterValue === "その他") return Boolean(postGenre) && !GENRES.includes(postGenre);
  return postGenre === filterValue;
}

// 保存済みの値(例: genre)が既知の選択肢に含まれるかどうかで、
// 編集フォームの「プルダウン選択」と「その他の自由入力」を復元する
function splitChoiceForEdit(value, knownList) {
  if (!value) return { choice: "", custom: "" };
  if (knownList.includes(value)) return { choice: value, custom: "" };
  return { choice: "その他", custom: value };
}

const TARGET_SYNTHS = [
  "Serum",
  "Vital",
  "Massive/Massive X",
  "Sylenth1",
  "Spire",
  "Diva",
  "Omnisphere",
  "Pigments",
  "Phase Plant",
  "Nexus",
  "Kontakt",
  "Ableton純正",
  "FM8",
];
// プラグインごとの対応ファイル拡張子(小文字, ドット無し)。
// null = 拡張子を制限しない(複数ファイル構成のプラグインや、対応表が未整備のプラグイン向け)。
// 今後プラグインが増えたらここに追記するだけで対応できる。
const SYNTH_FILE_EXTENSIONS = {
  Serum: ["fxp"],
  Vital: ["vital"],
  "Massive/Massive X": ["nmsv"],
  Sylenth1: ["fxb", "fxp"],
  Spire: ["fxp"],
  Diva: ["h2p"],
  Omnisphere: null, // 複数ファイル構成の可能性があるため制限しない
  Pigments: ["pigp"],
  "Phase Plant": ["phaseplant"],
  Nexus: null, // 対応表が未整備のため制限しない
  Kontakt: ["nki"],
  Ableton純正: ["adv", "adg"],
  FM8: ["fm8"],
};

// 現在の種別・対応プラグイン選択から、アップロード可能な拡張子一覧を返す。
// null を返した場合は拡張子を制限しない。
function getAllowedFileExtensions(midiPatchType, targetSynthChoice) {
  if (midiPatchType === "midi") return MIDI_EXTENSIONS;
  if (!targetSynthChoice || targetSynthChoice === "その他") return null;
  return SYNTH_FILE_EXTENSIONS[targetSynthChoice] ?? null;
}

const SOUND_CATEGORIES = [
  "Bass",
  "Lead",
  "Pad",
  "Pluck",
  "Keys",
  "Brass/Strings",
  "FX/SFX",
  "Vocal",
  "Drum/Percussion",
  "Arp/Sequence",
  "Ambient/Texture",
];
const MIDI_PATCH_NOTICE =
  "このMIDI/パッチは誰でも自由に使えます。投稿する際は、公開してよい内容かご確認ください。";

function MidiPatchPostForm({
  onCancel,
  onSubmit,
  status,
  error,
  initialValues,
  submitLabel = "投稿する",
  hideFiles = false,
  lockType = false,
}) {
  const initialGenre = splitChoiceForEdit(initialValues?.genre, GENRES);
  const initialTargetSynth = splitChoiceForEdit(initialValues?.targetSynth, TARGET_SYNTHS);
  const initialSoundCategory = splitChoiceForEdit(initialValues?.soundCategory, SOUND_CATEGORIES);
  const [midiPatchType, setMidiPatchType] = useState(initialValues?.midiPatchType ?? "midi"); // "midi" | "patch"
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [genreChoice, setGenreChoice] = useState(initialGenre.choice);
  const [genreCustom, setGenreCustom] = useState(initialGenre.custom);
  const [bpm, setBpm] = useState(initialValues?.bpm != null ? String(initialValues.bpm) : "");
  const [key, setKey] = useState(initialValues?.key ?? "");
  const [body, setBody] = useState(initialValues?.body ?? "");
  const [tagsInput, setTagsInput] = useState(initialValues?.tags?.join(", ") ?? "");
  const [targetSynthChoice, setTargetSynthChoice] = useState(initialTargetSynth.choice);
  const [targetSynthCustom, setTargetSynthCustom] = useState(initialTargetSynth.custom);
  const [soundCategoryChoice, setSoundCategoryChoice] = useState(initialSoundCategory.choice);
  const [soundCategoryCustom, setSoundCategoryCustom] = useState(initialSoundCategory.custom);
  const [mainFile, setMainFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(initialValues?.thumbnailUrl ?? null);
  const [thumbnailError, setThumbnailError] = useState("");

  function handleThumbnailChange(e) {
    const file = e.target.files?.[0] ?? null;
    setThumbnailError("");
    if (!file) return;
    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
      setThumbnailError("jpg・png・webp形式の画像を選択してください");
      e.target.value = "";
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setThumbnailError("画像サイズは2MB以下にしてください");
      e.target.value = "";
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  // allowedExt が null の場合は拡張子を制限しない
  function handleFileChange(setter, allowedExt) {
    return (e) => {
      const file = e.target.files?.[0] ?? null;
      setFileError("");
      if (file) {
        if (allowedExt) {
          const ext = file.name.split(".").pop()?.toLowerCase();
          if (!allowedExt.includes(ext)) {
            setFileError(
              `このファイル形式には対応していません(対応形式: ${allowedExt.map((e2) => `.${e2}`).join(", ")})`,
            );
            e.target.value = "";
            return;
          }
        }
        if (file.size > ATTACHMENT_FILE_MAX_BYTES) {
          setFileError(`ファイルサイズは${Math.round(ATTACHMENT_FILE_MAX_BYTES / (1024 * 1024))}MB以下にしてください`);
          e.target.value = "";
          return;
        }
      }
      setter(file);
    };
  }

  function handleMidiPatchTypeChange(next) {
    setMidiPatchType(next);
    setMainFile(null);
    setFileError("");
  }

  function handleTargetSynthChange(e) {
    setTargetSynthChoice(e.target.value);
    setMainFile(null);
    setFileError("");
  }

  const mainFileAllowedExt = getAllowedFileExtensions(midiPatchType, targetSynthChoice);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const targetSynth =
      midiPatchType === "patch"
        ? targetSynthChoice === "その他"
          ? targetSynthCustom.trim() || null
          : targetSynthChoice || null
        : null;
    const soundCategory =
      midiPatchType === "patch"
        ? soundCategoryChoice === "その他"
          ? soundCategoryCustom.trim() || null
          : soundCategoryChoice || null
        : null;

    onSubmit({
      midiPatchType,
      title: title.trim(),
      body: body.trim(),
      genre: genreChoice === "その他" ? genreCustom.trim() || null : genreChoice || null,
      tags,
      bpm: midiPatchType === "midi" && bpm ? parseInt(bpm, 10) : null,
      key: midiPatchType === "midi" ? key.trim() || null : null,
      targetSynth,
      soundCategory,
      thumbnailFile,
      files:
        midiPatchType === "midi" ? { midi: mainFile } : { preset: mainFile, audio_preview: previewFile },
    });
  }

  const inputStyle = { border: `1px solid ${C.border}`, color: C.text };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 rounded-xl flex flex-col gap-2"
      style={{ background: C.panel, border: `1px solid ${C.border}` }}
    >
      <div
        className="text-xs px-3 py-2 rounded-lg"
        style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted }}
      >
        {MIDI_PATCH_NOTICE}
      </div>

      {lockType ? (
        <div className="text-xs" style={{ color: C.muted }}>
          種別: {midiPatchType === "midi" ? "MIDI" : "パッチ"}(編集では変更できません)
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleMidiPatchTypeChange("midi")}
            className="px-3 py-1 rounded-full text-xs"
            style={{
              background: midiPatchType === "midi" ? C.text : C.bg,
              color: midiPatchType === "midi" ? C.bg : C.muted,
              border: `1px solid ${C.border}`,
            }}
          >
            MIDI
          </button>
          <button
            type="button"
            onClick={() => handleMidiPatchTypeChange("patch")}
            className="px-3 py-1 rounded-full text-xs"
            style={{
              background: midiPatchType === "patch" ? C.text : C.bg,
              color: midiPatchType === "patch" ? C.bg : C.muted,
              border: `1px solid ${C.border}`,
            }}
          >
            パッチ
          </button>
        </div>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
        required
        maxLength={100}
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
        style={inputStyle}
      />
      <select
        value={genreChoice}
        onChange={(e) => setGenreChoice(e.target.value)}
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
        style={{ ...inputStyle, background: C.panel, color: genreChoice ? C.text : C.muted, colorScheme: "dark" }}
      >
        <option value="">ジャンル(任意)</option>
        {GENRES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
        <option value="その他">その他</option>
      </select>
      {genreChoice === "その他" && (
        <input
          value={genreCustom}
          onChange={(e) => setGenreCustom(e.target.value)}
          placeholder="ジャンルを入力"
          maxLength={40}
          className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
          style={inputStyle}
        />
      )}

      {midiPatchType === "midi" && (
        <div className="flex gap-2">
          <input
            value={bpm}
            onChange={(e) => setBpm(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="BPM(任意)"
            inputMode="numeric"
            className="flex-1 bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
            style={inputStyle}
          />
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Key(任意, 例: Am)"
            maxLength={10}
            className="flex-1 bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
            style={inputStyle}
          />
        </div>
      )}

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="コメント(任意)"
        rows={3}
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg resize-none"
        style={inputStyle}
      />

      <input
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        placeholder="タグ(カンマ区切りで複数入力可, 例: lofi, chill, 808)"
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
        style={inputStyle}
      />

      {midiPatchType === "patch" && (
        <>
          <select
            value={targetSynthChoice}
            onChange={handleTargetSynthChange}
            className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
            style={{
              background: C.panel,
              border: `1px solid ${C.border}`,
              color: targetSynthChoice ? C.text : C.muted,
              colorScheme: "dark",
            }}
          >
            <option value="">
              対応シンセ/プラグイン(任意)
            </option>
            {TARGET_SYNTHS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="その他">
              その他
            </option>
          </select>
          {targetSynthChoice === "その他" && (
            <input
              value={targetSynthCustom}
              onChange={(e) => setTargetSynthCustom(e.target.value)}
              placeholder="シンセ/プラグイン名を入力"
              maxLength={40}
              className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
              style={inputStyle}
            />
          )}

          <select
            value={soundCategoryChoice}
            onChange={(e) => setSoundCategoryChoice(e.target.value)}
            className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
            style={{
              background: C.panel,
              border: `1px solid ${C.border}`,
              color: soundCategoryChoice ? C.text : C.muted,
              colorScheme: "dark",
            }}
          >
            <option value="">
              音色カテゴリ(任意)
            </option>
            {SOUND_CATEGORIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="その他">
              その他
            </option>
          </select>
          {soundCategoryChoice === "その他" && (
            <input
              value={soundCategoryCustom}
              onChange={(e) => setSoundCategoryCustom(e.target.value)}
              placeholder="音色カテゴリを入力"
              maxLength={40}
              className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
              style={inputStyle}
            />
          )}
        </>
      )}

      <div className="flex items-center gap-3">
        {thumbnailPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailPreview}
            alt="サムネイル"
            style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
          />
        )}
        <div className="flex flex-col gap-1">
          <div className="text-xs" style={{ color: C.muted }}>
            サムネイル画像(任意、jpg・png・webp / 2MBまで)
          </div>
          <FileInputButton label="画像を選択" accept="image/jpeg,image/png,image/webp" onChange={handleThumbnailChange} />
        </div>
      </div>
      {thumbnailError && (
        <div className="text-xs" style={{ color: C.rose }}>
          {thumbnailError}
        </div>
      )}

      {!hideFiles ? (
        <div className="flex flex-col gap-2 p-2 rounded-lg" style={{ border: `1px dashed ${C.border}` }}>
          <div className="flex flex-col gap-1">
            <div className="text-xs" style={{ color: C.muted }}>
              ファイル添付(任意、{Math.round(ATTACHMENT_FILE_MAX_BYTES / (1024 * 1024))}MBまで)
              {mainFileAllowedExt
                ? ` - 対応形式: ${mainFileAllowedExt.map((e) => `.${e}`).join(", ")}`
                : " - 対応形式の制限なし"}
            </div>
            <FileInputButton
              key={`${midiPatchType}-${targetSynthChoice}`}
              label="ファイルを選択"
              accept={mainFileAllowedExt ? mainFileAllowedExt.map((e) => `.${e}`).join(",") : undefined}
              onChange={handleFileChange(setMainFile, mainFileAllowedExt)}
            />
          </div>
          {midiPatchType === "patch" && (
            <div className="flex flex-col gap-1">
              <div className="text-xs" style={{ color: C.muted }}>
                試聴用音源(任意、ダウンロード前に聴けるプレビュー音源)
              </div>
              <FileInputButton
                label="ファイルを選択"
                accept={AUDIO_EXTENSIONS.map((e) => `.${e}`).join(",")}
                onChange={handleFileChange(setPreviewFile, AUDIO_EXTENSIONS)}
              />
            </div>
          )}
          {fileError && (
            <div className="text-xs" style={{ color: C.rose }}>
              {fileError}
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs" style={{ color: C.muted }}>
          ※ 編集ではファイルの変更はできません(削除して投稿し直してください)
        </div>
      )}

      {status === "error" && error && (
        <div className="text-xs" style={{ color: C.rose }}>
          {error}
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg text-sm" style={{ color: C.muted }}>
          キャンセル
        </button>
        <button
          type="submit"
          disabled={status === "posting"}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: C.amber, color: C.bg }}
        >
          {status === "posting" ? "送信中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function NewThreadForm({ onCancel, onSubmit, status, error, initialValues, submitLabel = "投稿する" }) {
  const [type, setType] = useState(initialValues?.type ?? "question");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [body, setBody] = useState(initialValues?.body ?? "");
  const [referenceUrl, setReferenceUrl] = useState(initialValues?.referenceUrl ?? "");
  const [urlError, setUrlError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const trimmedUrl = referenceUrl.trim();
    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      setUrlError("URLは http:// または https:// から入力してください");
      return;
    }
    setUrlError("");
    onSubmit({ type, title: title.trim(), body: body.trim(), referenceUrl: trimmedUrl });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 rounded-xl flex flex-col gap-2"
      style={{ background: C.panel, border: `1px solid ${C.border}` }}
    >
      <div className="flex gap-2 flex-wrap">
        {Object.entries(THREAD_TYPES).map(([key, t]) => (
          <button
            key={key}
            type="button"
            onClick={() => setType(key)}
            className="px-3 py-1 rounded-full text-xs"
            style={{
              background: type === key ? C.text : C.bg,
              color: type === key ? C.bg : C.muted,
              border: `1px solid ${C.border}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
        required
        maxLength={100}
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
        style={{ border: `1px solid ${C.border}`, color: C.text }}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="本文(任意)"
        rows={4}
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg resize-none"
        style={{ border: `1px solid ${C.border}`, color: C.text }}
      />
      <input
        type="url"
        value={referenceUrl}
        onChange={(e) => setReferenceUrl(e.target.value)}
        placeholder="参考URL(任意)"
        className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
        style={{ border: `1px solid ${C.border}`, color: C.text }}
      />
      {urlError && (
        <div className="text-xs" style={{ color: C.rose }}>
          {urlError}
        </div>
      )}
      {status === "error" && error && (
        <div className="text-xs" style={{ color: C.rose }}>
          {error}
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg text-sm" style={{ color: C.muted }}>
          キャンセル
        </button>
        <button
          type="submit"
          disabled={status === "posting"}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: C.amber, color: C.bg }}
        >
          {status === "posting" ? "送信中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function ThreadRow({ t, color, onOpen, interactive, onLikeToggle, onOpenProfile }) {
  const Icon = THREAD_TYPES[t.type].icon;
  return (
    <div
      className="p-4 rounded-xl cursor-pointer flex items-start gap-4"
      style={{ background: C.panel, border: `1px solid ${C.border}` }}
      onClick={onOpen}
    >
      <Icon size={20} color={color} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-base font-medium mb-1">{t.title}</div>
        {t.body && (
          <div className="text-sm mb-2 line-clamp-2" style={{ color: C.muted }}>
            {t.body}
          </div>
        )}
        <AuthorLine
          name={t.author}
          likes={t.authorLikes}
          avatarUrl={t.authorAvatarUrl}
          avatarSize={20}
          textClassName="text-sm"
          userId={t.userId}
          onOpenProfile={onOpenProfile}
        />
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        {t.resolved && (
          <span className="mono-font px-2 py-1 rounded text-xs" style={{ background: C.teal, color: C.bg }}>
            解決済み
          </span>
        )}
        <div className="flex items-center gap-3">
          {interactive ? (
            <LikeButton postId={t.id} liked={t.liked} count={t.likes} onToggled={onLikeToggle} size={14} />
          ) : (
            <span className="text-sm flex items-center gap-1" style={{ color: C.muted }}>
              <Heart size={14} /> {t.likes}
            </span>
          )}
          <span className="text-sm flex items-center gap-1" style={{ color: C.muted }}>
            <MessageCircle size={14} /> {t.comments}
          </span>
        </div>
      </div>
    </div>
  );
}
