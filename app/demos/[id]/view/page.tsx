"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logger } from "@/lib/utils/logger-client";
import {
  X,
  Copy,
  Check,
  Monitor,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Lock,
  FileText,
  Package,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CldImageWrapper } from "@/components/ui/CldImageWrapper";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Demo {
  id: number;
  title: string;
  subtitle?: string;
  url?: string;
  htmlContent?: string;
  instructions?: string;
  instructionsEs?: string;
  instructionsEn?: string;
  credentialsJson?: { username?: string; password?: string };
  hasResponsive?: boolean;
  requiresCredentials?: boolean;
  product: {
    id: number;
    name: string;
    logo?: string;
    corporateColor?: string;
  };
}

export default function DemoViewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { t, language } = useTranslation();
  const demoId = params?.id as string;

  const [demo, setDemo] = useState<Demo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isBuyer = session?.user?.role === "buyer";
  const demoContainerRef = useRef<HTMLDivElement>(null);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // En móvil, cerrar sidebar por defecto
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (demoId) {
      fetchDemo();
    }
  }, [demoId]);

  const fetchDemo = async () => {
    try {
      const res = await fetch(`/api/demos/${demoId}`);
      if (!res.ok) throw new Error(t("demoView.notFound"));
      const data = await res.json();
      
      // Asegurar que credentialsJson sea un objeto si existe
      let credentialsJson = data.credentialsJson;
      if (credentialsJson && typeof credentialsJson === "string") {
        // Si viene como string, intentar parsearlo (aunque debería venir desencriptado)
        try {
          credentialsJson = JSON.parse(credentialsJson);
        } catch (e) {
          // Si no se puede parsear, dejarlo como está
          logger.warn("Could not parse credentialsJson", e as any);
        }
      }
      
      setDemo({
        ...data,
        credentialsJson,
        hasResponsive: Boolean(data.hasResponsive),
        requiresCredentials: Boolean(data.requiresCredentials),
      });
    } catch (error) {
      logger.error("Error fetching demo", error);
    } finally {
      setLoading(false);
    }
  };

  const copyCredential = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToDemo = () => {
    demoContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-charcoal-950 flex overflow-hidden">
        {/* Skeleton Sidebar */}
        <div className="w-[360px] bg-white dark:bg-charcoal-900 border-r border-gray-200 dark:border-charcoal-700 p-6 space-y-6">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-charcoal-800 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-charcoal-800 rounded animate-pulse w-3/4" />
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-charcoal-800 rounded animate-pulse w-1/2" />
            <div className="h-20 bg-gray-200 dark:bg-charcoal-800 rounded animate-pulse" />
          </div>
        </div>
        {/* Skeleton Content */}
        <div className="flex-1 bg-gray-50 dark:bg-charcoal-950 p-6">
          <div className="h-full bg-white dark:bg-charcoal-900 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!demo) {
    return (
      <div className="min-h-screen bg-white dark:bg-charcoal-950 flex items-center justify-center">
        <div className="text-gray-600 dark:text-slate-400">{t("demoView.notFound")}</div>
      </div>
    );
  }

  const demoUrl = demo.htmlContent ? undefined : demo.url;
  const sidebarWidth = 360;

  // Contenido de instrucciones (reutilizable)
  const InstructionsContent = () => (
    <>
      {/* Credenciales */}
      {demo.requiresCredentials && demo.credentialsJson && typeof demo.credentialsJson === "object" && (demo.credentialsJson.username || demo.credentialsJson.password) && (
        <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-corporate-500 dark:text-corporate-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                {t("demoView.credentials")}
              </h3>
            </div>
            <button
              onClick={() => {
                const text = `${t("demoView.username")}: ${demo.credentialsJson?.username}\n${t("common.password")}: ${demo.credentialsJson?.password}`;
                copyCredential(text);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors text-gray-500 dark:text-slate-400"
              title={t("demoView.copyCredentials")}
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1.5">
                {t("demoView.username")}
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-lg text-sm text-gray-900 dark:text-slate-100 font-mono border border-gray-200 dark:border-charcoal-700">
                  {demo.credentialsJson.username}
                </code>
                <button
                  onClick={() => copyCredential(demo.credentialsJson!.username || '')}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors text-gray-500 dark:text-slate-400"
                  title={t("demoView.copyUser")}
                  aria-label={t("demoView.copyUser")}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1.5">
                {t("common.password")}
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-lg text-sm text-gray-900 dark:text-slate-100 font-mono border border-gray-200 dark:border-charcoal-700">
                  {demo.credentialsJson.password}
                </code>
                <button
                  onClick={() => copyCredential(demo.credentialsJson!.password || '')}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors text-gray-500 dark:text-slate-400"
                  title={t("demoView.copyPassword")}
                  aria-label={t("demoView.copyPassword")}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Instrucciones */}
      {((language === "es" && demo.instructionsEs) || (language === "en" && demo.instructionsEn) || demo.instructions) && (
        <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-700">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-corporate-500 dark:text-corporate-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              {t("demoView.instructions")}
            </h3>
          </div>
          <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {language === "es"
              ? (demo.instructionsEs || demo.instructions)
              : (demo.instructionsEn || demo.instructionsEs || demo.instructions)}
          </p>
        </Card>
      )}

      {/* Información del Producto */}
      <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-700">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-corporate-500 dark:text-corporate-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
            {t("demoView.product")}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {demo.product.logo && (
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-charcoal-700">
              <CldImageWrapper
                src={demo.product.logo}
                alt={demo.product.name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          )}
          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
            {demo.product.name}
          </span>
        </div>
      </Card>

      {/* Botón de Feedback */}
      <div className="pt-2">
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowFeedbackModal(true)}
          leftIcon={<MessageSquare className="w-4 h-4" />}
          className="w-full"
        >
          {t("demoView.completeSurvey")}
        </Button>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen bg-white dark:bg-charcoal-950 ${isMobile ? "flex flex-col" : "flex overflow-hidden"}`}>
      {/* Desktop: Sidebar lateral */}
      {!isMobile && (
        <motion.div
          initial={false}
          animate={{ 
            width: sidebarOpen ? sidebarWidth : 0,
            opacity: sidebarOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-white dark:bg-charcoal-900 border-r border-gray-200 dark:border-charcoal-700 flex flex-col fixed left-0 top-0 bottom-0 z-30 overflow-hidden"
        >
          <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header del Sidebar */}
            <div className="p-6 border-b border-gray-200 dark:border-charcoal-700 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => router.push("/demos")}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-charcoal-800 hover:bg-gray-200 dark:hover:bg-charcoal-700 transition-colors text-gray-700 dark:text-slate-300 text-sm font-medium group"
                  title={t("demoView.returnToDemos")}
                  aria-label={t("demoView.returnToDemos")}
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  {t("common.back")}
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors text-gray-500 dark:text-slate-400"
                  title={t("demoView.hideSidebar")}
                  aria-label={t("demoView.hideSidebar")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                  {demo.title}
                </h1>
                {demo.subtitle && (
                  <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                    {demo.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Contenido del Sidebar - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <InstructionsContent />
            </div>
          </div>
        </motion.div>
      )}

      {/* Desktop: Toggle Sidebar Button */}
      {!isMobile && (
        <AnimatePresence>
          {!sidebarOpen && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => setSidebarOpen(true)}
              className="fixed left-4 top-4 z-40 p-3 bg-white dark:bg-charcoal-900 rounded-lg border border-gray-300 dark:border-charcoal-700 hover:bg-gray-50 dark:hover:bg-charcoal-800 transition-all shadow-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
              title={t("demoView.showInstructions")}
              aria-label={t("demoView.showInstructions")}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Mobile: Instrucciones arriba - PRIMERO en móvil */}
      {isMobile && (
        <div className="w-full bg-white dark:bg-charcoal-900 p-4 sm:p-6 space-y-5">
          {/* Header móvil */}
          <div className="space-y-2">
            <button
              onClick={() => router.push("/demos")}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("common.back")}
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              {demo.title}
            </h1>
            {demo.subtitle && (
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                {demo.subtitle}
              </p>
            )}
          </div>

          <InstructionsContent />

          {/* Botón para ir a la demo */}
          <div className="pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={scrollToDemo}
              rightIcon={<ChevronDown className="w-5 h-5" />}
              className="w-full"
            >
              Ver Demo
            </Button>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div
        className={`${isMobile ? "w-full flex-1 flex flex-col" : "flex-1 flex flex-col transition-all duration-300"}`}
        style={{ 
          marginLeft: !isMobile && sidebarOpen ? `${sidebarWidth}px` : '0',
        }}
      >
        {/* Barra de herramientas - Solo en Desktop */}
        {!isMobile && (
          <div className="bg-white dark:bg-charcoal-900 border-b border-gray-200 dark:border-charcoal-700 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Toggle Responsive */}
              {demo.hasResponsive && (
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-charcoal-800 rounded-lg p-1 border border-gray-200 dark:border-charcoal-700">
                  <button
                    onClick={() => setViewMode("desktop")}
                    className={`px-2 sm:px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium ${
                      viewMode === "desktop"
                        ? "bg-white dark:bg-charcoal-700 text-corporate-600 dark:text-corporate-400 shadow-sm"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                    }`}
                    aria-pressed={viewMode === "desktop"}
                    aria-label="Vista de escritorio"
                  >
                    <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t("demoView.desktop")}</span>
                  </button>
                  <button
                    onClick={() => setViewMode("mobile")}
                    className={`px-2 sm:px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium ${
                      viewMode === "mobile"
                        ? "bg-white dark:bg-charcoal-700 text-corporate-600 dark:text-corporate-400 shadow-sm"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                    }`}
                    aria-pressed={viewMode === "mobile"}
                    aria-label="Vista móvil"
                  >
                    <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t("demoView.mobile")}</span>
                  </button>
                </div>
              )}

              {/* Link externo si hay URL */}
              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 sm:px-3 py-1.5 bg-gray-100 dark:bg-charcoal-800 rounded-lg border border-gray-200 dark:border-charcoal-700 hover:bg-gray-200 dark:hover:bg-charcoal-700 transition-colors text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t("demoView.openNewTabShort")}</span>
                </a>
              )}
            </div>

            <button
              onClick={() => router.push("/demos")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 flex-shrink-0"
              title={t("demoView.closeAndReturn")}
              aria-label={t("demoView.closeAndReturn")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Contenedor del Demo */}
        <div 
          ref={demoContainerRef}
          className={`bg-gray-50 dark:bg-charcoal-950 ${isMobile ? "w-full flex-1 min-h-screen" : "flex-1 overflow-auto p-2 sm:p-4 lg:p-6"}`}
        >
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`mx-auto bg-white dark:bg-gray-900 overflow-hidden transition-all duration-300 ${
              isMobile 
                ? "w-full h-screen rounded-none shadow-none border-0" 
                : `rounded-xl shadow-2xl border border-gray-200 dark:border-charcoal-800 ${viewMode === "mobile" && !isMobile ? "max-w-sm" : "w-full"}`
            }`}
            style={{
              height: isMobile 
                ? "100vh" 
                : viewMode === "mobile" && !isMobile
                  ? "800px" 
                  : "calc(100vh - 140px)",
            }}
          >
            {demo.htmlContent ? (
              <iframe
                srcDoc={demo.htmlContent}
                className="w-full h-full border-0"
                title={demo.title}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                style={{
                  display: "block",
                }}
              />
            ) : demoUrl ? (
              <iframe
                src={demoUrl}
                className="w-full h-full border-0"
                title={demo.title}
                allow="fullscreen"
                style={{
                  display: "block",
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-slate-400 p-4">
                <p className="text-sm sm:text-base">{t("demoView.noContent")}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal de Feedback */}
      {showFeedbackModal && session?.user?.id && (
        <FeedbackModal
          demoId={parseInt(demoId)}
          userId={parseInt(session.user.id)}
          onClose={() => setShowFeedbackModal(false)}
          onSuccess={() => {
            setShowFeedbackModal(false);
          }}
        />
      )}
    </div>
  );
}
