import sharp from "sharp";
import type { NextRequest } from "next/server";
import { ICON_SVG } from "@/lib/iconSvg";

// アプリロゴ(icon.svg)をそのままラスタライズして、PWAマニフェスト用に必要なサイズのPNGを生成する
export async function GET(_request: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const dimension = Math.min(Math.max(Number(size) || 512, 16), 1024);

  const png = await sharp(Buffer.from(ICON_SVG)).resize(dimension, dimension).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
