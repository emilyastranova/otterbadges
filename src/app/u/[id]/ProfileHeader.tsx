"use client";

import { useState } from "react";
import { Icon, FilledButton, OutlinedTextField, TextButton } from "@/components/MaterialUI";
import styles from "./profile.module.css";
import { useRouter } from "next/navigation";
import FeedbackDialog from "@/components/FeedbackDialog";

interface ProfileHeaderProps {
  user: any;
  isOwnProfile: boolean;
}

export default function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user.name || "",
    alias: user.alias || "",
    pronouns: user.pronouns || "",
    namePronunciation: user.namePronunciation || "",
    bio: user.bio || "",
    teamRole: user.teamRole || "",
    themeColor: user.themeColor || "#03A9F4",
    image: user.image || "",
  });

  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    type: "alert" | "error" | "success";
  }>({
    open: false,
    title: "",
    message: "",
    type: "alert",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 128;
        canvas.height = 128;
        if (ctx) {
          ctx.drawImage(img, 0, 0, 128, 128);
          setFormData({ ...formData, image: canvas.toDataURL("image/png") });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsEditing(false);
      // If alias changed, we need to redirect to the new URL to avoid 404 on refresh
      if (formData.alias && formData.alias !== user.alias) {
        router.push(`/u/${formData.alias}`);
      } else {
        router.refresh();
      }
    } else {
      const data = await res.json();
      setDialog({
        open: true,
        title: "Error Updating Profile",
        message: data.error || "Something went wrong.",
        type: "error"
      });
    }
    setLoading(false);
  };

  if (isEditing) {
    return (
      <div className={styles.editForm}>
        <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
          <div className={styles.avatarEdit}>
            {formData.image ? (
              <img src={formData.image} alt="Avatar" />
            ) : (
              <Icon style={{ fontSize: "64px" }}>person</Icon>
            )}
            <label className={styles.avatarLabel}>
              <Icon>upload</Icon>
              <input type="file" accept="image/*" onChange={handleFileChange} hidden />
            </label>
            {formData.image && (
              <button className={styles.removeAvatar} onClick={() => setFormData({...formData, image: ""})}>
                <Icon>close</Icon>
              </button>
            )}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <OutlinedTextField
                label="Name"
                value={formData.name}
                onInput={(e: any) => setFormData({ ...formData, name: e.target.value })}
                style={{ flex: 1 }}
              />
              <OutlinedTextField
                label="Alias (URL handle)"
                value={formData.alias}
                onInput={(e: any) => setFormData({ ...formData, alias: e.target.value.toLowerCase().replace(/\s+/g, "") })}
                style={{ flex: 1 }}
              >
                <Icon slot="leading-icon">alternate_email</Icon>
              </OutlinedTextField>
              <OutlinedTextField
                label="Pronouns"
                value={formData.pronouns}
                onInput={(e: any) => setFormData({ ...formData, pronouns: e.target.value })}
                style={{ width: "150px" }}
              />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <OutlinedTextField
                label="Name Pronunciation"
                value={formData.namePronunciation}
                onInput={(e: any) => setFormData({ ...formData, namePronunciation: e.target.value })}
                style={{ flex: 1 }}
              />
              <OutlinedTextField
                label="Team Role"
                value={formData.teamRole}
                onInput={(e: any) => setFormData({ ...formData, teamRole: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>
            <OutlinedTextField
              label="Bio"
              value={formData.bio}
              onInput={(e: any) => setFormData({ ...formData, bio: e.target.value })}
              style={{ minHeight: "80px" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span>Theme Color:</span>
              <input 
                type="color" 
                value={formData.themeColor} 
                onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })} 
              />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <TextButton onClick={() => setIsEditing(false)}>Cancel</TextButton>
          <FilledButton onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </FilledButton>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className={styles.header}>
      <div className={styles.avatar}>
        {user.image ? (
          <img src={user.image} alt={user.name || "User"} />
        ) : (
          <Icon style={{ fontSize: "64px" }}>person</Icon>
        )}
      </div>
      <div className={styles.info}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1 style={{ margin: 0 }}>{user.name || "Unknown User"}</h1>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              {user.pronouns && <span className={styles.pronounsDisplay}>{user.pronouns}</span>}
              {user.namePronunciation && <span className={styles.pronunciationDisplay}>({user.namePronunciation})</span>}
            </div>
          </div>
          {isOwnProfile && (
            <FilledButton onClick={() => setIsEditing(true)} style={{ marginLeft: "auto" }}>
              <Icon slot="icon">edit</Icon>
              Edit Profile
            </FilledButton>
          )}
        </div>
        {user.alias && <p className={styles.aliasDisplay}>@{user.alias}</p>}
        {user.teamRole && <p className={styles.role}>{user.teamRole}</p>}
        {user.bio && <p className={styles.bio}>{user.bio}</p>}
      </div>
    </div>

    <FeedbackDialog
      open={dialog.open}
      title={dialog.title}
      message={dialog.message}
      type={dialog.type}
      onConfirm={() => setDialog(prev => ({ ...prev, open: false }))}
    />
    </>
  );
}
