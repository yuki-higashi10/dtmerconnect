"use client";

import { useState, type FormEvent } from "react";

const C = {
  bg: "#0e1013",
  panel: "#181b21",
  border: "#282c35",
  text: "#f0efea",
  muted: "#9aa0ac",
  amber: "#e8a33d",
};

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl p-4 text-sm" style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }}>
        お問い合わせを受け付けました。内容を確認の上、必要に応じてご入力いただいたメールアドレス宛にご連絡いたします。
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-name" className="text-xs" style={{ color: C.muted }}>
          お名前(任意)
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-email" className="text-xs" style={{ color: C.muted }}>
          メールアドレス
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={320}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-message" className="text-xs" style={{ color: C.muted }}>
          お問い合わせ内容
        </label>
        <textarea
          id="contact-message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={5000}
          rows={5}
          className="rounded-lg px-3 py-2 text-sm outline-none resize-none"
          style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}
        />
      </div>
      {status === "error" && (
        <div className="text-xs" style={{ color: "#e8724d" }}>
          送信に失敗しました。時間をおいて再度お試しください。
        </div>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="self-start px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
        style={{ background: C.amber, color: C.bg }}
      >
        {status === "sending" ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}
