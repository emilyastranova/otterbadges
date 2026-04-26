import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import BadgeStudioClient from "./BadgeStudioClient";
import { prisma } from "@/lib/prisma";

export default async function BadgeStudio() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const createdBadges = await prisma.badge.findMany({
    where: { ownerId: session.user.id },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      externalUrl: true,
      useSmooth: true,
      isPublic: true,
      ownerId: true,
      imageSize: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--md-sys-color-primary)", marginBottom: "2rem" }}>Badge Studio</h1>
      <BadgeStudioClient initialBadges={createdBadges} />
    </div>
  );
}
