import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { AuditService } from "@/services/AuditService";
import { USER_ROLES } from "@/lib/utils/constants";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/utils/constants";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    // Only Super Admins can view audit logs
    if (((session.user as Record<string, unknown>)?.role as string) !== USER_ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only Super Admins can view audit logs" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE)), MAX_PAGE_SIZE);
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const result = await AuditService.getAuditLog({
      ...(action ? { action: [action] } : {}),
      ...(userId ? { userId } : {}),
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    }, {
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch audit logs" } },
      { status: 500 }
    );
  }
}
