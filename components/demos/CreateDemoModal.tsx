"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Check } from "lucide-react";

// Importación condicional de react-hook-form
let useForm: any;
let zodResolver: any;
try {
  // eslint-disable-next-line
  const rhf = require("react-hook-form");
  // eslint-disable-next-line
  const resolvers = require("@hookform/resolvers/zod");
  useForm = rhf.useForm;
  zodResolver = resolvers.zodResolver;
} catch (e) {
  // Fallback si las dependencias no están instaladas
  useForm = () => ({
    register: () => ({}),
    handleSubmit: (fn: any) => fn,
    formState: { errors: {}, isSubmitting: false },
    watch: () => "",
    setValue: () => {},
    reset: () => {},
    trigger: () => Promise.resolve(true),
  });
  zodResolver = () => {};
}
import { CreateProductModal } from "@/components/products/CreateProductModal";
import { Modal, ModalActions } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CldImageWrapper } from "@/components/ui/CldImageWrapper";
import { createDemoSchema, type CreateDemoInput } from "@/lib/validations/demo-schemas";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { logger } from "@/lib/utils/logger-client";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils/cn";

interface Product {
  id: number;
  name: string;
  logo?: string;
  corporateColor?: string;
}

interface CreateDemoModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateDemoModal({ onClose, onSuccess }: CreateDemoModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [demoType, setDemoType] = useState<"url" | "html">("url");
  const [instructionsLang, setInstructionsLang] = useState<"es" | "en">("es");
  const { isOffline } = useOnlineStatus();

  // React Hook Form con validación Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
    watch,
    setValue,
    reset,
    trigger,
  } = useForm({
    resolver: zodResolver(createDemoSchema),
    defaultValues: {
      productId: 0,
      title: "",
      subtitle: "",
      url: "",
      htmlContent: "",
      instructionsEs: "",
      instructionsEn: "",
      hasResponsive: false,
      requiresCredentials: false,
      status: "draft",
      username: "",
      password: "",
    },
    mode: "onSubmit", // Solo validar al intentar enviar
    reValidateMode: "onBlur", // Re-validar al perder el foco después del primer submit
  });

  const watchedUrl = watch("url");
  const watchedHtmlContent = watch("htmlContent");

  // Limpiar el campo no usado cuando se cambia el tipo de demo
  useEffect(() => {
    if (demoType === "url") {
      setValue("htmlContent", "");
    } else {
      setValue("url", "");
    }
    // Solo re-validar si el usuario ya intentó enviar el formulario
    if (isSubmitted) {
      trigger(["url", "htmlContent"]);
    }
  }, [demoType, setValue, trigger, isSubmitted]);

  const fetchProducts = useCallback(async () => {
    if (isOffline) {
      logger.warn("Intento de fetch products sin conexión");
      return;
    }

    try {
      setLoadingProducts(true);
      const res = await fetch("/api/products");
      if (!res.ok) {
        throw new Error("Error al cargar productos");
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        const currentProductId = watch("productId");
        if (!currentProductId || currentProductId === 0) {
          setValue("productId", data[0].id);
        }
      }
    } catch (error) {
      logger.error("Error fetching products", error);
      toast.error("Error al cargar productos", "No se pudieron cargar los productos");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [isOffline, watch, setValue]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onSubmit = async (data: CreateDemoInput & { username?: string; password?: string }) => {
    if (isOffline) {
      toast.error("Sin conexión", "No puedes crear demos sin conexión a internet");
      return;
    }

    try {
      // Determinar URL o HTML según el tipo seleccionado
      const url = demoType === "url" ? data.url : null;
      const htmlContent = demoType === "html" ? data.htmlContent : null;

      let credentialsJson = null;
      if (data.username?.trim() || data.password?.trim()) {
        credentialsJson = {
          username: data.username?.trim() || null,
          password: data.password?.trim() || null,
        };
      }

      const res = await fetch("/api/demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: data.productId,
          title: data.title,
          subtitle: data.subtitle || null,
          url: url || null,
          htmlContent: htmlContent || null,
          instructionsEs: data.instructionsEs || null,
          instructionsEn: data.instructionsEn || null,
          credentialsJson,
          hasResponsive: data.hasResponsive,
          requiresCredentials: data.requiresCredentials,
          status: data.status,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Error al crear demo");
      }

      reset();
      toast.success("Demo creado", "El demo ha sido creado correctamente");
      onSuccess();
      onClose();
    } catch (err: any) {
      logger.error("Error creating demo", err);
      toast.error("Error al crear demo", err.message || "Por favor, intenta nuevamente");
    }
  };

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Crear Nuevo Demo"
        size="lg"
        footer={
          <ModalActions
            onCancel={onClose}
            onConfirm={handleSubmit(onSubmit)}
            cancelLabel="Cancelar"
            confirmLabel={isSubmitting ? "Creando..." : "Crear Demo"}
            loading={isSubmitting}
          />
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Error general del formulario - solo mostrar después de intentar enviar */}
          {isSubmitted && Object.keys(errors).length > 0 && (
            <div className="bg-red-50 dark:bg-error/10 rounded-xl p-4 text-red-700 dark:text-error text-sm border border-red-200 dark:border-error/20">
              Por favor, corrige los errores en el formulario
            </div>
          )}

          {/* Producto */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300" htmlFor="productId">
                Producto <span className="text-error" aria-label="Campo requerido">*</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-slate-500 font-normal">(Requerido)</span>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowProductModal(true)}
                leftIcon={<Plus className="w-3 h-3" />}
              >
                Crear Producto
              </Button>
            </div>
            {loadingProducts ? (
              <div className="w-full px-4 py-3 bg-gray-100 dark:bg-charcoal-800 rounded-xl border border-gray-300 dark:border-charcoal-700 text-gray-500 dark:text-slate-400 text-sm">
                Cargando productos...
              </div>
            ) : products.length === 0 ? (
              <div className="w-full px-4 py-3 bg-gray-100 dark:bg-charcoal-800 rounded-xl border border-gray-300 dark:border-charcoal-700 text-center">
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                  No hay productos disponibles
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowProductModal(true)}
                  leftIcon={<Plus className="w-3 h-3" />}
                >
                  Crear Primer Producto
                </Button>
              </div>
            ) : (
              <div>
                <div
                  id="productId"
                  role="radiogroup"
                  aria-required="true"
                  aria-invalid={isSubmitted && errors.productId ? "true" : "false"}
                  aria-describedby={isSubmitted && errors.productId ? "productId-error" : undefined}
                  className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 gap-3",
                    isSubmitted && errors.productId && "ring-2 ring-error rounded-xl p-1"
                  )}
                >
                  {products.map((product) => {
                    const isSelected = watch("productId") === product.id;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setValue("productId", product.id, { shouldValidate: isSubmitted })}
                        disabled={isOffline}
                        className={cn(
                          "relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                          "hover:scale-[1.02] active:scale-[0.98]",
                          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                          isSelected
                            ? "border-corporate-500 bg-corporate-50 dark:bg-corporate-500/10 shadow-md"
                            : "border-gray-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 hover:border-corporate-300 dark:hover:border-corporate-600"
                        )}
                        aria-pressed={isSelected}
                        aria-label={`Seleccionar producto ${product.name}`}
                      >
                        {/* Logo del Producto */}
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

                        {/* Nombre del Producto */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                            {product.name}
                          </p>
                        </div>

                        {/* Indicador de Selección */}
                        {isSelected && (
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-corporate-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {isSubmitted && errors.productId && (
                  <p id="productId-error" className="mt-2 text-sm text-error" role="alert">
                    {errors.productId.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Título */}
          <div>
            <Input
              label={
                <>
                  Título <span className="text-error" aria-label="Campo requerido">*</span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-slate-500 font-normal">(Requerido)</span>
                </>
              }
              type="text"
              {...register("title")}
              disabled={isOffline}
              fullWidth
              placeholder="Ej: Demo de Producto X"
              error={isSubmitted ? errors.title?.message : undefined}
              aria-required="true"
              aria-invalid={isSubmitted && errors.title ? "true" : "false"}
            />
          </div>

          {/* Subtítulo */}
          <div>
            <Input
              label="Subtítulo"
              type="text"
              {...register("subtitle")}
              disabled={isOffline}
              fullWidth
              placeholder="Breve descripción del demo"
              error={isSubmitted ? errors.subtitle?.message : undefined}
            />
          </div>

          {/* Tipo de Demo */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
              Tipo de Demo <span className="text-error" aria-label="Campo requerido">*</span>
              <span className="ml-2 text-xs text-gray-500 dark:text-slate-500 font-normal">(Requerido)</span>
            </label>
            <div className="flex gap-2" role="radiogroup" aria-label="Tipo de demo">
              <Button
                type="button"
                variant={demoType === "url" ? "primary" : "secondary"}
                size="md"
                onClick={() => setDemoType("url")}
                className="flex-1"
                aria-pressed={demoType === "url"}
                aria-label="Seleccionar URL Externa"
              >
                URL Externa
              </Button>
              <Button
                type="button"
                variant={demoType === "html" ? "primary" : "secondary"}
                size="md"
                onClick={() => setDemoType("html")}
                className="flex-1"
                aria-pressed={demoType === "html"}
                aria-label="Seleccionar HTML Directo"
              >
                HTML Directo
              </Button>
            </div>
          </div>

          {/* URL o HTML */}
          {demoType === "url" ? (
            <div>
              <Input
                label={
                  <>
                    URL del Demo (iframe) <span className="text-error" aria-label="Campo requerido">*</span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-slate-500 font-normal">(Requerido)</span>
                  </>
                }
                type="text"
                {...register("url")}
                disabled={isOffline}
                fullWidth
                placeholder="demo.example.com o https://demo.example.com"
                helperText="URL externa que se mostrará en un iframe. Se agregará https:// automáticamente si falta."
                error={isSubmitted ? errors.url?.message : undefined}
                aria-required="true"
                aria-invalid={isSubmitted && errors.url ? "true" : "false"}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300" htmlFor="htmlContent">
                Contenido HTML <span className="text-error" aria-label="Campo requerido">*</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-slate-500 font-normal">(Requerido)</span>
              </label>
              <textarea
                id="htmlContent"
                {...register("htmlContent")}
                disabled={isOffline}
                rows={12}
                aria-required="true"
                aria-invalid={isSubmitted && errors.htmlContent ? "true" : "false"}
                aria-describedby={isSubmitted && errors.htmlContent ? "htmlContent-error" : undefined}
                className={`w-full px-4 py-3 bg-white dark:bg-charcoal-900 rounded-xl border ${
                  isSubmitted && errors.htmlContent
                    ? "border-error dark:border-error"
                    : "border-gray-300 dark:border-charcoal-700"
                } focus:border-corporate-500 focus:outline-none focus:ring-2 focus:ring-corporate-500/30 transition-all text-gray-900 dark:text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-600 font-mono text-sm disabled:opacity-50`}
                placeholder="<!DOCTYPE html>&#10;<html>&#10;<head>&#10;  <title>Mi Demo</title>&#10;</head>&#10;<body>&#10;  <h1>Bienvenido a mi Demo</h1>&#10;  <!-- Tu contenido HTML aquí -->&#10;</body>&#10;</html>"
              />
              {isSubmitted && errors.htmlContent && (
                <p id="htmlContent-error" className="mt-1 text-sm text-error" role="alert">
                  {errors.htmlContent.message}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                Pega tu HTML completo aquí. Se mostrará directamente en la plataforma.
              </p>
            </div>
          )}

          {/* Instrucciones Bilingües */}
          <div className="bg-gray-50 dark:bg-charcoal-800/50 rounded-xl p-4 border border-gray-200 dark:border-charcoal-700 space-y-4">
            <label className="block text-sm font-semibold text-gray-900 dark:text-slate-200">
              Instrucciones del Demo
            </label>
            
            {/* Instrucciones en Español */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">🇲🇽 Español</span>
              </div>
              <textarea
                {...register("instructionsEs")}
                disabled={isOffline}
                rows={4}
                className={`w-full px-4 py-3 bg-white dark:bg-charcoal-900 rounded-xl border ${
                  isSubmitted && errors.instructionsEs
                    ? "border-error dark:border-error"
                    : "border-gray-300 dark:border-charcoal-700"
                } focus:border-corporate-500 focus:outline-none focus:ring-2 focus:ring-corporate-500/30 transition-all text-gray-900 dark:text-slate-50 disabled:opacity-50`}
                placeholder="Instrucciones en español para usar el demo..."
              />
              {isSubmitted && errors.instructionsEs && (
                <p className="mt-1 text-sm text-error">{errors.instructionsEs.message}</p>
              )}
            </div>

            {/* Instrucciones en Inglés */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">🇺🇸 English</span>
              </div>
              <textarea
                {...register("instructionsEn")}
                disabled={isOffline}
                rows={4}
                className={`w-full px-4 py-3 bg-white dark:bg-charcoal-900 rounded-xl border ${
                  isSubmitted && errors.instructionsEn
                    ? "border-error dark:border-error"
                    : "border-gray-300 dark:border-charcoal-700"
                } focus:border-corporate-500 focus:outline-none focus:ring-2 focus:ring-corporate-500/30 transition-all text-gray-900 dark:text-slate-50 disabled:opacity-50`}
                placeholder="Instructions in English for using the demo..."
              />
              {isSubmitted && errors.instructionsEn && (
                <p className="mt-1 text-sm text-error">{errors.instructionsEn.message}</p>
              )}
            </div>
          </div>

          {/* Credenciales */}
          <div className="bg-gray-50 dark:bg-charcoal-800 rounded-xl p-4 border border-gray-200 dark:border-charcoal-700">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
              Credenciales de Acceso (Opcional)
            </label>
            <p className="text-xs text-gray-500 dark:text-slate-500 mb-3">
              Si el demo requiere usuario y contraseña, ingrésalos aquí
            </p>
            <div className="space-y-3">
              <Input
                label="Usuario"
                type="text"
                {...register("username")}
                disabled={isOffline}
                fullWidth
                placeholder="Ej: demo@example.com"
              />
              <Input
                label="Contraseña"
                type="text"
                {...register("password")}
                disabled={isOffline}
                fullWidth
                placeholder="Ej: demo123"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
              Estado
            </label>
            <select
              {...register("status")}
              disabled={isOffline}
              className="w-full px-4 py-3 bg-white dark:bg-charcoal-900 rounded-xl border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none focus:ring-2 focus:ring-corporate-500/30 transition-all text-gray-900 dark:text-slate-50 disabled:opacity-50"
            >
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="archived">Archivado</option>
            </select>
          </div>

          {/* Checkboxes para opciones */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("hasResponsive")}
                disabled={isOffline}
                className="w-4 h-4 rounded border-gray-300 dark:border-charcoal-700 text-corporate-500 focus:ring-corporate-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-700 dark:text-slate-300">
                Versión Responsive (tiene versión móvil)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("requiresCredentials")}
                disabled={isOffline}
                className="w-4 h-4 rounded border-gray-300 dark:border-charcoal-700 text-corporate-500 focus:ring-corporate-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-700 dark:text-slate-300">
                Requiere Credenciales
              </span>
            </label>
          </div>
        </form>
      </Modal>

      {showProductModal && (
        <CreateProductModal
          onClose={() => setShowProductModal(false)}
          onSuccess={() => {
            setShowProductModal(false);
            fetchProducts();
          }}
        />
      )}
    </>
  );
}
