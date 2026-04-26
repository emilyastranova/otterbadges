import styles from "./page.module.css";
import Link from "next/link";
import { FilledButton } from "@/components/MaterialUI";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  // Fetch a sample of badges to display in the background
  const dbBadges = await prisma.badge.findMany({
    take: 50,
    select: { id: true, imageUrl: true, title: true, useSmooth: true },
    orderBy: { createdAt: "desc" },
  });

  // If we don't have many badges, repeat them so the infinite scroll doesn't break
  const minBadges = 40;
  let displayBadges = [...dbBadges];
  if (displayBadges.length > 0) {
    while (displayBadges.length < minBadges) {
      displayBadges = [...displayBadges, ...dbBadges];
    }
  }

  // Split into rows for the animation
  const rowCount = 5;
  const rows: any[][] = Array.from({ length: rowCount }, () => []);
  displayBadges.forEach((badge, i) => {
    rows[i % rowCount].push(badge);
  });

  return (
    <div className={styles.container}>
      {displayBadges.length > 0 && (
        <div className={styles.backgroundWrapper}>
          <div className={styles.scrollingContainer}>
            {rows.map((row, i) => (
              <div 
                key={i} 
                className={`${styles.scrollingRow} ${i % 2 === 0 ? styles.scrollLeft : styles.scrollRight}`}
                style={{ animationDuration: `${60 + (i * 15)}s` }} // Varied speeds
              >
                {/* Triple the row for seamless infinite scrolling */}
                {[...row, ...row, ...row, ...row].map((badge, j) => (
                  <img
                    key={`${badge.id}-${i}-${j}`}
                    src={badge.imageUrl}
                    alt=""
                    className={styles.bgBadge}
                    style={{ imageRendering: badge.useSmooth ? "auto" : "pixelated" }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Vignette overlay to make the text pop and blend the edges */}
          <div className={styles.vignette}></div>
        </div>
      )}

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
