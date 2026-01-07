"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Loader2,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { wrapHTMLContent } from "@/lib/utils/html-wrapper";

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

export default function PublicDemoPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { t } = useTranslation();
  const demoId = params?.id as string;
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const sharedByUserId = searchParams.get("sharedBy");

  const [demo, setDemo] = useState<Demo | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"form" | "demo" | "feedback">("form");
  const [leadCreated, setLeadCreated] = useState(false);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Si el usuario está autenticado (es buyer), redirigir a la vista normal
  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user) {
      // Si es buyer, redirigir a la vista normal de demos
      if (session.user.role === "buyer") {
        router.push(`/demos/${demoId}/view`);
        return;
      }
      // Si es otro tipo de usuario autenticado, también redirigir (no necesitan formulario)
      router.push(`/demos/${demoId}/view`);
    }
  }, [sessionStatus, session, demoId, router]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    revenueRange: "",
    employeeCount: "",
    location: "",
  });

  useEffect(() => {
    if (demoId) {
      fetchDemo();
    }
  }, [demoId]);

  const fetchDemo = async () => {
    try {
      const res = await fetch(`/api/demos/${demoId}/public`);
      if (!res.ok) throw new Error(t("demoView.notFound"));
      const data = await res.json();
      setDemo(data);
    } catch (error) {
      console.error("Error fetching demo:", error);
      setError(t("demoView.notFoundOrNotAvailable"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Validar campos requeridos
      if (!formData.name.trim() || !formData.email.trim()) {
        setError(t("demoView.nameAndEmailRequired"));
        setSubmitting(false);
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError(t("demoView.validEmailRequired"));
        setSubmitting(false);
        return;
      }

      // Crear lead
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          company: formData.company.trim() || null,
          revenueRange: formData.revenueRange || null,
          employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : null,
          location: formData.location.trim() || null,
          sharedByUserId: sharedByUserId ? parseInt(sharedByUserId) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear lead");
      }

      const newLead = await res.json();
      setLeadId(newLead.id);
      setLeadCreated(true);
      
      // Esperar un momento y luego mostrar el demo
      setTimeout(() => {
        setStep("demo");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Error al procesar el formulario");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-corporate-500 mx-auto mb-4" />
          <p className="text-slate-400">{t("demoView.loadingDemo")}</p>
        </div>
      </div>
    );
  }

  if (error && !demo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-950 flex items-center justify-center">
        <Card variant="glassPremium" padding="lg" className="max-w-md">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button variant="secondary" onClick={() => window.location.href = "/"}>
              {t("demoView.returnHome")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!demo) {
    return null;
  }

  // Mostrar formulario de captura
  if (step === "form") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card variant="glassPremium" padding="lg">
            {/* Header */}
            <div className="text-center mb-8">
              {demo.product.logo && (
                <img
                  src={demo.product.logo}
                  alt={demo.product.name}
                  className="w-16 h-16 mx-auto mb-4 rounded-lg"
                />
              )}
              <h1 className="text-3xl font-bold mb-2 text-gradient-platinum">
                {demo.title}
              </h1>
              {demo.subtitle && (
                <p className="text-slate-400 text-lg">{demo.subtitle}</p>
              )}
              <p className="text-slate-500 text-sm mt-2">
                {t("demoView.completeForm")}
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {leadCreated && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <div>
                    <p className="text-success font-medium">{t("demoView.completedForm")}</p>
                    <p className="text-success/80 text-sm">{t("demoView.redirectingToDemo")}</p>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t("demoView.fullNameRequired")}
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  leftIcon={<User className="w-4 h-4" />}
                  placeholder={t("demoView.namePlaceholder")}
                  disabled={submitting || leadCreated}
                />
                <Input
                  label={t("demoView.emailRequired")}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  leftIcon={<Mail className="w-4 h-4" />}
                  placeholder={t("demoView.emailPlaceholder")}
                  disabled={submitting || leadCreated}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t("demoView.company")}
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  leftIcon={<Building2 className="w-4 h-4" />}
                  placeholder={t("demoView.companyPlaceholder")}
                  disabled={submitting || leadCreated}
                />
                <Input
                  label={t("demoView.location")}
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  placeholder={t("demoView.locationPlaceholder")}
                  disabled={submitting || leadCreated}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">
                    {t("demoView.revenueRange")}
                  </label>
                  <select
                    value={formData.revenueRange}
                    onChange={(e) => setFormData({ ...formData, revenueRange: e.target.value })}
                    className="w-full px-4 py-3 bg-charcoal-800 rounded-lg border border-charcoal-700 focus:border-corporate-500 focus:outline-none transition-colors text-slate-100"
                    disabled={submitting || leadCreated}
                  >
                    <option value="">{t("demoView.selectRange")}</option>
                    <option value="<$100K">{t("demoView.lessThan100K")}</option>
                    <option value="$100K-$500K">{t("demoView.range100K500K")}</option>
                    <option value="$500K-$1M">{t("demoView.range500K1M")}</option>
                    <option value="$1M-$10M">{t("demoView.range1M10M")}</option>
                    <option value="$10M-$50M">{t("demoView.range10M50M")}</option>
                    <option value=">$50M">{t("demoView.moreThan50M")}</option>
                  </select>
                </div>
                <Input
                  label={t("demoView.employeeCount")}
                  type="number"
                  value={formData.employeeCount}
                  onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                  leftIcon={<Users className="w-4 h-4" />}
                  placeholder={t("demoView.employeesPlaceholder")}
                  disabled={submitting || leadCreated}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting || leadCreated}
                rightIcon={
                  submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : leadCreated ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )
                }
                className="mt-6 w-full"
              >
                {submitting
                  ? t("demoView.processing")
                  : leadCreated
                  ? t("demoView.accessingDemo")
                  : t("demoView.accessDemo")}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Mostrar demo después del formulario
  if (step === "demo") {
    return (
      <div className="min-h-screen bg-charcoal-950">
        <iframe
          src={demo.htmlContent ? undefined : demo.url}
          srcDoc={demo.htmlContent ? wrapHTMLContent(demo.htmlContent) : undefined}
          className="w-full h-screen border-0"
          title={demo.title}
          sandbox={demo.htmlContent ? "allow-scripts allow-same-origin allow-forms allow-popups allow-modals" : undefined}
          allow="fullscreen"
        />
      </div>
    );
  }

  return null;
}

