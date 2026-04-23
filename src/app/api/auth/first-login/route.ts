import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { AuthService } from "@/services/AuthService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newPassword, confirmPassword } = body;

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Passwords are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const result = await AuthService.changePassword(session.user.email, newPassword, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to change password" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("First login password change error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
