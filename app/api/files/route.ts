// app/api/files/route.ts
import { NextRequest, NextResponse } from "next/server";
import File from "@/models/File";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {connectToDatabase} from "@/lib/db";

export async function GET(req: NextRequest) {
  // Get session
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const userId = session.user.id;
  try {
    const files = await File.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(files);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Get session
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const userId = session.user.id;
  const { name, url, size, fileType, fileExtension, thumbnailUrl } = await req.json();

  // Validate fileType
  if (!["video", "image", "document"].includes(fileType)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  // Check user's tier and limits
  const userFilesCount = await File.countDocuments({ userId });
  const userTier = session.user.tier || "free";
  const limit = userTier === "free" ? 2 : 100;

  if (userFilesCount >= limit) {
    return NextResponse.json(
      { error: `Upload limit reached. Max ${limit} files for ${userTier} users.` },
      { status: 403 }
    );
  }

  try {
    const newFile = new File({
      userId,
      name,
      url,
      size,
      fileType,
      fileExtension,
      thumbnailUrl,
    });

    await newFile.save();
    return NextResponse.json(newFile);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
