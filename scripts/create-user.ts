// Cargar variables de entorno PRIMERO usando require
require("dotenv").config();

// Importar después de cargar .env
import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import bcrypt from "bcryptjs";

async function createUser() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log("Uso: npm run create-user <name> <email> <password> [role]");
    console.log("Roles disponibles: admin, sales, buyer (default: buyer)");
    console.log("\nEjemplo:");
    console.log('  npm run create-user "Admin User" admin@example.com "password123" admin');
    process.exit(1);
  }

  // El último argumento puede ser el rol, si no está en la lista de roles válidos, es parte del nombre
  const validRoles = ["admin", "sales", "buyer"];
  const lastArg = args[args.length - 1];
  const role = validRoles.includes(lastArg) ? lastArg : "buyer";
  const argsWithoutRole = validRoles.includes(lastArg) ? args.slice(0, -1) : args;

  // Si hay 3 argumentos sin rol, o 4 con rol
  if (argsWithoutRole.length < 3) {
    console.log("Error: Se requieren al menos nombre, email y contraseña");
    process.exit(1);
  }

  const password = argsWithoutRole[argsWithoutRole.length - 1];
  const email = argsWithoutRole[argsWithoutRole.length - 2];
  const name = argsWithoutRole.slice(0, -2).join(" ") || argsWithoutRole[0];

  if (!["admin", "sales", "buyer"].includes(role)) {
    console.error("Rol inválido. Usa: admin, sales, o buyer");
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: role as "admin" | "sales" | "buyer",
      })
      .returning();

    console.log("✅ Usuario creado exitosamente:");
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Nombre: ${newUser.name}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Rol: ${newUser.role}`);
  } catch (error: any) {
    if (error.code === "23505") {
      console.error("❌ Error: El email ya está en uso");
    } else {
      console.error("❌ Error al crear usuario:", error.message);
    }
    process.exit(1);
  }
}

createUser();

