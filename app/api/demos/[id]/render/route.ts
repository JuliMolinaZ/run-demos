import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { demos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { wrapHTMLContent } from "@/lib/utils/html-wrapper";

/**
 * Endpoint para renderizar el HTML de un demo
 * Sirve el HTML envuelto directamente para usar en iframe con src
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const demoId = parseInt((await params).id);

    const demo = await db
      .select({
        htmlContent: demos.htmlContent,
      })
      .from(demos)
      .where(eq(demos.id, demoId))
      .limit(1);

    if (demo.length === 0 || !demo[0].htmlContent) {
      return new NextResponse("Demo no encontrado o sin contenido HTML", {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    const wrappedHTML = wrapHTMLContent(demo[0].htmlContent);

    return new NextResponse(wrappedHTML, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error("Error rendering demo HTML:", error);
    return new NextResponse("Error al renderizar el demo", {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
