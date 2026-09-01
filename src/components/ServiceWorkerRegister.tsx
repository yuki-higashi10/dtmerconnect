"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // オフライン対応は付加価値なので、登録に失敗してもアプリの動作は妨げない
    });
  }, []);

  return null;
}
