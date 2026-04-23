import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { PollService } from "@/services/PollService";
import { prisma } from "@/lib/db/prisma";
import type { CreatePollPayload } from "@/types/poll.types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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
    const poll = await prisma.poll.findFirst({
      where: { issueId },
    });

    if (!poll) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "No poll attached to this issue" } },
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

const attachPollSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string().min(1)).min(2, "At least 2 options required"),
  pollType: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE"]).default("SINGLE_CHOICE"),
  isAnonymous: z.boolean().optional().default(false),
  allowChangeVote: z.boolean().optional().default(true),
  expiresAt: z.string().datetime().optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id: issueId } = await params;
    const body = await request.json();
    const validated = attachPollSchema.parse(body);

    const payload = {
      title: validated.question,
      question: validated.question,
      options: validated.options,
      pollType: validated.pollType,
      isAnonymous: validated.isAnonymous,
      allowChangeVote: validated.allowChangeVote,
      issueId: issueId,
      ...(validated.expiresAt && { expiresAt: validated.expiresAt }),
    } as unknown as CreatePollPayload;

    const poll = await PollService.createPoll(payload, session.user.id);

    return NextResponse.json({ success: true, data: poll }, { status: 201 });
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

    console.error("Attach poll error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to attach poll" } },
      { status: 500 }
    );
  }
}
