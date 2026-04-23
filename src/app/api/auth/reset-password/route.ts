import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { AuthService } from "@/services/AuthService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword, confirmPassword } = body;

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Token, new password, and confirm password are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const result = await AuthService.resetPassword(token, newPassword);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to reset password" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
