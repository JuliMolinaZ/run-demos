"use client";

import { useState, useEffect } from "react";
import { User, Building2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { FileUpload } from "@/components/ui/FileUpload";
import { CldImageWrapper } from "@/components/ui/CldImageWrapper";
import { Modal, ModalActions } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { logger } from "@/lib/utils/logger-client";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setCompany((session.user as any).company || "");
      setProfilePicture((session.user as any).profilePicture || null);
      setError("");
    }
  }, [isOpen, session]);

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name?.trim() || "",
          company: company?.trim() || null,
          profilePicture: profilePicture || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar perfil");
      }

      // Actualizar la sesión con los nuevos datos
      await update({
        name: data.user?.name || name,
        company: data.user?.company || company,
        profilePicture: data.user?.profilePicture || profilePicture,
      });

      // Cerrar el modal después de un breve delay para que el usuario vea el feedback
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error: any) {
      logger.error("Error saving profile", error);
      setError(error.message || "Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil"
      description="Gestiona tu información personal y preferencias de cuenta"
      size="lg"
      footer={
        <ModalActions
          onCancel={onClose}
          onConfirm={handleSave}
          cancelLabel="Cancelar"
          confirmLabel={saving ? "Guardando..." : "Guardar Cambios"}
          confirmVariant="primary"
          loading={saving}
        />
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
            {error}
          </div>
        )}

        {/* Foto de Perfil */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Foto de Perfil
          </label>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-corporate-500/50 bg-gradient-charcoal flex-shrink-0 shadow-lg">
              {profilePicture ? (
                <CldImageWrapper
                  src={profilePicture}
                  alt="Foto de perfil"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-charcoal-800">
                  <User className="w-12 h-12 text-corporate-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <FileUpload
                value={profilePicture || undefined}
                onChange={(url) => setProfilePicture(url)}
                type="image"
                label="Subir foto de perfil"
                maxSizeMB={5}
              />
            </div>
          </div>
        </div>

        {/* Nombre */}
        <Input
          label="Nombre"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          required
          leftIcon={<User className="w-4 h-4" />}
        />

        {/* Email (solo lectura) */}
        <div className="space-y-2">
          <Input
            label="Email"
            type="email"
            value={email}
            disabled
            placeholder="email@ejemplo.com"
          />
          <p className="text-xs text-gray-500 dark:text-slate-500">El email no se puede modificar</p>
        </div>

        {/* Empresa */}
        <Input
          label="Nombre de Empresa"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Nombre de tu empresa"
          leftIcon={<Building2 className="w-4 h-4" />}
        />

        {/* Información adicional (solo lectura) */}
        <div className="pt-4 border-t border-gray-200 dark:border-charcoal-700 space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Información adicional</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-slate-500">Rol:</span>
              <span className="ml-2 text-gray-900 dark:text-slate-300 capitalize font-medium">{session?.user?.role}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-slate-500">ID:</span>
              <span className="ml-2 text-gray-900 dark:text-slate-300 font-medium">{session?.user?.id}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

