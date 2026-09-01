import sharp from "sharp";
import { ICON_SVG } from "@/lib/iconSvg";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// アプリロゴ(icon.svg)をそのままラスタライズしてiOSホーム画面用アイコンを生成する
export default async function AppleIcon() {
  const png = await sharp(Buffer.from(ICON_SVG)).resize(size.width, size.height).png().toBuffer();

  return new Response(new Uint8Array(png));
}
