"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSweetAlert } from "@/hooks/use-sweet-alert";
import { useAuthStore } from "@/stores/auth-store";
import { login as apiLogin, register as apiRegister, googleLogin } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-client";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Globe,
} from "lucide-react";
import Image from "next/image";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const alert = useSweetAlert();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const setAuth = useAuthStore((s) => s.setAuth);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "register" && form.password !== form.confirmPassword) {
      alert.error(t("error"), t("passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const result = await apiRegister(form.fullName, form.email, form.password);
        setAuth(result.access_token, result.user);
        setLoading(false);
        await alert.success(t("registerSuccess"), t("registerSuccessText"));
        router.push("/choose-plan");
        return;
      }

      const result = await apiLogin(form.email, form.password);
      setAuth(result.access_token, result.user);
      router.push("/dashboard");
    } catch (err) {
      setLoading(false);
      alert.error(t("error"), apiErrorMessage(err, "Invalid email or password."));
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setLoading(true);
    try {
      const result = await googleLogin(credential);
      setAuth(result.access_token, result.user);
      router.push("/dashboard");
    } catch (err) {
      setLoading(false);
      alert.error(t("error"), apiErrorMessage(err, "Google sign-in failed."));
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-hero dark:bg-gradient-hero-dark overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gold-500/10 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-brand-400/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Language switcher — always visible so a U.S.-default visitor can opt into Hebrew */}
      <button
        type="button"
        onClick={() => router.replace(pathname, { locale: locale === "en" ? "he" : "en" })}
        className="absolute top-4 end-4 z-20 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        {locale === "en" ? "עברית" : "English"}
      </button>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block">
            <Image
              src="/images/logoNoText.png"
              alt="PatentFlow"
              width={80}
              height={80}
              className="mx-auto h-20 w-auto mb-4"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Patent<span className="text-gradient-gold">Flow</span>
          </h1>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-premium-2xl">
            <CardContent className="p-6 md:p-8">
              {/* Toggle */}
              <div className="flex rounded-xl bg-white/5 p-1 mb-6">
                <button
                  onClick={() => setMode("login")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    mode === "login"
                      ? "bg-gradient-gold text-brand-900 shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {t("login")}
                </button>
                <button
                  onClick={() => setMode("register")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    mode === "register"
                      ? "bg-gradient-gold text-brand-900 shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {t("register")}
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === "register" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "register" ? -20 : 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-white mb-1">
                    {mode === "login" ? t("welcomeBack") : t("createAccount")}
                  </h2>
                  <p className="text-sm text-neutral-400 mb-6">
                    {mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name - Register only */}
                    {mode === "register" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                          {t("fullName")}
                        </label>
                        <div className="relative">
                          <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                          <Input
                            value={form.fullName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateField("fullName", e.target.value)
                            }
                            placeholder={t("fullNamePlaceholder")}
                            className="h-11 ps-10 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus-visible:border-gold-500 focus-visible:ring-gold-500/20"
                            required
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                        {t("email")}
                      </label>
                      <div className="relative">
                        <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("email", e.target.value)
                          }
                          placeholder={t("emailPlaceholder")}
                          className="h-11 ps-10 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus-visible:border-gold-500 focus-visible:ring-gold-500/20"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                        {t("password")}
                      </label>
                      <div className="relative">
                        <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("password", e.target.value)
                          }
                          placeholder="••••••••"
                          className="h-11 ps-10 pe-10 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus-visible:border-gold-500 focus-visible:ring-gold-500/20"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password - Register only */}
                    {mode === "register" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                          {t("confirmPassword")}
                        </label>
                        <div className="relative">
                          <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                          <Input
                            type="password"
                            value={form.confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateField("confirmPassword", e.target.value)
                            }
                            placeholder="••••••••"
                            className="h-11 ps-10 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus-visible:border-gold-500 focus-visible:ring-gold-500/20"
                            required
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Forgot Password - Login only */}
                    {mode === "login" && (
                      <div className="text-end">
                        <button
                          type="button"
                          className="text-xs text-gold-400 hover:text-gold-300 transition-colors"
                        >
                          {t("forgotPassword")}
                        </button>
                      </div>
                    )}

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-gradient-gold text-brand-900 font-semibold hover:shadow-glow-gold transition-shadow"
                    >
                      {loading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
                      ) : (
                        <>
                          {mode === "login" ? t("loginButton") : t("registerButton")}
                          <ArrowRight className="ms-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-transparent px-4 text-neutral-500">
                        {t("orContinueWith")}
                      </span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <div>
                    <GoogleSignInButton onCredential={handleGoogleCredential} />
                  </div>

                  {/* Terms - Register only */}
                  {mode === "register" && (
                    <p className="text-[11px] text-neutral-500 text-center mt-4 leading-relaxed">
                      {t("agreeTerms")}{" "}
                      <Link href="/privacy" className="text-gold-400 hover:underline">
                        {t("termsLink")}
                      </Link>{" "}
                      {t("and")}{" "}
                      <Link href="/privacy" className="text-gold-400 hover:underline">
                        {t("privacyLink")}
                      </Link>
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <Link
            href="/"
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            {t("backToHome")}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
