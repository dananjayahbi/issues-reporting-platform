import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { PollService } from "@/services/PollService";
import { getServerSession } from "@/lib/auth/auth";

export async function POST(
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
    const { optionId } = body;

    if (!optionId) {
      return NextResponse.json({ error: "Option ID is required" }, { status: 400 });
    }

    const result = await PollService.votePoll(id, optionId, session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Vote poll error:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
