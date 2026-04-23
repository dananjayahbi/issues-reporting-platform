import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { SearchService } from "@/lib/search/client";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/utils/constants";

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
    const query = searchParams.get("q") || searchParams.get("query");
    const types = searchParams.get("types")?.split(",").filter(Boolean);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE)), MAX_PAGE_SIZE);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const userId = searchParams.get("userId");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Search query must be at least 2 characters" } },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const searchParams_obj = {
      query: query.trim(),
      page,
      pageSize,
      ...(types && { types: types as ("issue" | "comment" | "user" | "message" | "channel")[] }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      ...(userId && { userId }),
    };

    const results = await SearchService.search(searchParams_obj);

    const took = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        results,
        total: results.length,
        query: query.trim(),
        filters: { types, dateFrom, dateTo, userId },
        took,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to perform search" } },
      { status: 500 }
    );
  }
}
