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
      image: true,
      themeColor: true,
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

  const { userId, name, email, role, password } = await req.json();

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
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

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return Res.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await req.json();

  try {
    // Delete the user's collected badges mapping
    await prisma.userBadge.deleteMany({ where: { userId } });

    // Attempt to delete the user
    await prisma.user.delete({ where: { id: userId } });
    return Res.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2003") { // Foreign key constraint failed
      return Res.json({ error: "Cannot delete user because they are the owner of one or more badges. Please reassign or delete their badges first." }, { status: 400 });
    }
    return Res.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
