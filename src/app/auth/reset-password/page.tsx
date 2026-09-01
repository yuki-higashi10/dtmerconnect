"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const C = {
  bg: "#0e1013",
  border: "#282c35",
  text: "#f0efea",
  muted: "#9aa0ac",
  amber: "#e8a33d",
  rose: "#f472b6",
};

export default function ResetPasswordPage() {
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  // パスワード再設定メールのリンクを開くと、Supabaseクライアントが自動的にリカバリー用の
  // セッションを確立する(実装方法によりCookie経由で即座に確立済みの場合と、URL中のトークンを
  // 読み取ってから確立する場合の両方があるため、両方に対応する)
  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) setReady(true);
      setChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setReady(true);
        setChecking(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 6) {
      setStatus("error");
      setError("パスワードは6文字以上で入力してください");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setError("パスワードが一致しません");
      return;
    }
    setStatus("saving");
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setStatus("error");
      setError(updateError.message);
      return;
    }
    setStatus("done");
  }

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh" }} className="px-4 py-8 sm:px-8">
      <div className="max-w-sm mx-auto">
        <Link href="/" style={{ color: C.amber }} className="text-sm font-medium">
          ← DTMer Connect トップに戻る
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-6">パスワードの再設定</h1>

        {checking ? (
          <div className="text-sm" style={{ color: C.muted }}>
            確認中...
          </div>
        ) : status === "done" ? (
          <div className="flex flex-col gap-3">
            <div className="text-sm">パスワードを再設定しました。</div>
            <Link href="/" className="text-sm font-medium" style={{ color: C.amber }}>
              トップページへ戻る
            </Link>
          </div>
        ) : !ready ? (
          <div className="text-sm" style={{ color: C.rose }}>
            リンクの有効期限が切れているか、無効なリンクです。ログイン画面の「パスワードを忘れた方はこちら」からもう一度お試しください。
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="新しいパスワード (6文字以上)"
              className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
              style={{ border: `1px solid ${C.border}`, color: C.text }}
            />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="新しいパスワード (確認)"
              className="bg-transparent outline-none text-sm px-3 py-2 rounded-lg"
              style={{ border: `1px solid ${C.border}`, color: C.text }}
            />
            {status === "error" && (
              <div className="text-xs" style={{ color: C.rose }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={status === "saving"}
              className="self-end px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: C.amber, color: C.bg }}
            >
              {status === "saving" ? "更新中..." : "パスワードを更新する"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
