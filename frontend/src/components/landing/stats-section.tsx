"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

const statKeys = [
  { key: "costSaving", valueKey: "costValue" },
  { key: "filingTime", valueKey: "timeValue" },
  { key: "patentsFiled", valueKey: "patentsValue" },
  { key: "satisfaction", valueKey: "satisfactionValue" },
] as const;

export function StatsSection() {
  const t = useTranslations("stats");

  return (
    <section className="relative overflow-hidden bg-gradient-premium py-20 md:py-24">
      {/* Decorative elements */}
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gold-500/10 blur-[100px]" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-brand-300/10 blur-[100px]" />

      <div className="container relative mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {statKeys.map(({ key, valueKey }, i) => (
            <ScrollReveal key={key} delay={i * 0.1}>
              <div className="text-center">
                <div className="text-4xl font-bold text-gradient-gold md:text-5xl">
                  {t(valueKey)}
                </div>
                <p className="mt-2 text-sm font-medium text-neutral-300 md:text-base">
                  {t(key)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
