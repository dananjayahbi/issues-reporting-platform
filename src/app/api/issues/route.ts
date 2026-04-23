import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { IssueService } from "@/services/IssueService";
import { getServerSession } from "@/lib/auth/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters: Record<string, unknown> = {};
    
    if (searchParams.get("status")) filters.status = [searchParams.get("status")];
    if (searchParams.get("severity")) filters.severity = [searchParams.get("severity")];
    if (searchParams.get("priority")) filters.priority = [searchParams.get("priority")];
    if (searchParams.get("category")) filters.category = [searchParams.get("category")];
    if (searchParams.get("assigneeId")) filters.assigneeIds = [searchParams.get("assigneeId")];
    if (searchParams.get("reporterId")) filters.reporterId = searchParams.get("reporterId");
    if (searchParams.get("search")) filters.search = searchParams.get("search");

    const result = await IssueService.listIssues(filters, {
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("limit") || "20"),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("List issues error:", error);
    return NextResponse.json({ error: "Failed to list issues" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const issue = await IssueService.createIssue(body, session.user.id);
    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error("Create issue error:", error);
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 });
  }
}
