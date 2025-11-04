import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient, createAdminUser } from "@/lib/auth";

// Secure admin seeding route: POST /api/admin/create-admin
// Body: { email?: string, userId?: string, token?: string, grantedBy?: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, userId, token, grantedBy } = body || {};

    // Basic protection: require token in production
    const seedToken = process.env.ADMIN_SEED_TOKEN;
    const isProd = process.env.NODE_ENV === "production";
    if (isProd && (!seedToken || token !== seedToken)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!email && !userId) {
      return NextResponse.json(
        { error: "Provide 'email' or 'userId' in request body" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    let targetUserId = userId as string | undefined;

    if (!targetUserId && email) {
      // Use admin API to find user by email
      const listRes = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (listRes.error) {
        return NextResponse.json({ error: listRes.error.message }, { status: 500 });
      }
      const match = listRes.data.users.find((u: any) => u.email?.toLowerCase() === String(email).toLowerCase());
      if (!match) {
        return NextResponse.json(
          { error: `User with email '${email}' not found` },
          { status: 404 }
        );
      }
      targetUserId = match.id;
    }

    // Create admin role record
    const roleRow = await createAdminUser(targetUserId!, grantedBy);

    return NextResponse.json({ success: true, data: roleRow }, { status: 200 });
  } catch (err: any) {
    console.error("create-admin route error:", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}