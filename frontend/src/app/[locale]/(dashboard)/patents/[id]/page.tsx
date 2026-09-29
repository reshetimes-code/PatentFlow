"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSweetAlert } from "@/hooks/use-sweet-alert";
import {
  getInvention,
  listInventors,
  confirmInventor,
  getProvisional,
  generateProvisionalDraft,
  updateProvisionalSection,
  approveProvisional,
  recordFiling,
  downloadProvisionalPdf,
  getDashboard,
  getAuditLog,
  type ApprovalChecklist,
} from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-client";
import { INVENTION_STATUS_LABELS, PROVISIONAL_SECTION_KEYS } from "@/lib/types";
import {
  ArrowLeft,
  FileText,
  Download,
  Sparkles,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  ShieldCheck,
  History,
} from "lucide-react";

const CHECKLIST_ITEMS: { key: keyof ApprovalChecklist }[] = [
  { key: "reviewed_inventor_information" },
  { key: "reviewed_invention_description" },
  { key: "reviewed_drawings" },
  { key: "reviewed_claims" },
  { key: "reviewed_filing_information" },
  { key: "authorize_submission" },
];

export default function PatentDetailPage() {
  const t = useTranslations("patentDetail");
  const params = useParams();
  const id = params.id as string;
  const alert = useSweetAlert();
  const queryClient = useQueryClient();

  const inventionQuery = useQuery({ queryKey: ["invention", id], queryFn: () => getInvention(id) });
  const inventorsQuery = useQuery({ queryKey: ["inventors", id], queryFn: () => listInventors(id) });
  const provisionalQuery = useQuery({
    queryKey: ["provisional", id],
    queryFn: () => getProvisional(id),
    retry: false,
  });
  const dashboardQuery = useQuery({ queryKey: ["dashboard", id], queryFn: () => getDashboard(id) });
  const auditQuery = useQuery({ queryKey: ["audit", id], queryFn: () => getAuditLog(id) });

  const draftMutation = useMutation({
    mutationFn: () => generateProvisionalDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provisional", id] });
      queryClient.invalidateQueries({ queryKey: ["invention", id] });
    },
    onError: (err) => alert.error(t("error"), apiErrorMessage(err)),
  });

  if (inventionQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const invention = inventionQuery.data;
  if (!invention) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Link href="/patents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          {t("backToPatents")}
        </Link>
        <div className="text-center py-20">
          <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-foreground">{t("notFound")}</h2>
        </div>
      </div>
    );
  }

  const provisional = provisionalQuery.data;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <Link href="/patents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        {t("backToPatents")}
      </Link>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge>{INVENTION_STATUS_LABELS[invention.status] || invention.status}</Badge>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{invention.title}</h1>
        {invention.short_summary && (
          <p className="text-muted-foreground mt-2 leading-relaxed">{invention.short_summary}</p>
        )}
      </motion.div>

      <Tabs defaultValue="overview">
        <TabsList variant="line" className="mb-6 overflow-x-auto no-scrollbar">
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="provisional">{t("tabs.provisional")}</TabsTrigger>
          <TabsTrigger value="filing">{t("tabs.filing")}</TabsTrigger>
          <TabsTrigger value="audit">{t("tabs.audit")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">{t("problemSolved")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {invention.problem_solved || t("noneYet")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">{t("structuredRecord")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {Object.entries(invention.structured_record).every(([, v]) => v.length === 0) ? (
                    <p className="text-sm text-muted-foreground">{t("noneYet")}</p>
                  ) : (
                    Object.entries(invention.structured_record).map(([topic, facts]) =>
                      facts.length === 0 ? null : (
                        <div key={topic}>
                          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                            {topic.replace(/_/g, " ")}
                          </p>
                          <ul className="list-disc ps-5 space-y-0.5">
                            {facts.map((f) => (
                              <li key={f.id} className="text-sm text-foreground">
                                {f.value}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )
                  )}
                </CardContent>
              </Card>

              {invention.interview_status !== "READY_FOR_PROVISIONAL_DRAFT" && (
                <Link href="/patents/new">
                  <Button variant="outline" className="w-full">
                    {t("continueInterview")}
                  </Button>
                </Link>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">{t("inventors")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(inventorsQuery.data || []).map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{inv.full_name}</p>
                        {inv.contribution_description && (
                          <p className="text-xs text-muted-foreground truncate">{inv.contribution_description}</p>
                        )}
                      </div>
                      {inv.confirmed_by_user ? (
                        <Badge variant="outline" className="text-success border-success/30 text-[10px] shrink-0">
                          <CheckCircle2 className="h-3 w-3 me-1" />
                          {t("confirmed")}
                        </Badge>
                      ) : (
                        <InventorConfirmButton inventionId={id} inventorId={inv.id} />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">{t("details")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("field")}</p>
                    <p className="text-foreground">{invention.technical_field || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("created")}</p>
                    <p className="text-foreground">{new Date(invention.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="provisional">
          {!provisional ? (
            <Card>
              <CardContent className="py-10 text-center space-y-4">
                <Sparkles className="h-8 w-8 text-gold-500 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {invention.interview_status === "READY_FOR_PROVISIONAL_DRAFT"
                    ? t("noDraftReady")
                    : t("noDraftNotReady")}
                </p>
                {invention.interview_status === "READY_FOR_PROVISIONAL_DRAFT" && (
                  <Button
                    onClick={() => draftMutation.mutate()}
                    disabled={draftMutation.isPending}
                    className="bg-gradient-gold text-brand-900 font-semibold"
                  >
                    {draftMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("generateDraft")}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <ProvisionalPanel inventionId={id} inventionTitle={invention.title} />
          )}
        </TabsContent>

        <TabsContent value="filing">
          <FilingPanel dashboard={dashboardQuery.data} loading={dashboardQuery.isLoading} />
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {(auditQuery.data || []).map((entry) => (
                  <div key={entry.id} className="px-4 py-3 flex items-start gap-3">
                    <History className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{entry.action}</span>{" "}
                        <span className="text-muted-foreground">· {entry.entity_type}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {(auditQuery.data || []).length === 0 && (
                  <p className="text-sm text-muted-foreground px-4 py-6 text-center">{t("noneYet")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InventorConfirmButton({ inventionId, inventorId }: { inventionId: string; inventorId: string }) {
  const t = useTranslations("patentDetail");
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (confirmed: boolean) => confirmInventor(inventionId, inventorId, confirmed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inventors", inventionId] }),
  });
  return (
    <Button
      size="xs"
      variant="outline"
      onClick={() => mutation.mutate(true)}
      disabled={mutation.isPending}
      className="shrink-0 text-[10px]"
    >
      {t("confirmInventor")}
    </Button>
  );
}

function ProvisionalPanel({ inventionId, inventionTitle }: { inventionId: string; inventionTitle: string }) {
  const t = useTranslations("patentDetail");
  const alert = useSweetAlert();
  const queryClient = useQueryClient();
  const { data: provisional } = useQuery({
    queryKey: ["provisional", inventionId],
    queryFn: () => getProvisional(inventionId),
  });
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [checklist, setChecklist] = useState<ApprovalChecklist>({
    reviewed_inventor_information: false,
    reviewed_invention_description: false,
    reviewed_drawings: false,
    reviewed_claims: false,
    reviewed_filing_information: false,
    authorize_submission: false,
  });
  const [filingDate, setFilingDate] = useState("");
  const [applicationNumber, setApplicationNumber] = useState("");

  const regenerateMutation = useMutation({
    mutationFn: () => generateProvisionalDraft(inventionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["provisional", inventionId] }),
    onError: (err) => alert.error(t("error"), apiErrorMessage(err)),
  });

  const saveSectionMutation = useMutation({
    mutationFn: ({ key, content }: { key: string; content: string }) =>
      updateProvisionalSection(inventionId, key, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["provisional", inventionId] }),
    onError: (err) => alert.error(t("error"), apiErrorMessage(err)),
  });

  const approveMutation = useMutation({
    mutationFn: () => approveProvisional(inventionId, checklist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provisional", inventionId] });
      alert.success(t("approved"), t("approvedText"));
    },
    onError: (err) => alert.error(t("error"), apiErrorMessage(err)),
  });

  const filingMutation = useMutation({
    mutationFn: () => recordFiling(inventionId, filingDate, applicationNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provisional", inventionId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", inventionId] });
      alert.success(t("filingRecorded"), t("filingRecordedText"));
    },
    onError: (err) => alert.error(t("error"), apiErrorMessage(err)),
  });

  if (!provisional) return null;

  const sectionsMap = Object.fromEntries(provisional.sections.map((s) => [s.section_key, s]));
  const canEdit = provisional.status === "PROVISIONAL_DRAFT" || provisional.status === "PROVISIONAL_REVIEW";
  const canApprove = canEdit && provisional.completeness_report?.passed;
  const canFile = provisional.status === "PROVISIONAL_APPROVED";

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className={`h-5 w-5 ${provisional.completeness_report?.passed ? "text-success" : "text-warning"}`} />
            <div>
              <p className="text-sm font-medium text-foreground">
                {provisional.completeness_report?.passed ? t("completenessPassed") : t("completenessPending")}
              </p>
              <p className="text-xs text-muted-foreground">{t(`provisionalStatus.${provisional.status}`)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadProvisionalPdf(
                  inventionId,
                  `provisional-${inventionTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) || inventionId}.pdf`
                )
              }
            >
              <Download className="h-4 w-4 me-1" />
              {t("export")}
            </Button>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => regenerateMutation.mutate()}
                disabled={regenerateMutation.isPending}
              >
                {regenerateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("regenerate")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {PROVISIONAL_SECTION_KEYS.map((key) => {
        const section = sectionsMap[key];
        const value = editing[key] ?? section?.content ?? "";
        const check = provisional.completeness_report?.sections[key];
        return (
          <Card key={key}>
            <CardHeader className="border-b flex-row items-center justify-between">
              <CardTitle className="text-sm">{t(`sectionNames.${key}`)}</CardTitle>
              {check && (
                <Badge variant="outline" className={check.ok ? "text-success border-success/30" : "text-warning border-warning/30"}>
                  {check.word_count} / {check.min_required} {t("words")}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-2 pt-3">
              <textarea
                value={value}
                onChange={(e) => setEditing((prev) => ({ ...prev, [key]: e.target.value }))}
                rows={key === "detailed_description" ? 10 : 4}
                disabled={!canEdit}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm leading-relaxed transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y dark:bg-input/30 disabled:opacity-70"
              />
              {canEdit && editing[key] !== undefined && editing[key] !== section?.content && (
                <Button
                  size="sm"
                  onClick={() => saveSectionMutation.mutate({ key, content: editing[key] })}
                  disabled={saveSectionMutation.isPending}
                >
                  {saveSectionMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t("saveSection")}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}

      {canEdit && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">{t("finalReview")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {CHECKLIST_ITEMS.map(({ key }) => (
              <label key={key} className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist[key]}
                  onChange={(e) => setChecklist((prev) => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 rounded border-input"
                />
                {t(`checklist.${key}`)}
              </label>
            ))}
            {!provisional.completeness_report?.passed && (
              <p className="text-xs text-warning">{t("completenessBlocksApproval")}</p>
            )}
            <Button
              onClick={() => approveMutation.mutate()}
              disabled={!canApprove || !Object.values(checklist).every(Boolean) || approveMutation.isPending}
              className="w-full bg-gradient-gold text-brand-900 font-semibold hover:shadow-glow-gold"
            >
              {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("authorizeSubmission")}
            </Button>
          </CardContent>
        </Card>
      )}

      {canFile && (
        <Card className="border-gold-500/30 bg-gold-500/5">
          <CardHeader className="border-b">
            <CardTitle className="text-base">{t("recordFilingTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <p className="text-xs text-muted-foreground">{t("recordFilingHint")}</p>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">{t("filingDate")}</label>
              <Input type="date" value={filingDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilingDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">{t("applicationNumber")}</label>
              <Input
                value={applicationNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApplicationNumber(e.target.value)}
                placeholder="63/XXX,XXX"
              />
            </div>
            <Button
              onClick={() => filingMutation.mutate()}
              disabled={!filingDate || !applicationNumber || filingMutation.isPending}
              className="w-full bg-gradient-gold text-brand-900 font-semibold"
            >
              {filingMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("recordFiling")}
            </Button>
          </CardContent>
        </Card>
      )}

      {provisional.status === "PROVISIONAL_FILED" && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            <p className="text-sm text-foreground">
              {t("filedSummary", {
                date: provisional.filing_date || "",
                number: provisional.application_number || "",
              })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FilingPanel({
  dashboard,
  loading,
}: {
  dashboard?: import("@/lib/types").Dashboard;
  loading: boolean;
}) {
  const t = useTranslations("patentDetail");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!dashboard?.filing_date) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t("noFilingYet")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-gold-500/30 bg-gold-500/5">
        <CardContent className="py-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("filed")}</p>
              <p className="text-sm font-semibold text-foreground">{dashboard.filing_date}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("twelveMonthDate")}</p>
              <p className="text-sm font-semibold text-foreground">{dashboard.twelve_month_date}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("daysRemaining")}</p>
              <p className="text-2xl font-bold text-gradient-gold">{dashboard.days_remaining}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t("upcomingDeadlines")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {dashboard.upcoming_deadlines.map((d) => (
              <div key={d.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-foreground">{d.label}</p>
                    <p className="text-xs text-muted-foreground">{d.source}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">{d.due_date}</span>
              </div>
            ))}
            {dashboard.upcoming_deadlines.length === 0 && (
              <p className="text-sm text-muted-foreground px-4 py-6 text-center">
                <Circle className="h-3 w-3 inline me-1" />
                {t("noneYet")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
