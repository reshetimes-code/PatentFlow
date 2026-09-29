"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Lightbulb, Bot, ClipboardCheck, Rocket } from "lucide-react";

const steps = [
  { key: "step1", icon: Lightbulb, color: "text-blue-400 bg-blue-500/10" },
  { key: "step2", icon: Bot, color: "text-gold-400 bg-gold-500/10" },
  { key: "step3", icon: ClipboardCheck, color: "text-green-400 bg-green-500/10" },
  { key: "step4", icon: Rocket, color: "text-purple-400 bg-purple-500/10" },
] as const;

export function HowItWorksSection() {
  const t = useTranslations("howItWorks");

  return (
    <section id="how-it-works" className="bg-muted/50 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("sectionTitle")}
          subtitle={t("sectionSubtitle")}
        />

        <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-16 hidden h-0.5 bg-gradient-to-r from-transparent via-border to-transparent lg:block" />

          {steps.map(({ key, icon: Icon, color }, i) => (
            <ScrollReveal key={key} delay={i * 0.15}>
              <div className="relative flex flex-col items-center text-center">
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-background px-2 text-xs font-bold text-muted-foreground">
                  0{i + 1}
                </div>

                {/* Icon */}
                <div className={`mb-6 rounded-2xl p-4 ${color}`}>
                  <Icon className="h-8 w-8" />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`${key}.description`)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
