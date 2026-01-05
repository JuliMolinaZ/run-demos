"use client";

import { useState } from "react";
import { Modal, ModalActions } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { StorageIndicator } from "@/components/ui/StorageIndicator";

interface CreateProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProductModal({
  onClose,
  onSuccess,
}: CreateProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    corporateColor: "#3b82f6",
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          logo: formData.logo || null,
          corporateColor: formData.corporateColor || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear producto");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Crear Producto"
      size="md"
      footer={
        <ModalActions
          onCancel={onClose}
          onConfirm={() => handleSubmit()}
          cancelLabel="Cancelar"
          confirmLabel={loading ? "Creando..." : "Crear Producto"}
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

        <StorageIndicator />

        <Input
          label="Nombre del Producto *"
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
          fullWidth
          placeholder="Ej: Producto X"
        />

        <div className="space-y-3">
          <ImageUpload
            value={formData.logo}
            onChange={(url) => setFormData({ ...formData, logo: url || "" })}
            label="Logo del Producto"
          />
          {!formData.logo && (
            <div>
              <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">
                O ingresa una URL manualmente:
              </p>
              <Input
                type="url"
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
                fullWidth
                placeholder="https://example.com/logo.png"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
            Color Corporativo
          </label>
          <div className="flex gap-3">
            <input
              type="color"
              value={formData.corporateColor}
              onChange={(e) =>
                setFormData({ ...formData, corporateColor: e.target.value })
              }
              className="w-16 h-10 rounded-xl border border-gray-300 dark:border-charcoal-700 cursor-pointer bg-white dark:bg-charcoal-900"
            />
            <Input
              type="text"
              value={formData.corporateColor}
              onChange={(e) =>
                setFormData({ ...formData, corporateColor: e.target.value })
              }
              fullWidth
              placeholder="#3b82f6"
              className="font-mono"
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
            Color hexadecimal para identificar el producto
          </p>
        </div>
      </form>
    </Modal>
  );
}
