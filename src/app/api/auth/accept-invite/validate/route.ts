import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AuthService } from "@/services/AuthService";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Invite token is required" },
        { status: 400 }
      );
    }

    const result = await AuthService.validateInviteToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || "Invalid invite token" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        email: result.email,
        displayName: result.displayName,
        role: result.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Validate invite token error:", error);
    return NextResponse.json(
      { error: "Failed to validate invite token" },
      { status: 500 }
    );
  }
}
