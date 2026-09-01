import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";

const MAX_LENGTH = 5000;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 320) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_LENGTH) : "";

  if (!email || !isValidEmail(email) || !message) {
    return NextResponse.json({ error: "email and message are required" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !toEmail) {
    return NextResponse.json({ error: "contact form is not configured" }, { status: 503 });
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "DTMer Connect <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: email,
    subject: `【DTMer Connect】お問い合わせ${name ? `(${name}様)` : ""}`,
    text: `お名前: ${name || "(未入力)"}\nメールアドレス: ${email}\n\nお問い合わせ内容:\n${message}`,
  });

  if (error) {
    return NextResponse.json({ error: "failed to send" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
