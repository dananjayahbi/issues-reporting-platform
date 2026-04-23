import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { ChatService } from "@/services/ChatService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateChannelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const channel = await ChatService.getChannelById(id);

    if (!channel) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Channel not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: channel });
  } catch (error) {
    console.error("Get channel error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch channel" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateChannelSchema.parse(body);

    // Build update payload, only including defined properties
    const updates: Record<string, unknown> = {};
    if (validated.name !== undefined) updates.name = validated.name;
    if (validated.description !== undefined) updates.description = validated.description;
    if (validated.avatarUrl !== undefined) updates.avatarUrl = validated.avatarUrl;

    const channel = await ChatService.updateChannel(id, updates, session.user.id);

    return NextResponse.json({ success: true, data: channel });
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

    console.error("Update channel error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update channel" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    await ChatService.deleteChannel(id);

    return NextResponse.json({ success: true, data: { message: "Channel deleted successfully" } });
  } catch (error) {
    console.error("Delete channel error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to delete channel" } },
      { status: 500 }
    );
  }
}
