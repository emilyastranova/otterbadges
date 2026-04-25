import { prisma } from "@/lib/prisma";
import MarketplaceClient from "./MarketplaceClient";

export const dynamic = "force-dynamic";

export default async function Marketplace() {
  const initialBadges = await prisma.badge.findMany({
    where: { isPublic: true },
    include: {
      owner: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

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
