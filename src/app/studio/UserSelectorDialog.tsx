"use client";

import { useState, useEffect } from "react";
import { Icon, OutlinedTextField, TextButton, FilledButton } from "@/components/MaterialUI";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

export default function UserSelectorDialog({ 
  onClose, 
  onSelect 
}: { 
  onClose: () => void; 
  onSelect: (userId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "var(--md-sys-color-surface)",
        color: "var(--md-sys-color-on-surface)",
        padding: "2rem",
        borderRadius: "1rem",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "var(--md-sys-elevation-3)"
      }}>
        <h2 style={{ marginTop: 0 }}>Assign to User</h2>
        <OutlinedTextField
          label="Search users..."
          value={search}
          onInput={(e: any) => setSearch(e.target.value)}
          style={{ width: "100%", marginBottom: "1.5rem" }}
        />

        <div style={{ 
          maxHeight: "300px", 
          overflowY: "auto", 
          display: "flex", 
          flexDirection: "column", 
          gap: "0.5rem",
          marginBottom: "1.5rem"
        }}>
          {loading && <p>Searching...</p>}
          {users.map((user) => (
            <div 
              key={user.id} 
              onClick={() => onSelect(user.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                cursor: "pointer",
                border: "1px solid var(--md-sys-color-outline-variant)",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--md-sys-color-surface-container-high)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <div style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%", 
                backgroundColor: "var(--md-sys-color-primary-container)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}>
                {user.image ? <img src={user.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon style={{ fontSize: "20px" }}>person</Icon>}
              </div>
              <span style={{ fontWeight: 500 }}>{user.name || "Unknown"}</span>
            </div>
          ))}
          {!loading && users.length === 0 && <p>No users found.</p>}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <TextButton onClick={onClose}>Cancel</TextButton>
        </div>
      </div>
    </div>
  );
}
