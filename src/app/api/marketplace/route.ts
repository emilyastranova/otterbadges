import { NextResponse as Res } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const badges = await prisma.badge.findMany({
    where: {
      isPublic: true,
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      externalUrl: true,
      useSmooth: true,
      isPublic: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: { name: true }
      },
      users: session?.user?.id ? {
        where: { userId: session.user.id }
      } : false
    },
    orderBy: { createdAt: "desc" },
  });

  const results = badges.map(b => ({
    ...b,
    hasBadge: b.users ? b.users.length > 0 : false,
    users: undefined // Clean up
  }));

  return Res.json(results);
}
