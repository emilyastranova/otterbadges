"use client";

import { useState } from "react";
import { Icon, TextButton } from "@/components/MaterialUI";
import { useRouter } from "next/navigation";

export default function ThemeCustomizer({ initialColor }: { initialColor: string }) {
  const [color, setColor] = useState(initialColor);
  const router = useRouter();

  const handleColorChange = async (newColor: string) => {
    setColor(newColor);
    
    await fetch("/api/users/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeColor: newColor }),
    });
    
    router.refresh();
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
        <div style={{ 
          width: "24px", 
          height: "24px", 
          borderRadius: "50%", 
          backgroundColor: color,
          border: "2px solid var(--md-sys-color-outline)"
        }} />
        <input 
          type="color" 
          value={color} 
          onChange={(e) => handleColorChange(e.target.value)}
          style={{ opacity: 0, width: 0, height: 0, padding: 0, border: "none" }} 
        />
      </label>
      <span style={{ fontSize: "0.75rem", color: "var(--md-sys-color-on-surface-variant)" }}>Customize Theme</span>
    </div>
  );
}
