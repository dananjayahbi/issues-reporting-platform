import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { PollService } from "@/services/PollService";
import type { CreatePollPayload } from "@/types/poll.types";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/utils/constants";

const createPollSchema = z.object({
  question: z.string().min(1, "Question is required").max(500),
  options: z.array(z.string().min(1)).min(2, "At least 2 options required").max(10),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "RATING", "YES_NO"]).default("SINGLE_CHOICE"),
  isAnonymous: z.boolean().optional().default(false),
  allowChangeVote: z.boolean().optional().default(true),
  minParticipation: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  channelId: z.string().optional(),
  issueId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE)), MAX_PAGE_SIZE);
    const includeClosed = searchParams.get("includeClosed") === "true";

    const listParams: Record<string, unknown> = {
      page,
      pageSize,
      includeClosed,
    };
    if (searchParams.get("channelId")) {
      listParams.channelId = searchParams.get("channelId");
    }

    const result = await PollService.listPolls(listParams);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("List polls error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch polls" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createPollSchema.parse(body);

    const pollPayload = {
      title: validated.question.substring(0, 100),
      question: validated.question,
      options: validated.options,
      pollType: validated.type,
      isAnonymous: validated.isAnonymous,
      allowChangeVote: validated.allowChangeVote,
      channelId: validated.channelId,
      issueId: validated.issueId,
      ...(validated.minParticipation && { minParticipation: validated.minParticipation }),
      ...(validated.expiresAt && { expiresAt: validated.expiresAt }),
    } as unknown as CreatePollPayload;

    const poll = await PollService.createPoll(pollPayload, session.user.id ?? "");

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

    console.error("Create poll error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create poll" } },
      { status: 500 }
    );
  }
}
