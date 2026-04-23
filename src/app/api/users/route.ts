import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { UserService } from "@/services/UserService";
import { getServerSession } from "@/lib/auth/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters: Record<string, unknown> = {
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("limit") || "20"),
    };
    if (searchParams.get("role")) filters.role = searchParams.get("role");
    if (searchParams.get("isActive") === "true") filters.isActive = true;
    if (searchParams.get("search")) filters.search = searchParams.get("search");

    const result = await UserService.listUsers(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }
}
