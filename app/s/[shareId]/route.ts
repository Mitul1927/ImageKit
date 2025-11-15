import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import File from "@/models/File";

type RouteParams = { shareId: string };

export async function GET(request: Request, context: { params: Promise<RouteParams> }) {
  try {
    const { shareId } = await context.params;

    if (!shareId) {
      console.error("GET /s/[shareId]: missing shareId");
      return NextResponse.redirect("/404");
    }

    await connectToDatabase();

    const file = await File.findOne({ shareId, isPublic: true });
    if (!file) {
      return NextResponse.redirect("/404");
    }
    const downloadUrl = new URL(`/api/files/${file._id}`, request.url);

    return NextResponse.redirect(downloadUrl);
  } catch (err) {
    console.error("GET /s/[shareId] error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
