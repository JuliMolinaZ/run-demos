"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Modal, ModalActions } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/utils/logger-client";
import { useDirtyState } from "@/lib/hooks/useDirtyState";
import { AlertDialog } from "@/components/ui/alert-dialog";

interface Product {
  id: number;
  name: string;
  logo?: string;
  corporateColor?: string;
}

interface Demo {
  id: number;
  title: string;
  subtitle?: string;
  url?: string;
  htmlContent?: string;
  instructions?: string;
  instructionsEs?: string;
  instructionsEn?: string;
  credentialsJson?: any;
  status: "draft" | "active" | "archived";
  productId: number;
  product: {
    id: number;
    name: string;
    logo?: string;
    corporateColor?: string;
  };
}

interface EditDemoModalProps {
  demo: Demo;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditDemoModal({
  demo,
  onClose,
  onSuccess,
}: EditDemoModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoType, setDemoType] = useState<"url" | "html">(demo.htmlContent ? "html" : "url");
  const [instructionsLang, setInstructionsLang] = useState<"es" | "en">("es");
  const initialFormData = useMemo(() => ({
    productId: (demo.productId || demo.product?.id || "").toString(),
    title: demo.title,
    subtitle: demo.subtitle || "",
    url: demo.url || "",
    htmlContent: demo.htmlContent || "",
    instructions: demo.instructions || "",
    instructionsEs: demo.instructionsEs || demo.instructions || "",
    instructionsEn: demo.instructionsEn || "",
    username: demo.credentialsJson?.username || "",
    password: demo.credentialsJson?.password || "",
    hasResponsive: Boolean((demo as any).hasResponsive),
    requiresCredentials: Boolean((demo as any).requiresCredentials),
    status: demo.status,
  }), [demo]);

  const [formData, setFormData] = useState(initialFormData);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const { isDirty } = useDirtyState(initialFormData, formData);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      logger.error("Error fetching products", error);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let credentialsJson = null;
      if (formData.username.trim() || formData.password.trim()) {
        credentialsJson = {
          username: formData.username.trim() || null,
          password: formData.password.trim() || null,
        };
      }

