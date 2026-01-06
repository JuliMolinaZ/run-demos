import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "sales" | "buyer";
      profilePicture?: string | null;
      company?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin" | "sales" | "buyer";
    profilePicture?: string | null;
    company?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "sales" | "buyer";
    id: string;
    email: string;
    profilePicture?: string | null;
    company?: string | null;
  }
}

