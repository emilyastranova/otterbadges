import { NextResponse as Res } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
      ],
    },
    take: 10,
    orderBy: { name: "asc" },
  });

  return Res.json(users);
}
