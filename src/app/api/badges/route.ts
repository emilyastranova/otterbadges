import { NextResponse as Res } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueBadgeSlug } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Res.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, imageUrl, isPublic, useSmooth } = await req.json();

    if (!title || !description || !imageUrl) {
      return Res.json({ error: "Missing fields" }, { status: 400 });
    }
    
    const slug = await generateUniqueBadgeSlug(title);

    const badge = await prisma.badge.create({
      data: {
        title,
        slug,
        description,
        imageUrl,
        useSmooth: useSmooth !== undefined ? !!useSmooth : true,
        isPublic: !!isPublic,
        ownerId: session.user.id,
      },
    });

    return Res.json(badge);
  } catch (error) {
    return Res.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
