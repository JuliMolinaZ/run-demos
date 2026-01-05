import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/**
 * Health check endpoint para Docker y monitoreo
 * Verifica que la aplicación y la base de datos estén funcionando
 */
export async function GET() {
  try {
    // Verificar conexión a la base de datos
    await db.execute(sql`SELECT 1`);

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "demo-hub",
        database: "connected",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        service: "demo-hub",
        database: "disconnected",
        error: "Database connection failed",
      },
      { status: 503 }
    );
  }
}

