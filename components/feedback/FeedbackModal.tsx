"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Star, Loader2, CheckCircle2, TrendingUp, DollarSign, Calendar, Target, MessageSquare, ThumbsUp, ThumbsDown, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface FeedbackModalProps {
  demoId: number;
  userId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AttendantUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function FeedbackModal({ demoId, userId, onClose, onSuccess }: FeedbackModalProps) {
  const { data: session } = useSession();
  const [systemRating, setSystemRating] = useState<number | null>(null);
  const [promoterRating, setPromoterRating] = useState<number | null>(null);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [company, setCompany] = useState<string>("");
  const [interestLevel, setInterestLevel] = useState<string>("");
  const [purchaseStage, setPurchaseStage] = useState<string>("");
  const [budgetRange, setBudgetRange] = useState<string>("");
  const [decisionTimeframe, setDecisionTimeframe] = useState<string>("");
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [painPoints, setPainPoints] = useState<string>("");
  const [useCase, setUseCase] = useState<string>("");
  const [comments, setComments] = useState("");
  const [attendedByUserId, setAttendedByUserId] = useState<number | null>(null);
  const [attendants, setAttendants] = useState<AttendantUser[]>([]);
  const [loadingAttendants, setLoadingAttendants] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Cargar usuarios admin y sales para el selector
  useEffect(() => {
    const fetchAttendants = async () => {
      setLoadingAttendants(true);
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const allUsers = await res.json();
          // Filtrar solo admin y sales
          const adminAndSales = allUsers.filter(
            (u: AttendantUser) => u.role === "admin" || u.role === "sales"
          );
          setAttendants(adminAndSales);
          
          // Si el usuario actual es admin o sales, seleccionarlo por defecto
          if (session?.user?.id && (session.user.role === "admin" || session.user.role === "sales")) {
            const currentUser = adminAndSales.find(
              (u: AttendantUser) => u.id === parseInt(session.user.id || "0")
            );
            if (currentUser) {
              setAttendedByUserId(currentUser.id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching attendants:", error);
      } finally {
        setLoadingAttendants(false);
      }
    };

    fetchAttendants();
  }, [session]);

  const interestLevels = [
    { value: "low", label: "Bajo - Solo explorando" },
    { value: "medium", label: "Medio - Evaluando opciones" },
    { value: "high", label: "Alto - Muy interesado" },
    { value: "very-high", label: "Muy Alto - Listo para comprar" },
  ];

  const purchaseStages = [
    { value: "exploring", label: "Explorando - Conociendo el mercado" },
    { value: "evaluating", label: "Evaluando - Comparando opciones" },
    { value: "negotiating", label: "Negociando - En proceso de compra" },
    { value: "ready", label: "Listo - Decisión inminente" },
  ];

  const budgetRanges = [
    { value: "<$10K", label: "Menos de $10,000" },
    { value: "$10K-$50K", label: "$10,000 - $50,000" },
    { value: "$50K-$100K", label: "$50,000 - $100,000" },
    { value: "$100K-$250K", label: "$100,000 - $250,000" },
    { value: ">$250K", label: "Más de $250,000" },
  ];

  const decisionTimeframes = [
    { value: "immediate", label: "Inmediato - Esta semana" },
    { value: "1-month", label: "1 mes" },
    { value: "3-months", label: "3 meses" },
    { value: "6-months", label: "6 meses" },
    { value: "1-year", label: "1 año o más" },
  ];

  const availableFeatures = [
    "Automatización de procesos",
    "Reportes y Analytics",
    "Integraciones",
    "Escalabilidad",
    "Seguridad",
    "Soporte técnico",
    "Precio competitivo",
    "Facilidad de uso",
  ];

  const toggleFeature = (feature: string) => {
    setKeyFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!company.trim()) {
      setError("Por favor ingresa el nombre de tu empresa");
      return;
    }

    if (!attendedByUserId) {
      setError("Por favor selecciona quien te atendió");
      return;
    }

    if (!systemRating) {
      setError("Por favor califica el sistema del demo");
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setSubmitting(true);

    try {
      const feedbackData = {
        demoId,
        userId,
        attendedByUserId: attendedByUserId || null,
        systemRating,
        promoterRating: promoterRating || null,
        npsScore: npsScore || null,
        company: company.trim() || null,
        interestLevel: interestLevel || null,
        purchaseStage: purchaseStage || null,
        budgetRange: budgetRange || null,
        decisionTimeframe: decisionTimeframe || null,
        keyFeatures: keyFeatures.length > 0 ? keyFeatures : null,
        painPoints: painPoints.trim() || null,
        useCase: useCase.trim() || null,
        comments: comments.trim() || null,
      };

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar feedback");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({
    rating,
    onRatingChange,
    label,
    required = false,
  }: {
    rating: number | null;
    onRatingChange: (rating: number) => void;
    label: string;
    required?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
            disabled={submitting || success}
          >
            <Star
              className={`w-8 h-8 ${
                rating && star <= rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 dark:text-slate-600"
              }`}
            />
          </button>
        ))}
        {rating && (
          <span className="ml-2 text-sm text-gray-600 dark:text-slate-400">
            {rating}/5
          </span>
        )}
      </div>
    </div>
  );

  const NPSRating = () => (
    <div>
      <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-slate-300">
        ¿Qué tan probable es que recomiendes este producto a un colega? (NPS) *
      </label>
      <div className="grid grid-cols-11 gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => setNpsScore(score)}
            className={`px-2 py-3 rounded-lg text-sm font-medium transition-all ${
              npsScore === score
                ? "bg-corporate-500 text-white scale-110"
                : "bg-gray-100 dark:bg-charcoal-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-charcoal-700"
            }`}
            disabled={submitting || success}
          >
            {score}
          </button>
        ))}
      </div>
      {npsScore !== null && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          {npsScore >= 9 && (
            <span className="text-success font-medium">Promotor</span>
          )}
          {npsScore >= 7 && npsScore <= 8 && (
            <span className="text-warning font-medium">Pasivo</span>
          )}
          {npsScore <= 6 && (
            <span className="text-error font-medium">Detractor</span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-charcoal-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Encuesta de Satisfacción
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              Paso {currentStep} de {totalSteps}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors"
            disabled={submitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-charcoal-800 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              className="bg-corporate-500 h-2 rounded-full"
            />
          </div>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
            <p className="text-gray-900 dark:text-slate-100 text-lg font-medium mb-2">
              ¡Gracias por tu feedback!
            </p>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Tu opinión es muy valiosa para nosotros.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-error/10 border border-red-200 dark:border-error/20 rounded-lg p-3 text-red-700 dark:text-error text-sm">
                {error}
              </div>
            )}

            {/* Paso 1: Calificaciones */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-700">
                  <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-corporate-500" />
                    Información de tu Empresa
                  </h3>
                  <div className="mb-5">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                      Nombre de tu Empresa <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Ej: Acme Corporation"
                      fullWidth
                      disabled={submitting || success}
                    />
                  </div>
                </Card>

                <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-700">
                  <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-corporate-500" />
                    ¿Quién te Atendió?
                  </h3>
                  <div className="mb-5">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                      Selecciona la persona que te atendió <span className="text-red-500">*</span>
                    </label>
                    {loadingAttendants ? (
                      <div className="text-sm text-gray-500 dark:text-slate-400">Cargando...</div>
                    ) : (
                      <select
                        value={attendedByUserId || ""}
                        onChange={(e) => setAttendedByUserId(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-4 py-3 bg-white dark:bg-charcoal-800 rounded-lg border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none transition-colors text-gray-900 dark:text-slate-100"
                        disabled={submitting}
                        required
                      >
                        <option value="">Selecciona quien te atendió</option>
                        {attendants.map((attendant) => (
                          <option key={attendant.id} value={attendant.id}>
                            {attendant.name} ({attendant.email}) - {attendant.role === "admin" ? "Administrador" : "Vendedor"}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </Card>

                <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-700">
                  <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <Star className="w-4 h-4 text-corporate-500" />
                    Calificaciones
                  </h3>
                  <div className="space-y-5">
                    <StarRating
                      rating={systemRating}
                      onRatingChange={setSystemRating}
                      label="¿Cómo calificarías el sistema del demo?"
                      required
                    />
                    <StarRating
                      rating={promoterRating}
                      onRatingChange={setPromoterRating}
                      label="¿Cómo calificarías al promotor de ventas?"
                    />
                    <NPSRating />
                  </div>
                </Card>
              </div>
            )}

            {/* Paso 2: Interés y Proceso de Compra */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-700">
                  <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-corporate-500" />
                    Interés y Proceso de Compra
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                        Nivel de Interés
                      </label>
                      <select
                        value={interestLevel}
                        onChange={(e) => setInterestLevel(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-charcoal-800 rounded-lg border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none transition-colors text-gray-900 dark:text-slate-100"
                        disabled={submitting}
                      >
                        <option value="">Selecciona un nivel</option>
                        {interestLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                        Etapa del Proceso de Compra
                      </label>
                      <select
                        value={purchaseStage}
                        onChange={(e) => setPurchaseStage(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-charcoal-800 rounded-lg border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none transition-colors text-gray-900 dark:text-slate-100"
                        disabled={submitting}
                      >
                        <option value="">Selecciona una etapa</option>
                        {purchaseStages.map((stage) => (
                          <option key={stage.value} value={stage.value}>
                            {stage.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Presupuesto Estimado
                        </label>
                        <select
                          value={budgetRange}
                          onChange={(e) => setBudgetRange(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-charcoal-800 rounded-lg border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none transition-colors text-gray-900 dark:text-slate-100"
                          disabled={submitting}
                        >
                          <option value="">Selecciona un rango</option>
                          {budgetRanges.map((range) => (
                            <option key={range.value} value={range.value}>
                              {range.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Tiempo Estimado para Decisión
                        </label>
                        <select
                          value={decisionTimeframe}
                          onChange={(e) => setDecisionTimeframe(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-charcoal-800 rounded-lg border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none transition-colors text-gray-900 dark:text-slate-100"
                          disabled={submitting}
                        >
                          <option value="">Selecciona un tiempo</option>
                          {decisionTimeframes.map((timeframe) => (
                            <option key={timeframe.value} value={timeframe.value}>
                              {timeframe.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Paso 3: Detalles y Comentarios */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-700">
                  <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <Target className="w-4 h-4 text-corporate-500" />
                    Funcionalidades y Detalles
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-slate-300">
                        Funcionalidades más importantes para ti (selecciona todas las que apliquen)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableFeatures.map((feature) => (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => toggleFeature(feature)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              keyFeatures.includes(feature)
                                ? "bg-corporate-500 text-white"
                                : "bg-gray-100 dark:bg-charcoal-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-charcoal-700"
                            }`}
                            disabled={submitting}
                          >
                            {feature}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                        Caso de Uso Principal
                      </label>
                      <textarea
                        value={useCase}
                        onChange={(e) => setUseCase(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white dark:bg-charcoal-800 rounded-lg border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none transition-colors text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500"
                        placeholder="Describe cómo planeas usar este producto..."
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                        Puntos de Dolor o Desafíos Actuales
                      </label>
                      <textarea
                        value={painPoints}
                        onChange={(e) => setPainPoints(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white dark:bg-charcoal-800 rounded-lg border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none transition-colors text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500"
                        placeholder="¿Qué problemas o desafíos estás tratando de resolver?"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                        Comentarios Adicionales
                      </label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-white dark:bg-charcoal-800 rounded-lg border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none transition-colors text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500"
                        placeholder="Comparte cualquier comentario, sugerencia o pregunta adicional..."
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-charcoal-700">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Anterior
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={submitting}
                className={currentStep === 1 ? "flex-1" : ""}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting || (currentStep === 1 && (!systemRating || !attendedByUserId))}
                className="flex-1"
                rightIcon={
                  submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : currentStep < totalSteps ? (
                    undefined
                  ) : undefined
                }
              >
                {submitting
                  ? "Enviando..."
                  : currentStep < totalSteps
                  ? "Siguiente"
                  : "Enviar Feedback"}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
