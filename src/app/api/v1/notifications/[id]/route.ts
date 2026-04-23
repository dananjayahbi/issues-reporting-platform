import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { NotificationService } from "@/services/NotificationService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const markReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1).optional(),
  all: z.boolean().optional(),
});

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
    const validated = markReadSchema.parse(body);

    // Mark single notification as read
    if (id !== "mark-read" && id !== "mark-all-read") {
      await NotificationService.markAsRead(session.user.id, [id]);
      return NextResponse.json({ success: true, data: { message: "Notification marked as read" } });
    }

    // Mark multiple or all as read
    if (validated.all) {
      await NotificationService.markAllAsRead(session.user.id);
      return NextResponse.json({ success: true, data: { message: "All notifications marked as read" } });
    }

    if (validated.notificationIds && validated.notificationIds.length > 0) {
      await NotificationService.markAsRead(session.user.id, validated.notificationIds);
      return NextResponse.json({ success: true, data: { message: "Notifications marked as read" } });
    }

    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request" } },
      { status: 400 }
    );
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

    console.error("Mark notification read error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to mark notification as read" } },
      { status: 500 }
    );
  }
}
