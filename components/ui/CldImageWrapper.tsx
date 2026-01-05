"use client";

import Image from "next/image";

interface CldImageWrapperProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
}

/**
 * Optimiza URLs de Cloudinary agregando transformaciones automáticas
 * Formato: f_auto (formato automático), q_auto (calidad automática), c_auto (crop automático)
 */
function optimizeCloudinaryUrl(url: string): string {
  try {
    // Si ya tiene transformaciones, no hacer nada
    if (url.includes("/upload/") && !url.includes("/upload/v")) {
      // Ya tiene transformaciones (formato: /upload/transformations/public_id)
      return url;
    }

    // Si es una URL de Cloudinary sin transformaciones
    if (url.includes("/upload/v")) {
      // Formato: /upload/v1234567890/public_id
      // Insertar transformaciones antes del version
      return url.replace("/upload/v", "/upload/f_auto,q_auto,c_auto/v");
    }

    if (url.includes("/upload/") && !url.includes("/upload/v")) {
      // Formato: /upload/public_id (sin version)
      // Agregar transformaciones
      return url.replace("/upload/", "/upload/f_auto,q_auto,c_auto/");
    }

    return url;
  } catch (e) {
    return url;
  }
}

/**
 * Componente wrapper que optimiza imágenes de Cloudinary usando transformaciones en la URL
 * Para otras URLs, usa Image normal de Next.js
 */
export function CldImageWrapper({
  src,
  alt,
  width,
  height,
  className,
  fill,
}: CldImageWrapperProps) {
  // Si la URL es de Cloudinary, optimizarla
  const isCloudinary = src.includes("cloudinary.com") || src.includes("res.cloudinary.com");
  const optimizedSrc = isCloudinary ? optimizeCloudinaryUrl(src) : src;

  // Usar Image de Next.js para todas las imágenes
  if (fill) {
    return (
      <Image
        src={optimizedSrc}
        alt={alt}
        fill
        className={className}
        unoptimized={false} // Next.js optimizará las imágenes
      />
    );
  }

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width || 500}
      height={height || 500}
      className={className}
      unoptimized={false} // Next.js optimizará las imágenes
    />
  );
}

