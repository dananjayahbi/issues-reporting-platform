import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthService } from "@/services/AuthService";
import { acceptInviteSchema } from "@/schemas/auth.schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = acceptInviteSchema.parse(body);

    const result = await AuthService.acceptInvite(
      validated.token,
      validated.displayName,
      validated.password
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to accept invite" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, userId: result.userId },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid invite data",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error("Accept invite error:", error);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 }
    );
  }
}
