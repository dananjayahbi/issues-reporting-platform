import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { NotificationService } from "@/services/NotificationService";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/utils/constants";

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
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const result = await NotificationService.getNotifications(session.user.id, {
      page,
      pageSize,
      unreadOnly,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch notifications" } },
      { status: 500 }
    );
  }
}
