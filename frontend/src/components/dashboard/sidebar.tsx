"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import Image from "next/image";

const NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "myPatents", href: "/patents", icon: FolderOpen },
  { key: "newPatent", href: "/patents/new", icon: PlusCircle },
  { key: "settings", href: "/settings", icon: Settings },
] as const;

function SidebarContent({
  collapsed,
  onToggle,
  pathname,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  pathname: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("dashboard.sidebar");
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const displayName = user?.full_name || user?.email || "";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 md:h-20">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/images/logoNoText.png"
            alt="PatentFlow"
            width={44}
            height={44}
            className="h-11 w-auto"
          />
          {!collapsed && (
            <span className="text-lg font-bold text-brand-900 dark:text-white">
              Patent<span className="text-gradient-gold">Flow</span>
            </span>
          )}
        </Link>
        {onToggle && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden text-muted-foreground hover:text-foreground md:flex"
            onClick={onToggle}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* New Patent CTA */}
      <div className="px-3 pb-2">
        <Link href="/patents/new" onClick={onNavigate}>
          <Button
            className={cn(
              "w-full bg-gradient-gold text-brand-900 font-semibold hover:shadow-glow-gold transition-shadow",
              collapsed && "px-0"
            )}
          >
            <PlusCircle className="h-4 w-4" />
            {!collapsed && <span className="ms-2">{t("newPatent")}</span>}
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-brand-500/10 text-brand-500 dark:bg-gold-500/10 dark:text-gold-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && t(item.key)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border px-3 py-4 space-y-2">
        <div className={cn("flex items-center gap-2", collapsed ? "justify-center" : "")}>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>

        {/* User profile */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5",
            collapsed && "justify-center px-2"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-gold text-brand-900 font-semibold text-sm">
            {initials || "?"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">
                {user?.subscription_tier || ""}
              </p>
            </div>
          )}
        </div>

        {/* Logout */}
        <Link href="/auth" onClick={() => { logout(); onNavigate?.(); }}>
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && t("logout")}
          </button>
        </Link>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-e border-border bg-card transition-all duration-300 h-screen sticky top-0",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          pathname={pathname}
        />
      </aside>

      {/* Mobile Header + Sidebar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/images/logoNoText.png"
            alt="PatentFlow"
            width={36}
            height={36}
            className="h-9 w-auto"
          />
          <span className="text-base font-bold text-brand-900 dark:text-white">
            Patent<span className="text-gradient-gold">Flow</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
            <Bell className="h-4 w-4" />
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-foreground" />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 p-0 bg-card border-border"
            >
              <SidebarContent
                collapsed={false}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
