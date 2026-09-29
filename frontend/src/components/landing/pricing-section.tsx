"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const planKeys = ["free", "pro", "business", "enterprise"] as const;

export function PricingSection() {
  const t = useTranslations("pricing");
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("sectionTitle")}
          subtitle={t("sectionSubtitle")}
        />

        {/* Toggle */}
        <div className="mb-12 flex items-center justify-center gap-4">
          <span
            className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}
          >
            {t("monthly")}
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              annual ? "bg-gold-500" : "bg-muted"
            }`}
          >
            <motion.div
              layout
              className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-md"
              style={{ left: annual ? "calc(100% - 24px)" : "4px" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span
            className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}
          >
            {t("annual")}
          </span>
          {annual && (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
              {t("annualSave")}
            </Badge>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {planKeys.map((plan, i) => {
            const isPro = plan === "pro";
            const isEnterprise = plan === "enterprise";
            const price = isEnterprise
              ? t(`${plan}.price`)
              : annual && !isEnterprise && plan !== "free"
                ? t(`${plan}.annualPrice`)
                : t(`${plan}.price`);
            const features = t.raw(`${plan}.features`) as string[];

            return (
              <ScrollReveal key={plan} delay={i * 0.1}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl border p-8 transition-all duration-300 ${
                    isPro
                      ? "border-gold-500/50 bg-card shadow-premium-lg hover:shadow-glow-gold"
                      : "border-border/50 bg-card hover:border-border hover:shadow-premium-md"
                  }`}
                >
                  {isPro && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gold text-brand-900 font-semibold px-4">
                      {t("popular")}
                    </Badge>
                  )}

                  <h3 className="text-lg font-semibold text-foreground">
                    {t(`${plan}.name`)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`${plan}.description`)}
                  </p>

                  <div className="my-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${plan}-${annual}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-baseline gap-1"
                      >
                        {!isEnterprise && (
                          <span className="text-sm text-muted-foreground">
                            $
                          </span>
                        )}
                        <span className="text-4xl font-bold text-foreground">
                          {price}
                        </span>
                        {!isEnterprise && price !== "0" && (
                          <span className="text-sm text-muted-foreground">
                            {t("perMonth")}
                          </span>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {features.map((feature: string) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      isPro
                        ? "bg-gradient-gold text-brand-900 font-semibold hover:shadow-glow-gold"
                        : isEnterprise
                          ? "bg-brand-500 text-white hover:bg-brand-600"
                          : ""
                    }`}
                    variant={isPro || isEnterprise ? "default" : "outline"}
                  >
                    {plan === "free"
                      ? t("startFree")
                      : isEnterprise
                        ? t("contactSales")
                        : t("choosePlan")}
                  </Button>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
