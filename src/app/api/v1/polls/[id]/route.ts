import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { PollService } from "@/services/PollService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updatePollSchema = z.object({
  question: z.string().min(1).max(500).optional(),
  options: z.array(z.string().min(1)).min(2).max(10).optional(),
  isAnonymous: z.boolean().optional(),
  allowChangeVote: z.boolean().optional(),
  minParticipation: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

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
    const poll = await PollService.getPollById(id, session.user.id);

    if (!poll) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Poll not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: poll });
  } catch (error) {
    console.error("Get poll error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch poll" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const validated = updatePollSchema.parse(body);

    // Filter out undefined/null values for update payload
    const updateData: Record<string, unknown> = {};
    if (validated.question !== undefined) updateData.question = validated.question;
    if (validated.options !== undefined) updateData.options = validated.options;
    if (validated.expiresAt !== undefined) updateData.expiresAt = validated.expiresAt;
    if (validated.isAnonymous !== undefined) updateData.isAnonymous = validated.isAnonymous;
    if (validated.allowChangeVote !== undefined) updateData.allowChangeVote = validated.allowChangeVote;
    if (validated.minParticipation !== undefined) updateData.minParticipation = validated.minParticipation;

    const poll = await PollService.updatePoll(id, updateData, session.user.id ?? "");

    return NextResponse.json({ success: true, data: poll });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid poll data",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    console.error("Update poll error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update poll" } },
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
    await PollService.deletePoll(id, session.user.id ?? "");

    return NextResponse.json({ success: true, data: { message: "Poll deleted successfully" } });
  } catch (error) {
    console.error("Delete poll error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to delete poll" } },
      { status: 500 }
    );
  }
}
