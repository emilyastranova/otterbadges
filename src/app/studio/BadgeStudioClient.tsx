"use client";

import { useState } from "react";
import { FilledButton, OutlinedTextField, Icon, TextButton } from "@/components/MaterialUI";
import { Badge } from "@prisma/client";
import styles from "./studio.module.css";

import UserSelectorDialog from "./UserSelectorDialog";

export default function BadgeStudioClient({ initialBadges }: { initialBadges: Badge[] }) {
  const [badges, setBadges] = useState<Badge[]>(initialBadges);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBadges = badges.filter((badge) => {
    const q = searchQuery.toLowerCase();
    return badge.title.toLowerCase().includes(q) || badge.description.toLowerCase().includes(q);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isGif = file.type === "image/gif";
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      
      img.onload = () => {
        const targetWidth = 40;
        const targetHeight = 40;
        const isLarger = img.width > 40 || img.height > 40;

        if (isGif) {
          // For GIFs, we keep the original data to preserve animation
          // We just show the preview of it scaled down
          setOriginalImage(dataUrl);
          setResizedImage(dataUrl); // This will be scaled via CSS in the preview
          setImageUrl(dataUrl);
          setShowPreview(isLarger);
        } else {
          // For other images, we resize via Canvas
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            const resized = canvas.toDataURL("image/png");
            
            setOriginalImage(dataUrl);
            setResizedImage(resized);
            setImageUrl(resized);
            setShowPreview(isLarger);
          }
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!title || !description || !imageUrl) return;
    setLoading(true);

    const res = await fetch("/api/badges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, imageUrl }),
    });

    if (res.ok) {
      const newBadge = await res.json();
      setBadges([newBadge, ...badges]);
      setTitle("");
      setDescription("");
      setImageUrl("");
      setOriginalImage(null);
      setResizedImage(null);
      setShowPreview(false);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this badge?")) return;
    
    const res = await fetch(`/api/badges/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setBadges(badges.filter((b) => b.id !== id));
    }
  };

  const startEdit = (badge: Badge) => {
    setEditingId(badge.id);
    setEditTitle(badge.title);
    setEditDesc(badge.description);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setLoading(true);

    const res = await fetch(`/api/badges/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDesc }),
    });

    if (res.ok) {
      const updated = await res.json();
      setBadges(badges.map((b) => (b.id === editingId ? updated : b)));
      setEditingId(null);
    }
    setLoading(false);
  };

  const handleAssign = async (userId: string) => {
    if (!assigningId) return;
    setLoading(true);

    const res = await fetch("/api/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId, badgeId: assigningId }),
    });

    if (res.ok) {
      alert("Badge assigned successfully!");
      setAssigningId(null);
    } else {
      const data = await res.json();
      alert(data.error || "Failed to assign badge");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className={styles.card}>
        <h2 style={{marginTop: 0}}>Create New Badge</h2>
        <div className={styles.form}>
          <div className={styles.preview}>
            <div className={styles.badgePreview}>
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" width={40} height={40} />
              ) : (
                <Icon style={{ fontSize: "40px" }}>image</Icon>
              )}
            </div>
            <p>40x40 px</p>
          </div>
          
          <div className={styles.inputs}>
            <OutlinedTextField
              label="Title"
              value={title}
              onInput={(e: any) => setTitle(e.target.value)}
              style={{ width: "100%" }}
            />
            <OutlinedTextField
              label="Description"
              value={description}
              onInput={(e: any) => setDescription(e.target.value)}
              style={{ width: "100%" }}
            />
            <div className={styles.fileUpload}>
              <label className={styles.fileLabel}>
                <Icon>upload</Icon>
                <span>Upload Badge Image</span>
                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
              </label>
            </div>

            {showPreview && originalImage && resizedImage && (
              <div className={styles.comparison}>
                <div>
                  <p>Original</p>
                  <img src={originalImage} className={styles.origThumb} />
                </div>
                <Icon>arrow_forward</Icon>
                <div>
                  <p>Resized (40x40)</p>
                  <img src={resizedImage} className={styles.resizedThumb} />
                </div>
              </div>
            )}

            <FilledButton onClick={handleCreate} disabled={loading || !title || !imageUrl}>
              {loading ? "Creating..." : "Create Badge"}
            </FilledButton>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "3rem", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Your Created Badges</h2>
        <OutlinedTextField
          label="Filter badges..."
          value={searchQuery}
          onInput={(e: any) => setSearchQuery(e.target.value)}
          style={{ width: "250px" }}
        />
      </div>
      
      <div className={styles.grid}>
        {filteredBadges.map((badge) => (
          <div key={badge.id} className={styles.badgeCard}>
            <img src={badge.imageUrl} alt={badge.title} width={40} height={40} />
            <div style={{ flex: 1 }}>
              {editingId === badge.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <OutlinedTextField 
                    label="Title" 
                    value={editTitle} 
                    onInput={(e: any) => setEditTitle(e.target.value)} 
                  />
                  <OutlinedTextField 
                    label="Description" 
                    value={editDesc} 
                    onInput={(e: any) => setEditDesc(e.target.value)} 
                  />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <FilledButton onClick={handleUpdate} disabled={loading}>Save</FilledButton>
                    <TextButton onClick={() => setEditingId(null)}>Cancel</TextButton>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{badge.title}</h3>
                  <p>{badge.description}</p>
                </>
              )}
            </div>
            <div className={styles.badgeActions}>
              {editingId !== badge.id && (
                <>
                  <button onClick={() => setAssigningId(badge.id)} className={styles.assignBtn} title="Assign to User">
                    <Icon>person_add</Icon>
                  </button>
                  <button onClick={() => startEdit(badge)} className={styles.editBtn} title="Edit Badge">
                    <Icon>edit</Icon>
                  </button>
                </>
              )}
              <button onClick={() => handleDelete(badge.id)} className={styles.deleteBtn} title="Delete Badge">
                <Icon>delete</Icon>
              </button>
            </div>
          </div>
        ))}
        {filteredBadges.length === 0 && (
          <p>{searchQuery ? "No badges match your search." : "You haven't created any badges yet."}</p>
        )}
      </div>

      {assigningId && (
        <UserSelectorDialog 
          onClose={() => setAssigningId(null)} 
          onSelect={handleAssign} 
        />
      )}
    </div>
  );
}
