"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Users,
  Download,
  Search,
  Filter,
  Mail,
  Building2,
  MapPin,
  Calendar,
  User,
  Star,
  Eye,
  X,
  RefreshCw,
  DollarSign,
  Presentation,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CldImageWrapper } from "@/components/ui/CldImageWrapper";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Lead {
  id: number;
  name: string;
  email: string;
  company?: string;
  revenueRange?: string;
  employeeCount?: number;
  location?: string;
  sharedByUserId?: number;
  createdAt: string;
  sharedBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  latestDemo?: {
    id: number;
    title: string;
    productId: number;
    productName: string;
    productLogo?: string;
  };
  demosAccessed?: number;
  avgRating?: number;
}

export default function LeadsPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDemo, setSelectedDemo] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [demos, setDemos] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
    fetchDemos();
    fetchUsers();
  }, [searchTerm, selectedDemo, selectedUser]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedDemo !== "all") params.append("demoId", selectedDemo);
      if (selectedUser !== "all") params.append("sharedByUserId", selectedUser);

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: t("leads.fetch.errorUnknown") }));
        throw new Error(errorData.error || t("leads.fetch.error"));
      }
      const data = await res.json();
      // Asegurarse de que data sea un array
      const leadsArray = Array.isArray(data) ? data : [];
      console.log("Leads cargados:", leadsArray.length, "leads");
      setLeads(leadsArray);
    } catch (error: any) {
      console.error("Error fetching leads:", error);
      // Mostrar mensaje de error al usuario
      alert(error.message || `${t("leads.fetch.error")}. ${t("leads.fetch.tryAgain")}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (leadId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que abra el modal

    if (!confirm(t("leads.delete.confirm"))) {
      return;
    }

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(t("leads.delete.error"));
      }

      // Recargar leads
      fetchLeads();
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert(t("leads.delete.error"));
    }
  };

  const fetchDemos = async () => {
    try {
      const res = await fetch("/api/demos");
      if (res.ok) {
        const data = await res.json();
        setDemos(data);
      }
    } catch (error) {
      console.error("Error fetching demos:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        // Asegurarse de que data sea un array
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedDemo !== "all") params.append("demoId", selectedDemo);
      if (selectedUser !== "all") params.append("sharedByUserId", selectedUser);

      const res = await fetch(`/api/leads/export?${params.toString()}`);
      if (!res.ok) throw new Error(t("leads.export.error"));

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting leads:", error);
      alert(t("leads.export.error"));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-2 tracking-tight text-gray-900 dark:text-slate-100">
              {t("leads.title")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {t("leads.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handleExport}
              leftIcon={<Download className="w-4 h-4" />}
              disabled={leads.length === 0}
            >
              {t("common.export")}
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={fetchLeads}
              disabled={loading}
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}
            >
              {loading ? t("common.loading") : t("common.refresh")}
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="w-full">
              <Input
                type="text"
                placeholder={t("leads.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                fullWidth
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-500 z-10" />
              <select
                value={selectedDemo}
                onChange={(e) => setSelectedDemo(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-charcoal-900 rounded-xl border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none focus:ring-2 focus:ring-corporate-500/30 transition-all appearance-none text-gray-900 dark:text-slate-50 text-base"
              >
                <option value="all" className="bg-white dark:bg-charcoal-900">{t("leads.allDemos")}</option>
                {demos.map((demo) => (
                  <option key={demo.id} value={demo.id.toString()} className="bg-white dark:bg-charcoal-900">
                    {demo.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-500 z-10" />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-charcoal-900 rounded-xl border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none focus:ring-2 focus:ring-corporate-500/30 transition-all appearance-none text-gray-900 dark:text-slate-50 text-base"
              >
                <option value="all" className="bg-white dark:bg-charcoal-900">{t("leads.allSellers")}</option>
                {Array.isArray(users) && users
                  .filter((u) => u.role === "sales")
                  .map((user) => (
                    <option key={user.id} value={user.id.toString()} className="bg-white dark:bg-charcoal-900">
                      {user.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <Card variant="glassPremium" padding="lg" className="text-center">
          <p className="text-gray-600 dark:text-slate-400">{t("common.loading")}</p>
        </Card>
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("leads.empty.title")}
          description={t("leads.empty.description")}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {leads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <Card
                variant="glassPremium"
                padding="none"
                className="hover:border-corporate-500/30 transition-all cursor-pointer overflow-hidden group relative"
                onClick={() => setSelectedLead(lead)}
              >
                {/* Delete Button (Admin only) - Always visible */}
                {session?.user?.role === "admin" && (
                  <button
                    onClick={(e) => handleDeleteLead(lead.id, e)}
                    className="absolute top-3 right-3 p-1.5 rounded-md bg-white dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-500/30 transition-all z-10 shadow-sm"
                    title={t("leads.delete.title")}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" />
                  </button>
                )}

                {/* Header */}
                <div className="p-4 pb-3 border-b border-gray-100 dark:border-charcoal-800">
                  <div className="flex items-start gap-3">
                    {/* Avatar Simple */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                      </div>
                      {lead.avgRating && typeof lead.avgRating === 'number' && (
                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-[10px] font-semibold px-1 py-0.5 rounded flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>{Number(lead.avgRating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-0.5 truncate">
                        {lead.name}
                      </h3>
                      {lead.company && (
                        <p className="text-xs font-medium text-corporate-600 dark:text-corporate-400 mb-1 truncate">
                          {lead.company}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-500">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Compacto */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-charcoal-800">
                  <div className="p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                      {lead.demosAccessed || 0}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-slate-500 mt-0.5">
                      {t("leads.demos")}
                    </div>
                  </div>

                  <div className="p-3 text-center">
                    <div className="text-xs font-medium text-gray-900 dark:text-slate-100">
                      {formatDate(lead.createdAt)}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-slate-500 mt-0.5">
                      {t("leads.registration")}
                    </div>
                  </div>

                  <div className="p-3 text-center">
                    <div className="text-xs font-medium text-gray-900 dark:text-slate-100 truncate px-1">
                      {lead.revenueRange || 'N/A'}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-slate-500 mt-0.5">
                      {t("leads.budget")}
                    </div>
                  </div>
                </div>

                {/* Footer Minimalista */}
                {(lead.latestDemo || lead.location || lead.employeeCount || lead.sharedBy) && (
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-charcoal-900/30 border-t border-gray-100 dark:border-charcoal-800">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {lead.latestDemo && (
                        <span className="text-gray-600 dark:text-slate-400 flex items-center gap-1.5">
                          {lead.latestDemo.productLogo ? (
                            <div className="relative w-4 h-4 flex-shrink-0">
                              <CldImageWrapper
                                src={lead.latestDemo.productLogo}
                                alt={lead.latestDemo.productName}
                                width={16}
                                height={16}
                                className="rounded object-contain"
                              />
                            </div>
                          ) : (
                            <Presentation className="w-3 h-3" />
                          )}
                          {lead.latestDemo.title}
                        </span>
                      )}
                      {lead.location && (
                        <span className="text-gray-500 dark:text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {lead.location}
                        </span>
                      )}
                      {lead.employeeCount && (
                        <span className="text-gray-500 dark:text-slate-500">
                          {lead.employeeCount} {t("leads.employees")}
                        </span>
                      )}
                      {lead.sharedBy && (
                        <span className="text-gray-500 dark:text-slate-500 flex items-center gap-1 ml-auto">
                          <User className="w-3 h-3" />
                          {lead.sharedBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de Detalles del Lead */}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}

function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [lead.id]);

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`/api/leads/${lead.id}/feedback`);
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-charcoal-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-charcoal-700 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-charcoal-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            {t("leads.detail.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors text-gray-500 dark:text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-slate-300">
              {t("leads.detail.contactInfo")}
            </h3>
            <div className="bg-gray-50 dark:bg-charcoal-800/50 rounded-lg p-4 space-y-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-slate-400">{t("common.name")}:</span>
                <p className="text-gray-900 dark:text-slate-100 font-medium">{lead.name}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-slate-400">{t("common.email")}:</span>
                <p className="text-gray-900 dark:text-slate-100 font-medium">{lead.email}</p>
              </div>
              {lead.company && (
                <div>
                  <span className="text-gray-600 dark:text-slate-400">{t("leads.detail.company")}:</span>
                  <p className="text-gray-900 dark:text-slate-100 font-medium">{lead.company}</p>
                </div>
              )}
              {lead.location && (
                <div>
                  <span className="text-gray-600 dark:text-slate-400">{t("leads.detail.location")}:</span>
                  <p className="text-gray-900 dark:text-slate-100 font-medium">{lead.location}</p>
                </div>
              )}
              {lead.revenueRange && (
                <div>
                  <span className="text-gray-600 dark:text-slate-400">{t("leads.detail.revenueRange")}:</span>
                  <p className="text-gray-900 dark:text-slate-100 font-medium">{lead.revenueRange}</p>
                </div>
              )}
              {lead.employeeCount && (
                <div>
                  <span className="text-gray-600 dark:text-slate-400">{t("leads.detail.employeeCount")}:</span>
                  <p className="text-gray-900 dark:text-slate-100 font-medium">{lead.employeeCount}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600 dark:text-slate-400">{t("leads.detail.captureDate")}:</span>
                <p className="text-gray-900 dark:text-slate-100 font-medium">
                  {new Date(lead.createdAt).toLocaleString("es-ES")}
                </p>
              </div>
              {lead.sharedBy && (
                <div>
                  <span className="text-gray-600 dark:text-slate-400">{t("leads.detail.sharedBy")}:</span>
                  <p className="text-gray-900 dark:text-slate-100 font-medium">{lead.sharedBy.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-slate-300">
              {t("leads.detail.feedbackTitle")}
            </h3>
            {loading ? (
              <p className="text-sm text-gray-600 dark:text-slate-400">{t("common.loading")}</p>
            ) : feedback.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {t("leads.detail.noFeedback")}
              </p>
            ) : (
              <div className="space-y-3">
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 dark:bg-charcoal-800/50 rounded-lg p-4 border border-gray-200 dark:border-charcoal-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {item.demo?.title || t("leads.detail.demo")}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-slate-500">
                        {new Date(item.timestamp).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    {(item.systemRating || item.promoterRating) && (
                      <div className="space-y-2">
                        {item.systemRating && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 dark:text-slate-400 w-28">{t("leads.detail.systemRating")}:</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= item.systemRating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300 dark:text-charcoal-700"
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-gray-600 dark:text-slate-400 ml-1">
                                ({item.systemRating}/5)
                              </span>
                            </div>
                          </div>
                        )}
                        {item.promoterRating && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 dark:text-slate-400 w-28">{t("leads.detail.promoterRating")}:</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= item.promoterRating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300 dark:text-charcoal-700"
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-gray-600 dark:text-slate-400 ml-1">
                                ({item.promoterRating}/5)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {item.comments && (
                      <p className="text-sm text-gray-700 dark:text-slate-300 mt-2">
                        {item.comments}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-charcoal-700">
          <Button variant="secondary" size="md" onClick={onClose}>
            {t("common.close")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
