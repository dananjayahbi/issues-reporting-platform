import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AuthService } from "@/services/AuthService";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 }
      );
    }

    const userId = await AuthService.validatePasswordResetToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: "This reset link has expired or is invalid" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Validate reset password token error:", error);
    return NextResponse.json(
      { error: "Failed to validate reset token" },
      { status: 500 }
    );
  }
}
