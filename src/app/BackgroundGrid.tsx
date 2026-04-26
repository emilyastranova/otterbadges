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
    if (!initialBadges || initialBadges.length === 0) return;

    const rowCount = 10;
    const itemsPerRow = 30; // Enough badges to safely cover ultra-wide screens before repeating
    const newRows: Badge[][] = [];

    for (let i = 0; i < rowCount; i++) {
      const rowBadges: Badge[] = [];
      
      while (rowBadges.length < itemsPerRow) {
        const shuffled = [...initialBadges].sort(() => Math.random() - 0.5);
        
        for (const badge of shuffled) {
          if (rowBadges.length === itemsPerRow) break;

          // Prevent identical badges from being adjacent
          const prevBadge = rowBadges.length > 0 ? rowBadges[rowBadges.length - 1] : null;
          const isAdjacent = prevBadge?.id === badge.id;
          
          // Prevent identical badges at the loop seam (last item touching first item)
          const isSeamConflict = rowBadges.length === itemsPerRow - 1 && rowBadges[0]?.id === badge.id;

          // If there's only 1 badge in the entire DB, we have to allow adjacent duplicates
          if (initialBadges.length === 1 || (!isAdjacent && !isSeamConflict)) {
            rowBadges.push(badge);
          }
        }
      }
      newRows.push(rowBadges);
    }

    setDisplayRows(newRows);
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
