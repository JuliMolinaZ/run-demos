"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
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
  ArrowLeft,
  Sparkles,
  Box
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
  /** Alternar entre ver la demo, TITAN IA, Comunicaciones o Modelo 3D */
  const [iframeSource, setIframeSource] = useState<"demo" | "titan" | "comunicaciones" | "modelo3d">("demo");

  /** Demo Apoloware/DISAL WMS: URLs desde env (producción) o localhost por defecto */
  const APOLOWARE_IA_URL = process.env.NEXT_PUBLIC_TITAN_IA_URL || "http://localhost:5173/";
  const COMUNICACIONES_URL = process.env.NEXT_PUBLIC_COMUNICACIONES_URL || "http://localhost:3721/";
  const MODELO_3D_URL = process.env.NEXT_PUBLIC_MODELO_3D_URL || "http://localhost:8081/";
  const name = demo?.product?.name?.toLowerCase() ?? "";
  const title = demo?.title?.toLowerCase() ?? "";
  const isApolowareWms =
    name.includes("apoloware") ||
    title.includes("apoloware") ||
    name.includes("aploware") ||
    title.includes("aploware") ||
    title.includes("wms") ||
    (name.includes("disal") && (title.includes("wms") || title.includes("apolo")));

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

  useEffect(() => {
    setIframeSource("demo");
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
      <div className="min-h-screen bg-gray-50/80 dark:bg-charcoal-950 flex overflow-hidden">
        {/* Skeleton Sidebar */}
        <div className="w-[360px] bg-white dark:bg-charcoal-900/95 border-r border-gray-200/80 dark:border-charcoal-700/80 shadow-sm p-6 space-y-5">
          <div className="p-5 border-b border-gray-100 dark:border-charcoal-700/60 space-y-4">
            <div className="h-10 bg-gray-200/80 dark:bg-charcoal-800 rounded-xl animate-pulse w-24" />
            <div className="h-6 bg-gray-200/80 dark:bg-charcoal-800 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200/60 dark:bg-charcoal-800/80 rounded animate-pulse w-1/2" />
          </div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200/60 dark:bg-charcoal-800/80 rounded-2xl animate-pulse" />
            <div className="h-20 bg-gray-200/60 dark:bg-charcoal-800/80 rounded-2xl animate-pulse" />
          </div>
        </div>
        {/* Skeleton Content */}
        <div className="flex-1 demo-viewer-bg p-6">
          <div className="h-full max-w-4xl mx-auto bg-white dark:bg-charcoal-900 rounded-2xl animate-pulse shadow-demo border border-gray-200/90 dark:border-charcoal-700/80" />
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
        <Card variant="glassPremium" padding="md" className="border border-gray-200/90 dark:border-charcoal-700/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-corporate-500/10 dark:bg-corporate-400/10">
                <Lock className="w-4 h-4 text-corporate-600 dark:text-corporate-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 tracking-tight">
                {t("demoView.credentials")}
              </h3>
            </div>
            <button
              onClick={() => {
                const text = `${t("demoView.username")}: ${demo.credentialsJson?.username}\n${t("common.password")}: ${demo.credentialsJson?.password}`;
                copyCredential(text);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
              title={t("demoView.copyCredentials")}
              aria-label={t("demoView.copyCredentials")}
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
              <label className="text-xs font-medium text-gray-500 dark:text-slate-500 block mb-1.5 uppercase tracking-wider">
                {t("demoView.username")}
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-charcoal-800/80 rounded-xl text-sm text-gray-900 dark:text-slate-100 font-mono border border-gray-200/80 dark:border-charcoal-700/80">
                  {demo.credentialsJson.username}
                </code>
                <button
                  onClick={() => copyCredential(demo.credentialsJson!.username || '')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors text-gray-500 dark:text-slate-400"
                  title={t("demoView.copyUser")}
                  aria-label={t("demoView.copyUser")}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-slate-500 block mb-1.5 uppercase tracking-wider">
                {t("common.password")}
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-charcoal-800/80 rounded-xl text-sm text-gray-900 dark:text-slate-100 font-mono border border-gray-200/80 dark:border-charcoal-700/80">
                  {demo.credentialsJson.password}
                </code>
                <button
                  onClick={() => copyCredential(demo.credentialsJson!.password || '')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors text-gray-500 dark:text-slate-400"
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
        <Card variant="glassPremium" padding="md" className="border border-gray-200/90 dark:border-charcoal-700/80 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-corporate-500/10 dark:bg-corporate-400/10">
              <FileText className="w-4 h-4 text-corporate-600 dark:text-corporate-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 tracking-tight">
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
      <Card variant="glassPremium" padding="md" className="border border-gray-200/90 dark:border-charcoal-700/80 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-corporate-500/10 dark:bg-corporate-400/10">
            <Package className="w-4 h-4 text-corporate-600 dark:text-corporate-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 tracking-tight">
            {t("demoView.product")}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {demo.product.logo && (
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200/80 dark:border-charcoal-700/80 shadow-sm">
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
      <div className="pt-1">
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowFeedbackModal(true)}
          leftIcon={<MessageSquare className="w-4 h-4" />}
          className="w-full rounded-xl font-medium shadow-sm"
        >
          {t("demoView.completeSurvey")}
        </Button>
      </div>
    </>
  );

  return (
    <div className={`bg-gray-50/80 dark:bg-charcoal-950 -mt-20 sm:-mt-24 ${isMobile ? "min-h-[100vh] flex flex-col" : "h-[100vh] flex overflow-hidden"}`}>
      {/* Desktop: Sidebar lateral */}
      {!isMobile && (
        <motion.div
          initial={false}
          animate={{ 
            width: sidebarOpen ? sidebarWidth : 0,
            opacity: sidebarOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-white dark:bg-charcoal-900/95 border-r border-gray-200/80 dark:border-charcoal-700/80 flex flex-col fixed left-0 top-0 bottom-0 z-30 overflow-hidden shadow-sm"
        >
          <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header del Sidebar */}
            <div className="p-6 pb-5 border-b border-gray-100 dark:border-charcoal-700/60 flex-shrink-0 bg-gray-50/50 dark:bg-charcoal-900/50">
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={() => router.push("/demos")}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 hover:border-gray-300 dark:hover:border-charcoal-600 hover:shadow-sm transition-all text-gray-700 dark:text-slate-300 text-sm font-medium group"
                  title={t("demoView.returnToDemos")}
                  aria-label={t("demoView.returnToDemos")}
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-gray-500 dark:text-slate-400" />
                  {t("common.back")}
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                  title={t("demoView.hideSidebar")}
                  aria-label={t("demoView.hideSidebar")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-1.5">
                <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">
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
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <InstructionsContent />
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile: Instrucciones arriba - PRIMERO en móvil */}
      {isMobile && (
        <div className="w-full bg-white dark:bg-charcoal-900/95 border-b border-gray-200/80 dark:border-charcoal-700/80 p-4 sm:p-6 space-y-5 shadow-sm">
          {/* Header móvil */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => router.push("/demos")}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.back")}
              </button>
              {isApolowareWms && (
                <div className="flex items-center gap-2">
                  <a
                    href={APOLOWARE_IA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-corporate-500/10 dark:bg-corporate-400/10 text-corporate-600 dark:text-corporate-400 text-sm font-semibold hover:bg-corporate-500/20 dark:hover:bg-corporate-400/20 transition-colors"
                    title="Abrir TITAN IA (localhost:5173)"
                    aria-label="TITAN IA"
                  >
                    <Sparkles className="w-4 h-4" />
                    TITAN IA
                  </a>
                  <a
                    href={COMUNICACIONES_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-corporate-500/10 dark:bg-corporate-400/10 text-corporate-600 dark:text-corporate-400 text-sm font-semibold hover:bg-corporate-500/20 dark:hover:bg-corporate-400/20 transition-colors"
                    title="Abrir Módulo de comunicaciones (localhost:3721)"
                    aria-label="Comunicaciones"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Comunicaciones
                  </a>
                  <a
                    href={MODELO_3D_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-corporate-500/10 dark:bg-corporate-400/10 text-corporate-600 dark:text-corporate-400 text-sm font-semibold hover:bg-corporate-500/20 dark:hover:bg-corporate-400/20 transition-colors"
                    title="Abrir Modelo 3D (localhost:8081)"
                    aria-label="Modelo 3D"
                  >
                    <Box className="w-4 h-4" />
                    Modelo 3D
                  </a>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">
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
              className="w-full rounded-xl font-medium shadow-sm"
            >
              Ver Demo
            </Button>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div
        className={`${isMobile ? "w-full flex-1 flex flex-col min-h-0" : "flex-1 flex flex-col min-h-0 transition-all duration-300 overflow-hidden"}`}
        style={{ 
          marginLeft: !isMobile && sidebarOpen ? `${sidebarWidth}px` : '0',
        }}
      >
        {/* Barra de herramientas compacta: máximo espacio para la demo */}
        {!isMobile && (
          <div className="bg-white dark:bg-charcoal-900 border-b border-gray-200 dark:border-charcoal-700 flex-shrink-0 h-10">
            <div className="px-2 h-full flex items-center gap-0">
              <div className="w-[64px] flex items-center justify-start gap-0.5 flex-shrink-0">
                {!sidebarOpen && (
                  <>
                    <button
                      onClick={() => router.push("/demos")}
                      className="p-1.5 rounded-md text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors"
                      title={t("demoView.returnToDemos")}
                      aria-label={t("demoView.returnToDemos")}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="p-1.5 rounded-md text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors"
                      title={t("demoView.showInstructions")}
                      aria-label={t("demoView.showInstructions")}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              <div className="w-px h-5 bg-gray-200 dark:bg-charcoal-600 flex-shrink-0" aria-hidden />
              <div className="flex-1 min-w-0" />
              <div className="flex items-center gap-1 flex-shrink-0">
                {isApolowareWms && (
                  <div className="inline-flex rounded-md bg-gray-100 dark:bg-charcoal-800 p-0.5 border border-gray-200/80 dark:border-charcoal-600">
                    <button
                      type="button"
                      onClick={() => setIframeSource("demo")}
                      className={`min-w-[7.5rem] px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        iframeSource === "demo"
                          ? "bg-white dark:bg-charcoal-700 text-corporate-600 dark:text-corporate-400 shadow-sm"
                          : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                      }`}
                      title="Ver esta demo"
                    >
                      Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => setIframeSource("titan")}
                      className={`min-w-[7.5rem] px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        iframeSource === "titan"
                          ? "bg-white dark:bg-charcoal-700 text-corporate-600 dark:text-corporate-400 shadow-sm"
                          : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                      }`}
                      title="Ver TITAN IA (localhost:5173)"
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      TITAN IA
                    </button>
                    <button
                      type="button"
                      onClick={() => setIframeSource("comunicaciones")}
                      className={`min-w-[7.5rem] px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        iframeSource === "comunicaciones"
                          ? "bg-white dark:bg-charcoal-700 text-corporate-600 dark:text-corporate-400 shadow-sm"
                          : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                      }`}
                      title="Ver Módulo de comunicaciones (localhost:3721)"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      Comunicaciones
                    </button>
                    <button
                      type="button"
                      onClick={() => setIframeSource("modelo3d")}
                      className={`min-w-[7.5rem] px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        iframeSource === "modelo3d"
                          ? "bg-white dark:bg-charcoal-700 text-corporate-600 dark:text-corporate-400 shadow-sm"
                          : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                      }`}
                      title="Ver Modelo 3D (localhost:8081)"
                    >
                      <Box className="w-3.5 h-3.5 shrink-0" />
                      Modelo 3D
                    </button>
                  </div>
                )}
                {demo.hasResponsive && (
                  <div className="inline-flex rounded-md bg-gray-100 dark:bg-charcoal-800 p-0.5 border border-gray-200/80 dark:border-charcoal-600">
                    <button
                      onClick={() => setViewMode("desktop")}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === "desktop"
                          ? "bg-white dark:bg-charcoal-700 text-corporate-600 dark:text-corporate-400 shadow-sm"
                          : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                      }`}
                      title={t("demoView.desktop")}
                      aria-label={t("demoView.desktop")}
                      aria-pressed={viewMode === "desktop"}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("mobile")}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === "mobile"
                          ? "bg-white dark:bg-charcoal-700 text-corporate-600 dark:text-corporate-400 shadow-sm"
                          : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                      }`}
                      title={t("demoView.mobile")}
                      aria-label={t("demoView.mobile")}
                      aria-pressed={viewMode === "mobile"}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {demoUrl && (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors"
                    title={t("demoView.openNewTabShort")}
                    aria-label={t("demoView.openNewTabShort")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => router.push("/demos")}
                  className="p-1.5 rounded-md text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors"
                  title={t("demoView.closeAndReturn")}
                  aria-label={t("demoView.closeAndReturn")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenedor del Demo: mínimo margen, casi pantalla completa */}
        <div 
          ref={demoContainerRef}
          className={`demo-viewer-bg flex flex-col ${isMobile ? "w-full flex-1 min-h-0" : "flex-1 min-h-0 overflow-hidden p-1 sm:p-2"}`}
        >
          <div className="flex-1 min-h-0 overflow-auto">
            <motion.div
              key={`${viewMode}-${iframeSource}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`mx-auto bg-white dark:bg-charcoal-900 overflow-hidden transition-all duration-300 ${
                isMobile 
                  ? "w-full h-screen rounded-none shadow-none border-0" 
                  : `rounded-lg shadow-sm border border-gray-200/80 dark:border-charcoal-700/80 ${viewMode === "mobile" && !isMobile ? "max-w-sm" : "w-full"}`
              }`}
              style={{
                height: isMobile
                  ? "100vh"
                  : viewMode === "mobile" && !isMobile
                    ? "800px"
                    : "calc(100vh - 40px)",
              } as React.CSSProperties}
            >
              {isApolowareWms && iframeSource === "titan" ? (
                <iframe
                  src={APOLOWARE_IA_URL}
                  className="w-full h-full border-0"
                  title="TITAN IA"
                  allow="fullscreen"
                  style={{ display: "block" }}
                />
              ) : isApolowareWms && iframeSource === "comunicaciones" ? (
                <iframe
                  src={COMUNICACIONES_URL}
                  className="w-full h-full border-0"
                  title="Módulo de comunicaciones"
                  allow="fullscreen"
                  style={{ display: "block" }}
                />
              ) : isApolowareWms && iframeSource === "modelo3d" ? (
                <iframe
                  src={MODELO_3D_URL}
                  className="w-full h-full border-0"
                  title="Modelo 3D"
                  allow="fullscreen"
                  style={{ display: "block" }}
                />
              ) : demo.htmlContent ? (
                <iframe
                  src={`/api/demos/${demo.id}/render`}
                  className="w-full h-full border-0"
                  title={demo.title}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  style={{ display: "block" }}
                />
              ) : demoUrl ? (
                <iframe
                  src={demoUrl}
                  className="w-full h-full border-0"
                  title={demo.title}
                  allow="fullscreen"
                  style={{ display: "block" }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-slate-400 p-4">
                  <p className="text-sm sm:text-base">{t("demoView.noContent")}</p>
                </div>
              )}
            </motion.div>
          </div>
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
