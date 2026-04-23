import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { ChatService } from "@/services/ChatService";
import { getServerSession } from "@/lib/auth/auth";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const channels = await ChatService.listChannels(session.user.id ?? "", {});
    return NextResponse.json(channels);
  } catch (error) {
    console.error("List channels error:", error);
    return NextResponse.json({ error: "Failed to list channels" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const channel = await ChatService.createChannel(body, session.user.id ?? "");
    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error("Create channel error:", error);
    return NextResponse.json({ error: "Failed to create channel" }, { status: 500 });
  }
}
