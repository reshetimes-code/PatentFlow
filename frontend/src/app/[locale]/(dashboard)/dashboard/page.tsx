"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listInventions, getDashboard } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { INVENTION_STATUS_LABELS } from "@/lib/types";
import {
  FileText,
  Clock,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Eye,
  Loader2,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ACTIVE_CLOCK_STATUSES = new Set(["PROVISIONAL_FILED", "12_MONTH_WINDOW_ACTIVE"]);

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const user = useAuthStore((s) => s.user);

  const { data: inventions, isLoading } = useQuery({
    queryKey: ["inventions"],
    queryFn: listInventions,
  });

  const clockInventions = (inventions || []).filter((i) => ACTIVE_CLOCK_STATUSES.has(i.status));

  const { data: dashboards } = useQuery({
    queryKey: ["dashboards", clockInventions.map((i) => i.id)],
    queryFn: () => Promise.all(clockInventions.map((i) => getDashboard(i.id))),
    enabled: clockInventions.length > 0,
  });

  const total = inventions?.length || 0;
  const inProgress = (inventions || []).filter(
    (i) => !["PROVISIONAL_FILED", "12_MONTH_WINDOW_ACTIVE", "FILED", "POST_FILING"].includes(i.status)
  ).length;
  const filed = (inventions || []).filter((i) => ACTIVE_CLOCK_STATUSES.has(i.status) || i.status === "FILED").length;
  const recent = [...(inventions || [])]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t("welcome")}
          {user?.full_name ? <>, <span className="text-gradient-gold">{user.full_name.split(" ")[0]}</span></> : null}
        </h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-3 gap-4 mb-8">
        {[
          { key: "totalPatents", value: total, icon: FileText, color: "text-brand-500 dark:text-brand-400", bg: "bg-brand-500/10" },
          { key: "inProgress", value: inProgress, icon: Clock, color: "text-gold-500 dark:text-gold-400", bg: "bg-gold-500/10" },
          { key: "approved", value: filed, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.key} variants={itemVariants}>
              <Card className="hover:shadow-premium-md transition-shadow">
                <CardContent className="flex items-center gap-3 sm:gap-4">
                  <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">{t(`stats.${stat.key}`)}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {clockInventions.length > 0 && dashboards && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">{t("twelveMonthClocks")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboards.map((d) => (
              <Card key={d.invention_id} className="border-gold-500/30 bg-gold-500/5">
                <CardContent className="py-4 space-y-2">
                  <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-gradient-gold">{d.days_remaining}</span>
                    <span className="text-xs text-muted-foreground">{t("daysRemainingLabel")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("twelveMonthDateLabel")}: {d.twelve_month_date}</p>
                  <Link href={`/patents/${d.invention_id}`}>
                    <Button size="sm" variant="outline" className="w-full mt-1 text-xs">
                      {t("continuePatent")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between border-b">
              <CardTitle className="text-lg">{t("recentPatents")}</CardTitle>
              <Link href="/patents">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  {t("viewAll")} <ArrowRight className="ms-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : recent.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">{t("noPatentsYet")}</p>
              ) : (
                <div className="divide-y divide-border">
                  {recent.map((patent) => (
                    <div key={patent.id} className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {INVENTION_STATUS_LABELS[patent.status] || patent.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">{patent.title}</p>
                      </div>
                      <Link href={`/patents/${patent.id}`}>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">{t("quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/patents/new" className="block">
                <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-500/10">
                    <PlusCircle className="h-4 w-4 text-gold-500" />
                  </div>
                  {t("actions.newPatent")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
