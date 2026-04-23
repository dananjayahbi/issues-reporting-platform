import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { IssueService } from "@/services/IssueService";
import { getServerSession } from "@/lib/auth/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const issue = await IssueService.getIssueById(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error("Get issue error:", error);
    return NextResponse.json({ error: "Failed to get issue" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const issue = await IssueService.updateIssue(id, body, session.user.id);
    return NextResponse.json(issue);
  } catch (error) {
    console.error("Update issue error:", error);
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await IssueService.deleteIssue(id, session.user.id);
    return NextResponse.json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("Delete issue error:", error);
    return NextResponse.json({ error: "Failed to delete issue" }, { status: 500 });
  }
}
