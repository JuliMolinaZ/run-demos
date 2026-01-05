import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { demos, products, demoAssignments } from "@/lib/db/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { sendN8NWebhook, N8N_EVENTS } from "@/lib/n8n/webhooks";
import { handleApiError, ApiError } from "@/lib/utils/api-error-handler";
import { createDemoSchema } from "@/lib/validations/demo-schemas";
import { sanitizeHTML, isValidURL } from "@/lib/utils/sanitize";
import { logger } from "@/lib/utils/logger";
import { encryptCredentials, decryptCredentials } from "@/lib/utils/encryption";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/utils/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const role = session.user?.role;
    const userId = session.user?.id;

    // Si es buyer, solo mostrar demos asignados
    if (role === "buyer") {
      const assignedDemos = await db
        .select({
          id: demos.id,
          title: demos.title,
          subtitle: demos.subtitle,
          url: demos.url,
          htmlContent: demos.htmlContent,
          instructions: demos.instructions,
          instructionsEs: demos.instructionsEs,
          instructionsEn: demos.instructionsEn,
          credentialsJson: demos.credentialsJson,
          hasResponsive: demos.hasResponsive,
          requiresCredentials: demos.requiresCredentials,
          status: demos.status,
          productId: demos.productId,
          createdAt: demos.createdAt,
          updatedAt: demos.updatedAt,
          product: {
            id: products.id,
            name: products.name,
            logo: products.logo,
            corporateColor: products.corporateColor,
          },
        })
        .from(demoAssignments)
        .innerJoin(demos, eq(demoAssignments.demoId, demos.id))
        .innerJoin(products, eq(demos.productId, products.id))
        .where(
          and(
            eq(demoAssignments.userId, parseInt(userId || "0")),
            eq(demos.status, "active")
          )
        )
        .orderBy(desc(demos.createdAt));

      // Desencriptar credenciales en cada demo
      const demosWithDecryptedCredentials = assignedDemos.map((demo) => {
        if (demo.credentialsJson && typeof demo.credentialsJson === "string") {
          const decrypted = decryptCredentials(demo.credentialsJson);
          if (decrypted) {
            return { ...demo, credentialsJson: decrypted };
          }
        }
        return demo;
      });

      return NextResponse.json(demosWithDecryptedCredentials);
    }

    // Para admin y sales, mostrar todos los demos
    const allDemos = await db
      .select({
        id: demos.id,
        title: demos.title,
        subtitle: demos.subtitle,
        url: demos.url,
        htmlContent: demos.htmlContent,
        instructions: demos.instructions,
        credentialsJson: demos.credentialsJson,
        hasResponsive: demos.hasResponsive,
        requiresCredentials: demos.requiresCredentials,
        status: demos.status,
        productId: demos.productId,
        createdAt: demos.createdAt,
        updatedAt: demos.updatedAt,
        product: {
          id: products.id,
          name: products.name,
          logo: products.logo,
          corporateColor: products.corporateColor,
        },
      })
      .from(demos)
      .innerJoin(products, eq(demos.productId, products.id))
      .orderBy(desc(demos.createdAt));

    // Desencriptar credenciales en cada demo
    const demosWithDecryptedCredentials = allDemos.map((demo) => {
      if (demo.credentialsJson && typeof demo.credentialsJson === "string") {
        const decrypted = decryptCredentials(demo.credentialsJson);
        if (decrypted) {
          return { ...demo, credentialsJson: decrypted };
        }
      }
      return demo;
    });

    return NextResponse.json(demosWithDecryptedCredentials);
  } catch (error) {
    return handleApiError(error, "GET /api/demos");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResponse = rateLimit(req, RATE_LIMIT_CONFIGS.DEMOS_WRITE, session.user?.id);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Solo admin y sales pueden crear demos
    if (
      session.user?.role !== "admin" &&
      session.user?.role !== "sales"
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();

    // Validar con Zod
    const validationResult = createDemoSchema.safeParse({
      productId: typeof body.productId === "string" ? parseInt(body.productId) : body.productId,
      title: body.title,
      subtitle: body.subtitle,
      url: body.url,
      htmlContent: body.htmlContent,
      instructions: body.instructions,
      instructionsEs: body.instructionsEs,
      instructionsEn: body.instructionsEn,
      credentialsJson: body.credentialsJson,
      hasResponsive: body.hasResponsive ?? false,
      requiresCredentials: body.requiresCredentials ?? false,
      status: body.status ?? "draft",
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      throw new ApiError(firstError.message, 400, true);
    }

    const validatedData = validationResult.data;

    // Validar que el producto exista (Foreign Key validation)
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, validatedData.productId))
      .limit(1);

    if (product.length === 0) {
      throw new ApiError("El producto especificado no existe", 404, true);
    }

    // Validar URL si se proporciona
    if (validatedData.url && !isValidURL(validatedData.url)) {
      throw new ApiError("La URL proporcionada no es válida", 400, true);
    }

    // Sanitizar HTML content si se proporciona
    const sanitizedHtmlContent = validatedData.htmlContent
      ? sanitizeHTML(validatedData.htmlContent)
      : null;

    // Encriptar credenciales si se proporcionan
    let encryptedCredentials: string | null = null;
    if (validatedData.credentialsJson) {
      encryptedCredentials = encryptCredentials(validatedData.credentialsJson);
    }

    const [newDemo] = await db
      .insert(demos)
      .values({
        productId: validatedData.productId,
        title: validatedData.title,
        subtitle: validatedData.subtitle || null,
        url: validatedData.url || null,
        htmlContent: sanitizedHtmlContent,
        instructions: validatedData.instructions || null,
        instructionsEs: validatedData.instructionsEs || null,
        instructionsEn: validatedData.instructionsEn || null,
        credentialsJson: encryptedCredentials as any, // Guardar como string encriptado
        hasResponsive: validatedData.hasResponsive ? 1 : 0,
        requiresCredentials: validatedData.requiresCredentials ? 1 : 0,
        status: validatedData.status,
      })
      .returning();

    // Obtener el demo con el producto
    const demoWithProduct = await db
      .select({
        id: demos.id,
        title: demos.title,
        subtitle: demos.subtitle,
        url: demos.url,
        htmlContent: demos.htmlContent,
        instructions: demos.instructions,
        credentialsJson: demos.credentialsJson,
        hasResponsive: demos.hasResponsive,
        requiresCredentials: demos.requiresCredentials,
        status: demos.status,
        productId: demos.productId,
        createdAt: demos.createdAt,
        updatedAt: demos.updatedAt,
        product: {
          id: products.id,
          name: products.name,
          logo: products.logo,
          corporateColor: products.corporateColor,
        },
      })
      .from(demos)
      .innerJoin(products, eq(demos.productId, products.id))
      .where(eq(demos.id, newDemo.id))
      .limit(1);

    const demoData = demoWithProduct[0];

    // Desencriptar credenciales si existen antes de retornar
    if (demoData.credentialsJson && typeof demoData.credentialsJson === "string") {
      const decrypted = decryptCredentials(demoData.credentialsJson);
      if (decrypted) {
        demoData.credentialsJson = decrypted as any;
      }
    }

    // Enviar webhook a N8N para automatización (notificaciones, etc.)
    sendN8NWebhook(N8N_EVENTS.DEMO_CREATED, {
      demo: {
        id: demoData.id,
        title: demoData.title,
        subtitle: demoData.subtitle,
        status: demoData.status,
        productId: demoData.productId,
        createdAt: demoData.createdAt,
      },
      product: demoData.product,
      createdBy: {
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

    return NextResponse.json(demoData, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/demos");
  }
}

