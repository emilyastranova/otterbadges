import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./badge.module.css";
import { Icon } from "@/components/MaterialUI";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const badge = await prisma.badge.findFirst({
    where: { OR: [{ slug }, { id: slug }] }
  });
  if (!badge) return { title: "Badge Not Found" };
  return { title: `${badge.title} - OtterBadges`, description: badge.description };
}

export default async function BadgePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const badge = await prisma.badge.findFirst({
    where: {
      OR: [
        { slug: slug },
        { id: slug }
      ]
    },
    include: {
      owner: true,
      users: {
        include: { user: true },
        orderBy: { assignedAt: 'desc' }
      }
    }
  });

  if (!badge) {
    notFound();
  }

  if (badge.slug && badge.slug !== slug) {
    redirect(`/b/${badge.slug}`);
  }

  const isOwner = session?.user?.id === badge.ownerId;
  const hasCollected = session?.user?.id ? badge.users.some(ub => ub.userId === session.user.id) : false;

  return (
    <div className={styles.container}>
      <div className={styles.badgeHeader}>
        <div className={styles.imageContainer}>
          <img 
            src={badge.imageUrl} 
            alt={badge.title} 
            className={styles.badgeImage} 
            style={{ imageRendering: badge.useSmooth ? "auto" : "pixelated" }}
          />
        </div>
        <div className={styles.badgeInfo}>
          <div className={styles.titleRow}>
            <h1>{badge.title}</h1>
            {hasCollected && (
              <span className={styles.collectedTag}>
                <Icon style={{ fontSize: "16px" }}>check_circle</Icon>
                Collected
              </span>
            )}
            {!badge.isPublic && (
              <span className={styles.privateTag}>
                <Icon style={{ fontSize: "16px" }}>lock</Icon>
                Private
              </span>
            )}
          </div>
          <p className={styles.creator}>
            Created by <Link href={`/u/${badge.owner.alias || badge.owner.id}`} className={styles.creatorLink}>{badge.owner.name}</Link>
          </p>
          <div className={styles.descriptionBox}>
            <p>{badge.description}</p>
          </div>
        </div>
      </div>

      <div className={styles.collectorsSection}>
        <h2>Collectors ({badge.users.length})</h2>
        {badge.users.length > 0 ? (
          <div className={styles.collectorsGrid}>
            {badge.users.map((ub) => (
              <Link key={ub.id} href={`/u/${ub.user.alias || ub.user.id}`} className={styles.collectorCard}>
                {ub.user.image ? (
                  <img src={ub.user.image} alt={ub.user.name || "User"} className={styles.collectorAvatar} />
                ) : (
                  <div className={styles.avatarPlaceholder} style={{ backgroundColor: ub.user.themeColor || "var(--md-sys-color-primary)" }}>
                    {ub.user.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <div className={styles.collectorInfo}>
                  <span className={styles.collectorName}>{ub.user.name}</span>
                  <span className={styles.collectedDate}>
                    {new Date(ub.assignedAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Icon style={{ fontSize: "48px", opacity: 0.3 }}>group_off</Icon>
            <p>No one has collected this badge yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
