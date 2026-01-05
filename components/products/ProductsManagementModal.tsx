"use client";

import { useState, useEffect, useCallback } from "react";
import { Edit, Trash2, Package } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CldImageWrapper } from "@/components/ui/CldImageWrapper";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { CreateProductModal } from "./CreateProductModal";
import { EditProductModal } from "./EditProductModal";
import { toast } from "@/lib/utils/toast";
import { logger } from "@/lib/utils/logger-client";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { cn } from "@/lib/utils/cn";

interface Product {
  id: number;
  name: string;
  logo?: string;
  corporateColor?: string;
}

interface ProductsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductsManagementModal({
  isOpen,
  onClose,
}: ProductsManagementModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const { isOffline } = useOnlineStatus();

  const fetchProducts = useCallback(async () => {
    if (isOffline) {
      logger.warn("Intento de fetch products sin conexión");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) {
        throw new Error("Error al cargar productos");
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error("Error fetching products", error);
      toast.error("Error al cargar productos", "No se pudieron cargar los productos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, fetchProducts]);

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    if (isOffline) {
      toast.error("Sin conexión", "No puedes eliminar productos sin conexión a internet");
      return;
    }

    try {
      const res = await fetch(`/api/products/${productToDelete}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar producto");
      }

      toast.success("Producto eliminado", "El producto ha sido eliminado correctamente");
      fetchProducts();
    } catch (err: any) {
      logger.error("Error deleting product", err);
      toast.error("Error al eliminar", err.message || "No se pudo eliminar el producto");
    } finally {
      setShowDeleteDialog(false);
      setProductToDelete(null);
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Gestionar Productos"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
            >
              Crear Producto
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
              Cargando productos...
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No hay productos"
              description="Comienza creando tu primer producto"
              action={{
                label: "Crear Producto",
                onClick: () => setShowCreateModal(true),
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  variant="glassPremium"
                  padding="md"
                  className="group hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {/* Logo */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-charcoal-800 flex-shrink-0 border border-gray-200 dark:border-charcoal-700">
                      {product.logo ? (
                        <CldImageWrapper
                          src={product.logo}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center text-white font-semibold text-sm"
                            style={{
                              backgroundColor: product.corporateColor || "#6366f1",
                            }}
                          >
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate mb-1">
                        {product.name}
                      </h3>
                      {product.corporateColor && (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border border-gray-300 dark:border-charcoal-700"
                            style={{ backgroundColor: product.corporateColor }}
                          />
                          <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                            {product.corporateColor}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(product)}
                        className="h-8 w-8 p-0"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(product.id)}
                        className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <AlertDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Producto"
        description="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="destructive"
      />

      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchProducts();
          }}
        />
      )}

      {showEditModal && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
            fetchProducts();
          }}
        />
      )}
    </>
  );
}

