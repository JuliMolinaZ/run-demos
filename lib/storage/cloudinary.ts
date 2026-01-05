import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export interface UploadFileParams {
  file: Buffer | Uint8Array;
  fileName: string;
  folder?: string;
  resourceType?: "image" | "video" | "auto";
}

export interface UploadResult {
  url: string;
  publicId: string;
  size: number;
}

/**
 * Sube un archivo a Cloudinary
 */
export async function uploadFile({
  file,
  fileName,
  folder = "demo-hub",
  resourceType = "auto",
}: UploadFileParams): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      `Cloudinary no está configurado. Agrega las siguientes variables a tu archivo .env:\n` +
      `- CLOUDINARY_CLOUD_NAME=${cloudName ? "✓" : "✗ (FALTA)"}\n` +
      `- CLOUDINARY_API_KEY=${apiKey ? "✓" : "✗ (FALTA)"}\n` +
      `- CLOUDINARY_API_SECRET=${apiSecret ? "✓" : "✗ (FALTA)"}\n\n` +
      `Ver CLOUDINARY_SETUP.md para más información.`
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("No se recibió resultado de Cloudinary"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          size: result.bytes,
        });
      }
    );

    uploadStream.end(file);
  });
}

/**
 * Elimina un archivo de Cloudinary
 */
export async function deleteFile(publicId: string, resourceType: "image" | "video" = "image"): Promise<void> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary no está configurado.");
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

// Constantes para límites
export const STORAGE_LIMITS = {
  FREE_TIER_BYTES: 25 * 1024 * 1024 * 1024, // 25 GB (Cloudinary free tier)
  MAX_FILE_SIZE_IMAGE: 10 * 1024 * 1024, // 10 MB (Cloudinary permite hasta 10MB para imágenes)
  MAX_FILE_SIZE_VIDEO: 100 * 1024 * 1024, // 100 MB (Cloudinary permite hasta 100MB para videos en free tier)
};

export { cloudinary };

