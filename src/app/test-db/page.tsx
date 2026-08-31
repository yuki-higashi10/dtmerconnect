"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type DawChannel = {
  id: string;
  name: string;
  color: string;
};

export default function TestDbPage() {
  const [channels, setChannels] = useState<DawChannel[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("daw_channels")
      .select("id, name, color")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setChannels(data);
      });
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        Supabase接続テスト: daw_channels
      </h1>

      {error && (
        <p style={{ color: "#e11d48" }}>取得エラー: {error}</p>
      )}

      {!error && channels === null && <p>読み込み中...</p>}

      {channels && channels.length === 0 && (
        <p>daw_channelsは0件でした(seed.sqlを実行済みか確認してください)。</p>
      )}

      {channels && channels.length > 0 && (
        <ul style={{ display: "flex", flexDirection: "column", gap: 8, padding: 0, listStyle: "none" }}>
          {channels.map((c) => (
            <li key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{ width: 12, height: 12, borderRadius: 999, background: c.color, display: "inline-block" }}
              />
              {c.name}
              <span style={{ color: "#888", fontSize: 12 }}>({c.color})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
