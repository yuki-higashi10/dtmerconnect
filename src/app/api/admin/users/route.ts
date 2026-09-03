import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// 管理画面の「登録者一覧」用API。
// メールアドレス(auth.users)はservice role経由でしか取得できないため、
// クライアントから直接は取れず、このサーバー専用ルートを経由する。
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: me } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const offset = Math.max(Number(searchParams.get("offset") ?? "0") || 0, 0);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "20") || 20, 1), 50);

  const admin = createAdminClient();

  // メールアドレス検索用: auth.users側を先に検索して該当IDを集める(検索語がある場合のみ)
  let emailMatchedIds: string[] | null = null;
  if (q) {
    const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    emailMatchedIds =
      authList?.users
        .filter((u) => u.email?.toLowerCase().includes(q.toLowerCase()))
        .map((u) => u.id) ?? [];
  }

  let query = admin
    .from("users")
    .select("id, display_name, avatar_url, total_likes_received, badge_level, created_at, is_admin", {
      count: "exact",
    })
    .eq("is_guest", false)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) {
    if (emailMatchedIds && emailMatchedIds.length > 0) {
      query = query.or(`display_name.ilike.%${q}%,id.in.(${emailMatchedIds.join(",")})`);
    } else {
      query = query.ilike("display_name", `%${q}%`);
    }
  }

  const { data: users, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enriched = await Promise.all(
    (users ?? []).map(async (u) => {
      const [authUserRes, postCountRes] = await Promise.all([
        admin.auth.admin.getUserById(u.id),
        admin.from("posts").select("*", { count: "exact", head: true }).eq("user_id", u.id),
      ]);
      return {
        ...u,
        email: authUserRes.data.user?.email ?? "",
        postCount: postCountRes.count ?? 0,
      };
    }),
  );

  return NextResponse.json({ users: enriched, total: count ?? 0 });
}
