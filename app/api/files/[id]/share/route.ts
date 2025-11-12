import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import File from "@/models/File";
import crypto from "crypto";

type RouteParams = { id: string };

export async function POST(_request: NextRequest, context: { params: Promise<RouteParams> }) {

  const { id: fileId } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const file = await File.findOne({ _id: fileId, userId: session.user.id });
  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const shareId = file.shareId || crypto.randomBytes(6).toString("base64url");
  await File.updateOne({ _id: file._id }, { $set: { isPublic: true, shareId } });

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${shareId}`;
  return NextResponse.json({ shareUrl });
}
