import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { ChatService } from "@/services/ChatService";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/utils/constants";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

const sendDmSchema = z.object({
  body: z.string().min(1, "Message body is required").max(4000),
});

async function getOrCreateDmChannel(userId1: string, userId2: string) {
  // Find or create direct message channel
  const channel = await prisma.channel.findFirst({
    where: {
      type: "DIRECT",
      AND: [
        { members: { some: { id: userId1 } } },
        { members: { some: { id: userId2 } } },
      ],
    },
  });

  if (channel) return channel;

  return prisma.channel.create({
    data: {
      name: `DM-${userId1}-${userId2}`,
      type: "DIRECT",
      createdById: userId1,
      members: {
        create: [
          { userId: userId1 },
          { userId: userId2 },
        ],
      },
    },
  });
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE)), MAX_PAGE_SIZE);

    const channel = await getOrCreateDmChannel(session.user.id, userId);
    const result = await ChatService.getMessages(channel.id, { page, pageSize });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Get DM messages error:", error);
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

    const { userId } = await params;
    const body = await request.json();
    const validated = sendDmSchema.parse(body);

    const channel = await getOrCreateDmChannel(session.user.id, userId);
    const message = await ChatService.sendMessage(
      { channelId: channel.id, body: validated.body },
      session.user.id
    );

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

    console.error("Send DM error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to send message" } },
      { status: 500 }
    );
  }
}
