import { NextResponse as Res } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Res.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, alias, pronouns, namePronunciation, bio, teamRole, themeColor, image } = body;

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        alias,
        pronouns,
        namePronunciation,
        bio,
        teamRole,
        themeColor,
        image,
      },
    });

    return Res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return Res.json({ error: "This alias is already taken" }, { status: 400 });
    }
    console.error(error);
    return Res.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
