import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { IVideo } from "@/models/Video";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const videos = await Video.find({}).sort({ createdAt: -1 }).lean<IVideo[]>();

    // Transform the data to match our FileItem interface
    const files = videos.map((video) => ({
      id: video._id?.toString() || "",
      name: video.title,
      url: video.videoUrl,
      size: video.size || 0, // Use stored size or default to 0
      type: video.fileType || "video", // Use stored file type or default to video
      uploadedAt: video.createdAt?.toISOString()  ?? new Date().toISOString(),
      thumbnailUrl: video.thumbnailUrl,
      fileExtension:
        video.fileExtension || video.title.split(".").pop() || "mp4",
    }));

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    // Create a new video/file record
    const newFile = await Video.create({
      title: body.name || "Untitled File",
      description: body.description || "Uploaded file",
      videoUrl: body.url,
      thumbnailUrl: body.thumbnailUrl || body.url,
      controls: true,
      transformation: {
        height: 1920,
        width: 1080,
        quality: 100,
      },
      // Store additional metadata
      size: body.size || 0,
      fileType: body.fileType || "document",
      fileExtension: body.fileExtension || "unknown",
    });

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json(
      { error: "Failed to create file" },
      { status: 500 }
    );
  }
}
