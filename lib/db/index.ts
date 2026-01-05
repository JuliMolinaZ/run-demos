import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const connectionString = process.env.DATABASE_URL;

// Singleton pattern para evitar múltiples instancias del cliente
// (importante en Next.js donde los módulos pueden recargarse en desarrollo)
declare global {
  // eslint-disable-next-line no-var
  var __postgresClient: ReturnType<typeof postgres> | undefined;
}

// Configurar pool de conexiones para evitar agotamiento
// Configuración recomendada para producción:
// - max: máximo de conexiones en el pool (default: 10)
// - idle_timeout: tiempo antes de cerrar conexiones inactivas (20 segundos)
// - max_lifetime: tiempo máximo de vida de una conexión (30 minutos)
// - connect_timeout: timeout para establecer conexión (10 segundos)
const getPostgresClient = () => {
  if (process.env.NODE_ENV === "development") {
    // En desarrollo, reutilizar el cliente global para evitar múltiples conexiones
    if (!global.__postgresClient) {
      global.__postgresClient = postgres(connectionString, {
        max: 5, // Reducir conexiones en desarrollo
        idle_timeout: 10, // Cerrar conexiones inactivas más rápido
        max_lifetime: 60 * 30, // Máximo 30 minutos de vida por conexión
        connect_timeout: 10, // 10 segundos para establecer conexión
      });
    }
    return global.__postgresClient;
  }

  // En producción, crear una nueva instancia (Next.js optimiza esto)
  return postgres(connectionString, {
    max: 10, // Máximo de conexiones simultáneas
    idle_timeout: 20, // Cerrar conexiones inactivas después de 20 segundos
    max_lifetime: 60 * 30, // Máximo 30 minutos de vida por conexión
    connect_timeout: 10, // 10 segundos para establecer conexión
  });
};

const client = getPostgresClient();

export const db = drizzle(client, { schema });

// Función para cerrar todas las conexiones (útil para shutdown graceful)
export async function closeDatabase() {
  await client.end();
  if (global.__postgresClient) {
    global.__postgresClient = undefined;
  }
}

