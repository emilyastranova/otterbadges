import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const badge = await prisma.badge.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!badge || !badge.imageUrl) {
      return new NextResponse(null, { status: 404 });
    }

    // Handle base64 data URLs
    if (badge.imageUrl.startsWith("data:")) {
      const matches = badge.imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // Fallback for regular URLs
    return NextResponse.redirect(badge.imageUrl);
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
