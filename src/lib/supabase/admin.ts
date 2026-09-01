import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// service role keyを使うサーバー専用クライアント。RLSを無視して全テーブルへアクセスできるため、
// APIルートなど信頼できるサーバーサイドコードからのみ使用すること(クライアントに公開しない)。
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
