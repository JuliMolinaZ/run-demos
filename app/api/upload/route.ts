import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { uploadFile, STORAGE_LIMITS } from "@/lib/storage/cloudinary";
import { db } from "@/lib/db";
import { storageUsage } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";
import { getResourceTypeFromFileName, isSupportedFileType } from "@/lib/utils/file-helpers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = parseInt(session.user?.id || "0");
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'image', 'video', or 'document'

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    // Validar que el tipo de archivo sea soportado
    if (!isSupportedFileType(file.name)) {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado" },
        { status: 400 }
      );
    }

    // Verificar límite de tamaño de archivo
    let maxSize = STORAGE_LIMITS.MAX_FILE_SIZE_IMAGE; // 10MB por defecto
    if (type === "video") {
      maxSize = STORAGE_LIMITS.MAX_FILE_SIZE_VIDEO; // 100MB
    } else if (type === "document") {
      maxSize = 10 * 1024 * 1024; // 10MB para documentos
    }

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `El archivo excede el límite de ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Verificar espacio disponible del usuario
    const userStorage = await db
      .select()
      .from(storageUsage)
      .where(eq(storageUsage.userId, userId))
      .limit(1);

    let currentUsage = userStorage[0]?.totalBytes || 0;
    const limit = userStorage[0]?.limitBytes || STORAGE_LIMITS.FREE_TIER_BYTES;

    if (currentUsage + file.size > limit) {
      const availableMB = (limit - currentUsage) / (1024 * 1024);
      return NextResponse.json(
        { error: `Espacio insuficiente. Disponible: ${availableMB.toFixed(2)}MB` },
        { status: 400 }
      );
    }

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determinar folder y resourceType basado en el tipo de archivo
    let folder = "demo-hub/images";
    if (type === "video") {
      folder = "demo-hub/videos";
    } else if (type === "document") {
      folder = "demo-hub/documents";
    }

    // Usar helper para determinar el resourceType correcto de Cloudinary
    const resourceType = getResourceTypeFromFileName(file.name);

    const result = await uploadFile({
      file: buffer,
      fileName: file.name,
      folder,
      resourceType,
    });

    // Actualizar uso de almacenamiento
    const newTotalBytes = currentUsage + result.size;
    if (userStorage.length > 0) {
      await db
        .update(storageUsage)
        .set({
          totalBytes: newTotalBytes,
          updatedAt: new Date(),
        })
        .where(eq(storageUsage.userId, userId));
    } else {
      await db.insert(storageUsage).values({
        userId,
        totalBytes: result.size,
        limitBytes: limit,
      });
    }

    return NextResponse.json({
      url: result.url,
      key: result.publicId, // Cloudinary usa publicId en lugar de key
      size: result.size,
    });
  } catch (error: any) {
    logger.error("Error uploading file", error);
    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    );
  }
}

