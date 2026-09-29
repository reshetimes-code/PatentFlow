import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accessibility" });
  return { title: t("title") };
}

export default async function AccessibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "accessibility" });

  const sections = [
    "commitment",
    "standards",
    "features",
    "assistiveTech",
    "knownLimitations",
    "feedback",
    "enforcement",
  ] as const;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-950 pt-32 pb-20">
        <div className="container mx-auto max-w-4xl px-4">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            {t("title")}
          </h1>
          <p className="mb-12 text-neutral-400">{t("lastUpdated")}</p>

          <div className="space-y-10">
            <p className="text-neutral-300 leading-relaxed">{t("intro")}</p>

            {sections.map((section) => (
              <section key={section}>
                <h2 className="mb-4 text-2xl font-semibold text-white">
                  {t(`sections.${section}.title`)}
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  {t(`sections.${section}.content`)}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
