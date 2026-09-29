"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  const t = useTranslations("cta");

  return (
    <section className="relative overflow-hidden bg-gradient-hero dark:bg-gradient-hero-dark py-20 md:py-28">
      {/* Decorative */}
      <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-gold-500/10 blur-[100px]" />
      <div className="absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-brand-300/10 blur-[100px]" />

      <div className="container relative mx-auto px-4 text-center">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gold-500/10 px-4 py-1.5 text-sm font-medium text-gold-400">
              <Sparkles className="h-4 w-4" />
              AI-Powered
            </div>
            <h2 className="text-3xl font-bold text-white md:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-lg text-neutral-300">{t("subtitle")}</p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-gradient-gold px-8 py-6 text-base font-semibold text-brand-900 transition-shadow hover:shadow-glow-gold"
              >
                {t("button")} <ArrowRight className="ms-2 h-5 w-5" />
              </Button>
            </div>
            <p className="mt-4 text-sm text-neutral-400">{t("noCard")}</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