      const res = await fetch(`/api/demos/${demo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(formData.productId),
          title: formData.title,
          subtitle: formData.subtitle,
          url: formData.url.trim() || null,
          htmlContent: formData.htmlContent.trim() || null,
          instructions: formData.instructions,
          instructionsEs: formData.instructionsEs.trim() || null,
          instructionsEn: formData.instructionsEn.trim() || null,
          credentialsJson,
          hasResponsive: formData.hasResponsive,
          requiresCredentials: formData.requiresCredentials,
          status: formData.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar demo");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (isDirty && !loading) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Editar Demo"
        size="lg"
        footer={
          <ModalActions
            onCancel={handleClose}
            onConfirm={() => handleSubmit()}
            cancelLabel="Cancelar"
            confirmLabel={loading ? "Guardando..." : "Guardar Cambios"}
            loading={loading}
          />
        }
      >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 dark:bg-error/10 rounded-xl p-4 text-red-700 dark:text-error text-sm border border-red-200 dark:border-error/20">
            {error}
          </div>
        )}

        {/* Producto */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
            Producto *
          </label>
          <select
            value={formData.productId}
            onChange={(e) =>
              setFormData({ ...formData, productId: e.target.value })
            }
            required
            className="w-full px-4 py-3 bg-white dark:bg-charcoal-900 rounded-xl border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none focus:ring-2 focus:ring-corporate-500/30 transition-all text-gray-900 dark:text-slate-50"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id} className="bg-white dark:bg-charcoal-900 text-gray-900 dark:text-slate-50">
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Título */}
        <Input
          label="Título *"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          fullWidth
          placeholder="Nombre del demo"
        />

        {/* Subtítulo */}
        <Input
          label="Subtítulo"
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          fullWidth
          placeholder="Descripción breve (opcional)"
        />

        {/* Tipo de Demo */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
            Tipo de Demo *
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={demoType === "url" ? "primary" : "secondary"}
              size="md"
              onClick={() => setDemoType("url")}
              className="flex-1"
            >
              URL Externa
            </Button>
            <Button
              type="button"
              variant={demoType === "html" ? "primary" : "secondary"}
              size="md"
              onClick={() => setDemoType("html")}
              className="flex-1"
            >
              HTML Directo
            </Button>
          </div>
        </div>

        {/* URL o HTML */}
        {demoType === "url" ? (
          <Input
            label="URL del Demo (iframe) *"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            fullWidth
            placeholder="https://demo.example.com"
            helperText="URL externa que se mostrará en un iframe"
          />
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
              Contenido HTML *
            </label>
            <textarea
              value={formData.htmlContent}
              onChange={(e) =>
                setFormData({ ...formData, htmlContent: e.target.value })
              }
              rows={10}
              className="w-full px-4 py-3 bg-white dark:bg-charcoal-900 rounded-xl border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none focus:ring-2 focus:ring-corporate-500/30 transition-all font-mono text-sm text-gray-900 dark:text-slate-50"
              placeholder="<!DOCTYPE html>
<html>
<head>
  <title>Mi Demo</title>
</head>
<body>
  <h1>Bienvenido</h1>
</body>
</html>"
            />
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
              Pega tu HTML completo aquí
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
              value={formData.instructionsEs}
              onChange={(e) =>
                setFormData({ ...formData, instructionsEs: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-charcoal-900 rounded-xl border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none focus:ring-2 focus:ring-corporate-500/30 transition-all text-gray-900 dark:text-slate-50"
              placeholder="Instrucciones en español para usar el demo..."
            />
          </div>

          {/* Instrucciones en Inglés */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">🇺🇸 English</span>
            </div>
            <textarea
              value={formData.instructionsEn}
              onChange={(e) =>
                setFormData({ ...formData, instructionsEn: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-charcoal-900 rounded-xl border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none focus:ring-2 focus:ring-corporate-500/30 transition-all text-gray-900 dark:text-slate-50"
              placeholder="Instructions in English for using the demo..."
            />
          </div>
        </div>

        {/* Credenciales */}
        <div className="bg-gray-50 dark:bg-charcoal-800/50 rounded-xl p-4 border border-gray-200 dark:border-charcoal-700">
          <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-slate-200">
            Credenciales de Acceso (Opcional)
          </h3>
          <p className="text-xs text-gray-600 dark:text-slate-400 mb-4">
            Si el demo requiere usuario y contraseña, ingrésalos aquí
          </p>
          <div className="space-y-3">
            <Input
              label="Usuario"
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              fullWidth
              placeholder="usuario@ejemplo.com"
              size="sm"
            />
            <Input
              label="Contraseña"
              type="text"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              fullWidth
              placeholder="contraseña123"
              size="sm"
            />
          </div>
        </div>

        {/* Opciones */}
        <div className="bg-gray-50 dark:bg-charcoal-800/50 rounded-xl p-4 border border-gray-200 dark:border-charcoal-700 space-y-4">
          <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-slate-200">
            Opciones de Visualización
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Versión Responsive
              </label>
              <p className="text-xs text-gray-600 dark:text-slate-400">
                ¿El demo tiene versión móvil?
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasResponsive}
                onChange={(e) =>
                  setFormData({ ...formData, hasResponsive: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 dark:bg-charcoal-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-corporate-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-corporate-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Requiere Credenciales
              </label>
              <p className="text-xs text-gray-600 dark:text-slate-400">
                ¿El demo necesita login?
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requiresCredentials}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requiresCredentials: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 dark:bg-charcoal-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-corporate-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-corporate-500"></div>
            </label>
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
            Estado
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as any })
            }
            className="w-full px-4 py-3 bg-white dark:bg-charcoal-900 rounded-xl border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none focus:ring-2 focus:ring-corporate-500/30 transition-all text-gray-900 dark:text-slate-50"
          >
            <option value="draft" className="bg-white dark:bg-charcoal-900 text-gray-900 dark:text-slate-50">Borrador</option>
            <option value="active" className="bg-white dark:bg-charcoal-900 text-gray-900 dark:text-slate-50">Activo</option>
            <option value="archived" className="bg-white dark:bg-charcoal-900 text-gray-900 dark:text-slate-50">Archivado</option>
          </select>
        </div>
      </form>
      </Modal>

      {/* Alert Dialog para confirmar cierre con cambios sin guardar */}
      <AlertDialog
        isOpen={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        onConfirm={handleConfirmClose}
        title="¿Descartar cambios?"
        description="Tienes cambios sin guardar. Si cierras ahora, perderás todos los cambios realizados."
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        variant="default"
      />
    </>
  );
}
