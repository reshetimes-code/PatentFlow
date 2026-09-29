import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "he"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // The product targets the U.S. market first — always default new visitors
  // to English regardless of browser/Accept-Language, rather than having
  // next-intl auto-negotiate a locale from the browser. Anyone can still
  // switch to Hebrew explicitly via the locale switcher; that choice is
  // remembered via the NEXT_LOCALE cookie on the next visit.
  localeDetection: false,
});
