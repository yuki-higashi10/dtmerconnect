// src/app/icon.svg (= public/logo.svg のアイコン部分)と座標を完全に一致させたアイコン描画。
// PWAアイコン生成(app/icons/[size]、app/apple-icon.tsx)で同じ定義を共有し、デザインが
// 元のロゴとずれないようにする。
// 元SVGは viewBox="0 8 64 64" (64x64を基準に、上端が8だけオフセットしているだけ)なので、
// ここでは64を基準とした比率(s関数)で全要素を再現する。
const VIEWBOX = 64;

export function iconArt(dimension: number, { rounded = true }: { rounded?: boolean } = {}) {
  const s = (v: number) => (v / VIEWBOX) * dimension;

  return (
    <div
      style={{
        position: "relative",
        width: dimension,
        height: dimension,
        display: "flex",
        background: "#e63946",
        borderRadius: rounded ? s(16) : 0,
      }}
    >
      {/* モニターベゼル(白枠) */}
      <div
        style={{
          position: "absolute",
          left: s(9),
          top: s(10),
          width: s(46),
          height: s(34),
          borderRadius: s(4),
          background: "#f5f2ec",
          display: "flex",
        }}
      />
      {/* 画面(赤)+音符 */}
      <div
        style={{
          position: "absolute",
          left: s(12),
          top: s(13),
          width: s(40),
          height: s(28),
          borderRadius: s(2),
          background: "#e63946",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: s(26),
          color: "#f5f2ec",
        }}
      >
        ♬
      </div>
      {/* モニタースタンド: 支柱 */}
      <div
        style={{
          position: "absolute",
          left: s(30),
          top: s(44),
          width: s(4),
          height: s(5),
          background: "#f5f2ec",
          display: "flex",
        }}
      />
      {/* モニタースタンド: 台座 */}
      <div
        style={{
          position: "absolute",
          left: s(20),
          top: s(49),
          width: s(24),
          height: s(4),
          borderRadius: s(2),
          background: "#f5f2ec",
          display: "flex",
        }}
      />
    </div>
  );
}
