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
