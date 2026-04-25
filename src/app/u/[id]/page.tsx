import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import styles from "./profile.module.css";
import UserThemeContainer from "./UserThemeContainer";
import { Icon } from "@/components/MaterialUI";
import AssignBadgeButton from "./AssignBadgeButton";
import ProfileHeader from "./ProfileHeader";

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
        <ProfileHeader user={user} isOwnProfile={isOwnProfile} />

        {session?.user && !isOwnProfile && ownedBadges.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <AssignBadgeButton targetUserId={user.id} ownedBadges={ownedBadges} />
          </div>
        )}

        <div className={styles.badgesSection}>
          <h2>Earned Badges</h2>
          <div className={styles.badgeGrid}>
            {user.badges.map((ub) => (
              <div key={ub.id} className={styles.badgeCard} title={ub.badge.description}>
                <img src={ub.badge.imageUrl} alt={ub.badge.title} />
              </div>
            ))}
            {user.badges.length === 0 && <p>No badges earned yet.</p>}
          </div>
        </div>
      </div>
    </UserThemeContainer>
  );
}
