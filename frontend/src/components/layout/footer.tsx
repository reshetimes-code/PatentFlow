"use client";

import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export function Footer() {
  const t = useTranslations("footer");

  const productLinks = ["features", "howItWorks", "pricing"];
  const legalLinks = [
    { key: "privacy", href: "/privacy" },
    { key: "terms", href: "#" },
    { key: "cookies", href: "#" },
    { key: "disclaimer", href: "#" },
    { key: "accessibility", href: "/accessibility" },
  ];
  const supportLinks = [
    { key: "helpCenter", href: "#" },
    { key: "documentation", href: "#" },
    { key: "status", href: "#" },
  ];

  return (
    <footer className="bg-brand-950 text-neutral-400">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="PatentFlow"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-lg font-bold text-white">
                Patent<span className="text-gradient-gold">Flow</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">{t("description")}</p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t("product")}
            </h3>
            <ul className="space-y-3">
              {productLinks.map((key) => (
                <li key={key}>
                  <a
                    href={`#${key === "howItWorks" ? "how-it-works" : key}`}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {key === "features"
                      ? "Features"
                      : key === "howItWorks"
                        ? "How It Works"
                        : "Pricing"}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t("legal")}
            </h3>
            <ul className="space-y-3">
              {legalLinks.map(({ key, href }) => (
                <li key={key}>
                  <a
                    href={href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t("support")}
            </h3>
            <ul className="space-y-3">
              {supportLinks.map(({ key, href }) => (
                <li key={key}>
                  <a
                    href={href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} PatentFlow. {t("copyright")}
          </p>
          <p className="text-xs italic">{t("legalNote")}</p>
        </div>
      </div>
    </footer>
  );
}
