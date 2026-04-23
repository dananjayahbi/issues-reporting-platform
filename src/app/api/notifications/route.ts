import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { NotificationService } from "@/services/NotificationService";
import { getServerSession } from "@/lib/auth/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const options = {
      unreadOnly: searchParams.get("unreadOnly") === "true",
      limit: parseInt(searchParams.get("limit") || "50"),
    };

    const notifications = await NotificationService.getNotifications(session.user.id, options);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Failed to get notifications" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, all } = body;

    if (all) {
      await NotificationService.markAllAsRead(session.user.id ?? "");
    } else if (notificationId) {
      await NotificationService.markAsRead(session.user.id ?? "", [notificationId]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
