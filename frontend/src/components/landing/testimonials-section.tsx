"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Quote } from "lucide-react";

export function TestimonialsSection() {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as Array<{
    quote: string;
    author: string;
    role: string;
    avatar: string;
  }>;

  return (
    <section className="bg-muted/50 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("sectionTitle")}
          subtitle={t("sectionSubtitle")}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <div className="relative flex h-full flex-col rounded-2xl border border-border/50 bg-card p-8">
                <Quote className="mb-4 h-8 w-8 text-gold-500/30" />
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-sm font-bold text-brand-900">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.author}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
