"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Lock,
  FileText,
  Tag,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Share2,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CldImageWrapper } from "@/components/ui/CldImageWrapper";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { VideoUpload } from "@/components/ui/VideoUpload";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { logger } from "@/lib/utils/logger-client";

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
  hasResponsive?: boolean | number;
  requiresCredentials?: boolean | number;
  status: "draft" | "active" | "archived";
  product: {
    id: number;
    name: string;
    logo?: string;
    corporateColor?: string;
  };
}

interface MediaItem {
  id: number;
  type: "image" | "video";
  url: string;
  title?: string;
  description?: string;
  createdAt: string;
}

interface ViewDemoModalProps {
  demo: Demo;
  onClose: () => void;
}

export function ViewDemoModal({ demo, onClose }: ViewDemoModalProps) {
  const { data: session } = useSession();
  const { t, language } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [showAddImage, setShowAddImage] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<MediaItem | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const canEdit = session?.user?.role !== "buyer";
  const isBuyer = session?.user?.role === "buyer";
  const hasCredentials = demo.credentialsJson && (demo.credentialsJson.username || demo.credentialsJson.password);
  const hasResponsive = Boolean(demo.hasResponsive);

  const getShareLink = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const userId = session?.user?.id;
    const shareUrl = `${baseUrl}/demo/${demo.id}/public${userId ? `?sharedBy=${userId}` : ""}`;
    return shareUrl;
  };

  const copyShareLink = () => {
    const link = getShareLink();
    navigator.clipboard.writeText(link);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
  };

  // Debug log (solo en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      logger.debug("Demo hasResponsive", { hasResponsive: demo.hasResponsive, boolean: hasResponsive });
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [demo.id]);

  const fetchMedia = async () => {
    try {
      const res = await fetch(`/api/demos/${demo.id}/media`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data);
      }
    } catch (error) {
      logger.error("Error fetching media", error);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleAddImage = async (url: string | null) => {
    if (!url) {
      setShowAddImage(false);
      return;
    }

    try {
      const res = await fetch(`/api/demos/${demo.id}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "image", url }),
      });

      if (res.ok) {
        setShowAddImage(false);
        fetchMedia();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al agregar imagen");
      }
    } catch (error) {
      logger.error("Error adding image", error);
    }
  };

  const handleAddVideo = async (url: string | null) => {
    if (!url) {
      setShowAddVideo(false);
      return;
    }

    try {
      const res = await fetch(`/api/demos/${demo.id}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "video", url }),
      });

      if (res.ok) {
        setShowAddVideo(false);
        fetchMedia();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al agregar video");
      }
    } catch (error) {
      logger.error("Error adding video", error);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm(t("demoView.deleteFile"))) return;

    try {
      const res = await fetch(`/api/demos/${demo.id}/media/${mediaId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchMedia();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al eliminar media");
      }
    } catch (error) {
      logger.error("Error deleting media", error);
    }
  };

  const copyCredential = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-charcoal-950">
      {/* Close Button - Top Right */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white dark:bg-charcoal-900 border border-gray-300 dark:border-charcoal-700 hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors shadow-lg text-gray-700 dark:text-slate-300"
        title={t("common.close")}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Back Button - Top Left */}
      <button
        onClick={onClose}
        className="fixed top-4 left-4 z-50 px-4 py-2 rounded-lg bg-white dark:bg-charcoal-900 border border-gray-300 dark:border-charcoal-700 hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors shadow-lg text-gray-700 dark:text-slate-300 flex items-center gap-2 font-medium"
        title={t("common.back")}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t("common.back")}
      </button>

      <div className="h-screen flex">
        {/* Sidebar - Panel Izquierdo */}
        <motion.div
          initial={false}
          animate={{ width: sidebarCollapsed ? 0 : 320 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-gray-50 dark:bg-charcoal-900 border-r border-gray-200 dark:border-charcoal-800 overflow-y-auto overflow-x-hidden"
        >
          <div className="w-80 p-6 space-y-6">
            {/* Título y Subtítulo */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                {demo.product.logo && (
                  <div className="relative w-8 h-8">
                    <CldImageWrapper
                      src={demo.product.logo}
                      alt={demo.product.name}
                      width={32}
                      height={32}
                      className="rounded"
                    />
                  </div>
                )}
                <Badge variant="corporate" size="sm">
                  {demo.product.name}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {demo.title}
              </h2>
              {demo.subtitle && (
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {demo.subtitle}
                </p>
              )}
            </div>

            {/* Credenciales */}
            {hasCredentials && (
              <Card variant="glassPremium" padding="md">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4 text-corporate-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {t("demoView.credentials")}
                  </h3>
                </div>
                <div className="space-y-3">
                  {demo.credentialsJson?.username && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">
                        {t("demoView.username")}
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-charcoal-800 rounded-lg text-sm text-gray-900 dark:text-slate-100 font-mono">
                          {demo.credentialsJson.username}
                        </code>
                        <button
                          onClick={() => copyCredential(demo.credentialsJson.username)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal-800 rounded-lg transition-colors text-gray-600 dark:text-slate-400"
                          title={t("demoView.copyUser")}
                        >
                          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                  {demo.credentialsJson?.password && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">
                        {t("common.password")}
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-charcoal-800 rounded-lg text-sm text-gray-900 dark:text-slate-100 font-mono">
                          {demo.credentialsJson.password}
                        </code>
                        <button
                          onClick={() => copyCredential(demo.credentialsJson.password)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal-800 rounded-lg transition-colors text-gray-600 dark:text-slate-400"
                          title={t("demoView.copyPassword")}
                        >
                          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Instrucciones */}
            {((language === "es" && demo.instructionsEs) || (language === "en" && demo.instructionsEn) || demo.instructions) && (
              <Card variant="glassPremium" padding="md">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-corporate-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {t("demoView.instructions")}
                  </h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {language === "es"
                    ? (demo.instructionsEs || demo.instructions)
                    : (demo.instructionsEn || demo.instructionsEs || demo.instructions)}
                </p>
              </Card>
            )}

            {/* Galería de Imágenes y Videos */}
            <Card variant="glassPremium" padding="md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-corporate-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {t("demoView.supportMaterial")}
                  </h3>
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAddImage(true);
                        setShowAddVideo(false);
                      }}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-charcoal-800 rounded transition-colors text-gray-600 dark:text-slate-400"
                      title={t("demoView.addImage")}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {showAddImage && (
                <div className="mb-4 p-3 bg-gray-100 dark:bg-charcoal-800 rounded-lg">
                  <ImageUpload
                    value=""
                    onChange={handleAddImage}
                    label={t("demoView.uploadImage")}
                  />
                  <button
                    onClick={() => setShowAddImage(false)}
                    className="mt-2 w-full px-3 py-2 text-sm bg-white dark:bg-charcoal-900 rounded-lg hover:bg-gray-50 dark:hover:bg-charcoal-800 transition-colors text-gray-700 dark:text-slate-300"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              )}

              {showAddVideo && (
                <div className="mb-4 p-3 bg-gray-100 dark:bg-charcoal-800 rounded-lg">
                  <VideoUpload
                    value=""
                    onChange={handleAddVideo}
                    label={t("demoView.uploadVideo")}
                  />
                  <button
                    onClick={() => setShowAddVideo(false)}
                    className="mt-2 w-full px-3 py-2 text-sm bg-white dark:bg-charcoal-900 rounded-lg hover:bg-gray-50 dark:hover:bg-charcoal-800 transition-colors text-gray-700 dark:text-slate-300"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              )}

              {loadingMedia ? (
                <p className="text-sm text-gray-600 dark:text-slate-400 text-center py-4">
                  {t("common.loading")}
                </p>
              ) : media.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-slate-500 text-center py-4">
                  {canEdit ? t("demoView.addMaterial") : t("demoView.noMaterial")}
                </p>
              ) : (
                <div className="space-y-2">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className="relative group bg-gray-100 dark:bg-charcoal-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-corporate-500 transition-all"
                      onClick={() => setLightboxMedia(item)}
                    >
                      {item.type === "image" ? (
                        <div className="relative w-full h-32">
                          <CldImageWrapper
                            src={item.url}
                            alt={item.title || t("demoView.image")}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full h-32 bg-charcoal-950 flex items-center justify-center">
                          <VideoIcon className="w-12 h-12 text-slate-400" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedia(item.id);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-600 rounded transition-colors text-white opacity-0 group-hover:opacity-100 z-10"
                          title={t("demoView.delete")}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Acciones */}
            <div className="space-y-2">
              {/* Botón de Feedback para TODOS los usuarios */}
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                leftIcon={<MessageSquare className="w-4 h-4" />}
                onClick={() => setShowFeedbackModal(true)}
              >
                {t("demoView.completeSurvey")}
              </Button>

              {demo.url && (
                <a
                  href={demo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" size="sm" className="w-full" leftIcon={<ExternalLink className="w-4 h-4" />}>
                    {t("demoView.openNewTab")}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute left-80 top-1/2 -translate-y-1/2 z-40 w-8 h-16 bg-white dark:bg-charcoal-900 border border-gray-300 dark:border-charcoal-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-all shadow-lg flex items-center justify-center text-gray-600 dark:text-slate-400"
          style={{ left: sidebarCollapsed ? '0px' : '320px' }}
          title={sidebarCollapsed ? t("demoView.expandInstructions") : t("demoView.hideInstructions")}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>

        {/* Panel Principal - Demo */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-charcoal-950">
          {/* Controles de Vista */}
          <div className="bg-white dark:bg-charcoal-900 border-b border-gray-200 dark:border-charcoal-800 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  demo.status === "active"
                    ? "success"
                    : demo.status === "draft"
                    ? "warning"
                    : "default"
                }
                size="sm"
              >
                {demo.status === "active" ? t("demos.status.active") : demo.status === "draft" ? t("demos.status.draft") : t("demos.status.archived")}
              </Badge>
              {hasResponsive && (
                <>
                  <div className="w-px h-4 bg-gray-300 dark:bg-charcoal-700" />
                  <Button
                    variant={viewMode === "desktop" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("desktop")}
                    leftIcon={<Monitor className="w-4 h-4" />}
                  >
                    {t("demoView.desktop")}
                  </Button>
                  <Button
                    variant={viewMode === "mobile" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("mobile")}
                    leftIcon={<Smartphone className="w-4 h-4" />}
                  >
                    {t("demoView.mobile")}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Demo Viewer */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            {demo.htmlContent ? (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`bg-white rounded-lg shadow-2xl overflow-hidden ${
                  viewMode === "mobile" ? "w-[375px] h-[667px]" : "w-full h-full"
                }`}
              >
                <iframe
                  srcDoc={demo.htmlContent}
                  className="w-full h-full border-0"
                  title={demo.title}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                />
              </motion.div>
            ) : demo.url ? (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`bg-white rounded-lg shadow-2xl overflow-hidden ${
                  viewMode === "mobile" ? "w-[375px] h-[667px]" : "w-full h-full"
                }`}
              >
                <iframe
                  src={demo.url}
                  className="w-full h-full"
                  title={demo.title}
                  allow="fullscreen"
                />
              </motion.div>
            ) : (
              <div className="text-center text-gray-500 dark:text-slate-500 py-12">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t("demoView.noContent")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setLightboxMedia(null)}
          >
            <button
              onClick={() => setLightboxMedia(null)}
              className="absolute top-6 right-6 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              title={t("common.close")}
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxMedia.type === "image" ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <CldImageWrapper
                    src={lightboxMedia.url}
                    alt={lightboxMedia.title || t("demoView.image")}
                    width={1200}
                    height={800}
                    className="object-contain max-h-[85vh] rounded-lg shadow-2xl"
                  />
                </div>
              ) : (
                <div className="relative w-full rounded-lg overflow-hidden shadow-2xl bg-black">
                  <video
                    src={lightboxMedia.url}
                    controls
                    autoPlay
                    className="w-full max-h-[85vh]"
                  />
                </div>
              )}

              {lightboxMedia.title && (
                <div className="mt-4 text-center">
                  <p className="text-lg font-semibold text-white">
                    {lightboxMedia.title}
                  </p>
                  {lightboxMedia.description && (
                    <p className="text-sm text-slate-300 mt-1">
                      {lightboxMedia.description}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Feedback para Buyers */}
      {showFeedbackModal && session?.user?.id && (
        <FeedbackModal
          demoId={demo.id}
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
