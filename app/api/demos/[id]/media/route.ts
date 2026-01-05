import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { demoMedia } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const demoId = parseInt(resolvedParams.id);

    const media = await db
      .select()
      .from(demoMedia)
      .where(eq(demoMedia.demoId, demoId))
      .orderBy(demoMedia.createdAt);

    return NextResponse.json(media);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admin y sales pueden agregar media
    if (
      session.user?.role !== "admin" &&
      session.user?.role !== "sales"
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const resolvedParams = await params;
    const demoId = parseInt(resolvedParams.id);
    const body = await req.json();
    const { type, url, title, description, fileSize } = body;

    if (!type || !url) {
      return NextResponse.json(
        { error: "Tipo y URL son requeridos" },
        { status: 400 }
      );
    }

    if (type !== "image" && type !== "video") {
      return NextResponse.json(
        { error: "Tipo debe ser 'image' o 'video'" },
        { status: 400 }
      );
    }

    const [newMedia] = await db
      .insert(demoMedia)
      .values({
        demoId,
        type: type as "image" | "video",
        url,
        title: title || null,
        description: description || null,
        uploadedByUserId: parseInt(session.user.id),
        fileSize: fileSize || null,
      })
      .returning();

    return NextResponse.json(newMedia, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

