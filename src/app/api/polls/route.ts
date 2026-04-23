import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { PollService } from "@/services/PollService";
import { getServerSession } from "@/lib/auth/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters: Record<string, unknown> = {
      status: (searchParams.get("status") as "active" | "expired" | "closed" | "all") || "active",
    };
    if (searchParams.get("createdBy")) {
      filters.createdBy = searchParams.get("createdBy");
    }

    const polls = await PollService.listPolls(filters);
    return NextResponse.json(polls);
  } catch (error) {
    console.error("List polls error:", error);
    return NextResponse.json({ error: "Failed to list polls" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const poll = await PollService.createPoll(body, session.user.id);
    return NextResponse.json(poll, { status: 201 });
  } catch (error) {
    console.error("Create poll error:", error);
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 });
  }
}
