import { NextResponse as Res } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return Res.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      alias: true,
      role: true,
      createdAt: true,
    },
  });

  return Res.json(users);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return Res.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, name, role, password } = await req.json();

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (role !== undefined) data.role = role;
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return Res.json(updated);
}
