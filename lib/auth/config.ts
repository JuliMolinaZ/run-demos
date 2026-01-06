import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const config: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Seleccionar todas las columnas necesarias
        const user = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            password: users.password,
            role: users.role,
            profilePicture: users.profilePicture,
            company: users.company,
          })
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        if (user.length === 0) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user[0].password
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user[0].id.toString(),
          email: user[0].email,
          name: user[0].name,
          role: user[0].role,
          profilePicture: user[0].profilePicture || null,
          company: user[0].company || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      // Si es un login inicial, cargar datos del usuario
      if (user) {
        token.id = user.id as string;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.profilePicture = (user as any).profilePicture;
        token.company = (user as any).company;
      }

      // Si se actualiza la sesión (desde update()), usar los nuevos datos
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.profilePicture !== undefined) token.profilePicture = session.profilePicture;
        if (session.company !== undefined) token.company = session.company;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as "admin" | "sales" | "buyer";
        (session.user as any).profilePicture = token.profilePicture;
        (session.user as any).company = token.company;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: (() => {
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
    if (!secret && process.env.NODE_ENV === "development") {
      // Secret de desarrollo (mínimo 32 caracteres requerido por NextAuth v5)
      return "development-secret-key-minimum-32-characters-long-for-nextauth-v5";
    }
    if (!secret) {
      console.warn("⚠️ AUTH_SECRET o NEXTAUTH_SECRET no está configurado. Esto es requerido en producción.");
    }
    return secret;
  })(),
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);

export const authOptions = config;

