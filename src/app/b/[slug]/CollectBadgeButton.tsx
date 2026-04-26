"use client";

import { useState } from "react";
import { FilledButton, Icon } from "@/components/MaterialUI";
import { useRouter } from "next/navigation";
import FeedbackDialog from "@/components/FeedbackDialog";

interface CollectBadgeButtonProps {
  badgeId: string;
  isPublic: boolean;
  hasCollected: boolean;
  isLoggedIn: boolean;
  userId?: string;
}

export default function CollectBadgeButton({ 
  badgeId, 
  isPublic, 
  hasCollected, 
  isLoggedIn,
  userId 
}: CollectBadgeButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm" | "error" | "success";
  }>({
    open: false,
    title: "",
    message: "",
    type: "alert",
  });

  const handleCollect = async () => {
    if (!isLoggedIn) {
      setDialog({
        open: true,
        title: "Sign In Required",
        message: "Please sign in to collect badges!",
        type: "error"
      });
      return;
    }

    if (hasCollected) return;

    setLoading(true);
    const res = await fetch("/api/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId, badgeId }),
    });

    if (res.ok) {
      setDialog({
        open: true,
        title: "Success!",
        message: "Badge added to your profile!",
        type: "success"
      });
      router.refresh();
    } else {
      const data = await res.json();
      setDialog({
        open: true,
        title: "Collection Failed",
        message: data.error || "Failed to collect badge",
        type: "error"
      });
    }
    setLoading(false);
  };

  if (!isPublic && !hasCollected) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "0.5rem", 
        marginTop: "1.5rem",
        color: "var(--md-sys-color-on-surface-variant)",
        fontSize: "0.9rem",
        backgroundColor: "var(--md-sys-color-surface-container-low)",
        padding: "0.75rem 1rem",
        borderRadius: "0.5rem",
        width: "fit-content"
      }}>
        <Icon style={{ fontSize: "20px" }}>info</Icon>
        <span>This badge is private and not available in the Marketplace.</span>
      </div>
    );
  }

  if (hasCollected) return null;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <FilledButton onClick={handleCollect} disabled={loading}>
        <Icon slot="icon">add</Icon>
        {loading ? "Collecting..." : "Collect Badge"}
      </FilledButton>

      <FeedbackDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={() => setDialog(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
