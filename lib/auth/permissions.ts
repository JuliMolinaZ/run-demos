import { Session } from "next-auth";

export type UserRole = "admin" | "sales" | "buyer";

export const hasPermission = (
  session: Session | null,
  requiredRole: UserRole | UserRole[]
): boolean => {
  if (!session?.user?.role) {
    return false;
  }

  const userRole = session.user.role;
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  // Admin tiene acceso a todo
  if (userRole === "admin") {
    return true;
  }

  // Sales tiene acceso a sales y buyer
  if (userRole === "sales") {
    return roles.includes("sales") || roles.includes("buyer");
  }

  // Buyer solo tiene acceso a buyer
  if (userRole === "buyer") {
    return roles.includes("buyer");
  }

  return false;
};

export const canManageUsers = (session: Session | null): boolean => {
  if (!session?.user?.role) {
    return false;
  }
  return session.user.role === "admin" || session.user.role === "sales";
};

export const canAssignDemos = (session: Session | null): boolean => {
  if (!session?.user?.role) {
    return false;
  }
  return session.user.role === "admin" || session.user.role === "sales";
};

