import { NextResponse as Res } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Res.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { badgeId } = await req.json();

    if (!badgeId) {
      return Res.json({ error: "Badge ID is required" }, { status: 400 });
    }

    await prisma.userBadge.deleteMany({
      where: {
        userId: session.user.id,
        badgeId: badgeId,
      },
    });

    return Res.json({ success: true });
  } catch (error) {
    return Res.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
