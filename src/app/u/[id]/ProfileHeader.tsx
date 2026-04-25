"use client";

import { useState } from "react";
import { Icon, FilledButton, OutlinedTextField, TextButton } from "@/components/MaterialUI";
import styles from "./profile.module.css";
import { useRouter } from "next/navigation";

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
    pronouns: user.pronouns || "",
    namePronunciation: user.namePronunciation || "",
    bio: user.bio || "",
    themeColor: user.themeColor || "#6750A4",
    image: user.image || "",
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
      router.refresh();
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
            <OutlinedTextField
              label="Name"
              value={formData.name}
              onInput={(e: any) => setFormData({ ...formData, name: e.target.value })}
            />
            <OutlinedTextField
              label="Name Pronunciation"
              value={formData.namePronunciation}
              onInput={(e: any) => setFormData({ ...formData, namePronunciation: e.target.value })}
            />
            <OutlinedTextField
              label="Pronouns"
              value={formData.pronouns}
              onInput={(e: any) => setFormData({ ...formData, pronouns: e.target.value })}
            />
            <OutlinedTextField
              label="Bio"
              value={formData.bio}
              onInput={(e: any) => setFormData({ ...formData, bio: e.target.value })}
              style={{ minHeight: "100px" }}
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
          <h1>{user.name || "Unknown User"}</h1>
          {isOwnProfile && (
            <FilledButton onClick={() => setIsEditing(true)} style={{ marginLeft: "auto" }}>
              <Icon slot="icon">edit</Icon>
              Edit Profile
            </FilledButton>
          )}
        </div>
        {user.namePronunciation && <p className={styles.pronunciation}>({user.namePronunciation})</p>}
        {user.pronouns && <p className={styles.pronouns}>{user.pronouns}</p>}
        {user.teamRole && <p className={styles.role}>{user.teamRole}</p>}
        {user.bio && <p className={styles.bio}>{user.bio}</p>}
      </div>
    </div>
  );
}
