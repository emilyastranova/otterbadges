import styles from "./page.module.css";
import Link from "next/link";
import { FilledButton } from "@/components/MaterialUI";
import { prisma } from "@/lib/prisma";
import BackgroundGrid from "./BackgroundGrid";

export default async function Home() {
  // Fetch a sample of badges to pass to the client for the background grid
  const dbBadges = await prisma.badge.findMany({
    take: 100,
    select: { id: true, imageUrl: true, title: true, useSmooth: true },
  });

  return (
    <div className={styles.container}>
      {dbBadges.length > 0 && <BackgroundGrid initialBadges={dbBadges} />}

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to OtterBadges</h1>
        <p className={styles.description}>
          Create, distribute, and collect digital achievement badges across your organization.
        </p>
        <div className={styles.actions}>
          <Link href="/marketplace">
            <FilledButton>Explore Badges</FilledButton>
          </Link>
        </div>
      </main>
    </div>
  );
}
