import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {connectToDatabase} from "@/lib/db";
import User from "@/models/User";
import File from "@/models/File";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return Response.json({ error: "Not authenticated" }, { status: 401 });

  await connectToDatabase();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const fileCount = await File.countDocuments({ userEmail: session.user.email });

  return Response.json({ tier: user.tier, fileCount });
}
