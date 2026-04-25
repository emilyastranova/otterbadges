"use client";

import { Icon } from "@/components/MaterialUI";
import styles from "./profile.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BadgeGridProps {
  badges: any[];
  isOwnProfile: boolean;
}

export default function BadgeGrid({ badges, isOwnProfile }: BadgeGridProps) {
  const router = useRouter();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleRevoke = async (badgeId: string) => {
    if (!confirm("Are you sure you want to remove this badge from your profile?")) return;
    
    setRevokingId(badgeId);
    const res = await fetch("/api/badges/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ badgeId }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to remove badge");
    }
    setRevokingId(null);
  };

  return (
    <div className={styles.badgeGrid}>
      {badges.map((ub) => (
        <div key={ub.id} className={styles.badgeCard} title={ub.badge.description}>
          <img src={ub.badge.imageUrl} alt={ub.badge.title} />
          {isOwnProfile && (
            <button 
              className={styles.revokeBadgeBtn} 
              onClick={() => handleRevoke(ub.badgeId)}
              disabled={revokingId === ub.badgeId}
              title="Remove this badge"
            >
              <Icon style={{ fontSize: "16px" }}>close</Icon>
            </button>
          )}
        </div>
      ))}
      {badges.length === 0 && <p>No badges earned yet.</p>}
    </div>
  );
}
