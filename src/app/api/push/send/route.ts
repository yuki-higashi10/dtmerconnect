import { NextResponse, type NextRequest } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

// Supabaseのnotifications INSERTトリガー(pg_net)から呼び出されるWebhook。
// notification_idを受け取り、対象ユーザーのWeb Push購読先へ通知を送信する。

const NOTIFICATION_TEXT: Record<string, (actorName: string, message: string | null) => string> = {
  like: (actorName) => `${actorName}さんがあなたの投稿にいいねしました`,
  comment: (actorName) => `${actorName}さんがあなたの投稿にコメントしました`,
  follow: (actorName) => `${actorName}さんにフォローされました`,
  mention: (actorName) => `${actorName}さんがあなたをメンションしました`,
  announcement: (_actorName, message) => message ?? "運営からのお知らせ",
};

function isConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT,
  );
}

export async function POST(request: NextRequest) {
  const secret = process.env.PUSH_WEBHOOK_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isConfigured()) {
    // VAPIDキー未設定の環境ではプッシュ送信をスキップする(アプリ本体の動作は妨げない)
    return NextResponse.json({ skipped: true });
  }

  const { notification_id: notificationId } = await request.json().catch(() => ({}));
  if (!notificationId) {
    return NextResponse.json({ error: "notification_id is required" }, { status: 400 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const admin = createAdminClient();

  const { data: notification, error } = await admin
    .from("notifications")
    .select("id, type, post_id, message, recipient_id, actor:users!actor_id(display_name)")
    .eq("id", notificationId)
    .single();

  if (error || !notification) {
    return NextResponse.json({ error: "notification not found" }, { status: 404 });
  }

  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", notification.recipient_id);

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const actorName = (notification.actor as unknown as { display_name?: string } | null)?.display_name ?? "誰か";
  const body = NOTIFICATION_TEXT[notification.type]?.(actorName, notification.message) ?? "新しい通知があります";
  const url = notification.post_id ? `/posts/${notification.post_id}` : "/";

  const payload = JSON.stringify({
    title: "DTMer Connect",
    body,
    url,
  });

  let sent = 0;
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
        sent += 1;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }),
  );

  return NextResponse.json({ sent });
}
