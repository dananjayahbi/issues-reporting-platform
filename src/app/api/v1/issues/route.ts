import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { IssueService } from "@/services/IssueService";
import { createIssueSchema } from "@/schemas/issue.schema";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/utils/constants";
import type { CreateIssuePayload } from "@/services/IssueService";

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
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDir = searchParams.get("sortDir") || "desc";

    // Build filters, only including defined values
    const filters: Record<string, unknown> = {};
    const status = searchParams.get("status");
    if (status) filters.status = [status];
    const severity = searchParams.get("severity");
    if (severity) filters.severity = [severity];

    const result = await IssueService.listIssues(filters, {
      page,
      pageSize,
      sortBy,
      sortDir: sortDir as "asc" | "desc",
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("List issues error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch issues" } },
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
    const validated = createIssueSchema.parse(body);

    // Build create payload, only including defined properties
    const payload: Record<string, unknown> = {};
    if (validated.title !== undefined) payload.title = validated.title;
    if (validated.body !== undefined) payload.body = validated.body;
    if (validated.severity !== undefined) payload.severity = validated.severity;
    if (validated.priority !== undefined) payload.priority = validated.priority;
    if (validated.category !== undefined) payload.category = validated.category;
    if (validated.assigneeIds !== undefined) payload.assigneeIds = validated.assigneeIds;

    const issue = await IssueService.createIssue(payload as unknown as CreateIssuePayload, session.user.id);

    return NextResponse.json(
      { success: true, data: issue },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid issue data",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    console.error("Create issue error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create issue" } },
      { status: 500 }
    );
  }
}
