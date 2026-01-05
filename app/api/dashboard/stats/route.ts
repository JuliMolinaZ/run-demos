import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { demos, leads, feedback, demoAssignments } from "@/lib/db/schema";
import { eq, and, sql, gte } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const role = session.user?.role;
    const userId = session.user?.id;

    // Solo admin y sales pueden ver el dashboard
    if (role === "buyer") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Fechas para comparación de tendencias
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Demos activos totales
    const activeDemos = await db
      .select({ count: sql<number>`count(*)` })
      .from(demos)
      .where(eq(demos.status, "active"));

    // Demos creados en los últimos 30 días
    const demosLast30Days = await db
      .select({ count: sql<number>`count(*)` })
      .from(demos)
      .where(
        and(
          eq(demos.status, "active"),
          gte(demos.createdAt, thirtyDaysAgo)
        )
      );

    // Demos creados entre 30-60 días atrás
    const demosPrevious30Days = await db
      .select({ count: sql<number>`count(*)` })
      .from(demos)
      .where(
        and(
          eq(demos.status, "active"),
          gte(demos.createdAt, sixtyDaysAgo),
          sql`${demos.createdAt} < ${thirtyDaysAgo}`
        )
      );

    // Leads capturados totales
    const totalLeads = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads);

    // Leads últimos 30 días
    const leadsLast30Days = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(gte(leads.createdAt, thirtyDaysAgo));

    // Leads 30-60 días atrás
    const leadsPrevious30Days = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(
        and(
          gte(leads.createdAt, sixtyDaysAgo),
          sql`${leads.createdAt} < ${thirtyDaysAgo}`
        )
      );

    // Feedback y ratings - todos
    const feedbackData = await db
      .select({
        systemRating: feedback.systemRating,
        promoterRating: feedback.promoterRating,
        createdAt: feedback.timestamp,
      })
      .from(feedback);

    const avgSystemRating =
      feedbackData.length > 0
        ? feedbackData.reduce((acc, f) => acc + (f.systemRating || 0), 0) / feedbackData.length
        : 0;

    const avgPromoterRating =
      feedbackData.length > 0
        ? feedbackData.reduce((acc, f) => acc + (f.promoterRating || 0), 0) / feedbackData.length
        : 0;

    // Ratings últimos 30 días
    const feedbackLast30Days = feedbackData.filter(
      f => f.createdAt && new Date(f.createdAt) >= thirtyDaysAgo
    );
    const avgRatingLast30Days = feedbackLast30Days.length > 0
      ? feedbackLast30Days.reduce((acc, f) => acc + ((f.systemRating || 0) + (f.promoterRating || 0)) / 2, 0) / feedbackLast30Days.length
      : 0;

    // Ratings 30-60 días atrás
    const feedbackPrevious30Days = feedbackData.filter(
      f => f.createdAt && new Date(f.createdAt) >= sixtyDaysAgo && new Date(f.createdAt) < thirtyDaysAgo
    );
    const avgRatingPrevious30Days = feedbackPrevious30Days.length > 0
      ? feedbackPrevious30Days.reduce((acc, f) => acc + ((f.systemRating || 0) + (f.promoterRating || 0)) / 2, 0) / feedbackPrevious30Days.length
      : 0;

    const ratingsTrend = avgRatingPrevious30Days > 0
      ? ((avgRatingLast30Days - avgRatingPrevious30Days) / avgRatingPrevious30Days) * 100
      : avgRatingLast30Days > 0 ? 100 : 0;

    // Calcular contadores primero
    const activeDemosCount = Number(activeDemos[0]?.count || 0);
    const demosLast30DaysCount = Number(demosLast30Days[0]?.count || 0);
    const demosPrevious30DaysCount = Number(demosPrevious30Days[0]?.count || 0);

    const totalLeadsCount = Number(totalLeads[0]?.count || 0);
    const leadsLast30DaysCount = Number(leadsLast30Days[0]?.count || 0);
    const leadsPrevious30DaysCount = Number(leadsPrevious30Days[0]?.count || 0);

    // Tasa de conversión (leads con feedback / total leads)
    const leadsWithFeedback = await db
      .select({ count: sql<number>`count(distinct ${leads.id})` })
      .from(leads)
      .innerJoin(feedback, eq(feedback.leadId, leads.id));

    const conversionRate =
      totalLeads[0]?.count > 0
        ? ((leadsWithFeedback[0]?.count || 0) / totalLeads[0].count) * 100
        : 0;

    // Conversión últimos 30 días
    const leadsWithFeedbackLast30Days = await db
      .select({ count: sql<number>`count(distinct ${leads.id})` })
      .from(leads)
      .innerJoin(feedback, eq(feedback.leadId, leads.id))
      .where(gte(leads.createdAt, thirtyDaysAgo));

    const conversionRateLast30Days = leadsLast30DaysCount > 0
      ? ((leadsWithFeedbackLast30Days[0]?.count || 0) / leadsLast30DaysCount) * 100
      : 0;

    // Conversión 30-60 días atrás
    const leadsWithFeedbackPrevious30Days = await db
      .select({ count: sql<number>`count(distinct ${leads.id})` })
      .from(leads)
      .innerJoin(feedback, eq(feedback.leadId, leads.id))
      .where(
        and(
          gte(leads.createdAt, sixtyDaysAgo),
          sql`${leads.createdAt} < ${thirtyDaysAgo}`
        )
      );

    const conversionRatePrevious30Days = leadsPrevious30DaysCount > 0
      ? ((leadsWithFeedbackPrevious30Days[0]?.count || 0) / leadsPrevious30DaysCount) * 100
      : 0;

    const conversionTrend = conversionRatePrevious30Days > 0
      ? ((conversionRateLast30Days - conversionRatePrevious30Days) / conversionRatePrevious30Days) * 100
      : conversionRateLast30Days > 0 ? 100 : 0;

    // Calcular tendencias comparando últimos 30 días vs 30 días anteriores
    const demosTrend = demosPrevious30DaysCount > 0
      ? ((demosLast30DaysCount - demosPrevious30DaysCount) / demosPrevious30DaysCount) * 100
      : demosLast30DaysCount > 0 ? 100 : 0;

    const leadsTrend = leadsPrevious30DaysCount > 0
      ? ((leadsLast30DaysCount - leadsPrevious30DaysCount) / leadsPrevious30DaysCount) * 100
      : leadsLast30DaysCount > 0 ? 100 : 0;

    return NextResponse.json({
      demos: {
        active: activeDemosCount,
        trend: demosTrend,
      },
      leads: {
        total: totalLeadsCount,
        trend: leadsTrend,
      },
      conversion: {
        rate: conversionRate,
        trend: conversionTrend,
      },
      ratings: {
        system: avgSystemRating,
        promoter: avgPromoterRating,
        average: (avgSystemRating + avgPromoterRating) / 2,
        trend: ratingsTrend,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

