"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  FileText,
  Search,
  Scale,
  PenTool,
  Send,
  LayoutDashboard,
} from "lucide-react";

const featureKeys = [
  { key: "aiDrafting", icon: FileText },
  { key: "priorArt", icon: Search },
  { key: "claimsGen", icon: Scale },
  { key: "drawings", icon: PenTool },
  { key: "filing", icon: Send },
  { key: "portfolio", icon: LayoutDashboard },
] as const;

export function FeaturesSection() {
  const t = useTranslations("features");

  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("sectionTitle")}
          subtitle={t("sectionSubtitle")}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map(({ key, icon: Icon }, i) => (
            <ScrollReveal key={key} delay={i * 0.1}>
              <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-gold-500/30 hover:shadow-premium-lg">
                {/* Glow effect on hover */}
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gold-500/0 blur-[60px] transition-all duration-500 group-hover:bg-gold-500/10" />

                <div className="relative">
                  <div className="mb-4 inline-flex rounded-xl bg-brand-500/10 p-3 text-brand-400 dark:bg-gold-500/10 dark:text-gold-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`${key}.description`)}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
