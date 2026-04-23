import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type"); // issues, messages, users, all

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const results: {
      issues: unknown[];
      messages: unknown[];
      users: unknown[];
    } = {
      issues: [],
      messages: [],
      users: [],
    };

    // Search issues
    if (!type || type === "all" || type === "issues") {
      results.issues = await prisma.issue.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { body: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          severity: true,
          createdAt: true,
          createdBy: { select: { id: true, name: true } },
        },
      });
    }

    // Search messages
    if (!type || type === "all" || type === "messages") {
      results.messages = await prisma.message.findMany({
        where: {
          body: { contains: query, mode: "insensitive" },
        },
        take: 10,
        select: {
          id: true,
          body: true,
          createdAt: true,
          channel: { select: { id: true, name: true } },
          author: { select: { id: true, name: true } },
        },
      });
    }

    // Search users
    if (!type || type === "all" || type === "users") {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
          isActive: true,
        },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
