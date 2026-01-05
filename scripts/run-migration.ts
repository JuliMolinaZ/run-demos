#!/usr/bin/env tsx
/**
 * Script para ejecutar migraciones SQL manualmente
 * Uso: tsx --env-file=.env scripts/run-migration.ts <ruta-al-archivo-sql>
 */

import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
import postgres from "postgres";

// Cargar variables de entorno
config({ path: resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL no está configurada en .env");
  process.exit(1);
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("❌ Debes proporcionar la ruta al archivo de migración");
  console.error("Uso: tsx --env-file=.env scripts/run-migration.ts <ruta-al-archivo-sql>");
  process.exit(1);
}

async function runMigration() {
  const sql = postgres(DATABASE_URL!, {
    max: 1, // Solo una conexión para migraciones
  });

  try {
    console.log(`📄 Leyendo migración: ${migrationFile}`);
    const migrationSQL = readFileSync(resolve(process.cwd(), migrationFile), "utf-8");

    console.log("🔄 Ejecutando migración...");
    await sql.unsafe(migrationSQL);

    console.log("✅ Migración ejecutada correctamente");
  } catch (error: any) {
    console.error("❌ Error ejecutando migración:", error.message);
    if (error.code === "42P07") {
      console.log("ℹ️  La columna/objeto ya existe, esto es normal si la migración ya se ejecutó");
    }
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();

