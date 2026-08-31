import { ImageResponse } from "next/og";

export const alt = "DTMer Connect";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#0e1013",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: 44,
              background: "#e63946",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 124,
                height: 92,
                borderRadius: 12,
                background: "#f5f2ec",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 108,
                  height: 76,
                  borderRadius: 8,
                  background: "#e63946",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 64,
                  color: "#f5f2ec",
                }}
              >
                ♬
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 700, lineHeight: 1.1 }}>
            <span style={{ color: "#f0efea" }}>DTMer</span>
            <span style={{ color: "#e63946" }}>Connect</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
