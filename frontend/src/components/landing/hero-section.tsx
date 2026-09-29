"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import {
  ArrowRight,
  Play,
} from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  const t = useTranslations("hero");
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, 80]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-hero dark:bg-gradient-hero-dark">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          style={{ y: y1 }}
          className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gold-500/10 blur-[100px]"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-brand-400/10 blur-[100px]"
        />
        <motion.div
          style={{ y: y1 }}
          className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-brand-300/5 blur-[80px]"
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto flex min-h-screen items-center px-4 pt-20">
        <div className="mx-auto max-w-3xl">
          {/* Eagle Logo - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 scale-110 rounded-full bg-gold-500/20 blur-[60px]" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/images/logoNoText.png"
                  alt="PatentFlow Eagle"
                  width={472}
                  height={483}
                  className="relative z-10 h-[180px] md:h-[250px] w-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Text Content */}
          <div className="flex flex-col justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-gold-400 hover:bg-gold-500/20">
                {t("badge")}
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {t("title")}{" "}
              <span className="text-gradient-gold">{t("titleHighlight")}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-300 md:text-xl"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-gradient-gold px-8 py-6 text-base font-semibold text-brand-900 transition-shadow hover:shadow-glow-gold"
                >
                  {t("cta")}{" "}
                  <ArrowRight className="ms-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 px-8 py-6 text-base text-white hover:bg-white/10"
              >
                <Play className="me-2 h-5 w-5" /> {t("ctaSecondary")}
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4"
            >
              <AnimatedCounter
                end={85}
                suffix="%"
                label={t("stats.costSaving")}
              />
              <AnimatedCounter
                end={10}
                suffix="x"
                label={t("stats.timeSaved")}
              />
              <AnimatedCounter
                end={94}
                suffix="%"
                label={t("stats.successRate")}
              />
              <AnimatedCounter
                end={12500}
                suffix="+"
                label={t("stats.patents")}
              />
            </motion.div>
          </div>

        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
