import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DTMer Connect",
    short_name: "DTMer Connect",
    description:
      "DTMerのためのコミュニティアプリ。DAW別の情報交換、楽曲投稿、MIDI/パッチ共有ができます。",
    start_url: "/",
    display: "standalone",
    background_color: "#0e1013",
    theme_color: "#e63946",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
