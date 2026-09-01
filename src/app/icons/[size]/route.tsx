import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { iconArt } from "@/lib/iconArt";

// アプリロゴ(public/logo.svgのアイコン部分)と完全に同じデザインを、PWAマニフェスト用に
// 必要なサイズで動的に生成する
export async function GET(_request: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const dimension = Math.min(Math.max(Number(size) || 512, 16), 1024);

  return new ImageResponse(iconArt(dimension), { width: dimension, height: dimension });
}
