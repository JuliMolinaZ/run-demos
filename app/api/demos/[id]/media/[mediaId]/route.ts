import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { demoMedia } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admin y sales pueden eliminar media
    if (
      session.user?.role !== "admin" &&
      session.user?.role !== "sales"
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const resolvedParams = await params;
    const mediaId = parseInt(resolvedParams.mediaId);

    await db.delete(demoMedia).where(eq(demoMedia.id, mediaId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admin y sales pueden editar media
    if (
      session.user?.role !== "admin" &&
      session.user?.role !== "sales"
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const resolvedParams = await params;
    const mediaId = parseInt(resolvedParams.mediaId);
    const body = await req.json();
    const { title, description } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const [updatedMedia] = await db
      .update(demoMedia)
      .set(updateData)
      .where(eq(demoMedia.id, mediaId))
      .returning();

    return NextResponse.json(updatedMedia);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

