import { NextRequest, NextResponse } from "next/server";
import { createChatMessage } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = process.env.CHAT_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Bot endpoint disabled" }, { status: 403 });
  }

  const auth = req.headers.get("authorization");
  if (!auth || auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, message } = body;
    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "name and message required" }, { status: 400 });
    }
    const msg = createChatMessage(name.trim(), message.trim(), true);
    return NextResponse.json({ message: msg }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
