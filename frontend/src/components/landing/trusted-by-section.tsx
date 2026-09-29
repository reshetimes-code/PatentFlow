"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const companies = [
  "Stanford University",
  "MIT",
  "Y Combinator",
  "TechStars",
  "500 Startups",
  "Berkeley Law",
];

export function TrustedBySection() {
  const t = useTranslations("trustedBy");

  return (
    <section className="border-b border-border/50 py-12">
      <div className="container mx-auto px-4">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {t("title")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {companies.map((company, i) => (
            <motion.div
              key={company}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-lg font-semibold text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            >
              {company}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
