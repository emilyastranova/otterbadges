"use client";

import { useState } from "react";
import { FilledButton, Dialog, TextButton, List, ListItem } from "@/components/MaterialUI";
import { Badge } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function AssignBadgeButton({
  targetUserId,
  ownedBadges,
}: {
  targetUserId: string;
  ownedBadges: Badge[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAssign = async (badgeId: string) => {
    setLoading(true);
    const res = await fetch("/api/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, badgeId }),
    });

    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to assign badge");
    }
    setLoading(false);
  };

  return (
    <>
      <FilledButton onClick={() => setOpen(true)}>Give Badge</FilledButton>

      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--md-sys-color-surface)",
              color: "var(--md-sys-color-on-surface)",
              padding: "2rem",
              borderRadius: "1rem",
              width: "100%",
              maxWidth: "400px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Select a Badge</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "300px", overflowY: "auto" }}>
              {ownedBadges.map((badge) => (
                <div
                  key={badge.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.5rem",
                    border: "1px solid var(--md-sys-color-outline-variant)",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                  }}
                  onClick={() => handleAssign(badge.id)}
                >
                  <img src={badge.imageUrl} alt={badge.title} width={40} height={40} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1rem" }}>{badge.title}</h3>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <TextButton onClick={() => setOpen(false)}>Cancel</TextButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
