"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Users, UserPlus, Presentation, Mail, User as UserIcon, Lock, Trash2, AlertTriangle, Search, Shield, Briefcase, TrendingUp, ShoppingCart } from "lucide-react";
import { canManageUsers } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal, ModalActions } from "@/components/ui/modal";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Demo {
  id: number;
  title: string;
}

type RoleFilter = "all" | "admin" | "sales" | "buyer";

const roleConfigBase = {
  admin: {
    icon: Shield,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    badgeVariant: "error" as const,
  },
  sales: {
    icon: TrendingUp,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    badgeVariant: "warning" as const,
  },
  buyer: {
    icon: ShoppingCart,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    badgeVariant: "success" as const,
  },
};

export default function UsersPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const roleConfig = {
    admin: {
      ...roleConfigBase.admin,
      label: t("role.admin"),
      pluralLabel: t("role.admins"),
    },
    sales: {
      ...roleConfigBase.sales,
      label: t("role.sales"),
      pluralLabel: t("role.salespersons"),
    },
    buyer: {
      ...roleConfigBase.buyer,
      label: t("role.buyer"),
      pluralLabel: t("role.buyers"),
    },
  };

  useEffect(() => {
    if (session && canManageUsers(session)) {
      fetchUsers();
      fetchDemos();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      // Asegurar que data sea un array
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // En caso de error, establecer como array vacío
    } finally {
      setLoading(false);
    }
  };

  const fetchDemos = async () => {
    try {
      const res = await fetch("/api/demos");
      const data = await res.json();
      setDemos(data);
    } catch (error) {
      console.error("Error fetching demos:", error);
    }
  };

  const isSales = session?.user?.role === "sales";
  const isAdmin = session?.user?.role === "admin";

  // Filtrar usuarios según el rol del usuario actual
  const displayedUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    let filtered = users;

    // Filtrar por permisos
    if (isSales) {
      filtered = users.filter((u) => u.role === "buyer");
    }

    // Filtrar por rol seleccionado
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [users, isSales, roleFilter, searchTerm]);

  // Contar usuarios por rol
  const userCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: 0,
      admin: 0,
      sales: 0,
      buyer: 0,
    };

    // Verificar que users sea un array antes de iterar
    if (!Array.isArray(users)) {
      return counts;
    }

    users.forEach((user) => {
      if (isSales && user.role !== "buyer") return;

      counts.all++;
      if (counts[user.role] !== undefined) {
        counts[user.role]++;
      }
    });

    return counts;
  }, [users, isSales]);

  // Tabs disponibles según permisos
  const availableTabs = useMemo(() => {
    const tabs: RoleFilter[] = ["all"];
    if (isAdmin) {
      tabs.push("admin", "sales", "buyer");
    } else if (isSales) {
      tabs.push("buyer");
    }
    return tabs;
  }, [isAdmin, isSales]);

  if (!session || !canManageUsers(session)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Card variant="glassPremium" padding="lg" className="text-center">
          <p className="text-gray-600 dark:text-slate-400">{t("message.noPermission")}</p>
        </Card>
      </div>
    );
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar usuario");
      }

      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert(error.message || "Error al eliminar usuario");
    } finally {
      setDeleting(false);
    }
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getTabLabel = (tab: RoleFilter) => {
    if (tab === "all") return t("common.all");
    return roleConfig[tab as keyof typeof roleConfig].pluralLabel;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900 dark:text-slate-100">
              {t("users.title")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {t("users.subtitle")}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            {t("users.newUser")}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={t("users.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              fullWidth
            />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-charcoal-700">
        <div className="flex gap-1">
          {availableTabs.map((tab) => {
            const count = userCounts[tab];
            const isActive = roleFilter === tab;

            return (
              <button
                key={tab}
                onClick={() => setRoleFilter(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-corporate-500 text-corporate-600 dark:text-corporate-400"
                    : "border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                }`}
              >
                {getTabLabel(tab)}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  isActive
                    ? "bg-corporate-500/10 text-corporate-600 dark:text-corporate-400"
                    : "bg-gray-100 dark:bg-charcoal-800 text-gray-600 dark:text-slate-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Card variant="glassPremium" padding="lg" className="text-center">
          <p className="text-gray-600 dark:text-slate-400">{t("common.loading")}</p>
        </Card>
      ) : displayedUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchTerm ? t("users.empty.titleSearch") : t("users.empty.title")}
          description={
            searchTerm
              ? t("users.empty.descriptionSearch")
              : t("users.empty.description")
          }
          action={
            !searchTerm
              ? {
                  label: t("users.empty.createUser"),
                  onClick: () => setShowCreateModal(true),
                  icon: <UserPlus className="w-4 h-4" />,
                }
              : undefined
          }
        />
      ) : (
        <Card variant="glassPremium" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-charcoal-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    {t("users.table.user")}
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    {t("users.table.email")}
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    {t("users.table.role")}
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    {t("users.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-charcoal-800">
                {displayedUsers.map((user, index) => {
                  const config = roleConfig[user.role as keyof typeof roleConfig];
                  const Icon = config.icon;

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="hover:bg-gray-50 dark:hover:bg-charcoal-900/30 transition-colors"
                    >
                      {/* Usuario */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${config.bgColor} border ${config.borderColor} flex items-center justify-center flex-shrink-0`}>
                            <span className={`text-sm font-semibold ${config.color}`}>
                              {getInitial(user.name)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                              {user.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </td>

                      {/* Rol */}
                      <td className="py-3 px-4">
                        <Badge variant={config.badgeVariant} size="sm">
                          {config.label}
                        </Badge>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.role === "buyer" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowAssignModal(true);
                              }}
                              leftIcon={<Presentation className="w-3.5 h-3.5" />}
                              className="text-xs"
                            >
                              {t("users.demos")}
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="text-error hover:text-error hover:bg-error/10 px-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
        />
      )}

      {showAssignModal && selectedUser && (
        <AssignDemosModal
          user={selectedUser}
          demos={demos}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showDeleteModal && selectedUser && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          title={t("users.delete.title")}
          description={t("users.delete.description")}
          size="md"
          footer={
            <ModalActions
              onCancel={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
              onConfirm={handleDeleteUser}
              cancelLabel={t("common.cancel")}
              confirmLabel={deleting ? t("users.delete.deleting") : t("users.delete.button")}
              loading={deleting}
              confirmVariant="danger"
            />
          }
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-error mb-1">
                  {t("users.delete.warning")}
                </p>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {t("users.delete.consequence")}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-charcoal-800/50 rounded-lg p-4 space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-600 dark:text-slate-400">{t("common.name")}:</span>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {selectedUser.name}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600 dark:text-slate-400">{t("common.email")}:</span>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {selectedUser.email}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600 dark:text-slate-400">{t("common.role")}:</span>
                <Badge variant="success" size="sm" className="mt-1">
                  {roleConfig[selectedUser.role as keyof typeof roleConfig]?.label || selectedUser.role}
                </Badge>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CreateUserModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "sales" | "buyer">("buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userRole = session?.user?.role;
  const availableRoles =
    userRole === "admin"
      ? [
          { value: "admin", label: t("role.admin") },
          { value: "sales", label: t("role.sales") },
          { value: "buyer", label: t("role.buyer") },
        ]
      : [
          { value: "buyer", label: t("role.buyer") },
        ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear usuario");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={t("users.create.title")}
      description={t("users.create.description")}
      size="md"
      footer={
        <ModalActions
          onCancel={onClose}
          onConfirm={() => {
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
          }}
          cancelLabel={t("common.cancel")}
          confirmLabel={loading ? t("users.create.creating") : t("users.create.button")}
          loading={loading}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="glass-light rounded-xl p-4 text-red-700 dark:text-error text-sm border border-red-200 dark:border-error/20">
            {error}
          </div>
        )}

        <Input
          label={t("common.name")}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          leftIcon={<UserIcon className="w-4 h-4" />}
          placeholder={t("users.create.fullName")}
          fullWidth
        />

        <Input
          label={t("common.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          leftIcon={<Mail className="w-4 h-4" />}
          placeholder={t("users.create.emailPlaceholder")}
          fullWidth
        />

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
            {t("common.role")} <span className="text-red-500">{t("users.required")}</span>
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "sales" | "buyer")}
            className="w-full px-4 py-3 bg-white dark:bg-charcoal-800 rounded-lg border border-gray-300 dark:border-charcoal-700 focus:border-corporate-500 focus:outline-none transition-colors text-gray-900 dark:text-slate-100"
            required
          >
            {availableRoles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label={t("common.password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          leftIcon={<Lock className="w-4 h-4" />}
          placeholder={t("users.create.passwordPlaceholder")}
          helperText={t("users.create.passwordHelper")}
          fullWidth
        />
      </form>
    </Modal>
  );
}

function AssignDemosModal({
  user,
  demos,
  onClose,
  onSuccess,
}: {
  user: User;
  demos: Demo[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const [selectedDemos, setSelectedDemos] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserDemos();
  }, []);

  const fetchUserDemos = async () => {
    try {
      const res = await fetch(`/api/users/${user.id}/demos`);
      const data = await res.json();
      setSelectedDemos(data.map((d: Demo) => d.id));
    } catch (error) {
      console.error("Error fetching user demos:", error);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/users/${user.id}/demos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoIds: selectedDemos }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al asignar demos");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDemo = (demoId: number) => {
    setSelectedDemos((prev) =>
      prev.includes(demoId)
        ? prev.filter((id) => id !== demoId)
        : [...prev, demoId]
    );
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={t("users.assign.title")}
      description={`${t("users.assign.description")} ${user.name}`}
      size="lg"
      footer={
        <ModalActions
          onCancel={onClose}
          onConfirm={handleSubmit}
          cancelLabel={t("common.cancel")}
          confirmLabel={t("users.assign.save")}
          loading={loading}
        />
      }
    >
      <div>
        {error && (
          <div className="glass-light rounded-xl p-4 text-red-700 dark:text-error text-sm border border-red-200 dark:border-error/20 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {demos.length === 0 ? (
            <EmptyState
              icon={Presentation}
              title={t("users.assign.empty")}
              description={t("users.assign.emptyDescription")}
              variant="minimal"
            />
          ) : (
            demos.map((demo) => (
              <label
                key={demo.id}
                className="flex items-center gap-3 p-4 glass-light rounded-xl cursor-pointer hover:glass-premium transition-all group"
              >
                <input
                  type="checkbox"
                  checked={selectedDemos.includes(demo.id)}
                  onChange={() => toggleDemo(demo.id)}
                  className="w-5 h-5 rounded border-gray-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-corporate-500 focus:ring-corporate-500 focus:ring-offset-white dark:focus:ring-offset-charcoal-950"
                />
                <span className="flex-1 text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-slate-100 transition-colors">
                  {demo.title}
                </span>
              </label>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
