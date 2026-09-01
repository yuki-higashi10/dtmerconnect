import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOSは角丸を自前でマスクするため、apple-touch-iconは角丸なしの正方形で用意する
export default function AppleIcon() {
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
        <div
          style={{
            width: 130,
            height: 96,
            borderRadius: 11,
            background: "#f5f2ec",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 113,
              height: 79,
              borderRadius: 5,
              background: "#e63946",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 72,
              color: "#f5f2ec",
            }}
          >
            ♬
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
