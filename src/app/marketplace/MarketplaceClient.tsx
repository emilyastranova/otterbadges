"use client";

import { useState } from "react";
import { Icon, OutlinedTextField, FilledButton, OutlinedButton } from "@/components/MaterialUI";
import styles from "./marketplace.module.css";
import { useSession } from "next-auth/react";

export default function MarketplaceClient({ initialBadges }: { initialBadges: any[] }) {
  const [badges, setBadges] = useState(initialBadges);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const handleSearch = async (q: string) => {
    setSearch(q);
    const res = await fetch(`/api/marketplace?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data = await res.json();
      setBadges(data);
    }
  };

  const handleCollect = async (badgeId: string) => {
    if (!session) {
      alert("Please sign in to collect badges!");
      return;
    }
    
    setLoading(true);
    const res = await fetch("/api/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: session.user.id, badgeId }),
    });

    if (res.ok) {
      alert("Badge added to your profile!");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to collect badge");
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <OutlinedTextField
          label="Search marketplace..."
          value={search}
          onInput={(e: any) => handleSearch(e.target.value)}
          style={{ width: "100%", maxWidth: "500px" }}
        >
          <Icon slot="leading-icon">search</Icon>
        </OutlinedTextField>
      </div>

      <div className={styles.grid}>
        {badges.map((badge) => (
          <div key={badge.id} className={styles.card}>
            <div className={styles.badgeHeader}>
              <img src={badge.imageUrl} alt={badge.title} width={40} height={40} />
              <div className={styles.badgeMeta}>
                <h3>{badge.title}</h3>
                <p>by {badge.owner?.name || "Unknown"}</p>
              </div>
            </div>
            <p className={styles.description}>{badge.description}</p>
            <div className={styles.actions}>
              <FilledButton onClick={() => handleCollect(badge.id)} disabled={loading}>
                <Icon slot="icon">add</Icon>
                Collect Badge
              </FilledButton>
            </div>
          </div>
        ))}
        {badges.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem", gridColumn: "1 / -1" }}>
            <Icon style={{ fontSize: "48px", opacity: 0.3 }}>storefront</Icon>
            <p>No badges found in the marketplace.</p>
          </div>
        )}
      </div>
    </div>
  );
}
