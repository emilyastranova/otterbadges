import { prisma } from "./prisma";

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")) {
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function generateUniqueAlias(name: string): Promise<string> {
  const base = name.toLowerCase().replace(/\s+/g, "");
  let alias = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { alias },
    });

    if (!existing) return alias;

    alias = `${base}${counter}`;
    counter++;
  }
}

export async function generateUniqueBadgeSlug(title: string): Promise<string> {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let slug = base || "badge";
  let counter = 1;

  while (true) {
    const existing = await prisma.badge.findUnique({
      where: { slug },
    });

    if (!existing) return slug;

    slug = `${base}-${counter}`;
    counter++;
  }
}

/**
 * Returns true if no users exist in the database yet.
 * Used to auto-promote the very first user to ADMIN.
 */
export async function isFirstUser(): Promise<boolean> {
  const count = await prisma.user.count();
  return count === 0;
}
