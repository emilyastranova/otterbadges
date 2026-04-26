"use client";

import { Icon } from "@/components/MaterialUI";
import styles from "./profile.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FeedbackDialog from "@/components/FeedbackDialog";
import AssignBadgeButton from "./AssignBadgeButton";

interface BadgeGridProps {
  badges: any[];
  isOwnProfile: boolean;
  targetUserId?: string;
  ownedBadges?: any[];
}

export default function BadgeGrid({ badges, isOwnProfile, targetUserId, ownedBadges }: BadgeGridProps) {
  const router = useRouter();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [favoritingId, setFavoritingId] = useState<string | null>(null);
  const [activeBadgeDescription, setActiveBadgeDescription] = useState<string | null>(null);
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

  const toggleFavorite = async (badgeId: string, currentStatus: boolean) => {
    setFavoritingId(badgeId);
    const res = await fetch("/api/badges/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ badgeId, isFavorite: !currentStatus }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setDialog({
        open: true,
        title: "Favorites Limit",
        message: data.error || "Failed to update favorite",
        type: "error",
        onConfirm: () => setDialog(prev => ({ ...prev, open: false })),
      });
    }
    setFavoritingId(null);
  };

  const favoriteBadges = badges.filter(b => b.isFavorite);
  const otherBadges = badges.filter(b => !b.isFavorite);
  const sortedBadges = [...favoriteBadges, ...otherBadges];

  const handleBadgeClick = (badge: any) => {
    if (isEditing) return;

    if (badge.externalUrl) {
      window.open(badge.externalUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // Only show the mobile description if we're on a touch device / small screen
    if (window.matchMedia("(max-width: 600px)").matches) {
      setActiveBadgeDescription(badge.description);
      // Auto-hide after 3 seconds
      setTimeout(() => setActiveBadgeDescription(null), 3000);
    }
  };

  return (
    <div className={styles.badgesSection}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>
          {isEditing ? "Manage Your Badges" : "Earned Badges"}
        </h2>
        {isOwnProfile && badges.length > 0 && (
          <button 
            className={isEditing ? styles.editBadgesBtnActive : styles.editBadgesBtn}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Icon style={{ fontSize: "18px" }}>{isEditing ? "done" : "edit"}</Icon>
            {isEditing ? "Done" : "Manage Badges"}
          </button>
        )}
        {!isOwnProfile && targetUserId && ownedBadges && ownedBadges.length > 0 && (
          <AssignBadgeButton targetUserId={targetUserId} ownedBadges={ownedBadges} />
        )}
      </div>

      {isEditing && (
        <div className={styles.favoritesManager}>
          <h3><Icon style={{ fontSize: "18px", color: "var(--md-sys-color-tertiary)" }}>star</Icon> Favorites ({favoriteBadges.length}/5)</h3>
          <p>Star up to 5 badges to highlight them on your profile and in the directory.</p>
          <div className={styles.favoriteSlots}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className={styles.favoriteSlot}>
                {favoriteBadges[i] ? (
                  <div className={styles.badgeCard} title={favoriteBadges[i].badge.description}>
                    <img src={favoriteBadges[i].badge.imageUrl} alt={favoriteBadges[i].badge.title} />
                    <button 
                      className={styles.unfavoriteBtn}
                      onClick={() => toggleFavorite(favoriteBadges[i].badgeId, true)}
                    >
                      <Icon style={{ fontSize: "14px" }}>star</Icon>
                    </button>
                  </div>
                ) : (
                  <Icon className={styles.emptySlotIcon}>add</Icon>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.badgeGrid}>
        {sortedBadges.map((ub) => (
          <div 
            key={ub.id} 
            className={`${styles.badgeCard} ${isEditing ? styles.badgeCardEditing : ""}`} 
            title={ub.badge.description}
            onClick={() => handleBadgeClick(ub.badge)}
            style={{ cursor: (!isEditing && ub.badge.externalUrl) ? "pointer" : "default" }}
          >
            <img src={ub.badge.imageUrl} alt={ub.badge.title} />
            {isOwnProfile && isEditing && (
              <>
                <button 
                  className={styles.revokeBadgeBtnVisible} 
                  onClick={(e) => { e.stopPropagation(); handleRevoke(ub.badgeId); }}
                  disabled={revokingId === ub.badgeId}
                  title="Remove this badge"
                >
                  <Icon style={{ fontSize: "16px" }}>close</Icon>
                </button>
                <button 
                  className={ub.isFavorite ? styles.favoriteBtnActive : styles.favoriteBtn} 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(ub.badgeId, ub.isFavorite); }}
                  disabled={favoritingId === ub.badgeId}
                  title={ub.isFavorite ? "Unfavorite" : "Make Favorite"}
                >
                  <Icon style={{ fontSize: "16px" }}>{ub.isFavorite ? "star" : "star_outline"}</Icon>
                </button>
              </>
            )}
          </div>
        ))}
        {badges.length === 0 && <p>No badges earned yet.</p>}
      </div>

      {activeBadgeDescription && (
        <div className={styles.mobileDescriptionBubble}>
          {activeBadgeDescription}
        </div>
      )}

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
