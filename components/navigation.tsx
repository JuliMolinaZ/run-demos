"use client";

import Link from "next/link";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Presentation, Users, LogOut, UserCog, Sparkles, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { UserMenu } from "@/components/settings/UserMenu";
import { useTranslation } from "@/lib/i18n/useTranslation";

const navItems = [
  { href: "/", translationKey: "nav.kpis" as const, icon: LayoutDashboard, roles: ["admin", "sales"] },
  { href: "/demos", translationKey: "nav.demos" as const, icon: Presentation, roles: ["admin", "sales", "buyer"] },
  { href: "/users", translationKey: "nav.users" as const, icon: UserCog, roles: ["admin", "sales"] },
  { href: "/leads", translationKey: "nav.leads" as const, icon: Users, roles: ["admin", "sales"] },
];

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ocultar navigation en la vista completa del demo
  if (pathname?.startsWith("/demos/") && pathname.includes("/view")) {
    return null;
  }

  const filteredNavItems = navItems.filter((item) => {
    if (!session?.user?.role) return false;
    return item.roles.includes(session.user.role);
  });

  const getRoleBadgeVariant = (role?: string): "error" | "corporate" | "warning" | "success" => {
    switch (role) {
      case "admin":
        return "error";
      case "manager":
        return "corporate";
      case "sales":
        return "warning";
      case "buyer":
        return "success";
      default:
        return "corporate";
    }
  };

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  if (!session) {
    return null;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50" style={{
        backgroundColor: 'rgba(28, 31, 38, 0.98)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgb(55, 61, 71)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo Premium con Glow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-shrink-0"
            >
              <Link
                href={session?.user?.role === "buyer" ? "/demos" : "/"}
                className="flex items-center gap-2 sm:gap-3 group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-corporate-500/20 blur-xl rounded-lg group-hover:bg-corporate-500/30 transition-all" />
                  <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-glow-corporate">
                    <img
                      src="/logo-run.png"
                      alt="RUN Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-sm sm:text-lg tracking-tight" style={{
                    background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    RUN DEMO-HUB
                  </span>
                  <span className="text-[8px] sm:text-[9px] tracking-wider font-semibold" style={{ color: '#64748b' }}>
                    v1.0.2
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Navigation Items con Active Indicator Animado */}
              <div className="flex items-center gap-2">
                {filteredNavItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-normal group shine-effect"
                      >
                        {/* Active Indicator con Layout Animation */}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-corporate rounded-xl shadow-glow-corporate"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}

                        <Icon className={`relative w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                        }`} />
                        <span className={`relative text-sm font-semibold transition-colors ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                        }`}>
                          {t(item.translationKey)}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* User Section Premium */}
              <div className="flex items-center gap-4 pl-6" style={{ borderLeft: '1px solid rgb(55, 61, 71)' }}>
                {/* Language Toggle */}
                <LanguageToggle />

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Menu con hamburguesa */}
                <UserMenu />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <UserMenu />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-charcoal-800 transition-colors"
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu - Inside Nav */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-2 border-t border-charcoal-700 mt-4">
                  {filteredNavItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                            isActive
                              ? "bg-gradient-corporate text-white shadow-lg"
                              : "text-slate-300 hover:text-white hover:bg-charcoal-800 active:bg-charcoal-700"
                          }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-base font-semibold">
                            {t(item.translationKey)}
                          </span>
                          {isActive && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-white/80" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}

