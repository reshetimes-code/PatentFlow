"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listInventions } from "@/lib/api";
import { INVENTION_STATUS_LABELS } from "@/lib/types";
import {
  Search,
  PlusCircle,
  Eye,
  FileText,
  Loader2,
  Grid3X3,
  List,
} from "lucide-react";

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT_INVENTION: "secondary",
  AI_INTERVIEW: "secondary",
  INVENTION_RECORD_COMPLETE: "default",
  PROVISIONAL_DRAFT: "default",
  PROVISIONAL_REVIEW: "default",
  PROVISIONAL_APPROVED: "outline",
  PROVISIONAL_FILED: "outline",
  "12_MONTH_WINDOW_ACTIVE": "outline",
};

export default function PatentsPage() {
  const t = useTranslations("portfolio");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const { data: inventions, isLoading } = useQuery({
    queryKey: ["inventions"],
    queryFn: listInventions,
  });

  const filtered = (inventions || []).filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <Link href="/patents/new">
          <Button className="bg-gradient-gold text-brand-900 font-semibold hover:shadow-glow-gold transition-shadow">
            <PlusCircle className="h-4 w-4 me-2" />
            {t("newPatent")}
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="ps-9 h-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">{t("empty.title")}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t("empty.subtitle")}</p>
          <Link href="/patents/new">
            <Button className="bg-gradient-gold text-brand-900 font-semibold">
              <PlusCircle className="h-4 w-4 me-2" />
              {t("newPatent")}
            </Button>
          </Link>
        </motion.div>
      ) : viewMode === "list" ? (
        <Card>
          <CardContent className="p-0">
            <div className="hidden lg:grid grid-cols-[1fr_160px_120px_50px] gap-4 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
              <span>{t("table.patent")}</span>
              <span>{t("table.status")}</span>
              <span>{t("table.updated")}</span>
              <span></span>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((patent) => (
                <div key={patent.id} className="px-4 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="hidden lg:grid grid-cols-[1fr_160px_120px_50px] gap-4 items-center">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{patent.title}</p>
                      {patent.short_summary && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{patent.short_summary}</p>
                      )}
                    </div>
                    <Badge variant={STATUS_BADGE_VARIANT[patent.status] || "secondary"} className="w-fit text-[10px]">
                      {INVENTION_STATUS_LABELS[patent.status] || patent.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(patent.updated_at).toLocaleDateString()}
                    </span>
                    <Link href={`/patents/${patent.id}`}>
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="lg:hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Badge variant={STATUS_BADGE_VARIANT[patent.status] || "secondary"} className="text-[10px] mb-1">
                          {INVENTION_STATUS_LABELS[patent.status] || patent.status}
                        </Badge>
                        <p className="text-sm font-medium text-foreground">{patent.title}</p>
                      </div>
                      <Link href={`/patents/${patent.id}`}>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground shrink-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((patent) => (
            <Card key={patent.id} className="hover:shadow-premium-md transition-all hover:-translate-y-0.5">
              <CardContent className="space-y-3">
                <Badge variant={STATUS_BADGE_VARIANT[patent.status] || "secondary"} className="text-[10px] w-fit">
                  {INVENTION_STATUS_LABELS[patent.status] || patent.status}
                </Badge>
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 min-h-[2.5rem]">{patent.title}</h3>
                {patent.short_summary && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{patent.short_summary}</p>
                )}
                <Link href={`/patents/${patent.id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Eye className="h-3 w-3 me-1" />
                    {t("view")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
