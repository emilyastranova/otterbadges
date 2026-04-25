"use client";

import { Icon } from "@/components/MaterialUI";
import styles from "./profile.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FeedbackDialog from "@/components/FeedbackDialog";

interface BadgeGridProps {
  badges: any[];
  isOwnProfile: boolean;
}

export default function BadgeGrid({ badges, isOwnProfile }: BadgeGridProps) {
  const router = useRouter();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm" | "error" | "success";
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    type: "alert",
    onConfirm: () => {},
  });

  const handleRevoke = (badgeId: string) => {
    setDialog({
      open: true,
      title: "Remove Badge",
      message: "Are you sure you want to remove this badge from your profile?",
      type: "confirm",
      onConfirm: async () => {
        setDialog(prev => ({ ...prev, open: false }));
        setRevokingId(badgeId);
        const res = await fetch("/api/badges/revoke", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ badgeId }),
        });

        if (res.ok) {
          router.refresh();
        } else {
          setDialog({
            open: true,
            title: "Error",
            message: "Failed to remove badge",
            type: "error",
            onConfirm: () => setDialog(prev => ({ ...prev, open: false })),
          });
        }
        setRevokingId(null);
      },
    });
  };

  return (
    <div className={styles.badgesSection}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Earned Badges</h2>
        {isOwnProfile && badges.length > 0 && (
          <button 
            className={isEditing ? styles.editBadgesBtnActive : styles.editBadgesBtn}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Icon style={{ fontSize: "18px" }}>{isEditing ? "done" : "edit"}</Icon>
            {isEditing ? "Done" : "Manage Badges"}
          </button>
        )}
      </div>

      <div className={styles.badgeGrid}>
        {badges.map((ub) => (
          <div key={ub.id} className={`${styles.badgeCard} ${isEditing ? styles.badgeCardEditing : ""}`} title={ub.badge.description}>
            <img src={ub.badge.imageUrl} alt={ub.badge.title} />
            {isOwnProfile && isEditing && (
              <button 
                className={styles.revokeBadgeBtnVisible} 
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

      <FeedbackDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        onCancel={() => setDialog(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
