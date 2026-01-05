import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { products, demos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { handleApiError } from "@/lib/utils/api-error-handler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const productId = parseInt((await params).id);

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error, "GET /api/products/[id]");
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

    // Solo admin puede editar productos
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const productId = parseInt((await params).id);
    const body = await req.json();
    const { name, logo, corporateColor } = body;

    if (!name) {
      return NextResponse.json(
        { error: "El nombre del producto es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!existingProduct) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const [updatedProduct] = await db
      .update(products)
      .set({
        name,
        logo: logo || null,
        corporateColor: corporateColor || null,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return handleApiError(error, "PUT /api/products/[id]");
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

    // Solo admin puede eliminar productos
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const productId = parseInt((await params).id);

    // Verificar que el producto existe
    const [productToDelete] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!productToDelete) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Verificar si hay demos asociados a este producto
    const demosWithProduct = await db
      .select()
      .from(demos)
      .where(eq(demos.productId, productId))
      .limit(1);

    if (demosWithProduct.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar el producto porque tiene demos asociados" },
        { status: 400 }
      );
    }

    // Eliminar el producto
    await db.delete(products).where(eq(products.id, productId));

    return NextResponse.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    return handleApiError(error, "DELETE /api/products/[id]");
  }
}

