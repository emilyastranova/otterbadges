import { NextResponse as Res } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Res.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: badgeId } = await params;

    // Verify ownership
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge || badge.ownerId !== session.user.id) {
      return Res.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        teamRole: true,
        badges: {
          where: { badgeId },
        },
      },
      orderBy: { name: "asc" },
    });

    const results = users.map((u) => ({
      id: u.id,
      name: u.name,
      image: u.image,
      teamRole: u.teamRole,
      hasBadge: u.badges.length > 0,
    }));

    return Res.json(results);
  } catch (error) {
    return Res.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
