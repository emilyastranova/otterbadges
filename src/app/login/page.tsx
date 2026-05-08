"use client";

import { useState, useEffect } from "react";
import { signIn, getProviders } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FilledButton, OutlinedTextField, Icon } from "@/components/MaterialUI";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignup) {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Signup failed");
        return;
      }
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/directory");
      router.refresh();
    }
  };

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/directory" });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 80px)" }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "400px", 
        padding: "2rem", 
        backgroundColor: "var(--md-sys-color-surface)",
        color: "var(--md-sys-color-on-surface)",
        borderRadius: "1rem",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        border: "1px solid var(--md-sys-color-outline-variant)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Icon style={{ fontSize: "48px", color: "var(--md-sys-color-primary)" }}>military_tech</Icon>
          <h1 style={{ marginTop: "0.5rem" }}>{isSignup ? "Create Account" : "Sign In"}</h1>
        </div>

        {error && <p style={{ color: "var(--md-sys-color-error)", textAlign: "center" }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {isSignup && (
            <OutlinedTextField
              label="Name"
              type="text"
              value={name}
              onInput={(e: any) => setName(e.target.value)}
              style={{ width: "100%" }}
            />
          )}
          <OutlinedTextField
            label="Email"
            type="email"
            value={email}
            onInput={(e: any) => setEmail(e.target.value)}
            style={{ width: "100%" }}
          />
          <OutlinedTextField
            label="Password"
            type="password"
            value={password}
            onInput={(e: any) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />
          <FilledButton type="submit" style={{ marginTop: "1rem" }}>{isSignup ? "Sign Up" : "Sign In"}</FilledButton>
        </form>
        
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button 
            onClick={() => setIsSignup(!isSignup)} 
            style={{ background: "none", border: "none", color: "var(--md-sys-color-primary)", cursor: "pointer", textDecoration: "underline" }}
          >
            {isSignup ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>
        </div>

        {providers?.google && (
          <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--md-sys-color-outline)" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "currentColor" }}></div>
              <span>OR</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "currentColor" }}></div>
            </div>
            <FilledButton onClick={handleGoogle} style={{ width: "100%", backgroundColor: "#DB4437", color: "white" }}>
              Sign in with Google
            </FilledButton>
          </div>
        )}
      </div>
    </div>
  );
}
