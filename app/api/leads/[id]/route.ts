import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
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

    // Solo admin puede eliminar leads
    if (session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Solo administradores pueden eliminar leads" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const leadId = parseInt(id);

    if (isNaN(leadId)) {
      return NextResponse.json(
        { error: "ID de lead inválido" },
        { status: 400 }
      );
    }

    // Eliminar el lead
    await db.delete(leads).where(eq(leads.id, leadId));

    return NextResponse.json(
      { message: "Lead eliminado correctamente" },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error("Error deleting lead", error);
    return NextResponse.json({ error: "Error al eliminar lead" }, { status: 500 });
  }
}
