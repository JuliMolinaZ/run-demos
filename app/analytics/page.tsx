"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { logger } from "@/lib/utils/logger-client";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Presentation,
  UserPlus,
  TrendingUp,
  Star,
  ThumbsUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface AnalyticsData {
  usersByRole: Array<{ role: string; count: number }>;
  demosByStatus: Array<{ status: string; count: number }>;
  totalLeads: number;
  totalDemos: number;
  totalUsers: number;
  avgRatings: {
    system: string;
    promoter: string;
  };
  topDemos: Array<{
    demoId: number;
    demoTitle: string;
    productName: string;
    assignmentCount: number;
  }>;
  demosOverTime: Array<{ date: string; count: number }>;
  leadsOverTime: Array<{ date: string; count: number }>;
  demosByProduct: Array<{
    productName: string;
    productColor: string | null;
    count: number;
  }>;
}

const COLORS = {
  primary: "#60a5fa",
  success: "#34d399",
  warning: "#fbbf24",
  error: "#f87171",
  purple: "#a78bfa",
  pink: "#f472b6",
};

const STATUS_COLORS: Record<string, string> = {
  active: COLORS.success,
  draft: COLORS.warning,
  archived: "#94a3b8",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "#ef4444",
  sales: "#3b82f6",
  buyer: "#10b981",
};

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Error al cargar analytics");
      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (error) {
      logger.error("Error fetching analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (session?.user?.role !== "admin") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
        <Card variant="glassPremium" padding="lg" className="text-center">
          <p className="text-gray-600 dark:text-slate-400">
            {t("analytics.adminOnly")}
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
        <Card variant="glassPremium" padding="lg" className="text-center">
          <p className="text-gray-600 dark:text-slate-400">{t("analytics.loadingAnalytics")}</p>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
        <Card variant="glassPremium" padding="lg" className="text-center">
          <p className="text-gray-600 dark:text-slate-400">
            {t("analytics.loadError")}
          </p>
        </Card>
      </div>
    );
  }

  const roleData = data.usersByRole.map((item) => ({
    name: item.role.charAt(0).toUpperCase() + item.role.slice(1),
    value: item.count,
    color: ROLE_COLORS[item.role] || COLORS.primary,
  }));

  const statusData = data.demosByStatus.map((item) => ({
    name:
      item.status === "active"
        ? t("demos.status.active")
        : item.status === "draft"
        ? t("demos.status.draft")
        : t("demos.status.archived"),
    value: item.count,
    color: STATUS_COLORS[item.status] || COLORS.primary,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2 tracking-tight text-gray-900 dark:text-slate-100">
            {t("analytics.metricsTitle")}
          </h1>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {t("analytics.metricsSubtitle")}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            label={t("analytics.totalUsers")}
            value={data.totalUsers.toString()}
            icon={Users}
            variant="corporate"
          />
          <StatsCard
            label={t("analytics.totalDemos")}
            value={data.totalDemos.toString()}
            icon={Presentation}
            variant="default"
          />
          <StatsCard
            label={t("analytics.totalLeads")}
            value={data.totalLeads.toString()}
            icon={UserPlus}
            variant="platinum"
          />
          <StatsCard
            label={t("analytics.avgRating")}
            value={data.avgRatings.system}
            icon={Star}
            variant="default"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Usuarios por Rol */}
          <Card variant="glassPremium" padding="lg">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-slate-100">
              {t("analytics.usersByRole")}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="value" fill="#60a5fa" radius={[8, 8, 0, 0]}>
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Demos por Estado */}
          <Card variant="glassPremium" padding="lg">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-slate-100">
              {t("analytics.demosByStatus")}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Timeline Charts */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Actividad en el Tiempo */}
          <Card variant="glassPremium" padding="lg">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-slate-100">
              {t("analytics.activityLast30Days")}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value as string);
                    return date.toLocaleDateString("es-ES");
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  data={data.demosOverTime}
                  name={t("analytics.demosCreated")}
                  dot={{ fill: COLORS.primary }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS.success}
                  strokeWidth={2}
                  data={data.leadsOverTime}
                  name={t("analytics.leadsGenerated")}
                  dot={{ fill: COLORS.success }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Demos */}
          <Card variant="glassPremium" padding="lg">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-slate-100">
              {t("analytics.top5Demos")}
            </h3>
            <div className="space-y-4">
              {data.topDemos.map((demo, index) => (
                <div
                  key={demo.demoId}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-charcoal-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-corporate-500/20 text-corporate-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-slate-100">
                        {demo.demoTitle}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">
                        {demo.productName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="font-semibold text-gray-900 dark:text-slate-100">
                      {demo.assignmentCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Demos por Producto */}
          <Card variant="glassPremium" padding="lg">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-slate-100">
              {t("analytics.demosByProduct")}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.demosByProduct} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="productName" type="category" stroke="#94a3b8" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#60a5fa" radius={[0, 8, 8, 0]}>
                  {data.demosByProduct.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.productColor || COLORS.primary}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
