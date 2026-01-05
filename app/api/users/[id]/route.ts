import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users, demoAssignments, feedback, leads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo los administradores pueden eliminar usuarios
    if (session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Solo los administradores pueden eliminar usuarios" },
        { status: 403 }
      );
    }

    const userId = parseInt((await params).id);

    // No permitir que un administrador se elimine a sí mismo
    if (parseInt(session.user?.id || "0") === userId) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const [userToDelete] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userToDelete) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Eliminar relaciones en cascada:
    // 1. Eliminar asignaciones de demos
    await db.delete(demoAssignments).where(eq(demoAssignments.userId, userId));
    
    // 2. Eliminar feedback asociado (donde userId es el que está siendo eliminado)
    await db.delete(feedback).where(eq(feedback.userId, userId));
    
    // 3. Actualizar leads que fueron compartidos por este usuario (poner sharedByUserId a null)
    await db
      .update(leads)
      .set({ sharedByUserId: null })
      .where(eq(leads.sharedByUserId, userId));

    // 4. Eliminar el usuario
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json(
      { message: "Usuario eliminado correctamente" },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error("Error deleting user", error);
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}

