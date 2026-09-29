"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/section-heading";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const t = useTranslations("faq");
  const items = t.raw("items") as Array<{
    question: string;
    answer: string;
  }>;

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto max-w-3xl px-4">
        <SectionHeading
          title={t("sectionTitle")}
          subtitle={t("sectionSubtitle")}
        />

        <ScrollReveal>
          <Accordion className="space-y-4">
            {items.map((item, i) => (
              <AccordionItem
                key={i}
                className="rounded-xl border border-border/50 bg-card px-6 data-[open]:border-gold-500/30 data-[open]:shadow-[var(--shadow-premium-sm)]"
              >
                <AccordionTrigger className="text-start text-base font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}
