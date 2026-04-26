"use client";

import { useState, useCallback } from "react";
import { FilledButton, OutlinedTextField, Icon, TextButton, Checkbox } from "@/components/MaterialUI";
import { Badge } from "@prisma/client";
import styles from "./studio.module.css";
import FeedbackDialog from "@/components/FeedbackDialog";
import Link from "next/link";

import UserSelectorDialog from "./UserSelectorDialog";
import BadgeRecipientManager from "./BadgeRecipientManager";

export default function BadgeStudioClient({ initialBadges }: { initialBadges: Badge[] }) {
  const [badges, setBadges] = useState<Badge[]>(initialBadges);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editExternalUrl, setEditExternalUrl] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [useSmooth, setUseSmooth] = useState(true);
  const [editUseSmooth, setEditUseSmooth] = useState(true);
  const [rawSourceImage, setRawSourceImage] = useState<string | null>(null);
  const [isAnimatedUpload, setIsAnimatedUpload] = useState(false);
  const [editRawSourceImage, setEditRawSourceImage] = useState<string | null>(null);
  const [editIsAnimatedUpload, setEditIsAnimatedUpload] = useState(false);

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

  const filteredBadges = badges.filter((badge) => {
    const q = searchQuery.toLowerCase();
    return badge.title.toLowerCase().includes(q) || badge.description.toLowerCase().includes(q);
  });

  const resizeImage = useCallback((sourceDataUrl: string, smooth: boolean): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 40;
        canvas.height = 40;
        if (ctx) {
          ctx.imageSmoothingEnabled = smooth;
          if (smooth) ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, 40, 40);
          resolve(canvas.toDataURL("image/png"));
        }
      };
      img.src = sourceDataUrl;
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAnimated = file.type === "image/gif" || file.type === "image/webp";
    const reader = new FileReader();

    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setOriginalImage(dataUrl);
      setRawSourceImage(dataUrl);
      setIsAnimatedUpload(isAnimated);

      if (isAnimated) {
        setResizedImage(dataUrl);
        setImageUrl(dataUrl);
        setShowPreview(true);
      } else {
        const resized = await resizeImage(dataUrl, useSmooth);
        setResizedImage(resized);
        setImageUrl(resized);
        const img = new Image();
        img.onload = () => setShowPreview(img.width > 40 || img.height > 40);
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSmoothToggle = async (smooth: boolean) => {
    setUseSmooth(smooth);
    if (rawSourceImage && !isAnimatedUpload) {
      const resized = await resizeImage(rawSourceImage, smooth);
      setResizedImage(resized);
      setImageUrl(resized);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAnimated = file.type === "image/gif" || file.type === "image/webp";
    const reader = new FileReader();

    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setEditRawSourceImage(dataUrl);
      setEditIsAnimatedUpload(isAnimated);

      if (isAnimated) {
        setEditImageUrl(dataUrl);
      } else {
        const resized = await resizeImage(dataUrl, editUseSmooth);
        setEditImageUrl(resized);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditSmoothToggle = async (smooth: boolean) => {
    setEditUseSmooth(smooth);
    if (editRawSourceImage && !editIsAnimatedUpload) {
      const resized = await resizeImage(editRawSourceImage, smooth);
      setEditImageUrl(resized);
    }
  };

  const handleCreate = async () => {
    if (!title || !description || !imageUrl) return;
    setLoading(true);

    const res = await fetch("/api/badges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, imageUrl, externalUrl, isPublic, useSmooth }),
    });

    if (res.ok) {
      const newBadge = await res.json();
      setBadges([newBadge, ...badges]);
      setTitle("");
      setDescription("");
      setExternalUrl("");
      setImageUrl("");
      setIsPublic(false);
      setOriginalImage(null);
      setResizedImage(null);
      setShowPreview(false);
      setRawSourceImage(null);
      setIsAnimatedUpload(false);
      setUseSmooth(true);
    }
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    setDialog({
      open: true,
      title: "Delete Badge",
      message: "Are you sure you want to delete this badge? This action cannot be undone.",
      type: "confirm",
      onConfirm: async () => {
        setDialog(prev => ({ ...prev, open: false }));
        const res = await fetch(`/api/badges/${id}`, { method: "DELETE" });
        if (res.ok) {
          setBadges(badges.filter((b) => b.id !== id));
        }
      },
    });
  };

  const startEdit = (badge: Badge) => {
    setEditingId(badge.id);
    setEditTitle(badge.title);
    setEditDesc(badge.description);
    setEditExternalUrl(badge.externalUrl || "");
    setEditIsPublic(badge.isPublic);
    setEditImageUrl(null);
    setEditRawSourceImage(null);
    setEditIsAnimatedUpload(false);
    setEditUseSmooth(badge.useSmooth);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setLoading(true);

    const body: any = { 
      title: editTitle, 
      description: editDesc, 
      externalUrl: editExternalUrl,
      isPublic: editIsPublic,
      useSmooth: editUseSmooth
    };
    if (editImageUrl) body.imageUrl = editImageUrl;

    const res = await fetch(`/api/badges/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const updated = await res.json();
      setBadges(badges.map((b) => (b.id === editingId ? updated : b)));
      setEditingId(null);
      setEditImageUrl(null);
      setEditRawSourceImage(null);
      setEditIsAnimatedUpload(false);
      setEditUseSmooth(true);
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
            <OutlinedTextField
              label="External Link (Optional URL)"
              value={externalUrl}
              onInput={(e: any) => setExternalUrl(e.target.value)}
              style={{ width: "100%" }}
              placeholder="https://example.com"
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

            {rawSourceImage && !isAnimatedUpload && (
              <div className={styles.checkboxField}>
                <Checkbox
                  checked={useSmooth}
                  onChange={(e: any) => handleSmoothToggle(e.target.checked)}
                  id="useSmooth"
                />
                <label htmlFor="useSmooth">Smooth scaling (uncheck for sharp pixel art)</label>
              </div>
            )}

            <div className={styles.checkboxField}>
              <Checkbox
                checked={isPublic}
                onChange={(e: any) => setIsPublic(e.target.checked)}
                id="isPublic"
              />
              <label htmlFor="isPublic">Publish to Marketplace (Anyone can get this badge)</label>
            </div>

            <FilledButton onClick={handleCreate} disabled={loading || !title || !imageUrl}>
              {loading ? "Creating..." : "Create Badge"}
            </FilledButton>
          </div>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <h2 style={{ margin: 0 }}>Your Created Badges</h2>
        <OutlinedTextField
          label="Filter badges..."
          value={searchQuery}
          onInput={(e: any) => setSearchQuery(e.target.value)}
          className={styles.filterField}
        />
      </div>
      
      <div className={styles.grid}>
        {filteredBadges.map((badge) => (
          <div key={badge.id} className={styles.badgeCard}>
            {editingId === badge.id ? (
              <img src={editImageUrl ? editImageUrl : badge.imageUrl} alt={badge.title} width={40} height={40} />
            ) : (
              <Link href={`/b/${badge.slug || badge.id}`}>
                <img src={badge.imageUrl} alt={badge.title} width={40} height={40} style={{ cursor: "pointer" }} />
              </Link>
            )}
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
                  <OutlinedTextField 
                    label="External Link (Optional URL)" 
                    value={editExternalUrl} 
                    onInput={(e: any) => setEditExternalUrl(e.target.value)} 
                    placeholder="https://example.com"
                  />
                  <div className={styles.fileUpload}>
                    <label className={styles.fileLabel}>
                      <Icon>image</Icon>
                      <span>{editImageUrl ? "Image Changed ✓" : "Change Image"}</span>
                      <input type="file" accept="image/*" onChange={handleEditFileChange} hidden />
                    </label>
                  </div>
                  {!editIsAnimatedUpload && (
                    <div className={styles.checkboxField}>
                      <Checkbox
                        checked={editUseSmooth}
                        onChange={(e: any) => handleEditSmoothToggle(e.target.checked)}
                        id={`edit-smooth-${badge.id}`}
                      />
                      <label htmlFor={`edit-smooth-${badge.id}`}>Smooth scaling</label>
                    </div>
                  )}
                  <div className={styles.checkboxField}>
                    <Checkbox
                      checked={editIsPublic}
                      onChange={(e: any) => setEditIsPublic(e.target.checked)}
                      id={`edit-isPublic-${badge.id}`}
                    />
                    <label htmlFor={`edit-isPublic-${badge.id}`}>Publish to Marketplace</label>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <FilledButton onClick={handleUpdate} disabled={loading}>Save</FilledButton>
                    <TextButton onClick={() => { setEditingId(null); setEditImageUrl(null); setEditRawSourceImage(null); setEditIsAnimatedUpload(false); setEditUseSmooth(true); }}>Cancel</TextButton>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h3>{badge.title}</h3>
                    {badge.isPublic && (
                      <span className={styles.publicBadgeTag}>
                        <Icon style={{ fontSize: "14px" }}>store</Icon>
                        Marketplace
                      </span>
                    )}
                  </div>
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
        <BadgeRecipientManager 
          badgeId={assigningId}
          badgeTitle={badges.find(b => b.id === assigningId)?.title || ""}
          onClose={() => setAssigningId(null)} 
        />
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
