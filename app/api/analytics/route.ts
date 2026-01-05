import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users, demos, leads, feedback, demoAssignments, products } from "@/lib/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admin puede ver analytics completos
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // 1. Conteo total de usuarios por rol
    const usersByRole = await db
      .select({
        role: users.role,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .groupBy(users.role);

    // 2. Demos por estado
    const demosByStatus = await db
      .select({
        status: demos.status,
        count: sql<number>`count(*)::int`,
      })
      .from(demos)
      .groupBy(demos.status);

    // 3. Total de leads
    const totalLeads = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads);

    // 4. Total de demos
    const totalDemos = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(demos);

    // 5. Total de usuarios
    const totalUsers = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    // 6. Rating promedio de demos
    const avgRatings = await db
      .select({
        avgSystem: sql<number>`COALESCE(AVG(${feedback.systemRating}), 0)`,
        avgPromoter: sql<number>`COALESCE(AVG(${feedback.promoterRating}), 0)`,
      })
      .from(feedback);

    // 7. Top 5 demos más populares (por asignaciones)
    const topDemos = await db
      .select({
        demoId: demos.id,
        demoTitle: demos.title,
        productName: products.name,
        assignmentCount: sql<number>`count(${demoAssignments.id})::int`,
      })
      .from(demos)
      .leftJoin(demoAssignments, eq(demos.id, demoAssignments.demoId))
      .leftJoin(products, eq(demos.productId, products.id))
      .groupBy(demos.id, demos.title, products.name)
      .orderBy(desc(sql`count(${demoAssignments.id})`))
      .limit(5);

    // 8. Demos creados en los últimos 30 días (por día)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const demosOverTime = await db
      .select({
        date: sql<string>`DATE(${demos.createdAt})`,
        count: sql<number>`count(*)::int`,
      })
      .from(demos)
      .where(gte(demos.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${demos.createdAt})`)
      .orderBy(sql`DATE(${demos.createdAt})`);

    // 9. Leads creados en los últimos 30 días
    const leadsOverTime = await db
      .select({
        date: sql<string>`DATE(${leads.createdAt})`,
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .where(gte(leads.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${leads.createdAt})`)
      .orderBy(sql`DATE(${leads.createdAt})`);

    // 10. Demos por producto
    const demosByProduct = await db
      .select({
        productName: products.name,
        productColor: products.corporateColor,
        count: sql<number>`count(${demos.id})::int`,
      })
      .from(products)
      .leftJoin(demos, eq(products.id, demos.productId))
      .groupBy(products.id, products.name, products.corporateColor)
      .orderBy(desc(sql`count(${demos.id})`));

    return NextResponse.json({
      usersByRole,
      demosByStatus,
      totalLeads: totalLeads[0]?.count || 0,
      totalDemos: totalDemos[0]?.count || 0,
      totalUsers: totalUsers[0]?.count || 0,
      avgRatings: {
        system: Number(avgRatings[0]?.avgSystem || 0).toFixed(1),
        promoter: Number(avgRatings[0]?.avgPromoter || 0).toFixed(1),
      },
      topDemos,
      demosOverTime,
      leadsOverTime,
      demosByProduct,
    });
  } catch (error: any) {
    logger.error("Error fetching analytics", error);
    return NextResponse.json({ error: "Error al obtener analytics" }, { status: 500 });
  }
}
