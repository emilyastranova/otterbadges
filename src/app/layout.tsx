import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProviders } from "@/components/ThemeProvider";
import NextAuthSessionProvider from "@/components/SessionProvider";
import { NavBar } from "@/components/NavBar";
import { getBaseUrl } from "@/lib/utils";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: process.env.NEXT_PUBLIC_APP_NAME || "OtterBadges",
  description: "A digital badge achievement system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block" />
      </head>
      <body className={`${roboto.variable} ${roboto.className}`} suppressHydrationWarning>
        <NextAuthSessionProvider>
          <ThemeProviders>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <NavBar />
              <main style={{ flex: 1 }}>{children}</main>
              <footer style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--md-sys-color-outline)",
                fontSize: "0.875rem",
                marginTop: "auto"
              }}>
                Created with love by <a href="https://www.team1619.org" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", color: "inherit" }}>Up-A-Creek Robotics</a>{" - "}FRC Team 1619 &hearts;
              </footer>
            </div>
          </ThemeProviders>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
