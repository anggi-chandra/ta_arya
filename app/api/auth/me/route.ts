import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ roles: [] }, { status: 200 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "SUPABASE env tidak lengkap", roles: [] },
        { status: 500 }
      );
    }

    const supabase = createClient(url, serviceKey);
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", token.sub);

    if (error) {
      return NextResponse.json({ error: error.message, roles: [] }, { status: 500 });
    }

    const roles = (data || []).map((r: any) => r.role);
    return NextResponse.json({ roles }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Tidak dapat memproses", roles: [] }, { status: 500 });
  }
}