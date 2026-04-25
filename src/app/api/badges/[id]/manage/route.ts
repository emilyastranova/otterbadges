import { NextResponse as Res } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Res.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: badgeId } = await params;
    const { userIds, action } = await req.json(); // action: "assign" | "revoke"

    if (!userIds || !Array.isArray(userIds)) {
      return Res.json({ error: "Invalid userIds" }, { status: 400 });
    }

    // Verify ownership
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge || badge.ownerId !== session.user.id) {
      return Res.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (action === "assign") {
      // Use createMany with skipDuplicates: true
      await prisma.userBadge.createMany({
        data: userIds.map((userId) => ({
          userId,
          badgeId,
        })),
      });
    } else if (action === "revoke") {
      await prisma.userBadge.deleteMany({
        where: {
          badgeId,
          userId: { in: userIds },
        },
      });
    }

    return Res.json({ success: true });
  } catch (error) {
    console.error(error);
    return Res.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
