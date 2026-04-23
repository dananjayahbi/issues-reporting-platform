import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { ChatService } from "@/services/ChatService";
import type { SendMessagePayload } from "@/types/chat.types";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/utils/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const sendMessageSchema = z.object({
  body: z.string().min(1, "Message body is required").max(4000),
  replyToId: z.string().optional(),
  mentions: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id: channelId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE)), MAX_PAGE_SIZE);
    
    const options: Record<string, unknown> = { page, pageSize };
    if (searchParams.get("before")) {
      options.before = searchParams.get("before");
    }

    const result = await ChatService.getMessages(channelId, options);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch messages" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id: channelId } = await params;
    const body = await request.json();
    const validated = sendMessageSchema.parse(body);

    const payload = {
      channelId,
      body: validated.body,
      ...(validated.replyToId && { replyToId: validated.replyToId }),
    } as unknown as SendMessagePayload;

    const message = await ChatService.sendMessage(payload, session.user.id);

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid message data",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    console.error("Send message error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to send message" } },
      { status: 500 }
    );
  }
}
