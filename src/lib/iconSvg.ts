// src/app/icon.svg と全く同じマークアップ。PWAアイコン(app/icons/[size]、apple-icon.tsx)は
// これをsharpで直接ラスタライズして生成するため、元のロゴと寸分違わない見た目になる。
// (Route Handler内でfsからsrc/app/icon.svgを読み込む方式だと、Vercel等のサーバーレス環境で
// ファイルが正しくバンドルされない場合があるため、文字列としてコードに直接埋め込む)
export const ICON_SVG = `<svg viewBox="0 8 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="8" width="64" height="64" rx="16" fill="#e63946" />
  <rect x="9" y="18" width="46" height="34" rx="4" fill="#f5f2ec" />
  <rect x="12" y="21" width="40" height="28" rx="2" fill="#e63946" />
  <text x="32" y="36" font-family="Arial, sans-serif" font-size="26" fill="#f5f2ec" text-anchor="middle" dominant-baseline="central">♬</text>
  <rect x="30" y="52" width="4" height="5" fill="#f5f2ec" />
  <rect x="20" y="57" width="24" height="4" rx="2" fill="#f5f2ec" />
</svg>`;
