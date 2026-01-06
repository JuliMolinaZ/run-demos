import { v2 as cloudinary } from "cloudinary";

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

  // Usar REST API directamente con fetch en lugar del SDK
  try {
    // Convertir Buffer a base64 data URI
    const base64 = `data:${resourceType === 'video' ? 'video/mp4' : 'image/png'};base64,${file.toString('base64')}`;

    // Generar timestamp y signature para signed upload
    const timestamp = Math.round(Date.now() / 1000);
    const crypto = await import('crypto');

    // Parámetros para el signature (deben estar en orden alfabético)
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    // Crear FormData
    const formData = new FormData();
    formData.append('file', base64);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    console.log('[CLOUDINARY DEBUG] Uploading with params:', {
      cloudName,
      folder,
      resourceType,
      timestamp,
    });

    // Upload a Cloudinary usando REST API
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CLOUDINARY ERROR]', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500),
      });
      throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[CLOUDINARY SUCCESS]', { publicId: result.public_id, url: result.secure_url });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
    };
  } catch (error: any) {
    console.error('[CLOUDINARY ERROR]', error);
    throw new Error(`Error al subir archivo a Cloudinary: ${error.message}`);
  }
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

