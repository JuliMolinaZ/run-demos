"use client";

import { motion } from "framer-motion";
import { User, Shield, Bell, Key, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const router = useRouter();

  const settingsCategories = [
    {
      icon: User,
      title: t("settings.profile"),
      description: t("settings.profile.description"),
      color: "text-corporate-400",
    },
    {
      icon: Shield,
      title: t("settings.security"),
      description: t("settings.security.description"),
      color: "text-success",
    },
    {
      icon: Bell,
      title: t("settings.notifications"),
      description: t("settings.notifications.description"),
      color: "text-warning",
    },
    {
      icon: Key,
      title: t("settings.apiKeys"),
      description: t("settings.apiKeys.description"),
      color: "text-platinum",
    },
    {
      icon: Globe,
      title: t("settings.preferences"),
      description: t("settings.preferences.description"),
      color: "text-slate-400",
    },
  ];

  useEffect(() => {
    // Redirigir buyers a demos
    if (session?.user?.role === "buyer") {
      router.push("/demos");
    }
  }, [session, router]);

  // Si es buyer, no mostrar nada (se está redirigiendo)
  if (session?.user?.role === "buyer") {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2 tracking-tight text-gray-900 dark:text-slate-100">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          {t("settings.manageSubtitle")}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card variant="interactive" padding="lg" className="h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-charcoal border border-charcoal-700 flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-slate-100">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
