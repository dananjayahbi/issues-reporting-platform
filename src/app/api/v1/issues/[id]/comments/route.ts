import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { CommentService } from "@/services/CommentService";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/utils/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const createCommentSchema = z.object({
  body: z.string().min(1, "Comment body is required"),
  parentId: z.string().optional(),
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE)), MAX_PAGE_SIZE);
    const skip = (page - 1) * pageSize;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { issueId },
        include: { author: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.comment.count({ where: { issueId } }),
    ]);

    return NextResponse.json({ success: true, data: { items: comments, total, page, pageSize } });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch comments" } },
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

    const { id: issueId } = await params;
    const body = await request.json();
    const validated = createCommentSchema.parse(body);

    const commentData: { body: string; parentId?: string } = { body: validated.body };
    if (validated.parentId !== undefined) {
      commentData.parentId = validated.parentId;
    }

    const comment = await CommentService.createComment(issueId, commentData, session.user.id);

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid comment data",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    console.error("Create comment error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create comment" } },
      { status: 500 }
    );
  }
}
