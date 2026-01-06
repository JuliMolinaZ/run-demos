import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { feedback, leads, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      demoId,
      userId,
      leadId,
      attendedByUserId,
      systemRating,
      promoterRating,
      npsScore,
      company,
      interestLevel,
      purchaseStage,
      budgetRange,
      decisionTimeframe,
      keyFeatures,
      painPoints,
      useCase,
      comments,
    } = body;

    if (!demoId || !systemRating) {
      return NextResponse.json(
        { error: "Demo ID y rating del sistema son requeridos" },
        { status: 400 }
      );
    }

    // Usar el userId proporcionado o el de la sesión
    const finalUserId = userId || (session.user?.id ? parseInt(session.user.id) : null);
    let finalLeadId = leadId || null;

    // Si el usuario está autenticado y NO tiene leadId, crear un Lead automáticamente
    // Esto aplica para todos los roles (admin, sales, buyer)
    if (session.user && !finalLeadId && finalUserId) {
      try {
        // Obtener información del usuario
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, finalUserId))
          .limit(1);

        if (user) {
          // Verificar si ya existe un lead para este usuario
          const existingLeads = await db
            .select()
            .from(leads)
            .where(eq(leads.email, user.email))
            .limit(1);

          if (existingLeads.length > 0) {
            // Usar el lead existente
            finalLeadId = existingLeads[0].id;
          } else {
            // Crear nuevo lead con información del buyer
            const [newLead] = await db
              .insert(leads)
              .values({
                name: user.name,
                email: user.email,
                company: company?.trim() || null,
                revenueRange: budgetRange || null,
                employeeCount: null,
                location: null,
                sharedByUserId: null, // El buyer se auto-genera
              })
              .returning();

            finalLeadId = newLead.id;
            logger.info("Auto-lead created for user", {
              userId: finalUserId,
              userRole: session.user.role,
              email: user.email,
              company,
              leadId: newLead.id,
            });
          }
        }
      } catch (error) {
        logger.error("Error creating auto-lead", error, { userId: finalUserId });
        // Continuar sin lead si falla
      }
    }

    const [newFeedback] = await db
      .insert(feedback)
      .values({
        demoId: parseInt(demoId),
        userId: finalUserId || null,
        leadId: finalLeadId || null,
        attendedByUserId: attendedByUserId ? parseInt(attendedByUserId) : null,
        systemRating: parseInt(systemRating),
        promoterRating: promoterRating ? parseInt(promoterRating) : null,
        npsScore: npsScore ? parseInt(npsScore) : null,
        interestLevel: interestLevel || null,
        purchaseStage: purchaseStage || null,
        budgetRange: budgetRange || null,
        decisionTimeframe: decisionTimeframe || null,
        keyFeatures: keyFeatures && Array.isArray(keyFeatures) && keyFeatures.length > 0 ? keyFeatures : null,
        painPoints: painPoints?.trim() || null,
        useCase: useCase?.trim() || null,
        comments: comments?.trim() || null,
      })
      .returning();

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error: any) {
    logger.error("Error creating feedback", error);
    return NextResponse.json({ error: "Error al crear feedback" }, { status: 500 });
  }
}

