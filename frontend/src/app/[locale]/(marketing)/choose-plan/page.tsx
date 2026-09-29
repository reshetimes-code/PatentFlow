"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crown,
  Zap,
  Building2,
  ArrowRight,
  Sparkles,
  Globe,
} from "lucide-react";
import Image from "next/image";

const PLANS = [
  {
    key: "free",
    icon: Zap,
    price: "0",
    popular: false,
    features: 5,
  },
  {
    key: "pro",
    icon: Crown,
    price: "99",
    annualPrice: "79",
    popular: true,
    features: 7,
  },
  {
    key: "business",
    icon: Building2,
    price: "299",
    annualPrice: "239",
    popular: false,
    features: 8,
  },
] as const;

export default function ChoosePlanPage() {
  const t = useTranslations("pricing");
  const tc = useTranslations("choosePlan");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [annual, setAnnual] = useState(false);
  const [selected, setSelected] = useState<string>("pro");

  const handleContinue = () => {
    router.push("/patents/new");
  };

  return (
    <div className="relative min-h-screen bg-gradient-hero dark:bg-gradient-hero-dark overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gold-500/10 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-brand-400/10 blur-[100px]" />
      </div>

      <button
        type="button"
        onClick={() => router.replace(pathname, { locale: locale === "en" ? "he" : "en" })}
        className="absolute top-4 end-4 z-20 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        {locale === "en" ? "עברית" : "English"}
      </button>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Image
            src="/images/logoNoText.png"
            alt="PatentFlow"
            width={60}
            height={60}
            className="mx-auto h-15 w-auto mb-4"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {tc("title")}
          </h1>
          <p className="text-neutral-400 max-w-lg mx-auto">
            {tc("subtitle")}
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm ${!annual ? "text-white" : "text-neutral-400"}`}>
              {t("monthly")}
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                annual ? "bg-gold-500" : "bg-white/20"
              }`}
            >
              <div
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  annual ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className={`text-sm ${annual ? "text-white" : "text-neutral-400"}`}>
              {t("annual")}
            </span>
            {annual && (
              <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 text-xs">
                {t("annualSave")}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Plans Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid gap-4 sm:gap-5 md:grid-cols-3 mb-8"
        >
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selected === plan.key;
            const price = annual && "annualPrice" in plan && plan.annualPrice ? plan.annualPrice : plan.price;
            const features: string[] = t.raw(`${plan.key}.features`) as string[];

            return (
              <button
                key={plan.key}
                onClick={() => setSelected(plan.key)}
                className="text-start"
              >
                <Card
                  className={`relative transition-all h-full ${
                    isSelected
                      ? "border-gold-500 ring-2 ring-gold-500/30 bg-white/10 shadow-glow-gold"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 inset-x-0 flex justify-center">
                      <Badge className="bg-gradient-gold text-brand-900 font-semibold text-xs px-3">
                        <Sparkles className="h-3 w-3 me-1" />
                        {t("popular")}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isSelected ? "bg-gold-500/20" : "bg-white/10"
                      }`}>
                        <Icon className={`h-4 w-4 ${isSelected ? "text-gold-400" : "text-neutral-400"}`} />
                      </div>
                      <CardTitle className="text-white text-base">
                        {t(`${plan.key}.name`)}
                      </CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1">
                      {price !== "0" && <span className="text-neutral-400 text-sm">$</span>}
                      <span className="text-3xl font-bold text-white">
                        {price === "0" ? tc("free") : price}
                      </span>
                      {price !== "0" && (
                        <span className="text-neutral-400 text-sm">{t("perMonth")}</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      {t(`${plan.key}.description`)}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-300">
                          <Check className={`h-4 w-4 shrink-0 mt-0.5 ${
                            isSelected ? "text-gold-400" : "text-neutral-500"
                          }`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Button
            onClick={handleContinue}
            size="lg"
            className="bg-gradient-gold px-10 py-6 text-base font-semibold text-brand-900 hover:shadow-glow-gold transition-shadow"
          >
            {tc("continue")}
            <ArrowRight className="ms-2 h-5 w-5" />
          </Button>
          <p className="text-xs text-neutral-500 mt-3">{tc("changeLater")}</p>
        </motion.div>
      </div>
    </div>
  );
}
