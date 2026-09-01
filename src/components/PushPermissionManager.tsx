"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { isPushSupported, hasPushBeenPrompted, markPushPrompted, requestPushPermissionAndSubscribe } from "@/lib/webPush";

// PWAとしてインストールされた直後に通知許可ダイアログを表示する。
// 画面には何も描画しない(return null)。ゲストユーザーには表示しない。
export default function PushPermissionManager() {
  const { user, isGuest } = useAuth();

  useEffect(() => {
    if (!isPushSupported() || !user || isGuest) return;

    function handleAppInstalled() {
      if (hasPushBeenPrompted() || Notification.permission !== "default") return;
      markPushPrompted();
      const supabase = createClient();
      requestPushPermissionAndSubscribe(supabase, user!.id);
    }

    window.addEventListener("appinstalled", handleAppInstalled);
    return () => window.removeEventListener("appinstalled", handleAppInstalled);
  }, [user, isGuest]);

  return null;
}
