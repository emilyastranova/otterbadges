import { prisma } from "../src/lib/prisma";
import { createCanvas, loadImage } from "canvas";

async function run() {
  const badges = await prisma.badge.findMany({
    where: { previewUrl: null }
  });

  console.log(`Generating previews for ${badges.length} badges...`);

  for (const b of badges) {
    try {
      const img = await loadImage(b.imageUrl);
      const canvas = createCanvas(20, 20);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, 20, 20);

      const previewUrl = canvas.toDataURL("image/png");

      await prisma.badge.update({
        where: { id: b.id },
        data: { previewUrl }
      });
      console.log(`Updated ${b.title}`);
    } catch (e) {
      console.error(`Failed to generate preview for ${b.title}:`, e);
    }
  }

  process.exit(0);
}

run();