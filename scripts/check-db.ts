#!/usr/bin/env tsx
/**
 * Valida la conexión a PostgreSQL usando DATABASE_URL de .env
 * Uso: npm run db:check   o   tsx --env-file=.env scripts/check-db.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL no está definida en .env");
  process.exit(1);
}

// Mostrar a qué se conecta (sin contraseña)
try {
  const url = new URL(DATABASE_URL.replace(/^postgresql:\/\//, "https://"));
  console.log("   Conectando a:", url.hostname, "puerto", url.port || "5432", "usuario", url.username);
} catch {
  console.log("   (no se pudo parsear la URL)");
}

async function check() {
  const sql = postgres(DATABASE_URL!, { max: 1 });
  try {
    const result = await sql`SELECT 1 as ok`;
    console.log("✅ Base de datos: conexión OK");
    console.log("   Resultado:", result[0]);
    const version = await sql`SELECT version()`;
    console.log("   PostgreSQL:", (version[0]?.version as string)?.split("\n")[0] || "—");
  } catch (err: unknown) {
    console.error("❌ Error conectando a la base de datos:");
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

check();
