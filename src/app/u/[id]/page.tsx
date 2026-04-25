import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import styles from "./profile.module.css";
import UserThemeContainer from "./UserThemeContainer";
import { Icon } from "@/components/MaterialUI";
import AssignBadgeButton from "./AssignBadgeButton";
import ThemeCustomizer from "./ThemeCustomizer";

export default async function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id: id },
    include: {
      badges: {
        include: { badge: true },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === user.id;

  let ownedBadges: any[] = [];
  if (session?.user) {
    ownedBadges = await prisma.badge.findMany({
      where: { ownerId: session.user.id },
    });
  }

  return (
    <UserThemeContainer sourceColor={user.themeColor || "#6750A4"}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {user.image ? (
              <img src={user.image} alt={user.name || "User"} />
            ) : (
              <Icon style={{ fontSize: "64px" }}>person</Icon>
            )}
          </div>
          <div className={styles.info}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <h1>{user.name || "Unknown User"}</h1>
              {isOwnProfile && <ThemeCustomizer initialColor={user.themeColor || "#6750A4"} />}
            </div>
            {user.pronouns && <p className={styles.pronouns}>{user.pronouns}</p>}
            {user.teamRole && <p className={styles.role}>{user.teamRole}</p>}
          </div>
        </div>

        {session?.user && !isOwnProfile && ownedBadges.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <AssignBadgeButton targetUserId={user.id} ownedBadges={ownedBadges} />
          </div>
        )}

        <div className={styles.badgesSection}>
          <h2>Earned Badges</h2>
          <div className={styles.badgeGrid}>
            {user.badges.map((ub) => (
              <div key={ub.id} className={styles.badgeCard}>
                <img src={ub.badge.imageUrl} alt={ub.badge.title} />
                <div className={styles.badgeInfo}>
                  <h3>{ub.badge.title}</h3>
                  <p>{ub.badge.description}</p>
                </div>
              </div>
            ))}
            {user.badges.length === 0 && <p>No badges earned yet.</p>}
          </div>
        </div>
      </div>
    </UserThemeContainer>
  );
}
