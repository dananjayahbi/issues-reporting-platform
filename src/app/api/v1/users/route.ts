import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { UserService } from "@/services/UserService";
import { AuthService } from "@/services/AuthService";
import EmailClient from "@/lib/email/client";
import { inviteUserSchema } from "@/schemas/auth.schema";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, type UserRole, USER_ROLES } from "@/lib/utils/constants";

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
    const search = searchParams.get("search") ?? undefined;
    const role = (searchParams.get("role") as UserRole | null) ?? undefined;
    const isActive = searchParams.get("isActive");

    const listParams: Record<string, unknown> = {
      page,
      pageSize,
    };
    if (search) listParams.search = search;
    if (role) listParams.role = role;
    if (isActive === "true") listParams.isActive = true;
    if (isActive === "false") listParams.isActive = false;

    const result = await UserService.listUsers(listParams);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch users" } },
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

    // Only admins can invite users
    const currentUser = await UserService.getUserById(session.user.id ?? "");
    if (!currentUser || (currentUser.role !== USER_ROLES.ADMIN && currentUser.role !== USER_ROLES.SUPER_ADMIN)) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only admins can invite users" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = inviteUserSchema.parse(body);

    // Create invite token and send email
    const token = await AuthService.createInviteToken(
      validated.email,
      validated.displayName,
      validated.role,
      session.user.id ?? ""
    );
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invite?token=${token}`;
    
    await EmailClient.sendInviteEmail(
      validated.email,
      inviteLink,
      currentUser?.name || "Admin"
    );

    return NextResponse.json(
      { success: true, data: { message: "Invite sent successfully", email: validated.email } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid user data",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    console.error("Invite user error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to invite user" } },
      { status: 500 }
    );
  }
}
