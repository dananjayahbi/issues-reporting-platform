import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { UserService } from "@/services/UserService";
import { USER_ROLES } from "@/lib/utils/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateUserSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  phone: z.string().max(20).optional(),
  department: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
});

const updateRoleSchema = z.object({
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.VIEWER]),
});

const deactivateSchema = z.object({
  reason: z.string().max(500).optional(),
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
    const user = await UserService.getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch user" } },
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

    // Users can update their own profile, admins can update any profile
    const isSelf = session.user.id === id;
    
    // Fetch current user to check role
    const currentUser = await UserService.getUserById(session.user.id ?? "");
    const isAdmin = currentUser && (currentUser.role === USER_ROLES.ADMIN || currentUser.role === USER_ROLES.SUPER_ADMIN);

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You can only update your own profile" } },
        { status: 403 }
      );
    }

    // Only admins can change roles
    if (body.role && !isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only admins can change user roles" } },
        { status: 403 }
      );
    }

    let user;
    if (body.role) {
      const validatedRole = updateRoleSchema.parse({ role: body.role });
      user = await UserService.updateUserRole(id, validatedRole.role, session.user.id ?? "");
    } else {
      const validated = updateUserSchema.parse(body);
      // Filter out undefined values
      const updatePayload: Record<string, unknown> = {};
      Object.entries(validated).forEach(([key, value]) => {
        if (value !== undefined) updatePayload[key] = value;
      });
      user = await UserService.updateUser(id, updatePayload, session.user.id ?? "");
    }

    return NextResponse.json({ success: true, data: user });
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

    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update user" } },
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

    // Only admins can deactivate users
    const currentUser = await UserService.getUserById(session.user.id ?? "");
    if (!currentUser || (currentUser.role !== USER_ROLES.ADMIN && currentUser.role !== USER_ROLES.SUPER_ADMIN)) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only admins can deactivate users" } },
        { status: 403 }
      );
    }

    // Cannot deactivate yourself
    if (session.user.id === (await params).id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You cannot deactivate your own account" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const validated = deactivateSchema.parse(body);

    await UserService.deactivateUser(id, validated.reason, session.user.id);

    return NextResponse.json({ success: true, data: { message: "User deactivated successfully" } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    console.error("Deactivate user error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to deactivate user" } },
      { status: 500 }
    );
  }
}
