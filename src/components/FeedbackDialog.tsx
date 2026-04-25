"use client";

import { Dialog, FilledButton, TextButton, Icon } from "./MaterialUI";

interface FeedbackDialogProps {
  open: boolean;
  title: string;
  message: string;
  type?: "alert" | "confirm" | "error" | "success";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function FeedbackDialog({
  open,
  title,
  message,
  type = "alert",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: FeedbackDialogProps) {
  if (!open) return null;

  const getIcon = () => {
    switch (type) {
      case "error": return "error";
      case "success": return "check_circle";
      case "confirm": return "help";
      default: return "info";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "error": return "var(--md-sys-color-error)";
      case "success": return "var(--md-sys-color-primary)";
      case "confirm": return "var(--md-sys-color-tertiary)";
      default: return "var(--md-sys-color-primary)";
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onCancel || onConfirm}
      style={{
        // @ts-ignore
        "--md-dialog-container-color": "var(--md-sys-color-surface-container-high)",
      } as any}
    >
      <div slot="headline" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Icon style={{ color: getIconColor() }}>{getIcon()}</Icon>
        {title}
      </div>
      <div slot="content">
        {message}
      </div>
      <div slot="actions">
        {type === "confirm" && (
          <TextButton onClick={onCancel}>{cancelLabel}</TextButton>
        )}
        <FilledButton onClick={onConfirm}>{confirmLabel}</FilledButton>
      </div>
    </Dialog>
  );
}
