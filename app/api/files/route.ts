import { NextRequest, NextResponse } from "next/server";
import File from "@/models/File";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const files = await File.find({ userId: session.user.id }).sort({ createdAt: -1 });
    const plain = files.map(f => ({
      id: String(f._id),
      name: f.name, url: f.url, size: f.size, fileExtension: f.fileExtension,
      thumbnailUrl: f.thumbnailUrl, uploadedAt: f.createdAt, type: f.fileType
    }));
    return NextResponse.json(plain, { status: 200 });
  } catch (err) {
    console.error("Error fetching files:", err);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { name, url, size, fileType, fileExtension, thumbnailUrl } = await req.json();
    const userId = session.user.id;

    if (!["video", "image", "document"].includes(fileType)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Check tier from database to ensure accuracy
    const user = await User.findById(userId);
    const tier = user?.tier || "free";
    const limit = tier === "free" ? 2 : 100;

    const userFilesCount = await File.countDocuments({ userId });
    if (userFilesCount >= limit) {
      return NextResponse.json(
        {
          error: `Upload limit reached for ${tier} users. (Limit: ${limit} files)`,
          tier,
          currentCount: userFilesCount,
        },
        { status: 403 }
      );
    }

    const newFile = new File({
      userId,
      name,
      url,
      size,
      fileType,
      fileExtension,
      thumbnailUrl,
      isPublic:true
    });

    await newFile.save();
    return NextResponse.json(
      { message: "File uploaded successfully", file: newFile },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error uploading file:", err);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
