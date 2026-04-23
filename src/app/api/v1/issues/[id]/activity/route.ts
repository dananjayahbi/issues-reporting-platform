import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { IssueService } from "@/services/IssueService";

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

    const { id: issueId } = await params;
    const activity = await IssueService.getIssueActivity(issueId);

    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    console.error("Get activity error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch activity" } },
      { status: 500 }
    );
  }
}
