import { prisma } from "@/lib/prisma";
import MarketplaceClient from "./MarketplaceClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Marketplace() {
  const session = await getServerSession(authOptions);
  
  const badges = await prisma.badge.findMany({
    where: { isPublic: true },
    include: {
      owner: {
        select: { name: true }
      },
      users: session?.user?.id ? {
        where: { userId: session.user.id }
      } : false
    },
    orderBy: { createdAt: "desc" },
  });

  const initialBadges = badges.map(b => ({
    ...b,
    hasBadge: b.users ? b.users.length > 0 : false,
    users: undefined
  }));

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--md-sys-color-primary)", marginBottom: "0.5rem" }}>Badge Marketplace</h1>
      <p style={{ color: "var(--md-sys-color-on-surface-variant)", marginBottom: "2rem" }}>
        Discover and collect badges published by others in the community.
      </p>
      
      <MarketplaceClient initialBadges={initialBadges} />
    </div>
  );
}
