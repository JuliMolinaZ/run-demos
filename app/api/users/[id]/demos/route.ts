import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { demoAssignments, demos, products, users } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { canAssignDemos } from "@/lib/auth/permissions";
import { sendN8NWebhook, N8N_EVENTS } from "@/lib/n8n/webhooks";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !canAssignDemos(session)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = parseInt((await params).id);

    const assignments = await db
      .select({
        id: demos.id,
        title: demos.title,
      })
      .from(demoAssignments)
      .innerJoin(demos, eq(demoAssignments.demoId, demos.id))
      .where(eq(demoAssignments.userId, userId));

    return NextResponse.json(assignments);
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

    if (!session || !canAssignDemos(session)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = parseInt((await params).id);
    const body = await req.json();
    const { demoIds } = body;

    if (!Array.isArray(demoIds)) {
      return NextResponse.json(
        { error: "demoIds debe ser un array" },
        { status: 400 }
      );
    }

    // Obtener información del usuario al que se le asignan los demos
    const targetUserResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (targetUserResult.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const targetUser = targetUserResult[0];

    // Eliminar asignaciones existentes
    await db
      .delete(demoAssignments)
      .where(eq(demoAssignments.userId, userId));

    // Crear nuevas asignaciones
    if (demoIds.length > 0) {
      const assignmentsToInsert = demoIds.map((demoId: number) => ({
        userId,
        demoId,
        assignedByUserId: parseInt(session.user.id),
      }));

      await db.insert(demoAssignments).values(assignmentsToInsert);

      // Obtener información de los demos asignados
      const assignedDemos = await db
        .select({
          id: demos.id,
          title: demos.title,
          subtitle: demos.subtitle,
          status: demos.status,
          productId: demos.productId,
          product: {
            id: products.id,
            name: products.name,
            logo: products.logo,
            corporateColor: products.corporateColor,
          },
        })
        .from(demos)
        .innerJoin(products, eq(demos.productId, products.id))
        .where(inArray(demos.id, demoIds));

      // Enviar webhook a N8N para cada demo asignado
      for (const demo of assignedDemos) {
        sendN8NWebhook(N8N_EVENTS.DEMO_ASSIGNED, {
          demo: {
            id: demo.id,
            title: demo.title,
            subtitle: demo.subtitle,
            status: demo.status,
            productId: demo.productId,
          },
          product: demo.product,
          assignedTo: {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role,
          },
          assignedBy: {
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
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

