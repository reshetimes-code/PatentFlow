"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === "en" ? "he" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLocale}
      className="text-brand-700 dark:text-neutral-300 hover:text-brand-900 dark:hover:text-white hover:bg-brand-100 dark:hover:bg-white/10"
      title={locale === "en" ? "עברית" : "English"}
    >
      <Globe className="h-4 w-4" />
      <span className="ms-1 text-xs font-medium">
        {locale === "en" ? "HE" : "EN"}
      </span>
    </Button>
  );
}
