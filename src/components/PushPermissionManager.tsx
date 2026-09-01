"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { isPushSupported, hasPushBeenPrompted, markPushPrompted, requestPushPermissionAndSubscribe } from "@/lib/webPush";

// PWAとしてインストールされた直後に通知許可ダイアログを表示する。
// ゲストユーザーには表示しない(通知機能自体がログインユーザー向けのため)。
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
