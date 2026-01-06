import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { leads, demos, users, feedback, products } from "@/lib/db/schema";
import { eq, desc, ilike, and, or, sql } from "drizzle-orm";
import { sendN8NWebhook, N8N_EVENTS } from "@/lib/n8n/webhooks";
import { handleApiError, ApiError } from "@/lib/utils/api-error-handler";
import { createLeadSchema } from "@/lib/validations/lead-schemas";
import { logger } from "@/lib/utils/logger";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/utils/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admin y sales pueden ver leads
    if (
      session.user?.role !== "admin" &&
      session.user?.role !== "sales"
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Si es vendedor, solo puede ver sus propios leads
    const isSales = session.user?.role === "sales";
    const salesUserId = isSales ? parseInt(session.user.id || "0") : null;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const demoId = searchParams.get("demoId");
    const sharedByUserId = searchParams.get("sharedByUserId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Construir query base
    let query = db
      .select({
        id: leads.id,
        name: leads.name,
        email: leads.email,
        company: leads.company,
        revenueRange: leads.revenueRange,
        employeeCount: leads.employeeCount,
        location: leads.location,
        sharedByUserId: leads.sharedByUserId,
        createdAt: leads.createdAt,
        sharedBy: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        },
        // Obtener el demo más reciente que accedió este lead
        latestDemo: sql<any>`
          (
            SELECT json_build_object(
              'id', d.id,
              'title', d.title,
              'productId', d.product_id,
              'productName', p.name,
              'productLogo', p.logo
            )
            FROM ${feedback} f
            INNER JOIN ${demos} d ON f.demo_id = d.id
            LEFT JOIN ${products} p ON d.product_id = p.id
            WHERE f.lead_id = ${leads.id} AND f.lead_id IS NOT NULL
            ORDER BY f.timestamp DESC
            LIMIT 1
          )
        `.as("latest_demo"),
        // Contar demos accedidos
        demosAccessed: sql<number>`
          COALESCE((
            SELECT COUNT(DISTINCT demo_id)
            FROM ${feedback}
            WHERE lead_id = ${leads.id} AND lead_id IS NOT NULL
          ), 0)
        `.as("demos_accessed"),
        // Rating promedio
        avgRating: sql<number>`
          (
            SELECT AVG(system_rating)
            FROM ${feedback}
            WHERE lead_id = ${leads.id} AND lead_id IS NOT NULL AND system_rating IS NOT NULL
          )
        `.as("avg_rating"),
      })
      .from(leads)
      .leftJoin(users, eq(leads.sharedByUserId, users.id))
      .$dynamic();

    const conditions: any[] = [];

    // Si es vendedor, solo puede ver sus propios leads
    if (isSales && salesUserId) {
      conditions.push(eq(leads.sharedByUserId, salesUserId));
    }

    // Búsqueda por texto
    if (search) {
      conditions.push(
        or(
          ilike(leads.name, `%${search}%`),
          ilike(leads.email, `%${search}%`),
          ilike(leads.company, `%${search}%`),
          ilike(leads.location, `%${search}%`)
        )
      );
    }

    // Filtro por demo (si el lead accedió a un demo específico)
    if (demoId) {
      const leadIdsWithDemo = await db
        .select({ leadId: feedback.leadId })
        .from(feedback)
        .where(
          and(
            eq(feedback.demoId, parseInt(demoId)),
            sql`${feedback.leadId} IS NOT NULL`
          )
        );
      
      const leadIds = leadIdsWithDemo
        .map((f) => f.leadId)
        .filter((id): id is number => id !== null && id !== undefined);
      
      if (leadIds.length > 0) {
        conditions.push(sql`${leads.id} = ANY(${leadIds})`);
      } else {
        // Si no hay leads para este demo, retornar vacío
        return NextResponse.json([]);
      }
    }

    // Filtro por vendedor que compartió
    if (sharedByUserId) {
      conditions.push(eq(leads.sharedByUserId, parseInt(sharedByUserId)));
    }

    // Filtro por fecha
    if (dateFrom) {
      conditions.push(sql`${leads.createdAt} >= ${dateFrom}`);
    }
    if (dateTo) {
      conditions.push(sql`${leads.createdAt} <= ${dateTo}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const allLeads = await query.orderBy(desc(leads.createdAt));

    logger.info(`[API Leads] Retornando ${allLeads.length} leads`);
    
    return NextResponse.json(allLeads);
  } catch (error) {
    return handleApiError(error, "GET /api/leads");
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting (sin autenticación, usar IP)
    const rateLimitResponse = rateLimit(req, RATE_LIMIT_CONFIGS.LEADS);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Permitir crear leads sin autenticación para formularios públicos
    const body = await req.json();

    // Validar con Zod (incluye validación de email)
    const validationResult = createLeadSchema.safeParse({
      name: body.name,
      email: body.email,
      company: body.company,
      revenueRange: body.revenueRange,
      employeeCount: body.employeeCount ? parseInt(body.employeeCount) : null,
      location: body.location,
      sharedByUserId: body.sharedByUserId ? parseInt(body.sharedByUserId) : null,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      throw new ApiError(firstError.message, 400, true);
    }

    const validatedData = validationResult.data;

    const [newLead] = await db
      .insert(leads)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company || null,
        revenueRange: validatedData.revenueRange || null,
        employeeCount: validatedData.employeeCount || null,
        location: validatedData.location || null,
        sharedByUserId: validatedData.sharedByUserId || null,
      })
      .returning();

    // Obtener información del usuario que compartió si existe
    let sharedByUser = null;
    if (newLead.sharedByUserId) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, newLead.sharedByUserId))
        .limit(1);
      sharedByUser = user || null;
    }

    // Enviar webhook a N8N para automatización (correo de bienvenida al lead, notificación al vendedor, etc.)
    sendN8NWebhook(N8N_EVENTS.LEAD_CREATED, {
      lead: {
        id: newLead.id,
        name: newLead.name,
        email: newLead.email,
        company: newLead.company,
        revenueRange: newLead.revenueRange,
        employeeCount: newLead.employeeCount,
        location: newLead.location,
        createdAt: newLead.createdAt,
      },
      sharedBy: sharedByUser ? {
        id: sharedByUser.id,
        name: sharedByUser.name,
        email: sharedByUser.email,
        role: sharedByUser.role,
      } : null,
    }, {
      userId: undefined, // No hay sesión en formularios públicos
      userRole: undefined,
      userEmail: undefined,
    });

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/leads");
  }
}

