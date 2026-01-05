import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users, demoAssignments } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { canManageUsers } from "@/lib/auth/permissions";
import { sendN8NWebhook, N8N_EVENTS } from "@/lib/n8n/webhooks";
import { handleApiError, ApiError } from "@/lib/utils/api-error-handler";
import { createUserSchema } from "@/lib/validations/user-schemas";
import { logger } from "@/lib/utils/logger";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !canManageUsers(session)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Si es vendedor, solo puede ver sus propios compradores y él mismo
    const isSales = session.user?.role === "sales";
    const salesUserId = isSales ? parseInt(session.user.id || "0") : null;

    // Seleccionar solo las columnas que existen actualmente en la BD
    // (hasta que se apliquen las migraciones de profile_picture, company, created_by_user_id)
    const userColumns = {
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    };

    if (isSales && salesUserId) {
      // Vendedores ven:
      // 1. Ellos mismos
      // 2. Compradores que tienen demos asignados por ellos
      // Nota: createdByUserId se agregará cuando se aplique la migración
      const salesUsers = await db
        .select(userColumns)
        .from(users)
        .where(
          sql`${users.id} = ${salesUserId} OR 
          ${users.id} IN (
            SELECT DISTINCT ${demoAssignments.userId}
            FROM ${demoAssignments}
            WHERE ${demoAssignments.assignedByUserId} = ${salesUserId}
          )`
        );
      return NextResponse.json(salesUsers);
    }

    const allUsers = await db.select(userColumns).from(users);

    return NextResponse.json(allUsers);
  } catch (error) {
    return handleApiError(error, "GET /api/users");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !canManageUsers(session)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, role = "buyer" } = body;

    // Si es vendedor, solo puede crear compradores
    const isSales = session.user?.role === "sales";
    if (isSales && role !== "buyer") {
      throw new ApiError("Los vendedores solo pueden crear usuarios compradores", 403, true);
    }

    // Validar con Zod (incluye validación de email)
    const validationResult = createUserSchema.safeParse({
      name,
      email,
      password,
      role,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      throw new ApiError(firstError.message, 400, true);
    }

    const validatedData = validationResult.data;

    // Verificar si el email ya existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar quién creó el usuario (si la columna existe)
    const createdByUserId = session.user?.id ? parseInt(session.user.id) : null;

    const insertData: any = {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role,
    };

    // Solo agregar createdByUserId si existe la columna (se manejará el error si no existe)
    if (createdByUserId) {
      insertData.createdByUserId = createdByUserId;
    }

    const [newUser] = await db
      .insert(users)
      .values(insertData)
      .returning();

    // Enviar webhook a N8N para automatización (correo de bienvenida, etc.)
    sendN8NWebhook(N8N_EVENTS.USER_CREATED, {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      createdBy: {
        id: session.user?.id,
        name: session.user?.name,
        email: session.user?.email,
        role: session.user?.role,
      },
    }, {
      userId: session.user?.id,
      userRole: session.user?.role,
      userEmail: session.user?.email || undefined,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/users");
  }
}

