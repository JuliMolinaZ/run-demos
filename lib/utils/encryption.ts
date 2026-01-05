import crypto from "crypto";
import { logger } from "./logger";

/**
 * Módulo de Encriptación para Credenciales de Demo
 * 
 * ESTRATEGIA DE ENCRIPTACIÓN:
 * - Algoritmo: AES-256-GCM (Galois/Counter Mode)
 * - IV (Initialization Vector): Generado aleatoriamente para cada encriptación (12 bytes para GCM)
 * - Key: Derivada de ENCRYPTION_KEY en .env (debe ser de 32 bytes para AES-256)
 * - Formato almacenado: `iv:authTag:encryptedData` (todos en base64)
 * 
 * SEGURIDAD:
 * - Cada encriptación usa un IV único (previene ataques de patrón)
 * - GCM proporciona autenticación integrada (detecta modificaciones)
 * - La key debe estar en .env y nunca en el código
 * - Rotación de key: Si necesitas rotar, desencripta con la key antigua y re-encripta con la nueva
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes para GCM (96 bits)
const AUTH_TAG_LENGTH = 16; // 16 bytes para el auth tag de GCM
const KEY_LENGTH = 32; // 32 bytes para AES-256

/**
 * Obtiene la clave de encriptación desde variables de entorno
 * Si no existe, genera una advertencia y usa una key de desarrollo (NO SEGURA)
 */
function getEncryptionKey(): Buffer {
  const keyString = process.env.ENCRYPTION_KEY;

  if (!keyString) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ENCRYPTION_KEY no está configurada. Esto es CRÍTICO para producción."
      );
    }
    logger.warn(
      "ENCRYPTION_KEY no está configurada. Usando key de desarrollo (NO SEGURA)."
    );
    // Key de desarrollo (NO usar en producción)
    return crypto.scryptSync("development-key", "salt", KEY_LENGTH);
  }

  // Si la key es un string, derivarla a 32 bytes
  if (keyString.length < 32) {
    // Si es muy corta, usar scrypt para derivarla
    return crypto.scryptSync(keyString, "demo-hub-salt", KEY_LENGTH);
  }

  // Si es exactamente 32 caracteres o más, usar los primeros 32 bytes
  return Buffer.from(keyString.substring(0, KEY_LENGTH), "utf-8");
}

/**
 * Encripta un objeto de credenciales
 * @param credentials Objeto con username y password
 * @returns String encriptado en formato base64: `iv:authTag:encryptedData`
 */
export function encryptCredentials(credentials: {
  username?: string | null;
  password?: string | null;
}): string {
  try {
    if (!credentials || (!credentials.username && !credentials.password)) {
      return "";
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Convertir objeto a JSON string
    const plaintext = JSON.stringify(credentials);

    // Encriptar
    let encrypted = cipher.update(plaintext, "utf8", "base64");
    encrypted += cipher.final("base64");

    // Obtener auth tag (GCM lo genera automáticamente)
    const authTag = cipher.getAuthTag();

    // Formato: iv:authTag:encryptedData (todos en base64)
    return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
  } catch (error) {
    logger.error("Error encriptando credenciales", error);
    throw new Error("Error al encriptar credenciales");
  }
}

/**
 * Desencripta un string encriptado
 * @param encryptedString String en formato `iv:authTag:encryptedData`
 * @returns Objeto con username y password, o null si hay error
 */
export function decryptCredentials(
  encryptedString: string | null | undefined
): { username?: string | null; password?: string | null } | null {
  try {
    if (!encryptedString || typeof encryptedString !== "string") {
      return null;
    }

    // Separar las partes
    const parts = encryptedString.split(":");
    if (parts.length !== 3) {
      logger.warn("Formato de credenciales encriptadas inválido");
      return null;
    }

    const [ivBase64, authTagBase64, encrypted] = parts;

    const key = getEncryptionKey();
    const iv = Buffer.from(ivBase64, "base64");
    const authTag = Buffer.from(authTagBase64, "base64");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Desencriptar
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");

    // Parsear JSON
    return JSON.parse(decrypted) as {
      username?: string | null;
      password?: string | null;
    };
  } catch (error) {
    logger.error("Error desencriptando credenciales", error);
    // En caso de error, retornar null en lugar de lanzar excepción
    // para que la app pueda continuar funcionando
    return null;
  }
}

/**
 * Verifica si un string está encriptado (formato correcto)
 */
export function isEncrypted(encryptedString: string | null | undefined): boolean {
  if (!encryptedString || typeof encryptedString !== "string") {
    return false;
  }
  const parts = encryptedString.split(":");
  return parts.length === 3;
}

/**
 * Migra credenciales sin encriptar a formato encriptado
 * Útil para migrar datos existentes
 */
export function migrateCredentials(
  oldCredentials: { username?: string | null; password?: string | null } | null
): string {
  if (!oldCredentials) {
    return "";
  }
  return encryptCredentials(oldCredentials);
}

