import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { ChatService } from "@/services/ChatService";
import { getServerSession } from "@/lib/auth/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const options: Record<string, unknown> = {
      pageSize: parseInt(searchParams.get("pageSize") || "50"),
    };
    if (searchParams.get("before")) {
      options.before = searchParams.get("before");
    }

    const messages = await ChatService.getMessages(id, options);
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: _id } = await params;
    const body = await request.json();
    const message = await ChatService.sendMessage(body, session.user.id ?? "");
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
