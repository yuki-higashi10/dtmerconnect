import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// アプリロゴ(public/logo.svg)のアイコン部分を、PWAマニフェスト用に必要なサイズで動的に生成する
export async function GET(_request: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const dimension = Math.min(Math.max(Number(size) || 512, 16), 1024);

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
          borderRadius: dimension * 0.25,
        }}
      >
        <div
          style={{
            width: dimension * 0.72,
            height: dimension * 0.53,
            borderRadius: dimension * 0.06,
            background: "#f5f2ec",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: dimension * 0.63,
              height: dimension * 0.44,
              borderRadius: dimension * 0.03,
              background: "#e63946",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: dimension * 0.4,
              color: "#f5f2ec",
            }}
          >
            ♬
          </div>
        </div>
      </div>
    ),
    { width: dimension, height: dimension },
  );
}
