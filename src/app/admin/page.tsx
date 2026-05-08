"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FilledButton, OutlinedButton, Icon, List, ListItem, OutlinedTextField, IconButton } from "@/components/MaterialUI";
import FeedbackDialog from "@/components/FeedbackDialog";
import UserSelectorDialog from "@/app/studio/UserSelectorDialog";
import LazyBadge from "@/components/LazyBadge";
import styles from "./admin.module.css";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "badges">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<any>({ open: false });
  const [changingOwnerId, setChangingOwnerId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && (session.user as any).role !== "ADMIN") {
      router.push("/");
    } else if (session) {
      fetchData();
    }
  }, [session, status, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const endpoint = activeTab === "users" ? "/api/admin/users" : "/api/admin/badges";
    const res = await fetch(endpoint);
    const data = await res.json();
    if (activeTab === "users") setUsers(data);
    else setBadges(data);
    setLoading(false);
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...updates }),
    });
    if (res.ok) {
      setDialog({ open: true, title: "Success", message: "User updated successfully", type: "success" });
      fetchData();
    } else {
      setDialog({ open: true, title: "Error", message: "Failed to update user", type: "error" });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setDialog({
      open: true,
      title: "Delete User",
      message: `Are you sure you want to delete ${userName}? This cannot be undone.`,
      type: "confirm",
      onConfirm: async () => {
        setDialog({ open: false });
        const res = await fetch("/api/admin/users", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (res.ok) {
          fetchData();
        } else {
          const data = await res.json();
          setDialog({ open: true, title: "Error", message: data.error || "Failed to delete user", type: "error" });
        }
      }
    });
  };

  const handleUpdateBadge = async (badgeId: string, updates: any) => {
    const res = await fetch("/api/admin/badges", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ badgeId, ...updates }),
    });
    if (res.ok) {
      setDialog({ open: true, title: "Success", message: "Badge updated successfully", type: "success" });
      fetchData();
    } else {
      setDialog({ open: true, title: "Error", message: "Failed to update badge", type: "error" });
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    setDialog({
      open: true,
      title: "Delete Badge",
      message: "Are you sure you want to delete this badge globally? This cannot be undone.",
      type: "confirm",
      onConfirm: async () => {
        setDialog({ open: false });
        const res = await fetch("/api/admin/badges", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ badgeId }),
        });
        if (res.ok) {
          fetchData();
        } else {
          setDialog({ open: true, title: "Error", message: "Failed to delete badge", type: "error" });
        }
      }
    });
  };

  if (status === "loading" || loading) {
    return <div className={styles.loading}>Loading Admin Panel...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin Control Panel</h1>
        <div className={styles.tabs}>
          <FilledButton onClick={() => setActiveTab("users")} disabled={activeTab === "users"}>
            <Icon slot="icon">people</Icon>
            Manage Users
          </FilledButton>
          <FilledButton onClick={() => setActiveTab("badges")} disabled={activeTab === "badges"}>
            <Icon slot="icon">military_tech</Icon>
            Manage Badges
          </FilledButton>
        </div>
      </header>

      <main className={styles.content}>
        {activeTab === "users" ? (
          <section className={styles.section}>
            <h2>Users ({users.length})</h2>
            <div className={styles.userList}>
              {users.map(user => (
                <div key={user.id} className={styles.adminCard}>
                  <Link href={`/u/${user.alias || user.id}`} className={styles.link}>
                    {user.image ? (
                      <img src={user.image} alt={user.name} className={styles.adminAvatar} />
                    ) : (
                      <div className={styles.adminAvatar} style={{ backgroundColor: user.themeColor || "var(--md-sys-color-primary)" }}>
                        {user.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </Link>
                  <div className={styles.cardInfo}>
                    <Link href={`/u/${user.alias || user.id}`} className={styles.link}>
                      <strong>{user.name}</strong> (@{user.alias})
                    </Link>
                    <p>{user.email} • Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <div className={styles.fieldGroup}>
                      <label>Role</label>
                      <select 
                        value={user.role} 
                        onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                        className={styles.select}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <OutlinedButton onClick={() => {
                      const newName = prompt("Enter new name for " + user.name, user.name);
                      if (newName) handleUpdateUser(user.id, { name: newName });
                    }}>
                      Rename
                    </OutlinedButton>
                    <OutlinedButton onClick={() => {
                      const newEmail = prompt("Enter new email for " + user.name, user.email);
                      if (newEmail) handleUpdateUser(user.id, { email: newEmail });
                    }}>
                      Change Email
                    </OutlinedButton>
                    <OutlinedButton onClick={() => {
                      const newPass = prompt("Enter new password for " + user.name);
                      if (newPass) handleUpdateUser(user.id, { password: newPass });
                    }}>
                      Reset Password
                    </OutlinedButton>
                    <IconButton onClick={() => handleDeleteUser(user.id, user.name || "this user")} style={{ color: "var(--md-sys-color-error)" }}>
                      <Icon>delete</Icon>
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className={styles.section}>
            <h2>Global Badges ({badges.length})</h2>
            <div className={styles.badgeList}>
              {badges.map(badge => (
                <div key={badge.id} className={styles.adminCard}>
                  <Link href={`/b/${badge.slug || badge.id}`} className={styles.link} style={{ width: "40px", height: "40px", display: "block", flexShrink: 0 }}>
                    <LazyBadge 
                      badgeId={badge.id} 
                      title={badge.title} 
                      imageSize={badge.imageSize} 
                      useSmooth={badge.useSmooth} 
                    />
                  </Link>
                  <div className={styles.cardInfo}>
                    <Link href={`/b/${badge.slug || badge.id}`} className={styles.link}>
                      <strong>{badge.title}</strong>
                    </Link>
                    <p>{badge.description}</p>
                    <small>Owner: <Link href={`/u/${badge.owner.alias || badge.ownerId}`} className={styles.link}>{badge.owner.name}</Link> (@{badge.owner.alias}) • Used by {badge._count.users} users</small>
                  </div>
                  <div className={styles.cardActions}>
                    <OutlinedButton onClick={() => {
                      const newTitle = prompt("Enter new title", badge.title);
                      if (newTitle) handleUpdateBadge(badge.id, { title: newTitle });
                    }}>
                      Edit Title
                    </OutlinedButton>
                    <OutlinedButton onClick={() => {
                      const newDesc = prompt("Enter new description", badge.description);
                      if (newDesc) handleUpdateBadge(badge.id, { description: newDesc });
                    }}>
                      Edit Desc
                    </OutlinedButton>
                    <OutlinedButton onClick={() => setChangingOwnerId(badge.id)}>
                      Change Owner
                    </OutlinedButton>
                    <IconButton onClick={() => handleDeleteBadge(badge.id)} style={{ color: "var(--md-sys-color-error)" }}>
                      <Icon>delete</Icon>
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {changingOwnerId && (
        <UserSelectorDialog 
          onClose={() => setChangingOwnerId(null)}
          onSelect={(userId) => {
            handleUpdateBadge(changingOwnerId, { ownerId: userId });
            setChangingOwnerId(null);
          }}
        />
      )}

      <FeedbackDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        onCancel={() => setDialog({ open: false })}
      />
    </div>
  );
}
