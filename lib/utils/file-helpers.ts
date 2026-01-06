/**
 * Determina el resourceType de Cloudinary basado en el nombre del archivo
 */
export function getResourceTypeFromFileName(fileName: string): "image" | "video" | "raw" | "auto" {
  const ext = fileName.toLowerCase().split('.').pop();

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'];
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];

  if (ext && imageExtensions.includes(ext)) {
    return 'image';
  }

  if (ext && videoExtensions.includes(ext)) {
    return 'video';
  }

  if (ext && documentExtensions.includes(ext)) {
    return 'raw';
  }

  return 'auto';
}

/**
 * Determina el tipo de media para el schema de la base de datos
 */
export function getMediaTypeFromFileName(fileName: string): "image" | "video" | "pdf" | "document" {
  const ext = fileName.toLowerCase().split('.').pop();

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'];

  if (ext && imageExtensions.includes(ext)) {
    return 'image';
  }

  if (ext && videoExtensions.includes(ext)) {
    return 'video';
  }

  if (ext === 'pdf') {
    return 'pdf';
  }

  return 'document';
}

/**
 * Valida si un archivo es un tipo soportado
 */
export function isSupportedFileType(fileName: string): boolean {
  const ext = fileName.toLowerCase().split('.').pop();

  const supportedExtensions = [
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico',
    // Videos
    'mp4', 'webm', 'mov', 'avi', 'mkv', 'flv',
    // Documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'
  ];

  return ext ? supportedExtensions.includes(ext) : false;
}

/**
 * Obtiene el MIME type de un archivo basado en su extensión
 */
export function getMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();

  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    // Videos
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    'flv': 'video/x-flv',
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
}
