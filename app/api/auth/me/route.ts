import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getSupabaseClient } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    // Ensure we have a valid user id and a string access token
    const hasUserId = !!token?.sub;
    const supabaseToken = typeof token?.supabaseAccessToken === "string" ? token!.supabaseAccessToken : "";
    if (!hasUserId || !supabaseToken) {
      return NextResponse.json({ roles: [] }, { status: 200 });
    }

    const supabase = getSupabaseClient(supabaseToken);
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", token!.sub);

    if (error) {
      return NextResponse.json({ error: error.message, roles: [] }, { status: 500 });
    }

    const roles = (data || []).map((r: any) => r.role);
    return NextResponse.json({ roles }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Tidak dapat memproses", roles: [] }, { status: 500 });
  }
}