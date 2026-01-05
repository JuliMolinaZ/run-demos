"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Bell, LogOut, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProfileModal } from "./ProfileModal";
import { SecurityModal } from "./SecurityModal";
import { NotificationsModal } from "./NotificationsModal";
import { CldImageWrapper } from "@/components/ui/CldImageWrapper";

export function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const profilePicture = (session?.user as any)?.profilePicture;

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Avatar Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-charcoal-800 transition-colors group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-corporate-500/20 blur-md rounded-full" />
            <div className="relative w-10 h-10 rounded-full border-2 border-corporate-500/50 bg-gradient-charcoal flex items-center justify-center overflow-hidden">
              {profilePicture ? (
                <CldImageWrapper
                  src={profilePicture}
                  alt={session?.user?.name || "Usuario"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-corporate-400" />
              )}
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-charcoal-900 border border-charcoal-700 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-charcoal-700">
                <p className="text-sm font-semibold text-slate-100">{session?.user?.name}</p>
                <p className="text-xs text-slate-400">{session?.user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-slate-300 hover:bg-charcoal-800 transition-colors"
                >
                  <User className="w-4 h-4 text-corporate-400" />
                  Perfil
                </button>

                <button
                  onClick={() => {
                    setShowSecurityModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-slate-300 hover:bg-charcoal-800 transition-colors"
                >
                  <Shield className="w-4 h-4 text-success" />
                  Seguridad
                </button>

                <button
                  onClick={() => {
                    setShowNotificationsModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-slate-300 hover:bg-charcoal-800 transition-colors"
                >
                  <Bell className="w-4 h-4 text-warning" />
                  Notificaciones
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-charcoal-700 py-2">
                <button
                  onClick={async () => {
                    setIsLoggingOut(true);
                    setIsOpen(false);
                    try {
                      // Cerrar sesión sin redirección automática
                      await signOut({ redirect: false });
                      // Redirigir manualmente usando router
                      router.push("/login");
                      router.refresh(); // Refrescar datos del servidor
                    } catch (error) {
                      // Si hay error, redirigir de todas formas
                      router.push("/login");
                    } finally {
                      setIsLoggingOut(false);
                    }
                  }}
                  disabled={isLoggingOut}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-error hover:bg-error/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      <SecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />
    </>
  );
}

