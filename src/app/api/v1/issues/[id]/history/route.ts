import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { IssueService } from "@/services/IssueService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const restoreVersionSchema = z.object({
  versionId: z.string().min(1, "Version ID is required"),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id: issueId } = await params;
    const versions = await IssueService.getIssueVersions(issueId);

    return NextResponse.json({ success: true, data: versions });
  } catch (error) {
    console.error("Get versions error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch versions" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id: _issueId } = await params;
    const body = await request.json();
    const _validated = restoreVersionSchema.parse(body);

    // TODO: Implement version restoration
    return NextResponse.json(
      { success: false, error: { code: "NOT_IMPLEMENTED", message: "Version restoration is not yet implemented" } },
      { status: 501 }
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

    console.error("Restore version error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to restore version" } },
      { status: 500 }
    );
  }
}
