import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
  try {
    const { title = "Info", message = "" } = await request.json();
    const payload = {
      title,
      message,
      timestamp: Date.now(),
    };

    await pusherServer.trigger("notifications", "new-notification", payload);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}