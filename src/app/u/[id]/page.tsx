import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import styles from "./profile.module.css";
import UserThemeContainer from "./UserThemeContainer";
import { Icon } from "@/components/MaterialUI";
import AssignBadgeButton from "./AssignBadgeButton";
import ProfileHeader from "./ProfileHeader";
import BadgeGrid from "./BadgeGrid";

export default async function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  const { id } = await params;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: id },
        { alias: id },
      ],
    },
    include: {
      badges: {
        include: { badge: true },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // If the user was found by ID but they have an alias, and we're NOT already using that alias, redirect.
  if (id === user.id && user.alias && id !== user.alias) {
    redirect(`/u/${user.alias}`);
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

        <BadgeGrid 
          badges={user.badges} 
          isOwnProfile={isOwnProfile} 
          targetUserId={user.id}
          ownedBadges={ownedBadges}
        />
      </div>
    </UserThemeContainer>
  );
}
