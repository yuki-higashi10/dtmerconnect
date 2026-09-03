import { ImageResponse } from "next/og";

export const alt = "DTMer Connect";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// アプリアイコン(赤背景いっぱいに音符アイコン)と同じ配色・デザインで統一する。
// ダーク背景に小さくロゴを置くデザインだと、Safariの共有シート等でアイコンだけが
// 縮小プレビューされた際に「黒背景+小さい絵柄」に見えてしまうため、赤を全面に敷く。
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e63946",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <div
            style={{
              width: 300,
              height: 220,
              borderRadius: 28,
              background: "#f5f2ec",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 260,
                height: 180,
                borderRadius: 18,
                background: "#e63946",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 148,
                color: "#f5f2ec",
              }}
            >
              ♬
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 700, lineHeight: 1.1 }}>
            <span style={{ color: "#f5f2ec" }}>DTMer</span>
            <span style={{ color: "#0e1013" }}>Connect</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
