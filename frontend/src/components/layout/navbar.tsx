"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: t("features") },
    { href: "#how-it-works", label: t("howItWorks") },
    { href: "#pricing", label: t("pricing") },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "glass border-b border-black/5 dark:border-white/10 shadow-premium-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-900 dark:text-white">
            Patent<span className="text-gradient-gold">Flow</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-brand-700 dark:text-neutral-300 transition-colors hover:text-brand-900 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher />
          <ThemeToggle />
          <Link href="/auth">
            <Button
              variant="ghost"
              className="text-brand-700 dark:text-neutral-300 hover:text-brand-900 dark:hover:text-white hover:bg-brand-100 dark:hover:bg-white/10"
            >
              {tc("signIn")}
            </Button>
          </Link>
          <Link href="/auth">
            <Button className="bg-gradient-gold text-brand-900 font-semibold hover:shadow-glow-gold transition-shadow">
              {tc("getStarted")}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher />
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-brand-900 dark:text-white" />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white dark:bg-brand-900 border-brand-200 dark:border-brand-700">
              <nav className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium text-brand-700 dark:text-neutral-300 transition-colors hover:text-brand-900 dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-4 flex flex-col gap-3">
                  <Link href="/auth" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-brand-200 dark:border-white/20 text-brand-900 dark:text-white hover:bg-brand-100 dark:hover:bg-white/10"
                    >
                      {tc("signIn")}
                    </Button>
                  </Link>
                  <Link href="/auth" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-gradient-gold text-brand-900 font-semibold">
                      {tc("getStarted")}
                    </Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
