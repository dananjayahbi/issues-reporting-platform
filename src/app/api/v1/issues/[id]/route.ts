import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { IssueService } from "@/services/IssueService";
import { updateIssueSchema } from "@/schemas/issue.schema";

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

    const { id } = await params;
    const issue = await IssueService.getIssueById(id);

    if (!issue) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Issue not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: issue });
  } catch (error) {
    console.error("Get issue error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch issue" } },
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
    const validated = updateIssueSchema.parse(body);

    // Build update object, only including defined properties
    const updates: Record<string, unknown> = {};
    if (validated.title !== undefined) updates.title = validated.title;
    if (validated.body !== undefined) updates.body = validated.body;
    if (validated.status !== undefined) updates.status = validated.status;
    if (validated.severity !== undefined) updates.severity = validated.severity;
    if (validated.priority !== undefined) updates.priority = validated.priority;
    if (validated.category !== undefined) updates.category = validated.category;
    if (validated.assigneeIds !== undefined) updates.assigneeIds = validated.assigneeIds;

    const issue = await IssueService.updateIssue(id, updates, session.user.id);

    return NextResponse.json({ success: true, data: issue });
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

    console.error("Update issue error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update issue" } },
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
    await IssueService.deleteIssue(id, session.user.id ?? "");

    return NextResponse.json({ success: true, data: { message: "Issue deleted successfully" } });
  } catch (error) {
    console.error("Delete issue error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to delete issue" } },
      { status: 500 }
    );
  }
}
