import Link from "next/link";
import type { ReactNode } from "react";

const C = {
  bg: "#0e1013",
  border: "#282c35",
  text: "#f0efea",
  muted: "#9aa0ac",
  amber: "#e8a33d",
};

export default function LegalPageLayout({
  title,
  children,
  enactedDate = "2026年8月31日",
}: {
  title: string;
  children: ReactNode;
  enactedDate?: string;
}) {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh" }} className="px-4 py-8 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" style={{ color: C.amber }} className="text-sm font-medium">
          ← DTMer Connect トップに戻る
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-6">{title}</h1>
        <div className="flex flex-col gap-6 text-sm leading-relaxed pb-16">{children}</div>
        <div className="text-xs mt-4" style={{ color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
          制定日: {enactedDate}
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold">{heading}</h2>
      <div className="flex flex-col gap-2" style={{ color: C.muted }}>
        {children}
      </div>
    </section>
  );
}
