import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { demos, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";

/**
 * Endpoint público para obtener información de un demo
 * No requiere autenticación, pero solo muestra demos activos
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Solo permitir acceso a demos activos
    if (demo[0].status !== "active") {
      return NextResponse.json(
        { error: "Este demo no está disponible" },
        { status: 403 }
      );
    }

    return NextResponse.json(demo[0]);
  } catch (error: any) {
    logger.error("Error fetching public demo", error);
    return NextResponse.json({ error: "Error al obtener demo" }, { status: 500 });
  }
}

