"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Presentation,
  Users,
  Star,
  TrendingUp,
  BarChart3,
  Building2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CldImageWrapper } from "@/components/ui/CldImageWrapper";
import { AdminStorageCard } from "@/components/ui/AdminStorageCard";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface DashboardData {
  kpis: {
    totalDemos: number;
    demosActivos: number;
    totalLeads: number;
    totalUsuarios: number;
    avgSystemRating: string;
    totalFeedbacks: number;
  };
  topRequestedDemo: any;
  topRatedDemo: any;
  demosOverTime: Array<{ date: string; count: number }>;
  leadsOverTime: Array<{ date: string; count: number }>;
  userActivity: Array<{
    userId: number;
    userName: string;
    userEmail: string;
    userRole: string;
    lastActivity: string;
    activityCount: number;
  }>;
  demosByStatus: Array<{ status: string; count: number }>;
  topActiveLeads: Array<any>;
}

export default function Home() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Esperar a que la sesión esté completamente cargada
    if (status === "loading") {
      return; // Aún cargando, no hacer nada
    }

    // Si no hay sesión, el middleware debería redirigir a login
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }

    // Redirigir buyers a demos
    if (userRole === "buyer") {
      router.push("/demos");
      return;
    }

    // Solo cargar dashboard si hay sesión y es admin o sales
    if (status === "authenticated" && (userRole === "admin" || userRole === "sales")) {
      fetchDashboard();
    } else if (status === "authenticated") {
      // Sesión autenticada pero sin rol válido
      setLoading(false);
    }
  }, [userRole, router, status]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
      } else {
        // Si hay error, al menos mostrar que no hay datos
        setData(null);
      }
    } catch (error) {
      // Error silencioso - la UI mostrará el estado de loading=false sin datos
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras se carga la sesión o se está redirigiendo
  if (status === "loading" || userRole === "buyer") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-corporate-500 mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Paginación de actividad de usuarios
  const paginatedActivity = data?.userActivity || [];
  const totalPages = Math.ceil(paginatedActivity.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivity = paginatedActivity.slice(startIndex, endIndex);

  // Helper para traducir roles
  const getRoleTranslation = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: t("role.admin"),
      sales: t("role.sales"),
      buyer: t("role.buyer"),
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-slate-100">
            {t("dashboard.executive.title")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-500">
            {t("dashboard.executive.subtitle")}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-charcoal-900 rounded-lg p-4 animate-pulse border border-gray-200 dark:border-charcoal-800"
              >
                <div className="h-16 bg-gray-200 dark:bg-charcoal-800 rounded mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-charcoal-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : data ? (
          <>
            {/* KPIs Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`grid grid-cols-1 md:grid-cols-2 ${userRole === "admin" ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-4 mb-6`}
            >
              <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">{t("dashboard.executive.totalDemos")}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
                      {data.kpis.totalDemos}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                      {data.kpis.demosActivos} {t("dashboard.executive.active")}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-corporate-500/10 flex items-center justify-center">
                    <Presentation className="w-5 h-5 text-corporate-500" />
                  </div>
                </div>
              </Card>

              <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">{t("dashboard.executive.totalLeads")}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
                      {data.kpis.totalLeads}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                      {data.kpis.totalFeedbacks} {t("dashboard.executive.feedbacks")}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-success" />
                  </div>
                </div>
              </Card>

              <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">{t("dashboard.executive.avgRating")}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
                        {data.kpis.avgSystemRating}
                      </p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= parseFloat(data.kpis.avgSystemRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300 dark:text-charcoal-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{t("dashboard.executive.satisfaction")}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              </Card>

              <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">{t("dashboard.executive.activeUsers")}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
                      {data.kpis.totalUsuarios}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{t("dashboard.executive.inPlatform")}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </Card>

              {/* Almacenamiento Total (solo para administradores) */}
              {userRole === "admin" && <AdminStorageCard />}
            </motion.div>

            {/* Demo Destacadas */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6"
            >
              {/* Demo Más Solicitada */}
              {data.topRequestedDemo && (
                <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {t("dashboard.executive.mostRequested")}
                    </h3>
                    <Badge variant="corporate" size="sm">
                      {data.topRequestedDemo.assignmentCount} {t("dashboard.assignments")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-charcoal-800 flex items-center justify-center overflow-hidden">
                      {data.topRequestedDemo.productLogo ? (
                        <CldImageWrapper
                          src={data.topRequestedDemo.productLogo}
                          alt={data.topRequestedDemo.productName}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Presentation className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                        {data.topRequestedDemo.demoTitle}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-500 truncate">
                        {data.topRequestedDemo.productName}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Demo Mejor Calificada */}
              {data.topRatedDemo && (
                <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {t("dashboard.executive.topRated")}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                        {Number(data.topRatedDemo.avgRating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center overflow-hidden">
                      {data.topRatedDemo.productLogo ? (
                        <CldImageWrapper
                          src={data.topRatedDemo.productLogo}
                          alt={data.topRatedDemo.productName}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Star className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                        {data.topRatedDemo.demoTitle}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-500 truncate">
                        {data.topRatedDemo.productName} · {data.topRatedDemo.feedbackCount} {t("dashboard.reviews")}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>

            {/* Gráficos */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6"
            >
              {/* Demos Creadas */}
              <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">
                  {t("dashboard.executive.demosCreated")}
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.demosOverTime}>
                    <defs>
                      <linearGradient id="colorDemos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => {
                        try {
                          const date = new Date(value);
                          if (isNaN(date.getTime())) return value;
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "6px",
                        fontSize: "11px",
                      }}
                      labelFormatter={(value) => {
                        try {
                          const date = new Date(value);
                          if (isNaN(date.getTime())) return value;
                          return date.toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          });
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDemos)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Leads Capturados */}
              <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">
                  {t("dashboard.executive.leadsCaptured")}
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.leadsOverTime}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => {
                        try {
                          const date = new Date(value);
                          if (isNaN(date.getTime())) return value;
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "6px",
                        fontSize: "11px",
                      }}
                      labelFormatter={(value) => {
                        try {
                          const date = new Date(value);
                          if (isNaN(date.getTime())) return value;
                          return date.toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          });
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#34d399"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorLeads)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Tabla de Actividad de Usuarios */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card variant="glassPremium" padding="none" className="border-gray-200 dark:border-charcoal-800">
                <div className="p-4 border-b border-gray-200 dark:border-charcoal-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {t("dashboard.executive.recentActivity")}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
                    {t("dashboard.executive.last7Days")}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-charcoal-900/50 border-b border-gray-200 dark:border-charcoal-800">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-slate-400">
                          {t("dashboard.executive.table.user")}
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-slate-400">
                          {t("dashboard.executive.table.email")}
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-slate-400">
                          {t("dashboard.executive.table.role")}
                        </th>
                        <th className="px-4 py-2.5 text-center font-medium text-gray-600 dark:text-slate-400">
                          {t("dashboard.executive.table.activities")}
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-slate-400">
                          {t("dashboard.executive.table.lastActivity")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-charcoal-800">
                      {currentActivity.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-gray-500 dark:text-slate-500">
                            {t("dashboard.executive.noActivity")}
                          </td>
                        </tr>
                      ) : (
                        currentActivity.map((activity) => (
                          <tr
                            key={activity.userId}
                            className="hover:bg-gray-50 dark:hover:bg-charcoal-900/30 transition-colors"
                          >
                            <td className="px-4 py-2.5 text-gray-900 dark:text-slate-100 font-medium">
                              {activity.userName}
                            </td>
                            <td className="px-4 py-2.5 text-gray-600 dark:text-slate-400">
                              {activity.userEmail}
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge
                                variant={
                                  activity.userRole === "admin"
                                    ? "default"
                                    : activity.userRole === "sales"
                                    ? "warning"
                                    : "success"
                                }
                                size="sm"
                              >
                                {getRoleTranslation(activity.userRole)}
                              </Badge>
                            </td>
                            <td className="px-4 py-2.5 text-center text-gray-900 dark:text-slate-100">
                              {activity.activityCount}
                            </td>
                            <td className="px-4 py-2.5 text-gray-600 dark:text-slate-400">
                              {new Date(activity.lastActivity).toLocaleString("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginación Sutil */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-200 dark:border-charcoal-800 flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-slate-500">
                      {t("dashboard.executive.page")} {currentPage} {t("dashboard.executive.of")} {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-charcoal-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-400" />
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-charcoal-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-slate-400" />
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </>
        ) : (
          <Card variant="glassPremium" padding="lg" className="text-center">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {t("dashboard.executive.loadError")}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
