import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { leads, users, feedback, demos } from "@/lib/db/schema";
import { eq, desc, ilike, and, or, sql } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admin y sales pueden exportar leads
    if (
      session.user?.role !== "admin" &&
      session.user?.role !== "sales"
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const demoId = searchParams.get("demoId");
    const sharedByUserId = searchParams.get("sharedByUserId");

    // Obtener todos los leads con la misma query que GET /api/leads
    let query = db
      .select({
        id: leads.id,
        name: leads.name,
        email: leads.email,
        company: leads.company,
        revenueRange: leads.revenueRange,
        employeeCount: leads.employeeCount,
        location: leads.location,
        createdAt: leads.createdAt,
        sharedBy: users.name,
        demosAccessed: sql<number>`
          (
            SELECT COUNT(DISTINCT demo_id)
            FROM ${feedback}
            WHERE lead_id = ${leads.id}
          )
        `.as("demos_accessed"),
      })
      .from(leads)
      .leftJoin(users, eq(leads.sharedByUserId, users.id))
      .$dynamic();

    const conditions: any[] = [];

    if (search) {
      conditions.push(
        or(
          ilike(leads.name, `%${search}%`),
          ilike(leads.email, `%${search}%`),
          ilike(leads.company, `%${search}%`)
        )
      );
    }

    if (demoId) {
      const leadIdsWithDemo = await db
        .select({ leadId: feedback.leadId })
        .from(feedback)
        .where(eq(feedback.demoId, parseInt(demoId)));
      
      const leadIds = leadIdsWithDemo.map((f) => f.leadId);
      if (leadIds.length > 0) {
        conditions.push(sql`${leads.id} = ANY(${leadIds})`);
      } else {
        return NextResponse.json([]);
      }
    }

    if (sharedByUserId) {
      conditions.push(eq(leads.sharedByUserId, parseInt(sharedByUserId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const allLeads = await query.orderBy(desc(leads.createdAt));

    // Convertir a CSV
    const headers = [
      "ID",
      "Nombre",
      "Email",
      "Empresa",
      "Rango de Ingresos",
      "Número de Empleados",
      "Ubicación",
      "Compartido por",
      "Demos Accedidos",
      "Fecha de Captura",
    ];

    const rows = allLeads.map((lead) => [
      lead.id.toString(),
      lead.name || "",
      lead.email || "",
      lead.company || "",
      lead.revenueRange || "",
      lead.employeeCount?.toString() || "",
      lead.location || "",
      lead.sharedBy || "",
      lead.demosAccessed?.toString() || "0",
      new Date(lead.createdAt).toLocaleDateString("es-ES"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Retornar como CSV
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    logger.error("Error exporting leads", error);
    return NextResponse.json({ error: "Error al exportar leads" }, { status: 500 });
  }
}

