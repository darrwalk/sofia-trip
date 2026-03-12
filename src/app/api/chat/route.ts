import { NextRequest, NextResponse } from "next/server";
import { getChatMessages, createChatMessage } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const since = req.nextUrl.searchParams.get("since") || undefined;
  const messages = getChatMessages(since);
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, message } = body;
    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "name and message required" }, { status: 400 });
    }
    const msg = createChatMessage(name.trim(), message.trim(), false);
    return NextResponse.json({ message: msg }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
