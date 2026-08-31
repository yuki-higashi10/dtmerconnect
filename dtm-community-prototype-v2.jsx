import React, { useState, useEffect, useMemo, useRef } from "react";
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
} from "lucide-react";

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
];

const GENERAL_CHANNEL = { id: "general", name: "全般", color: C.text };

const THREAD_TYPES = {
  question: { label: "質問", icon: HelpCircle },
  tips: { label: "Tips", icon: Lightbulb },
  casual: { label: "雑談", icon: Coffee },
  setup: { label: "環境/機材紹介", icon: Settings2 },
};

const BADGES = [
  { min: 0, name: "ブロンズ" },
  { min: 100, name: "シルバー" },
  { min: 300, name: "ゴールド" },
  { min: 500, name: "プラチナ" },
  { min: 1000, name: "ダイヤモンド" },
];
function badgeFor(likes) {
  let b = BADGES[0];
  for (const cand of BADGES) if (likes >= cand.min) b = cand;
  return b;
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

function timeStr(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function App() {
  const [view, setView] = useState("home"); // home | channel | tracks | patches | mypage | search
  const [activeChannel, setActiveChannel] = useState(null);
  const [threadTab, setThreadTab] = useState("all");
  const [nowPlaying, setNowPlaying] = useState(null); // {id,title,author,seed,color}
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detail, setDetail] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying && nowPlaying) {
      timerRef.current = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 1.2));
      }, 200);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, nowPlaying]);

  function play(item, color) {
    setNowPlaying({ ...item, color });
    setIsPlaying(true);
    setProgress(0);
  }

  const channelColor = (id) =>
    (CHANNELS.find((c) => c.id === id) || (id === GENERAL_CHANNEL.id ? GENERAL_CHANNEL : {})).color || C.muted;
  const myBadge = badgeFor(42);

  const navItem = (id, icon, label) => {
    const Icon = icon;
    const active = view === id;
    return (
      <button
        onClick={() => setView(id)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full text-left"
        style={{ background: active ? C.panelHover : "transparent", color: active ? C.text : C.muted }}
      >
        <Icon size={17} />
        {label}
      </button>
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

      <div className="flex" style={{ paddingBottom: nowPlaying ? 84 : 0 }}>
        {/* sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 p-4 gap-1 sticky top-0" style={{ height: "100vh" }}>
          <div className="flex items-center gap-2 mb-4 px-1">
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Music2 size={15} color={C.bg} />
            </div>
            <span className="display-font font-bold">パッチノート</span>
          </div>

          {navItem("home", Home, "ホーム")}
          {navItem("search", Search, "検索")}

          <div className="text-xs uppercase mt-4 mb-1 px-3" style={{ color: C.muted }}>
            DAW別コミュニティ
          </div>
          {CHANNELS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setView("channel");
                setActiveChannel(c.id);
                setThreadTab("all");
              }}
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
          {navItem("tracks", Music2, "楽曲投稿")}
          {navItem("patches", Download, "MIDI/パッチ共有")}

          <div className="mt-auto">{navItem("mypage", User, "マイページ")}</div>
        </aside>

        {/* main */}
        <main className="flex-1 min-w-0 px-4 py-4 md:px-6">
          {view === "home" && (
            <div className="flex flex-col gap-6">
              <h1 className="display-font text-xl font-bold">ホーム</h1>

              <Row title="今週の人気MIDI/パッチ">
                {PATCHES.map((p) => (
                  <PatchCard key={p.id} p={p} onPlay={() => play(p, C.amber)} onOpen={() => setDetail({ kind: "patch", data: p })} />
                ))}
              </Row>

              <Row title="新着Tips">
                {THREADS.filter((t) => t.type === "tips").map((t) => (
                  <ThreadCard key={t.id} t={t} color={channelColor(t.channel)} onOpen={() => setDetail({ kind: "thread", data: t })} />
                ))}
              </Row>

              <Row title="楽曲投稿の新着">
                {TRACKS.map((tr) => (
                  <TrackCard key={tr.id} tr={tr} onPlay={() => play(tr, C.teal)} onOpen={() => setDetail({ kind: "track", data: tr })} />
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
                    onClick={() => {
                      setView("channel");
                      setActiveChannel(c.id);
                    }}
                    className="p-4 rounded-xl text-left"
                    style={{ background: C.panel, border: `1px solid ${C.border}` }}
                  >
                    <span style={{ color: c.color }} className="font-medium text-sm">
                      {c.name}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setView("channel");
                    setActiveChannel(GENERAL_CHANNEL.id);
                  }}
                  className="col-span-2 sm:col-span-3 p-4 rounded-xl text-left"
                  style={{ background: C.panel, border: `1px solid ${C.border}` }}
                >
                  <span style={{ color: GENERAL_CHANNEL.color }} className="font-medium text-sm">
                    {GENERAL_CHANNEL.name}
                  </span>
                  <span className="text-xs ml-2" style={{ color: C.muted }}>
                    ソフト関係なく話せる場所
                  </span>
                </button>
              </div>
            </div>
          )}

          {view === "channel" && activeChannel && (
            <div>
              <h1 className="display-font text-xl font-bold mb-1" style={{ color: channelColor(activeChannel) }}>
                {activeChannel === GENERAL_CHANNEL.id
                  ? GENERAL_CHANNEL.name
                  : CHANNELS.find((c) => c.id === activeChannel)?.name}
              </h1>
              <div className="flex gap-2 my-3 overflow-x-auto row-scroll">
                {["all", ...Object.keys(THREAD_TYPES)].map((tt) => (
                  <button
                    key={tt}
                    onClick={() => setThreadTab(tt)}
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
              <div className="flex flex-col gap-2">
                {THREADS.filter((t) => t.channel === activeChannel && (threadTab === "all" || t.type === threadTab)).map((t) => (
                  <ThreadRow key={t.id} t={t} color={channelColor(t.channel)} onOpen={() => setDetail({ kind: "thread", data: t })} />
                ))}
              </div>
            </div>
          )}

          {view === "tracks" && (
            <div>
              <h1 className="display-font text-xl font-bold mb-3">楽曲投稿</h1>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TRACKS.map((tr) => (
                  <TrackCard key={tr.id} tr={tr} onPlay={() => play(tr, C.teal)} onOpen={() => setDetail({ kind: "track", data: tr })} />
                ))}
              </div>
            </div>
          )}

          {view === "patches" && (
            <div>
              <h1 className="display-font text-xl font-bold mb-3">MIDI/パッチ共有</h1>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PATCHES.map((p) => (
                  <PatchCard key={p.id} p={p} onPlay={() => play(p, C.amber)} onOpen={() => setDetail({ kind: "patch", data: p })} />
                ))}
              </div>
            </div>
          )}

          {view === "mypage" && (
            <div>
              <h1 className="display-font text-xl font-bold mb-4">マイページ</h1>
              <div className="p-4 rounded-xl mb-4 flex items-center gap-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 999, background: C.amber }} />
                <div>
                  <div className="font-medium">あなた</div>
                  <div className="text-xs mono-font" style={{ color: C.muted }}>
                    称号: {myBadge.name} (累計42いいね)
                  </div>
                </div>
              </div>
              <div className="text-xs uppercase mb-2" style={{ color: C.muted }}>
                自分の投稿(サンプル)
              </div>
              <div className="text-sm" style={{ color: C.muted }}>
                まだ投稿はありません
              </div>
            </div>
          )}
        </main>
      </div>

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
              {timeStr((progress / 100) * 30)}
            </span>
            <div className="flex-1 h-1 rounded-full" style={{ background: C.border }}>
              <div className="h-1 rounded-full" style={{ width: `${progress}%`, background: nowPlaying.color }} />
            </div>
            <span className="mono-font text-xs hidden sm:inline" style={{ color: C.muted }}>
              0:30
            </span>
          </div>
          <button onClick={() => setNowPlaying(null)} style={{ color: C.muted }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* detail overlay */}
      {detail && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-0 sm:p-6" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setDetail(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md sm:rounded-xl p-4"
            style={{ background: C.panel, border: `1px solid ${C.border}` }}
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-semibold">{detail.data.title}</h2>
              <button onClick={() => setDetail(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="text-xs mb-3" style={{ color: C.muted }}>
              {detail.data.author}
            </div>
            {(detail.kind === "patch" || detail.kind === "track") && (
              <PianoRoll seed={detail.data.id + detail.data.title} color={detail.kind === "patch" ? C.amber : C.teal} height={64} />
            )}
            <div className="flex items-center gap-4 text-xs mt-3" style={{ color: C.muted }}>
              <span className="flex items-center gap-1">
                <Heart size={13} /> {detail.data.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={13} /> {detail.data.comments}
              </span>
              {detail.kind === "patch" && (
                <span className="flex items-center gap-1">
                  <Download size={13} /> {detail.data.downloads}
                </span>
              )}
            </div>
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

function PatchCard({ p, onPlay, onOpen }) {
  return (
    <div className="shrink-0 w-44 p-3 rounded-xl cursor-pointer" style={{ background: C.panel, border: `1px solid ${C.border}` }} onClick={onOpen}>
      <div className="relative mb-2">
        <PianoRoll seed={p.id + p.title} color={C.amber} height={80} />
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
      <div className="text-xs truncate" style={{ color: C.muted }}>
        {p.author}
      </div>
    </div>
  );
}

function TrackCard({ tr, onPlay, onOpen }) {
  return (
    <div className="shrink-0 w-44 p-3 rounded-xl cursor-pointer" style={{ background: C.panel, border: `1px solid ${C.border}` }} onClick={onOpen}>
      <div className="relative mb-2">
        <PianoRoll seed={tr.id + tr.title} color={C.teal} height={80} />
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
      <div className="text-xs truncate" style={{ color: C.muted }}>
        {tr.author}
      </div>
    </div>
  );
}

function ThreadCard({ t, color, onOpen }) {
  const Icon = THREAD_TYPES[t.type].icon;
  return (
    <div className="shrink-0 w-56 p-3 rounded-xl cursor-pointer" style={{ background: C.panel, border: `1px solid ${C.border}` }} onClick={onOpen}>
      <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: C.muted }}>
        <Icon size={12} color={color} />
        {THREAD_TYPES[t.type].label}
      </div>
      <div className="text-sm mb-2">{t.title}</div>
      <div className="text-xs" style={{ color: C.muted }}>
        {t.author}
      </div>
    </div>
  );
}

function ThreadRow({ t, color, onOpen }) {
  const Icon = THREAD_TYPES[t.type].icon;
  return (
    <div
      className="p-3 rounded-xl cursor-pointer flex items-center gap-3"
      style={{ background: C.panel, border: `1px solid ${C.border}` }}
      onClick={onOpen}
    >
      <Icon size={16} color={color} />
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{t.title}</div>
        <div className="text-xs" style={{ color: C.muted }}>
          {t.author}
        </div>
      </div>
      {t.resolved && (
        <span className="mono-font px-1.5 py-0.5 rounded text-xs" style={{ background: C.teal, color: C.bg }}>
          解決済み
        </span>
      )}
      <span className="text-xs flex items-center gap-1" style={{ color: C.muted }}>
        <Heart size={12} /> {t.likes}
      </span>
    </div>
  );
}
