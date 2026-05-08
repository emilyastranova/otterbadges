"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FilledButton, TextButton, Icon, IconButton } from "./MaterialUI";
import styles from "./NavBar.module.css";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavBar() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "OtterBadges";
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => setIsMenuOpen(false), [pathname]);

  return (
    <>
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <IconButton className={styles.menuButton} onClick={() => setIsMenuOpen(true)}>
          <Icon>menu</Icon>
        </IconButton>
        <Link href="/" className={styles.logo}>
          <Icon>military_tech</Icon>
          <span>{appName}</span>
        </Link>
      </div>

      <div className={styles.desktopLinks}>
        <Link href="/directory"><TextButton>Directory</TextButton></Link>
        <Link href="/marketplace"><TextButton>Marketplace</TextButton></Link>
        <Link href="/studio"><TextButton>Badge Studio</TextButton></Link>
        {session && (session.user as any).role === "ADMIN" && (
          <Link href="/admin"><TextButton style={{ color: "var(--md-sys-color-tertiary)" }}>Admin</TextButton></Link>
        )}
        
        {mounted && (
          <IconButton onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Icon>{theme === "dark" ? "light_mode" : "dark_mode"}</Icon>
          </IconButton>
        )}

        {session ? (
          <div className={styles.userMenu}>
            <Link href={`/u/${session.user.alias || session.user.id}`}>
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

      <div className={styles.mobileRight}>
         {mounted && (
          <IconButton onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Icon>{theme === "dark" ? "light_mode" : "dark_mode"}</Icon>
          </IconButton>
        )}
      </div>
    </nav>

    {/* Mobile Side Menu */}
    {isMenuOpen && (
      <div className={styles.drawerOverlay} onClick={() => setIsMenuOpen(false)}>
        <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.drawerHeader}>
            <Icon>military_tech</Icon>
            <span>{appName}</span>
            <IconButton onClick={() => setIsMenuOpen(false)} style={{ marginLeft: "auto" }}>
              <Icon>close</Icon>
            </IconButton>
          </div>
          <div className={styles.drawerContent}>
            <Link href="/directory" className={styles.drawerLink}>
              <Icon>groups</Icon> Directory
            </Link>
            <Link href="/marketplace" className={styles.drawerLink}>
              <Icon>storefront</Icon> Marketplace
            </Link>
            <Link href="/studio" className={styles.drawerLink}>
              <Icon>auto_awesome</Icon> Badge Studio
            </Link>
            {session && (session.user as any).role === "ADMIN" && (
              <Link href="/admin" className={styles.drawerLink}>
                <Icon>admin_panel_settings</Icon> Admin Panel
              </Link>
            )}
            <hr className={styles.divider} />
            {session ? (
              <>
                <Link href={`/u/${session.user.alias || session.user.id}`} className={styles.drawerLink}>
                  <Icon>person</Icon> My Profile
                </Link>
                <div className={styles.drawerAction}>
                  <FilledButton onClick={() => signOut()} style={{ width: "100%" }}>Sign Out</FilledButton>
                </div>
              </>
            ) : (
              <div className={styles.drawerAction}>
                <Link href="/login" style={{ width: "100%" }}>
                  <FilledButton style={{ width: "100%" }}>Sign In</FilledButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
