import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { storageUsage } from "@/lib/db/schema";
import { STORAGE_LIMITS } from "@/lib/storage/cloudinary";
import { sql } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo administradores pueden ver el almacenamiento total
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener almacenamiento total de todos los usuarios
    const totalStorage = await db
      .select({
        totalBytes: sql<number>`COALESCE(SUM(${storageUsage.totalBytes}), 0)`,
        totalLimit: sql<number>`COALESCE(SUM(${storageUsage.limitBytes}), 0)`,
        userCount: sql<number>`COUNT(DISTINCT ${storageUsage.userId})`,
      })
      .from(storageUsage);

    const totalBytes = Number(totalStorage[0]?.totalBytes || 0);
    // Si no hay usuarios con storageUsage, usar el límite por defecto de un usuario
    // Si hay usuarios, sumar sus límites individuales
    const userCount = Number(totalStorage[0]?.userCount || 0);
    const totalLimitBytes = userCount > 0 
      ? Number(totalStorage[0]?.totalLimit || 0) 
      : STORAGE_LIMITS.FREE_TIER_BYTES;
    
    const usedMB = totalBytes / (1024 * 1024);
    const limitMB = totalLimitBytes / (1024 * 1024);
    const availableMB = (totalLimitBytes - totalBytes) / (1024 * 1024);
    const percentage = totalLimitBytes > 0 ? (totalBytes / totalLimitBytes) * 100 : 0;

    return NextResponse.json({
      used: {
        bytes: totalBytes,
        mb: usedMB,
        formatted: `${usedMB.toFixed(2)} MB`,
      },
      limit: {
        bytes: totalLimitBytes,
        mb: limitMB,
        formatted: `${limitMB.toFixed(2)} MB`,
      },
      available: {
        bytes: totalLimitBytes - totalBytes,
        mb: availableMB,
        formatted: `${availableMB.toFixed(2)} MB`,
      },
      percentage: percentage.toFixed(1),
    });
  } catch (error: any) {
    logger.error("Error fetching admin storage", error);
    return NextResponse.json({ error: "Error al obtener almacenamiento" }, { status: 500 });
  }
}

