import { NextResponse as Res } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return Res.json({ error: "Unauthorized" }, { status: 401 });
  }

  const badges = await prisma.badge.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: { name: true, alias: true }
      },
      _count: {
        select: { users: true }
      }
    }
  });

  return Res.json(badges);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return Res.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { badgeId } = await req.json();

  // Cascade delete is handled by prisma if configured, but let's be explicit if needed.
  // Actually, let's just delete the badge.
  await prisma.badge.delete({
    where: { id: badgeId },
  });

  return Res.json({ message: "Badge deleted" });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return Res.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { badgeId, title, description, ownerId } = await req.json();

  const data: any = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (ownerId !== undefined) data.ownerId = ownerId;

  const updated = await prisma.badge.update({
    where: { id: badgeId },
    data,
  });

  return Res.json(updated);
}
