import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { ReportService } from "@/services/ReportService";
import { DEFAULT_PAGE_SIZE as _DEFAULT_PAGE_SIZE } from "@/lib/utils/constants";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "csv").toLowerCase() as "pdf" | "csv" | "xlsx";

    // Build filters from search params - only include non-empty values
    const filters: Record<string, unknown> = {};
    const status = searchParams.get("status");
    if (status) filters.status = status;
    const severity = searchParams.get("severity");
    if (severity) filters.severity = severity;
    const priority = searchParams.get("priority");
    if (priority) filters.priority = priority;
    const category = searchParams.get("category");
    if (category) filters.category = category;

    // Currently only CSV export is implemented
    if (format !== "csv") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_IMPLEMENTED", message: `${format.toUpperCase()} export is not yet implemented. Please use CSV format.` } },
        { status: 501 }
      );
    }

    const csvData = await ReportService.exportIssuesAsCsv(filters);

    const timestamp = new Date().toISOString().split("T")[0];
    const contentType = "text/csv";
    const extension = ".csv";

    return new NextResponse(csvData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="issues-export-${timestamp}${extension}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export issues error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to export issues" } },
      { status: 500 }
    );
  }
}
