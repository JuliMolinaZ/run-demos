import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { OfflineBanner } from "@/components/ui/offline-banner";

export const metadata: Metadata = {
  title: "RUN DEMO-HUB",
  description: "Plataforma Empresarial de Habilitación de Ventas e Inteligencia de Negocios",
  icons: {
    icon: '/logo-run.png',
    apple: '/logo-run.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full overflow-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-white dark:bg-charcoal-950 text-gray-900 dark:text-slate-50 h-full overflow-hidden m-0 p-0" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <Providers>
          <OfflineBanner />
          <Navigation />
          <main className="min-h-screen bg-white dark:bg-charcoal-950 text-gray-900 dark:text-slate-100 pt-20 sm:pt-24 h-full overflow-x-hidden overflow-y-auto [&_.login-page-wrapper]:pt-0 [&_.login-page-wrapper]:mt-0">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

