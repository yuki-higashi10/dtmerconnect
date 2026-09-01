// Web Push購読まわりのクライアント側処理。
// iOS Safari等、Push APIに対応していない環境では isPushSupported() が false を返すため、
// 呼び出し側は機能自体を出し分けること(無理に対応させない)。
import type { SupabaseClient } from "@supabase/supabase-js";

const PROMPTED_KEY = "dtmer_push_prompted";

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function hasPushBeenPrompted(): boolean {
  try {
    return window.localStorage.getItem(PROMPTED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markPushPrompted() {
  try {
    window.localStorage.setItem(PROMPTED_KEY, "1");
  } catch {
    // ignore
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// 通知許可ダイアログを表示し、許可されたら購読情報をSupabaseへ保存する。
// 戻り値: 購読に成功した場合true
export async function requestPushPermissionAndSubscribe(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  if (!isPushSupported()) return false;

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) return false;

  if (Notification.permission === "default") {
    const result = await Notification.requestPermission();
    if (result !== "granted") return false;
  }
  if (Notification.permission !== "granted") return false;

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });
  }

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false;

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    { onConflict: "endpoint" },
  );

  return !error;
}
