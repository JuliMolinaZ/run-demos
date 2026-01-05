import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users, demos, leads, feedback, demoAssignments, products } from "@/lib/db/schema";
import { eq, desc, sql, and, gte, count, avg } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admin y sales pueden ver el dashboard
    if (
      session.user?.role !== "admin" &&
      session.user?.role !== "sales"
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Si es vendedor, solo ver sus propios datos
    const isSales = session.user?.role === "sales";
    const salesUserId = isSales ? parseInt(session.user.id || "0") : null;

    // 1. KPIs Principales
    const totalDemos = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(demos);

    const demosActivos = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(demos)
      .where(eq(demos.status, "active"));

    const totalLeads = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(
        isSales && salesUserId
          ? eq(leads.sharedByUserId, salesUserId)
          : undefined
      );

    const totalUsuarios = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    const avgSystemRating = await db
      .select({
        avg: sql<number>`COALESCE(AVG(${feedback.systemRating}), 0)`,
      })
      .from(feedback)
      .where(
        and(
          sql`${feedback.systemRating} IS NOT NULL`,
          isSales && salesUserId
            ? eq(feedback.attendedByUserId, salesUserId)
            : undefined
        )
      );

    const totalFeedbacks = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(feedback)
      .where(
        isSales && salesUserId
          ? eq(feedback.attendedByUserId, salesUserId)
          : undefined
      );

    // 2. Demo más solicitada (por asignaciones)
    const topRequestedDemo = await db
      .select({
        demoId: demos.id,
        demoTitle: demos.title,
        productName: products.name,
        productLogo: products.logo,
        assignmentCount: sql<number>`count(${demoAssignments.id})::int`,
      })
      .from(demos)
      .leftJoin(demoAssignments, eq(demos.id, demoAssignments.demoId))
      .leftJoin(products, eq(demos.productId, products.id))
      .groupBy(demos.id, demos.title, products.name, products.logo)
      .orderBy(desc(sql`count(${demoAssignments.id})`))
      .limit(1);

    // 3. Demo mejor calificada
    const topRatedDemo = await db
      .select({
        demoId: demos.id,
        demoTitle: demos.title,
        productName: products.name,
        productLogo: products.logo,
        avgRating: sql<number>`AVG(${feedback.systemRating})`,
        feedbackCount: sql<number>`count(${feedback.id})::int`,
      })
      .from(demos)
      .innerJoin(feedback, eq(demos.id, feedback.demoId))
      .leftJoin(products, eq(demos.productId, products.id))
      .where(sql`${feedback.systemRating} IS NOT NULL`)
      .groupBy(demos.id, demos.title, products.name, products.logo)
      .orderBy(desc(sql`AVG(${feedback.systemRating})`))
      .limit(1);

    // 4. Demos creadas en los últimos 30 días (por día)
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

    // 5. Leads por fecha (últimos 30 días)
    const leadsOverTime = await db
      .select({
        date: sql<string>`DATE(${leads.createdAt})`,
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .where(
        and(
          gte(leads.createdAt, thirtyDaysAgo),
          isSales && salesUserId ? eq(leads.sharedByUserId, salesUserId) : undefined
        )
      )
      .groupBy(sql`DATE(${leads.createdAt})`)
      .orderBy(sql`DATE(${leads.createdAt})`);

    // 6. Actividad de usuarios (últimos 7 días) - basado en feedback y asignaciones
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Obtener actividad de usuarios basada en feedback reciente
    const userActivityFromFeedback = await db
      .select({
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        userRole: users.role,
        lastActivity: sql<string>`MAX(${feedback.timestamp})`,
        activityCount: sql<number>`count(${feedback.id})::int`,
      })
      .from(users)
      .innerJoin(feedback, eq(users.id, feedback.userId))
      .where(gte(feedback.timestamp, sevenDaysAgo))
      .groupBy(users.id, users.name, users.email, users.role);

    // Obtener actividad de usuarios basada en asignaciones recientes (para buyers)
    const userActivityFromAssignments = await db
      .select({
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        userRole: users.role,
        lastActivity: sql<string>`MAX(${demoAssignments.createdAt})`,
        activityCount: sql<number>`count(${demoAssignments.id})::int`,
      })
      .from(users)
      .innerJoin(demoAssignments, eq(users.id, demoAssignments.userId))
      .where(gte(demoAssignments.createdAt, sevenDaysAgo))
      .groupBy(users.id, users.name, users.email, users.role);

    // Combinar y consolidar actividades
    const activityMap = new Map();
    
    // Agregar actividades de feedback
    userActivityFromFeedback.forEach((activity) => {
      const key = activity.userId;
      if (!activityMap.has(key)) {
        activityMap.set(key, {
          userId: activity.userId,
          userName: activity.userName,
          userEmail: activity.userEmail,
          userRole: activity.userRole,
          lastActivity: activity.lastActivity,
          activityCount: activity.activityCount,
        });
      } else {
        const existing = activityMap.get(key);
        existing.activityCount += activity.activityCount;
        if (new Date(activity.lastActivity) > new Date(existing.lastActivity)) {
          existing.lastActivity = activity.lastActivity;
        }
      }
    });

    // Agregar actividades de asignaciones
    userActivityFromAssignments.forEach((activity) => {
      const key = activity.userId;
      if (!activityMap.has(key)) {
        activityMap.set(key, {
          userId: activity.userId,
          userName: activity.userName,
          userEmail: activity.userEmail,
          userRole: activity.userRole,
          lastActivity: activity.lastActivity,
          activityCount: activity.activityCount,
        });
      } else {
        const existing = activityMap.get(key);
        existing.activityCount += activity.activityCount;
        if (new Date(activity.lastActivity) > new Date(existing.lastActivity)) {
          existing.lastActivity = activity.lastActivity;
        }
      }
    });

    // Convertir a array y ordenar por última actividad
    const userActivity = Array.from(activityMap.values())
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, 50);

    // 7. Demos por estado
    const demosByStatus = await db
      .select({
        status: demos.status,
        count: sql<number>`count(*)::int`,
      })
      .from(demos)
      .groupBy(demos.status);

    // 8. Top 5 leads más activos
    const topActiveLeads = await db
      .select({
        leadId: leads.id,
        leadName: leads.name,
        leadEmail: leads.email,
        leadCompany: leads.company,
        feedbackCount: sql<number>`count(${feedback.id})::int`,
        avgRating: sql<number>`AVG(${feedback.systemRating})`,
      })
      .from(leads)
      .innerJoin(feedback, eq(leads.id, feedback.leadId))
      .where(
        isSales && salesUserId
          ? eq(leads.sharedByUserId, salesUserId)
          : undefined
      )
      .groupBy(leads.id, leads.name, leads.email, leads.company)
      .orderBy(desc(sql`count(${feedback.id})`))
      .limit(5);

    return NextResponse.json({
      kpis: {
        totalDemos: totalDemos[0]?.count || 0,
        demosActivos: demosActivos[0]?.count || 0,
        totalLeads: totalLeads[0]?.count || 0,
        totalUsuarios: totalUsuarios[0]?.count || 0,
        avgSystemRating: Number(avgSystemRating[0]?.avg || 0).toFixed(1),
        totalFeedbacks: totalFeedbacks[0]?.count || 0,
      },
      topRequestedDemo: topRequestedDemo[0] || null,
      topRatedDemo: topRatedDemo[0] || null,
      demosOverTime,
      leadsOverTime,
      userActivity,
      demosByStatus,
      topActiveLeads,
    });
  } catch (error: any) {
    logger.error("Error fetching dashboard data", error);
    return NextResponse.json({ error: "Error al obtener datos del dashboard" }, { status: 500 });
  }
}
