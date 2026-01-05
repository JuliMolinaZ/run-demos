import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { storageUsage } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { STORAGE_LIMITS } from "@/lib/storage/cloudinary";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = parseInt(session.user?.id || "0");

    const userStorage = await db
      .select()
      .from(storageUsage)
      .where(eq(storageUsage.userId, userId))
      .limit(1);

    const totalBytes = userStorage[0]?.totalBytes || 0;
    const limitBytes = userStorage[0]?.limitBytes || STORAGE_LIMITS.FREE_TIER_BYTES;
    const usedMB = totalBytes / (1024 * 1024);
    const limitMB = limitBytes / (1024 * 1024);
    const availableMB = (limitBytes - totalBytes) / (1024 * 1024);
    const percentage = (totalBytes / limitBytes) * 100;

    return NextResponse.json({
      used: {
        bytes: totalBytes,
        mb: usedMB,
        formatted: `${usedMB.toFixed(2)} MB`,
      },
      limit: {
        bytes: limitBytes,
        mb: limitMB,
        formatted: `${limitMB.toFixed(2)} MB`,
      },
      available: {
        bytes: limitBytes - totalBytes,
        mb: availableMB,
        formatted: `${availableMB.toFixed(2)} MB`,
      },
      percentage: percentage.toFixed(1),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

