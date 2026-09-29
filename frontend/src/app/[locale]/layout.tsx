import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Inter, Heebo } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew"],
  variable: "--font-heebo",
  display: "swap",
});

const DIRECTION_MAP: Record<string, "ltr" | "rtl"> = {
  en: "ltr",
  he: "rtl",
};

export const metadata: Metadata = {
  title: {
    default: "PatentFlow — AI-Powered Patent Filing Platform",
    template: "%s | PatentFlow",
  },
  description:
    "Transform your ideas into protected patents. AI-powered patent drafting, prior art search, and direct USPTO filing. Save up to 85% compared to law firms.",
  keywords: [
    "patent filing",
    "USPTO",
    "AI patent",
    "patent drafting",
    "prior art search",
    "patent application",
    "intellectual property",
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = DIRECTION_MAP[locale] ?? "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${heebo.variable} ${dir === "rtl" ? "font-hebrew" : "font-sans"} min-h-screen antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <QueryProvider>{children}</QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
