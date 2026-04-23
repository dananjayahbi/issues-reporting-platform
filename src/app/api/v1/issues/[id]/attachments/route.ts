import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id: _issueId } = await params;
    
    // TODO: Implement issue attachments retrieval
    return NextResponse.json({ success: true, data: { items: [], total: 0 } });
  } catch (error) {
    console.error("Get attachments error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch attachments" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id: issueId } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "No file provided" } },
        { status: 400 }
      );
    }

    // TODO: Implement attachment upload
    return NextResponse.json(
      { success: true, data: { id: "", issueId, fileName: file.name, uploadedBy: session.user.id, createdAt: new Date() } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload attachment error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to upload attachment" } },
      { status: 500 }
    );
  }
}
