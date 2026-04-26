"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./BackgroundGrid.module.css";

interface Badge {
  id: string;
  imageUrl: string;
  title: string;
  useSmooth: boolean;
}

export default function BackgroundGrid({ initialBadges }: { initialBadges: Badge[] }) {
  const [mounted, setMounted] = useState(false);
  const [displayRows, setDisplayRows] = useState<Badge[][]>([]);

  useEffect(() => {
    // Shuffle badges on the client side to ensure a different order every time
    const shuffledBadges = [...initialBadges].sort(() => Math.random() - 0.5);

    // Ensure we have enough badges to cover the screen
    const minBadges = 200;
    let pool = [...shuffledBadges];
    if (pool.length > 0) {
      while (pool.length < minBadges) {
        pool = [...pool, ...shuffledBadges];
      }
    }

    const rowCount = 10;
    const rows: Badge[][] = Array.from({ length: rowCount }, () => []);
    pool.forEach((badge, i) => {
      rows[i % rowCount].push(badge);
    });

    setDisplayRows(rows);
    setMounted(true);
  }, [initialBadges]);

  if (!mounted || displayRows.length === 0) return null;

  return (
    <div className={styles.backgroundWrapper}>
      <div className={styles.scrollingContainer}>
        {displayRows.map((row, i) => (
          <div
            key={i}
            className={`${styles.scrollingRow} ${i % 2 === 0 ? styles.scrollLeft : styles.scrollRight}`}
            style={{ animationDuration: `${40 + i * 10}s` }}
          >
            {/* Double the row for seamless infinite scrolling */}
            {[...row, ...row].map((badge, j) => {
              // Generate a random delay for the pop-in animation
              const popInDelay = Math.random() * 2; // 0s to 2s
              return (
                <div key={`${badge.id}-${i}-${j}`} className={styles.badgeWrapper}>
                  <div 
                    className={styles.popInContainer}
                    style={{ animationDelay: `${popInDelay}s` }}
                  >
                    <Image
                      src={badge.imageUrl}
                      alt=""
                      width={80}
                      height={80}
                      className={styles.bgBadge}
                      style={{ imageRendering: badge.useSmooth ? "auto" : "pixelated" }}
                      loading="lazy"
                      quality={50}
                      sizes="80px"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className={styles.vignette}></div>
    </div>
  );
}
