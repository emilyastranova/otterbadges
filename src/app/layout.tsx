import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProviders } from "@/components/ThemeProvider";
import NextAuthSessionProvider from "@/components/SessionProvider";
import { NavBar } from "@/components/NavBar";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "OtterBadges",
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
      <body className={`${roboto.variable} ${roboto.className}`}>
        <NextAuthSessionProvider>
          <ThemeProviders>
            <NavBar />
            <main>{children}</main>
          </ThemeProviders>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
