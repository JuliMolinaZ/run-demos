import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { demos, products, demoAssignments, feedback, demoMedia } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendN8NWebhook, N8N_EVENTS } from "@/lib/n8n/webhooks";
import { handleApiError, ApiError } from "@/lib/utils/api-error-handler";
import { updateDemoSchema } from "@/lib/validations/demo-schemas";
import { sanitizeHTML, isValidURL } from "@/lib/utils/sanitize";
import { encryptCredentials, decryptCredentials } from "@/lib/utils/encryption";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/utils/rate-limit";
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

    const demoId = parseInt((await params).id);

    const demo = await db
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
      .from(demos)
      .innerJoin(products, eq(demos.productId, products.id))
      .where(eq(demos.id, demoId))
      .limit(1);

    if (demo.length === 0) {
      return NextResponse.json({ error: "Demo no encontrado" }, { status: 404 });
    }

    const demoData = demo[0];
    
    // Desencriptar credenciales si existen
    if (demoData.credentialsJson && typeof demoData.credentialsJson === "string") {
      const decrypted = decryptCredentials(demoData.credentialsJson);
      if (decrypted) {
        demoData.credentialsJson = decrypted as any;
      }
    }

    return NextResponse.json(demoData);
  } catch (error) {
    return handleApiError(error, "GET /api/demos/[id]");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Solo admin y sales pueden editar demos
    if (
      session.user?.role !== "admin" &&
      session.user?.role !== "sales"
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const demoId = parseInt((await params).id);
    const body = await req.json();

    const {
      productId,
      title,
      subtitle,
      url,
      htmlContent,
      instructions,
      instructionsEs,
      instructionsEn,
      credentialsJson,
      hasResponsive,
      requiresCredentials,
      status,
    } = body;

    // Obtener el demo anterior para detectar cambios
    const oldDemoResult = await db
      .select()
      .from(demos)
      .where(eq(demos.id, demoId))
      .limit(1);

    if (oldDemoResult.length === 0) {
      return NextResponse.json({ error: "Demo no encontrado" }, { status: 404 });
    }

    const oldDemo = oldDemoResult[0];
    const oldStatus = oldDemo.status;

    // Validar con Zod (schema parcial para updates)
    const validationResult = updateDemoSchema.safeParse({
      productId: productId !== undefined ? (typeof productId === "string" ? parseInt(productId) : productId) : undefined,
      title,
      subtitle,
      url,
      htmlContent,
      instructions,
      instructionsEs,
      instructionsEn,
      credentialsJson,
      hasResponsive,
      requiresCredentials,
      status,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      throw new ApiError(firstError.message, 400, true);
    }

    const validatedData = validationResult.data;

    // Validar que el producto exista si se está actualizando
    if (validatedData.productId !== undefined) {
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, validatedData.productId))
        .limit(1);

      if (product.length === 0) {
        throw new ApiError("El producto especificado no existe", 404, true);
      }
    }

    // Validar URL si se proporciona
    if (validatedData.url !== undefined && validatedData.url !== null && !isValidURL(validatedData.url)) {
      throw new ApiError("La URL proporcionada no es válida", 400, true);
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.productId !== undefined) updateData.productId = validatedData.productId;
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.subtitle !== undefined) updateData.subtitle = validatedData.subtitle;
    if (validatedData.url !== undefined) updateData.url = validatedData.url || null;
    if (validatedData.htmlContent !== undefined) {
      // Sanitizar HTML si se proporciona
      updateData.htmlContent = validatedData.htmlContent ? sanitizeHTML(validatedData.htmlContent) : null;
    }
    if (validatedData.instructions !== undefined) updateData.instructions = validatedData.instructions;
    if (validatedData.instructionsEs !== undefined) updateData.instructionsEs = validatedData.instructionsEs;
    if (validatedData.instructionsEn !== undefined) updateData.instructionsEn = validatedData.instructionsEn;
    if (validatedData.credentialsJson !== undefined) {
      // Encriptar credenciales si se proporcionan
      if (validatedData.credentialsJson) {
        updateData.credentialsJson = encryptCredentials(validatedData.credentialsJson) as any;
      } else {
        updateData.credentialsJson = null;
      }
    }
    if (validatedData.hasResponsive !== undefined) updateData.hasResponsive = validatedData.hasResponsive ? 1 : 0;
    if (validatedData.requiresCredentials !== undefined) updateData.requiresCredentials = validatedData.requiresCredentials ? 1 : 0;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;

    const [updatedDemo] = await db
      .update(demos)
      .set(updateData)
      .where(eq(demos.id, demoId))
      .returning();

    // Obtener el demo actualizado con el producto
    const demoWithProduct = await db
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
      .from(demos)
      .innerJoin(products, eq(demos.productId, products.id))
      .where(eq(demos.id, demoId))
      .limit(1);

    const demoData = demoWithProduct[0];
    
    // Desencriptar credenciales para la respuesta
    if (demoData.credentialsJson && typeof demoData.credentialsJson === "string") {
      const decrypted = decryptCredentials(demoData.credentialsJson);
      if (decrypted) {
        demoData.credentialsJson = decrypted as any;
      }
    }

    // Enviar webhook a N8N para automatización
    sendN8NWebhook(N8N_EVENTS.DEMO_UPDATED, {
      demo: {
        id: demoData.id,
        title: demoData.title,
        subtitle: demoData.subtitle,
        status: demoData.status,
        productId: demoData.productId,
        updatedAt: demoData.updatedAt,
      },
      product: demoData.product,
      changes: {
        title: title !== undefined && title !== oldDemo.title,
        subtitle: subtitle !== undefined && subtitle !== oldDemo.subtitle,
        status: status !== undefined && status !== oldStatus,
      },
      updatedBy: {
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

    // Si el status cambió, enviar un webhook adicional específico
    if (status !== undefined && status !== oldStatus) {
      sendN8NWebhook(N8N_EVENTS.DEMO_STATUS_CHANGED, {
        demo: {
          id: demoData.id,
          title: demoData.title,
          status: demoData.status,
          productId: demoData.productId,
        },
        product: demoData.product,
        statusChange: {
          from: oldStatus,
          to: status,
        },
        updatedBy: {
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

    return NextResponse.json(demoData);
  } catch (error) {
    return handleApiError(error, "PUT /api/demos/[id]");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admin puede eliminar demos
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const demoId = parseInt((await params).id);

    // Verificar que el demo existe
    const [demoToDelete] = await db
      .select()
      .from(demos)
      .where(eq(demos.id, demoId))
      .limit(1);

    if (!demoToDelete) {
      return NextResponse.json({ error: "Demo no encontrado" }, { status: 404 });
    }

    // Eliminar relaciones en cascada antes de eliminar el demo:
    // 1. Eliminar asignaciones de demos (demo_assignments)
    await db.delete(demoAssignments).where(eq(demoAssignments.demoId, demoId));
    
    // 2. Eliminar feedback asociado al demo
    await db.delete(feedback).where(eq(feedback.demoId, demoId));
    
    // 3. Eliminar media asociado al demo
    await db.delete(demoMedia).where(eq(demoMedia.demoId, demoId));

    // 4. Finalmente, eliminar el demo
    await db.delete(demos).where(eq(demos.id, demoId));

    // Enviar webhook a N8N para notificar la eliminación (si el evento existe)
    // Nota: El evento DEMO_DELETED puede no estar definido en N8N_EVENTS
    try {
      sendN8NWebhook("demo.deleted" as any, {
        demo: {
          id: demoToDelete.id,
          title: demoToDelete.title,
          status: demoToDelete.status,
          productId: demoToDelete.productId,
        },
        deletedBy: {
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
    } catch (webhookError) {
      // Ignorar errores de webhook, no es crítico para la eliminación
      logger.warn("Error sending demo deleted webhook", webhookError);
    }

    return NextResponse.json({ 
      success: true,
      message: "Demo eliminado correctamente"
    });
  } catch (error) {
    return handleApiError(error, "DELETE /api/demos/[id]");
  }
}

