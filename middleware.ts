import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 
    (process.env.NODE_ENV === "development" ? "development-secret-key-minimum-32-characters-long-for-nextauth-v5" : undefined);
  
  const token = await getToken({ 
    req, 
    secret
  });
  const path = req.nextUrl.pathname;

  // Permitir archivos estáticos (imágenes, fuentes, etc.)
  const staticExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif', '.woff', '.woff2', '.ttf', '.eot', '.css', '.js', '.map'];
  if (staticExtensions.some(ext => path.toLowerCase().endsWith(ext))) {
    return NextResponse.next();
  }

  // Rutas públicas (login y demos públicos)
  if (path === "/login") {
    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Permitir acceso público a demos compartidos
  if (path.startsWith("/demo/") && path.includes("/public")) {
    return NextResponse.next();
  }

  // Si no hay token y no es login, redirigir a login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // Protección de rutas por rol
  const role = token.role as string;

  // Rutas solo para admin, manager, sales (no buyers)
  const restrictedPaths = ["/users", "/leads", "/analytics"];
  if (restrictedPaths.some((p) => path.startsWith(p))) {
    if (role === "buyer") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|woff|woff2|ttf|eot|css|js|map)$).*)",
  ],
};

