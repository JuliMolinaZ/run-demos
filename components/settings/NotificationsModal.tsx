"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Modal, ModalActions } from "@/components/ui/modal";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [saving, setSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [demoUpdates, setDemoUpdates] = useState(true);
  const [leadUpdates, setLeadUpdates] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    // Aquí puedes agregar la lógica para guardar las preferencias
    // Por ahora solo simulamos un guardado
    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notificaciones"
      description="Configura cómo y cuándo recibir notificaciones"
      size="md"
      footer={
        <ModalActions
          onCancel={onClose}
          onConfirm={handleSave}
          cancelLabel="Cancelar"
          confirmLabel={saving ? "Guardando..." : "Guardar"}
          confirmVariant="primary"
          loading={saving}
        />
      }
    >
      <div className="space-y-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 hover:border-corporate-500/50 transition-colors">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-200">Notificaciones por Email</p>
            <p className="text-xs text-gray-600 dark:text-slate-500 mt-1">Recibe actualizaciones por correo electrónico</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-charcoal-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-corporate-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-corporate-500"></div>
          </label>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 hover:border-corporate-500/50 transition-colors">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-200">Notificaciones Push</p>
            <p className="text-xs text-gray-600 dark:text-slate-500 mt-1">Recibe notificaciones en tiempo real</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-charcoal-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-corporate-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-corporate-500"></div>
          </label>
        </div>

        {/* Demo Updates */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 hover:border-corporate-500/50 transition-colors">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-200">Actualizaciones de Demos</p>
            <p className="text-xs text-gray-600 dark:text-slate-500 mt-1">Notificaciones sobre cambios en demos</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={demoUpdates}
              onChange={(e) => setDemoUpdates(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-charcoal-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-corporate-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-corporate-500"></div>
          </label>
        </div>

        {/* Lead Updates */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 hover:border-corporate-500/50 transition-colors">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-200">Actualizaciones de Leads</p>
            <p className="text-xs text-gray-600 dark:text-slate-500 mt-1">Notificaciones sobre nuevos leads</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={leadUpdates}
              onChange={(e) => setLeadUpdates(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-charcoal-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-corporate-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-corporate-500"></div>
          </label>
        </div>
      </div>
    </Modal>
  );
}

