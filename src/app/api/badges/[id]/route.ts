import { NextResponse as Res } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Res.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const badge = await prisma.badge.findUnique({
      where: { id },
    });

    if (!badge || badge.ownerId !== session.user.id) {
      return Res.json({ error: "You don't own this badge" }, { status: 403 });
    }

    await prisma.userBadge.deleteMany({
      where: { badgeId: id },
    });

    await prisma.badge.delete({
      where: { id },
    });

    return Res.json({ success: true });
  } catch (error) {
    return Res.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Res.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, description, isPublic, imageUrl, useSmooth, externalUrl } = await req.json();

    const badge = await prisma.badge.findUnique({
      where: { id },
    });

    if (!badge || badge.ownerId !== session.user.id) {
      return Res.json({ error: "You don't own this badge" }, { status: 403 });
    }

    const data: any = { 
      title, 
      description,
      externalUrl,
      isPublic: isPublic !== undefined ? !!isPublic : badge.isPublic,
      useSmooth: useSmooth !== undefined ? !!useSmooth : badge.useSmooth
    };
    if (imageUrl) data.imageUrl = imageUrl;

    const updated = await prisma.badge.update({
      where: { id },
      data,
    });

    return Res.json(updated);
  } catch (error) {
    return Res.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
