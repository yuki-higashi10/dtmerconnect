// PWAインストール誘導バナーの表示タイミング制御。
// 「初回訪問では出さない」「いいね・投稿などの行動後に出す」「閉じたら数日は出さない」を
// localStorageだけで(サーバー側の状態を持たず)判定する。

const VISIT_COUNT_KEY = "dtmer_pwa_visit_count";
const ENGAGED_KEY = "dtmer_pwa_engaged";
const DISMISSED_AT_KEY = "dtmer_pwa_dismissed_at";
const DISMISS_SUPPRESS_DAYS = 14;

export const PWA_ENGAGEMENT_EVENT = "dtmer:pwa-engagement";

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // localStorageが使えない環境(プライベートブラウジング等)では何もしない
  }
}

// ページ読み込みのたびに1回呼び出す想定。訪問回数を返す。
export function recordVisit(): number {
  const count = Number(safeGet(VISIT_COUNT_KEY) ?? "0") + 1;
  safeSet(VISIT_COUNT_KEY, String(count));
  return count;
}

// いいね・保存・投稿・コメントなど、何らかの能動的な操作をしたときに呼び出す
export function recordEngagementAction() {
  safeSet(ENGAGED_KEY, "1");
  window.dispatchEvent(new Event(PWA_ENGAGEMENT_EVENT));
}

// 「2回目以降の訪問」または「行動済み」のどちらかを満たしたら表示対象とする
export function hasEngagementSignal(): boolean {
  if (safeGet(ENGAGED_KEY) === "1") return true;
  const count = Number(safeGet(VISIT_COUNT_KEY) ?? "0");
  return count >= 2;
}

export function recordDismiss() {
  safeSet(DISMISSED_AT_KEY, String(Date.now()));
}

export function isDismissedRecently(): boolean {
  const raw = safeGet(DISMISSED_AT_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return false;
  const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return daysSince < DISMISS_SUPPRESS_DAYS;
}
