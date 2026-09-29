"use client";

import { ScrollReveal } from "./scroll-reveal";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export function SectionHeading({
  title,
  subtitle,
  centered = true,
  light = false,
}: SectionHeadingProps) {
  return (
    <ScrollReveal className={`mb-12 md:mb-16 ${centered ? "text-center" : ""}`}>
      <h2
        className={`text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl ${
          light ? "text-white" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mx-auto mt-4 max-w-2xl text-lg ${
            light ? "text-neutral-300" : "text-muted-foreground"
          }`}
        >
          {subtitle}
        </p>
      )}
    </ScrollReveal>
  );
}
