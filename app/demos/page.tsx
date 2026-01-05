"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Presentation,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Play,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { CreateDemoModal } from "@/components/demos/CreateDemoModal";
import { EditDemoModal } from "@/components/demos/EditDemoModal";
import { ViewDemoModal } from "@/components/demos/ViewDemoModal";
import { CreateProductModal } from "@/components/products/CreateProductModal";
import { ProductsManagementModal } from "@/components/products/ProductsManagementModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CldImageWrapper } from "@/components/ui/CldImageWrapper";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { DemosListSkeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { toast } from "@/lib/utils/toast";
import { logger } from "@/lib/utils/logger-client";

interface Demo {
  id: number;
  title: string;
  subtitle?: string;
  url?: string;
  htmlContent?: string;
  instructions?: string;
  credentialsJson?: any;
  hasResponsive?: boolean | number;
  requiresCredentials?: boolean | number;
  status: "draft" | "active" | "archived";
  productId: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
    logo?: string;
    corporateColor?: string;
  };
}

export default function DemosPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const router = useRouter();
  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProductsManagementModal, setShowProductsManagementModal] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<Demo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [demoToDelete, setDemoToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const isBuyer = session?.user?.role === "buyer";
  const canEdit = session?.user?.role !== "buyer";
  const { isOffline } = useOnlineStatus();
  
  // Debounce de búsqueda para evitar múltiples requests
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    fetchDemos();
  }, []);

  const fetchDemos = useCallback(async () => {
    if (isOffline) {
      logger.warn("Intento de fetch demos sin conexión");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/demos");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t("demos.fetch.error"));
      }
      const data = await res.json();
      setDemos(data);
    } catch (error) {
      logger.error("Error fetching demos", error);
      toast.error("Error al cargar demos", "Por favor, intenta nuevamente");
      setDemos([]);
    } finally {
      setLoading(false);
    }
  }, [t, isOffline]);

  const handleDeleteClick = (id: number) => {
    setDemoToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!demoToDelete || isOffline) {
      if (isOffline) {
        toast.error("Sin conexión", "No puedes eliminar demos sin conexión a internet");
      }
      setShowDeleteDialog(false);
      setDemoToDelete(null);
      return;
    }

    try {
      const res = await fetch(`/api/demos/${demoToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t("demos.delete.error"));
      }

      toast.success("Demo eliminado", "El demo ha sido eliminado correctamente");
      fetchDemos();
    } catch (error) {
      logger.error("Error deleting demo", error);
      toast.error("Error al eliminar", "No se pudo eliminar el demo. Intenta nuevamente");
    } finally {
      setShowDeleteDialog(false);
      setDemoToDelete(null);
    }
  };

  // Filtrar demos con debounce aplicado
  const filteredDemos = useMemo(() => {
    return demos.filter((demo) => {
      const matchesSearch =
        demo.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        demo.subtitle?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        demo.product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || demo.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [demos, debouncedSearchTerm, statusFilter]);

  // Paginación
  const totalPages = Math.ceil(filteredDemos.length / itemsPerPage);
  const paginatedDemos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDemos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDemos, currentPage, itemsPerPage]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "draft":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "archived":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return t("demos.status.active");
      case "draft":
        return t("demos.status.draft");
      case "archived":
        return t("demos.status.archived");
      default:
        return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-2 tracking-tight text-gray-900 dark:text-slate-100">
              {t("demos.title")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {isBuyer
                ? t("demos.subtitle.buyer")
                : t("demos.subtitle.default")}
            </p>
          </div>
          {canEdit && (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowProductsManagementModal(true)}
                leftIcon={<Package className="w-4 h-4" />}
              >
                Gestionar Productos
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowProductModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                {t("demos.newProduct")}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowCreateModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                disabled={isOffline}
                aria-label={t("demos.newDemo")}
              >
                {t("demos.newDemo")}
              </Button>
            </div>
          )}
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={t("demos.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              fullWidth
            />
          </div>
          {!isBuyer && (
            <div className="w-full sm:w-64">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-500 z-10" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 glass-light rounded-xl border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none focus:ring-2 focus:ring-corporate-500/30 transition-all appearance-none bg-white dark:bg-transparent text-gray-900 dark:text-slate-50 text-base"
                >
                  <option value="all" className="bg-white dark:bg-charcoal-900 text-gray-900 dark:text-slate-50">{t("demos.allStatuses")}</option>
                  <option value="active" className="bg-white dark:bg-charcoal-900 text-gray-900 dark:text-slate-50">{t("demos.active")}</option>
                  <option value="draft" className="bg-white dark:bg-charcoal-900 text-gray-900 dark:text-slate-50">{t("demos.draft")}</option>
                  <option value="archived" className="bg-white dark:bg-charcoal-900 text-gray-900 dark:text-slate-50">{t("demos.archived")}</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {loading ? (
        <DemosListSkeleton count={6} />
      ) : filteredDemos.length === 0 ? (
        <EmptyState
          icon={Presentation}
          title={
            searchTerm || statusFilter !== "all"
              ? t("demos.empty.title")
              : isBuyer
              ? t("demos.empty.title.noAssigned")
              : t("demos.empty.title.noDemos")
          }
          description={
            isBuyer
              ? t("demos.empty.description.buyer")
              : t("demos.empty.description.default")
          }
          action={
            canEdit
              ? {
                  label: t("demos.empty.createDemo"),
                  onClick: () => setShowCreateModal(true),
                  icon: <Plus className="w-4 h-4" />,
                }
              : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedDemos.map((demo, index) => (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              <Card variant="glassPremium" padding="lg" className="h-full flex flex-col group">
                {/* Product Badge */}
                <div className="flex items-center gap-2 mb-4">
                  {demo.product.logo && (
                    <div className="relative w-6 h-6">
                      <CldImageWrapper
                        src={demo.product.logo}
                        alt={demo.product.name}
                        width={24}
                        height={24}
                        className="rounded"
                      />
                    </div>
                  )}
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-lg border"
                    style={{
                      backgroundColor: demo.product.corporateColor
                        ? `${demo.product.corporateColor}15`
                        : "rgba(71, 85, 105, 0.15)",
                      borderColor: demo.product.corporateColor
                        ? `${demo.product.corporateColor}30`
                        : "rgba(71, 85, 105, 0.3)",
                      color: demo.product.corporateColor || "#94A3B8",
                    }}
                  >
                    {demo.product.name}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div className="flex-1 mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-slate-100 group-hover:text-corporate-400 transition-colors">
                    {demo.title}
                  </h3>
                  {demo.subtitle && (
                    <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {demo.subtitle}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <Badge
                    variant={
                      demo.status === "active"
                        ? "success"
                        : demo.status === "draft"
                        ? "warning"
                        : "default"
                    }
                    size="sm"
                  >
                    {getStatusLabel(demo.status)}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // Todos los usuarios (incluidos buyers) usan el modal
                      setSelectedDemo(demo);
                      setShowViewModal(true);
                    }}
                    leftIcon={<Play className="w-4 h-4" />}
                    className="flex-1"
                    aria-label={`Ver demo: ${demo.title}`}
                  >
                    {t("demos.view")}
                  </Button>
                  {canEdit && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDemo(demo);
                          setShowEditModal(true);
                        }}
                        className="px-3"
                        aria-label={`Editar demo: ${demo.title}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {session?.user?.role === "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(demo.id)}
                          disabled={isOffline}
                          className="px-3 text-error hover:bg-error/10 disabled:opacity-50"
                          aria-label={t("demos.delete.confirm")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredDemos.length)} de {filteredDemos.length} demos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isOffline}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                  aria-label="Página anterior"
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600 dark:text-slate-400 px-3">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isOffline}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  aria-label="Página siguiente"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Alert Dialog para confirmar eliminación */}
      <AlertDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDemoToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar demo?"
        description="Esta acción no se puede deshacer. El demo será eliminado permanentemente."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="destructive"
      />

      {showCreateModal && (
        <CreateDemoModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            toast.success("Demo creado", "El demo ha sido creado correctamente");
            fetchDemos();
          }}
        />
      )}

      {showEditModal && selectedDemo && (
        <EditDemoModal
          demo={selectedDemo}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDemo(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedDemo(null);
            toast.success("Demo actualizado", "Los cambios se han guardado correctamente");
            fetchDemos();
          }}
        />
      )}

      {showViewModal && selectedDemo && (
        <ViewDemoModal
          demo={selectedDemo}
          onClose={() => {
            setShowViewModal(false);
            setSelectedDemo(null);
          }}
        />
      )}

      {showProductModal && (
        <CreateProductModal
          onClose={() => setShowProductModal(false)}
          onSuccess={() => {
            setShowProductModal(false);
            // Actualizar datos sin recargar página usando router.refresh()
            router.refresh();
            // También refrescar demos por si acaso hay cambios
            fetchDemos();
          }}
        />
      )}

      {showProductsManagementModal && (
        <ProductsManagementModal
          isOpen={showProductsManagementModal}
          onClose={() => setShowProductsManagementModal(false)}
        />
      )}
    </div>
  );
}
