import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { ChatService } from "@/services/ChatService";
import type { CreateChannelPayload } from "@/types/chat.types";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, CHANNEL_TYPES } from "@/lib/utils/constants";

const createChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required").max(100),
  description: z.string().max(500).optional(),
  type: z.enum([CHANNEL_TYPES.GENERAL, CHANNEL_TYPES.ISSUE_LINKED, CHANNEL_TYPES.DIRECT, CHANNEL_TYPES.GROUP]).default(CHANNEL_TYPES.GENERAL),
  memberIds: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE)), MAX_PAGE_SIZE);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const result = await ChatService.listChannels(session.user.id ?? "", {
      ...(type ? { type } : {}),
      ...(search ? { search } : {}),
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("List channels error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch channels" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createChannelSchema.parse(body);

    const payload = {
      name: validated.name,
      type: validated.type,
      ...(validated.description && { description: validated.description }),
      ...(validated.memberIds && { memberIds: validated.memberIds }),
    } as unknown as CreateChannelPayload;

    const channel = await ChatService.createChannel(payload, session.user.id ?? "");

    return NextResponse.json({ success: true, data: channel }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid channel data",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    console.error("Create channel error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create channel" } },
      { status: 500 }
    );
  }
}
