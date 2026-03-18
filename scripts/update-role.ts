#!/usr/bin/env tsx
/**
 * Actualiza el rol de un usuario por email.
 * Uso: npm run update-role <email> <admin|sales|buyer>
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

const VALID_ROLES = ["admin", "sales", "buyer"] as const;

async function updateRole() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Uso: npm run update-role <email> <admin|sales|buyer>");
    process.exit(1);
  }
  const [email, role] = args;
  if (!VALID_ROLES.includes(role as any)) {
    console.error("❌ Rol debe ser: admin, sales o buyer");
    process.exit(1);
  }

  try {
    const result = await db
      .update(users)
      .set({ role: role as "admin" | "sales" | "buyer", updatedAt: new Date() })
      .where(eq(users.email, email))
      .returning({ id: users.id, email: users.email, role: users.role });

    if (result.length === 0) {
      console.error("❌ No se encontró ningún usuario con ese email.");
      process.exit(1);
    }
    console.log("✅ Rol actualizado para:", result[0].email, "→", result[0].role);
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

updateRole();
