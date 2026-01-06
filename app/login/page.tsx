"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Sparkles, Shield, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Componente para el logo - versión simplificada (igual que navigation.tsx)
function LogoImage() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-run.png"
        alt="RUN Logo"
        className="w-full h-full object-contain drop-shadow-2xl"
      />
    </div>
  );
}

// Componente para el logo móvil
function LogoImageMobile() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-run.png"
        alt="RUN Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // SOLUCIÓN DEFINITIVA: Si ya hay sesión autenticada, forzar redirección inmediata
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      router.replace(callbackUrl);
    }
  }, [status, session, router, searchParams]);

  // Track mouse position for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // SOLUCIÓN DEFINITIVA: Usar signIn con callbackUrl para redirección automática
      const callbackUrl = searchParams.get("callbackUrl") || "/";

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(t("message.error"));
        setLoading(false);
      } else if (result?.ok) {
        // Login exitoso - redirigir inmediatamente usando router.replace
        router.replace(callbackUrl);
      }
    } catch (err) {
      setError(t("message.error"));
      setLoading(false);
    }
  };

  return (
    <div className="login-page h-screen w-screen relative flex overflow-hidden bg-charcoal-950 m-0 p-0">
      {/* Language and Theme Toggles - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="fixed top-6 right-6 z-50 flex items-center gap-3"
      >
        {/* Language Toggle with custom styling for login */}
        <div className="login-toggle-wrapper">
          <div className="login-language-toggle">
            <LanguageToggle />
          </div>
        </div>
        
        {/* Theme Toggle with custom styling for login */}
        <div className="login-toggle-wrapper">
          <div className="login-theme-toggle">
            <ThemeToggle />
          </div>
        </div>
      </motion.div>

      {/* Left Side - Brand Experience */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-16 overflow-hidden login-left-side"
      >
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 login-gradient-bg" />
        
        {/* Animated Mesh Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(16, 117, 224, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(45, 136, 232, 0.15) 0%, transparent 70%)
            `,
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        />

        {/* Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-corporate-300/20 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg text-center">
          {/* Logo with Premium Effect */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12"
          >
            <div className="relative inline-block">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-corporate-400/40 blur-2xl rounded-3xl scale-150" />
              
              {/* Logo Container */}
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                  <LogoImage />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Brand Message */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-5xl font-black tracking-tight text-white mb-4">
              RUN <span className="text-corporate-300">DEMO-HUB</span>
            </h1>
            
            <p className="text-xl text-white/90 font-medium leading-relaxed">
              {t("login.branding.title")}<br />
              <span className="text-white/70">{t("login.branding.subtitle")}</span>
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              {[
                { icon: Shield, text: t("login.branding.secure") },
                { icon: Zap, text: t("login.branding.fast") },
                { icon: Sparkles, text: t("login.branding.premium") },
              ].map((feature, idx) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + idx * 0.1, duration: 0.4 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white/90 text-sm font-medium"
                >
                  <feature.icon className="w-4 h-4" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 lg:w-[45%] flex items-center justify-center p-8 lg:p-16 login-right-side relative"
      >
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Card with Premium Glass Effect */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-corporate-500/20 via-corporate-400/10 to-transparent rounded-2xl blur-xl opacity-50" />
            
            {/* Main Card */}
            <div className="relative login-card bg-charcoal-900/80 backdrop-blur-2xl rounded-2xl border border-charcoal-700/50 p-10 shadow-2xl">
              {/* Mobile Logo (only visible on mobile) */}
              <div className="lg:hidden mb-8 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-corporate-500/20 blur-xl rounded-2xl" />
                  <div className="relative bg-charcoal-800/50 backdrop-blur-md rounded-2xl p-6 border border-charcoal-700/50">
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <LogoImageMobile />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white mt-4 tracking-tight">
                  RUN <span className="text-corporate-400">DEMO-HUB</span>
                </h2>
              </div>

              {/* Desktop Header */}
              <div className="hidden lg:block mb-8">
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                  {t("login.title")}
                </h2>
                <p className="text-slate-400 text-sm">
                  {t("login.subtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-center gap-3 text-error"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-300 block mb-2">
                    {t("common.email")}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t("login.emailPlaceholder")}
                    size="lg"
                    fullWidth
                    leftIcon={<Mail className="w-5 h-5" />}
                    className="bg-charcoal-800/50 border-charcoal-700/50 text-white placeholder:text-slate-500 focus:border-corporate-500 focus:ring-corporate-500/20 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-300 block mb-2">
                    {t("common.password")}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder={t("login.passwordPlaceholder")}
                      size="lg"
                      fullWidth
                      leftIcon={<Lock className="w-5 h-5" />}
                      className="bg-charcoal-800/50 border-charcoal-700/50 text-white placeholder:text-slate-500 focus:border-corporate-500 focus:ring-corporate-500/20 dark:text-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors z-10"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  leftIcon={!loading && <LogIn className="w-5 h-5" />}
                  className="w-full bg-gradient-to-r from-corporate-600 to-corporate-500 hover:from-corporate-500 hover:to-corporate-400 text-white font-semibold shadow-lg shadow-corporate-500/25 hover:shadow-corporate-500/40 transition-all duration-300"
                >
                  {loading ? t("login.loggingIn") : t("login.button")}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-charcoal-700/50 dark:border-charcoal-700/50 light:border-gray-200 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-600">
                  {t("login.copyright")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-charcoal-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-corporate-500"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
