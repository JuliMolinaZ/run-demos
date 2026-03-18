#!/usr/bin/env tsx
/**
 * Actualiza la contraseña de un usuario por email.
 * Uso: npm run update-password <email> <nueva-contraseña>
 */

require("dotenv").config();
import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function updatePassword() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Uso: npm run update-password <email> <nueva-contraseña>");
    process.exit(1);
  }
  const [email, newPassword] = args;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.email, email))
      .returning({ id: users.id, email: users.email });

    if (result.length === 0) {
      console.error("❌ No se encontró ningún usuario con ese email.");
      process.exit(1);
    }
    console.log("✅ Contraseña actualizada para:", result[0].email);
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

updatePassword();
