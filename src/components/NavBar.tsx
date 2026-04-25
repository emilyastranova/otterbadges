"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FilledButton, TextButton, Icon } from "./MaterialUI";
import styles from "./NavBar.module.css";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function NavBar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <Link href="/" className={styles.logo}>
          <Icon>military_tech</Icon>
          <span>OtterBadges</span>
        </Link>
      </div>

      <div className={styles.links}>
        <Link href="/directory"><TextButton>Directory</TextButton></Link>
        <Link href="/marketplace"><TextButton>Marketplace</TextButton></Link>
        <Link href="/studio"><TextButton>Badge Studio</TextButton></Link>
        
        {mounted && (
          <TextButton onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Icon>{theme === "dark" ? "light_mode" : "dark_mode"}</Icon>
          </TextButton>
        )}

        {session ? (
          <div className={styles.userMenu}>
            <Link href={`/u/${session.user.id}`}>
              <TextButton>Profile</TextButton>
            </Link>
            <FilledButton onClick={() => signOut()}>Sign Out</FilledButton>
          </div>
        ) : (
          <Link href="/login">
            <FilledButton>Sign In</FilledButton>
          </Link>
        )}
      </div>
    </nav>
  );
}
