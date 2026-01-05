import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, company, profilePicture } = body;

    const userId = parseInt(session.user.id);

    // Validar que el nombre no esté vacío
    if (name !== undefined && name !== null && typeof name === 'string' && name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre no puede estar vacío" },
        { status: 400 }
      );
    }

    // Actualizar solo los campos proporcionados
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined && name !== null) {
      updateData.name = typeof name === 'string' ? name.trim() : name;
    }

    if (company !== undefined) {
      updateData.company = company !== null && typeof company === 'string' ? company.trim() || null : company;
    }

    if (profilePicture !== undefined) {
      updateData.profilePicture = profilePicture || null;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    logger.info("Profile updated", {
      userId: updatedUser.id,
      name: updatedUser.name,
      company: updatedUser.company,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        company: updatedUser.company,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    logger.error("Error updating profile", error);
    return NextResponse.json(
      { error: "Error al actualizar perfil" },
      { status: 500 }
    );
  }
}

