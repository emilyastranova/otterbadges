import { prisma } from "./prisma";

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

