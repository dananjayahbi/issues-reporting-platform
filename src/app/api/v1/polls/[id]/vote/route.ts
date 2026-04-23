import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { PollService } from "@/services/PollService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const voteSchema = z.object({
  optionIds: z.array(z.string()).min(1, "At least one option must be selected"),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = voteSchema.parse(body);

    const result = await PollService.votePoll(id, { optionIds: validated.optionIds }, session.user.id ?? "");

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid vote data",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    console.error("Vote error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to record vote" } },
      { status: 500 }
    );
  }
}
