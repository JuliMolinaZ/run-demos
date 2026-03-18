#!/usr/bin/env tsx
/**
 * Lista usuarios en la BD (para verificar roles). Usa DATABASE_URL de .env
 * Uso: npm run db:users   o   tsx --env-file=.env scripts/check-users.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { db } from "../lib/db";
import { users } from "../lib/db/schema";

async function main() {
  const list = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
  }).from(users);
  console.log("Usuarios en la BD:", list.length);
  console.table(list);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
