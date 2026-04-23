import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { ReportService } from "@/services/ReportService";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await ReportService.getDashboardStats(session.user.id ?? "");
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to get dashboard stats" }, { status: 500 });
  }
}
