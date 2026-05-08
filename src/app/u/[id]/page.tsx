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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findFirst({
    where: { OR: [{ id }, { alias: id }] },
    include: { _count: { select: { badges: true } } }
  });
  if (!user) return { title: "User Not Found" };

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "OtterBadges";
  const title = `${user.name || "User"} - ${appName}`;
  const description = user.bio
    || `${user.name || "User"}'s profile on ${appName} — ${user._count.badges} badge${user._count.badges === 1 ? "" : "s"} collected`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: appName,
      ...(user.image ? { images: [{ url: user.image, alt: user.name || "User" }] } : {}),
    },
    twitter: {
      card: "summary",
      title,
      description,
      ...(user.image ? { images: [user.image] } : {}),
    },
  };
}

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
        include: { 
          badge: {
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
              updatedAt: true
            }
          } 
        },
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
        updatedAt: true
      }
    });
  }

  return (
    <UserThemeContainer sourceColor={user.themeColor || "#03A9F4"}>
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
