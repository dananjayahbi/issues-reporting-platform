import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { ChatService } from "@/services/ChatService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id: channelId } = await params;
    const channel = await ChatService.getChannelById(channelId);

    return NextResponse.json({ success: true, data: channel?.members || [] });
  } catch (error) {
    console.error("Get members error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch members" } },
      { status: 500 }
    );
  }
}

const addMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

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
    const validated = addMemberSchema.parse(body);

    const member = await ChatService.addMember(channelId, validated.userId, session.user.id);

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    console.error("Add member error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to add member" } },
      { status: 500 }
    );
  }
}

const removeMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const validated = removeMemberSchema.parse(body);

    await ChatService.removeMember(channelId, validated.userId, session.user.id);

    return NextResponse.json({ success: true, data: { message: "Member removed successfully" } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    console.error("Remove member error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to remove member" } },
      { status: 500 }
    );
  }
}
