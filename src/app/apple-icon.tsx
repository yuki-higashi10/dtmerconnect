import { ImageResponse } from "next/og";
import { iconArt } from "@/lib/iconArt";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOSは角丸を自前でマスクするため、apple-touch-iconは角丸なしの正方形で用意する
export default function AppleIcon() {
  return new ImageResponse(iconArt(180, { rounded: false }), { ...size });
}
