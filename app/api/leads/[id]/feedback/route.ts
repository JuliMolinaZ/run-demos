import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { feedback, demos, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admin y sales pueden ver feedback
    if (
      session.user?.role !== "admin" &&
      session.user?.role !== "sales"
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const leadId = parseInt((await params).id);

    const allFeedback = await db
      .select({
        id: feedback.id,
        systemRating: feedback.systemRating,
        promoterRating: feedback.promoterRating,
        comments: feedback.comments,
        timestamp: feedback.timestamp,
        demo: {
          id: demos.id,
          title: demos.title,
          productId: demos.productId,
        },
      })
      .from(feedback)
      .innerJoin(demos, eq(feedback.demoId, demos.id))
      .where(eq(feedback.leadId, leadId))
      .orderBy(feedback.timestamp);

    return NextResponse.json(allFeedback);
  } catch (error: any) {
    logger.error("Error fetching feedback", error);
    return NextResponse.json({ error: "Error al obtener feedback" }, { status: 500 });
  }
}

