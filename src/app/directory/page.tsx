import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "./directory.module.css";
import { Icon } from "@/components/MaterialUI";
import LazyBadge from "@/components/LazyBadge";

export const dynamic = "force-dynamic";

export default async function Directory() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: {
      badges: {
        where: { isFavorite: true },
        include: { 
          badge: {
            select: {
              id: true,
              title: true,
              imageSize: true,
              useSmooth: true
            }
          } 
        },
        take: 5,
      }
    }
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--md-sys-color-primary)", marginBottom: "2rem" }}>User Directory</h1>
      
      <div className={styles.list}>
        {users.map((user) => (
          <Link key={user.id} href={`/u/${user.alias || user.id}`} className={styles.card}>
            <div className={styles.avatar}>
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name || "User"} />
              ) : (
                <Icon>person</Icon>
              )}
            </div>
            <div className={styles.contentWrapper}>
              <div className={styles.info}>
                <h3>{user.name || "Unknown User"}</h3>
                <p>{user.teamRole || "No role specified"}</p>
              </div>
              <div className={styles.favoriteBadges}>
                {user.badges.map((ub) => (
                  <div key={ub.id} className={styles.directoryBadgeWrapper}>
                    <LazyBadge 
                      badgeId={ub.badge.id}
                      title={ub.badge.title}
                      imageSize={ub.badge.imageSize}
                      useSmooth={ub.badge.useSmooth}
                    />
                  </div>
                ))}
              </div>
            </div>
            <Icon className={styles.arrow}>chevron_right</Icon>
          </Link>
        ))}
        {users.length === 0 && <p>No users found.</p>}
      </div>
    </div>
  );
}
