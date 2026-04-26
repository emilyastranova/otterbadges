import { NextResponse as Res } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const badge = await prisma.badge.findUnique({
      where: { id },
    });

    if (!badge) {
      return Res.json({ error: "Badge not found" }, { status: 404 });
    }

    return Res.json(badge);
  } catch (error) {
    return Res.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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
    if (imageUrl) {
      data.imageUrl = imageUrl;
      
      let imageSize = 0;
      if (imageUrl.startsWith("data:")) {
        const base64 = imageUrl.split(",")[1];
        if (base64) {
          let padding = 0;
          if (base64.endsWith("==")) padding = 2;
          else if (base64.endsWith("=")) padding = 1;
          imageSize = Math.round((base64.length * 3) / 4) - padding;
        }
      } else {
        imageSize = imageUrl.length;
      }
      data.imageSize = imageSize;
    }

    const updated = await prisma.badge.update({
      where: { id },
      data,
    });

    return Res.json(updated);
  } catch (error) {
    return Res.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
