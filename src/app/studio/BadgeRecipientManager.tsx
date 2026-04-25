"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, Icon, FilledButton, TextButton, 
  OutlinedTextField, Checkbox, ListItem 
} from "@/components/MaterialUI";
import styles from "./RecipientManager.module.css";

interface UserRecipient {
  id: string;
  name: string;
  image: string | null;
  teamRole: string | null;
  hasBadge: boolean;
}

interface Props {
  badgeId: string;
  badgeTitle: string;
  onClose: () => void;
}

export default function BadgeRecipientManager({ badgeId, badgeTitle, onClose }: Props) {
  const [users, setUsers] = useState<UserRecipient[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "has" | "hasnot">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [badgeId]);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch(`/api/badges/${badgeId}/recipients`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkAction = async (action: "assign" | "revoke") => {
    if (selectedIds.size === 0) return;
    
    setSaving(true);
    const res = await fetch(`/api/badges/${badgeId}/manage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userIds: Array.from(selectedIds),
        action,
      }),
    });

    if (res.ok) {
      setSelectedIds(new Set());
      await fetchUsers();
    } else {
      alert("Failed to update badges");
    }
    setSaving(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === "all" || 
      (filter === "has" && u.hasBadge) || 
      (filter === "hasnot" && !u.hasBadge);
    return matchesSearch && matchesFilter;
  });

  return (
    <Dialog open onClose={onClose} style={{ maxWidth: "600px", width: "100%" }}>
      <div slot="headline" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Icon>group_add</Icon>
        Manage Recipients: {badgeTitle}
      </div>
      
      <div slot="content" className={styles.container}>
        <div className={styles.controls}>
          <OutlinedTextField
            label="Search people..."
            value={search}
            onInput={(e: any) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          >
            <Icon slot="leading-icon">search</Icon>
          </OutlinedTextField>
          
          <div className={styles.filters}>
            <button 
              className={filter === "all" ? styles.activeFilter : ""} 
              onClick={() => setFilter("all")}
            >All</button>
            <button 
              className={filter === "has" ? styles.activeFilter : ""} 
              onClick={() => setFilter("has")}
            >Has Badge</button>
            <button 
              className={filter === "hasnot" ? styles.activeFilter : ""} 
              onClick={() => setFilter("hasnot")}
            >Doesn't Have</button>
          </div>
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.status}>Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className={styles.status}>No users found.</div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className={styles.userRow} onClick={() => toggleSelect(user.id)}>
                <Checkbox checked={selectedIds.has(user.id)} onChange={() => {}} />
                <div className={styles.avatar}>
                  {user.image ? (
                    <img src={user.image} alt={user.name || "User"} />
                  ) : (
                    <Icon>person</Icon>
                  )}
                </div>
                <div className={styles.userInfo}>
                  <div className={user.hasBadge ? styles.userNameWithBadge : styles.userName}>
                    {user.name}
                    {user.hasBadge && <Icon style={{ fontSize: "16px", color: "var(--md-sys-color-primary)" }}>verified</Icon>}
                  </div>
                  <div className={styles.userRole}>{user.teamRole || "No Role"}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div slot="actions">
        <div style={{ display: "flex", gap: "0.5rem", flex: 1, paddingLeft: "1rem" }}>
          {selectedIds.size > 0 && (
            <span style={{ fontSize: "0.8rem", color: "var(--md-sys-color-on-surface-variant)" }}>
              {selectedIds.size} selected
            </span>
          )}
        </div>
        <TextButton onClick={onClose}>Close</TextButton>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <FilledButton 
            onClick={() => handleBulkAction("revoke")} 
            disabled={saving || selectedIds.size === 0}
            className={styles.revokeBtn}
          >
            Revoke
          </FilledButton>
          <FilledButton 
            onClick={() => handleBulkAction("assign")} 
            disabled={saving || selectedIds.size === 0}
          >
            Give Badge
          </FilledButton>
        </div>
      </div>
    </Dialog>
  );
}
