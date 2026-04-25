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

    const { badgeId, isFavorite } = await req.json();

    if (isFavorite) {
      // Check if user already has 5 favorites
      const favoriteCount = await prisma.userBadge.count({
        where: {
          userId: session.user.id,
          isFavorite: true,
        },
      });

      if (favoriteCount >= 5) {
        return Res.json({ error: "You can only have up to 5 favorite badges" }, { status: 400 });
      }
    }

    const updated = await prisma.userBadge.update({
      where: {
        userId_badgeId: {
          userId: session.user.id,
          badgeId,
        },
      },
      data: {
        isFavorite,
      },
    });

    return Res.json(updated);
  } catch (error) {
    console.error(error);
    return Res.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
