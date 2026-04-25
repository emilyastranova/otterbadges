import { NextResponse as Res } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
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
    include: {
      owner: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return Res.json(badges);
}
