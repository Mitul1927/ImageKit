import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import File from "@/models/File";

type RouteParams = { id: string };

export async function GET(
  _request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const { id: fileId } = await context.params;
  await connectToDatabase();

  const file = await File.findById(fileId);
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.id === file.userId;
  console.log("SESSION:", JSON.stringify(session, null, 2));
  console.log("FILE owner:", String(file.userId));

  if (!file.isPublic && !isOwner) {
    return NextResponse.json(
      { error: "You are not allowed to access this file" },
      { status: 403 }
    );
  }

  const upstreamResponse = await fetch(file.url);
  if (!upstreamResponse.ok) {
    return NextResponse.json(
      { error: "Failed to fetch file from storage" },
      { status: 502 }
    );
  }

  const headers = new Headers(upstreamResponse.headers);
  headers.set(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(file.name)}"`
  );

  return new NextResponse(upstreamResponse.body, { headers });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: fileId } = await context.params;
  await connectToDatabase();

  const file = await File.findOne({ _id: fileId, userId: session.user.id });
  if (!file) {
    return NextResponse.json(
      { error: "File not found or not owned by user" },
      { status: 404 }
    );
  }

  await File.deleteOne({ _id: fileId });
  return new NextResponse(null, { status: 204 });
}
