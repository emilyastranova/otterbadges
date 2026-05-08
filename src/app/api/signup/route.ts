import { NextResponse as Res } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateUniqueAlias, isFirstUser } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    if (process.env.NEXT_PUBLIC_DISABLE_SIGNUP === "true" || process.env.NEXT_PUBLIC_DISABLE_LOCAL_LOGIN === "true") {
      return Res.json({ error: "Signups are currently disabled." }, { status: 403 });
    }

    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return Res.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return Res.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const alias = await generateUniqueAlias(name);
    const firstUser = await isFirstUser();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        alias,
        role: firstUser ? "ADMIN" : "USER",
        // Give them a random default theme color based on their name length
        themeColor: ["#03A9F4", "#B3261E", "#386A20", "#006874", "#825500"][name.length % 5],
      },
    });

    return Res.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Signup error:", error);
    return Res.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
