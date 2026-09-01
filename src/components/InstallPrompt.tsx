"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  recordVisit,
  hasEngagementSignal,
  isDismissedRecently,
  recordDismiss,
  PWA_ENGAGEMENT_EVENT,
} from "@/lib/pwaEngagement";

const C = {
  panel: "#181b21",
  border: "#282c35",
  text: "#f0efea",
  muted: "#9aa0ac",
  amber: "#e8a33d",
  bg: "#0e1013",
};

interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = window as unknown as { MSStream?: unknown };
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !nav.MSStream;
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | null>(null);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;

    function evaluate() {
      if (isStandalone() || isDismissedRecently() || !hasEngagementSignal()) return;
      if (deferredPromptRef.current) {
        setPlatform("android");
        setVisible(true);
      } else if (isIos()) {
        setPlatform("ios");
        setVisible(true);
      }
    }

    recordVisit();
    evaluate();

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      evaluate();
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener(PWA_ENGAGEMENT_EVENT, evaluate);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener(PWA_ENGAGEMENT_EVENT, evaluate);
    };
  }, []);

  async function handleInstallClick() {
    const promptEvent = deferredPromptRef.current;
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    deferredPromptRef.current = null;
    setVisible(false);
  }

  function handleDismiss() {
    recordDismiss();
    setVisible(false);
  }

  if (!visible || !platform) return null;

  return (
    <div className="fixed inset-x-0 z-40 px-4 bottom-20 md:bottom-4">
      <div
        className="max-w-md mx-auto rounded-xl p-4 flex items-start gap-3 shadow-lg"
        style={{ background: C.panel, border: `1px solid ${C.border}` }}
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium mb-2" style={{ color: C.text }}>
            アプリとしてインストールすると、ホーム画面からすぐにアクセスできて便利です
          </div>
          {platform === "android" ? (
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: C.amber, color: C.bg }}
            >
              インストール
            </button>
          ) : (
            <div className="text-xs" style={{ color: C.muted }}>
              共有ボタン→「ホーム画面に追加」からインストールできます
            </div>
          )}
        </div>
        <button type="button" onClick={handleDismiss} aria-label="閉じる" className="shrink-0" style={{ color: C.muted }}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
