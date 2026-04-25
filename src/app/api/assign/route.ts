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

    const { targetUserId, badgeId } = await req.json();

    if (!targetUserId || !badgeId) {
      return Res.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify the current user owns the badge OR the badge is public
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge) {
      return Res.json({ error: "Badge not found" }, { status: 404 });
    }

    const isOwner = badge.ownerId === session.user.id;
    const isPublic = badge.isPublic;

    if (!isOwner && !isPublic) {
      return Res.json({ error: "You don't own this badge" }, { status: 403 });
    }

    // Assign the badge
    const assignment = await prisma.userBadge.create({
      data: {
        userId: targetUserId,
        badgeId,
      },
    });

    return Res.json(assignment);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return Res.json({ error: "User already has this badge" }, { status: 400 });
    }
    return Res.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
