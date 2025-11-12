// app/s/[shareId]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import File from "@/models/File";

export async function GET(_: Request, { params }: { params: { shareId: string } }) {
  await connectToDatabase();
  const f = await File.findOne({ shareId: params.shareId, isPublic: true });
  if (!f) return NextResponse.redirect("/404");
  return NextResponse.redirect(`/api/files/${f._id}`); // downloads with filename
}
