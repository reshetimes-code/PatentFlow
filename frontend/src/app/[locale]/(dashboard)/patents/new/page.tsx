"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSweetAlert } from "@/hooks/use-sweet-alert";
import {
  createInvention,
  getInterview,
  postInterviewMessage,
  confirmFact,
  generateProvisionalDraft,
} from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-client";
import type { StructuredFact } from "@/lib/types";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Send,
  Sparkles,
  Loader2,
  CheckCircle2,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

const PROVENANCE_STYLE: Record<string, string> = {
  USER_PROVIDED: "text-success border-success/30",
  HUMAN_REVIEWED: "text-success border-success/30",
  DOCUMENT_SUPPORTED: "text-info border-info/30",
  AI_INFERRED: "text-muted-foreground border-border",
  AI_SUGGESTED: "text-warning border-warning/30",
  EXTERNAL_SOURCE: "text-info border-info/30",
};

export default function NewInventionPage() {
  const t = useTranslations("interview");
  const router = useRouter();
  const alert = useSweetAlert();
  const queryClient = useQueryClient();

  const [inventionId, setInventionId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [openingDescription, setOpeningDescription] = useState("");
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const interviewQuery = useQuery({
    queryKey: ["interview", inventionId],
    queryFn: () => getInterview(inventionId as string),
    enabled: !!inventionId,
  });

  const createMutation = useMutation({
    mutationFn: () => createInvention(title.trim(), openingDescription.trim()),
    onSuccess: (invention) => {
      setInventionId(invention.id);
      queryClient.invalidateQueries({ queryKey: ["inventions"] });
    },
    onError: (err) => alert.error(t("error"), apiErrorMessage(err)),
  });

  const messageMutation = useMutation({
    mutationFn: (content: string) => postInterviewMessage(inventionId as string, content),
    onSuccess: (state) => {
      queryClient.setQueryData(["interview", inventionId], state);
      setDraft("");
    },
    onError: (err) => alert.error(t("error"), apiErrorMessage(err)),
  });

  const factMutation = useMutation({
    mutationFn: ({ topic, factId, confirmed }: { topic: string; factId: string; confirmed: boolean }) =>
      confirmFact(inventionId as string, topic, factId, confirmed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interview", inventionId] });
    },
  });

  const draftMutation = useMutation({
    mutationFn: () => generateProvisionalDraft(inventionId as string),
    onSuccess: () => {
      router.push(`/patents/${inventionId}`);
    },
    onError: (err) => alert.error(t("error"), apiErrorMessage(err)),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [interviewQuery.data?.messages.length]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !openingDescription.trim()) return;
    createMutation.mutate();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || messageMutation.isPending) return;
    messageMutation.mutate(draft.trim());
  };

  // --- Step 1: opening form -------------------------------------------------
  if (!inventionId) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <Link
          href="/patents"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToPatents")}
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{t("startTitle")}</h1>
          <p className="text-muted-foreground mb-6">{t("startSubtitle")}</p>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleStart} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("inventionTitle")}
                  </label>
                  <Input
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    placeholder={t("inventionTitlePlaceholder")}
                    className="h-10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("openingLabel")}
                  </label>
                  <textarea
                    value={openingDescription}
                    onChange={(e) => setOpeningDescription(e.target.value)}
                    placeholder={t("openingPlaceholder")}
                    rows={7}
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none dark:bg-input/30"
                    required
                  />
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-brand-500/5 dark:bg-gold-500/5 border border-brand-500/10 dark:border-gold-500/10 p-4">
                  <Sparkles className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{t("aiHintText")}</p>
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full h-11 bg-gradient-gold text-brand-900 font-semibold hover:shadow-glow-gold gap-2"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {t("startInterview")}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // --- Step 2: interview chat ------------------------------------------------
  const state = interviewQuery.data;
  const ready = state?.interview_status === "READY_FOR_PROVISIONAL_DRAFT";

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/patents"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToPatents")}
        </Link>
        {state && (
          <Badge variant={ready ? "default" : "secondary"} className="gap-1">
            {ready && <CheckCircle2 className="h-3 w-3" />}
            {t(`interviewStatus.${state.interview_status}`)}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex flex-col h-[65vh]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {interviewQuery.isLoading && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
              {state?.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-gold text-brand-900 font-medium"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {messageMutation.isPending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t("thinking")}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2">
              <Input
                value={draft}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
                placeholder={t("replyPlaceholder")}
                className="h-10"
                disabled={messageMutation.isPending}
              />
              <Button type="submit" size="icon" disabled={messageMutation.isPending || !draft.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>

          {ready && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <Card className="border-gold-500/30 bg-gold-500/5">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/10">
                      <Lightbulb className="h-4 w-4 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t("readyTitle")}</p>
                      <p className="text-xs text-muted-foreground">{t("readySubtitle")}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => draftMutation.mutate()}
                    disabled={draftMutation.isPending}
                    className="bg-gradient-gold text-brand-900 font-semibold hover:shadow-glow-gold shrink-0"
                  >
                    {draftMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t("generateDraft")
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Structured record */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold-500" />
                {t("recordTitle")}
              </h3>
              {!state || Object.keys(state.structured_record).length === 0 ? (
                <p className="text-xs text-muted-foreground">{t("recordEmpty")}</p>
              ) : (
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pe-1">
                  {Object.entries(state.structured_record).map(([topic, facts]) =>
                    facts.length === 0 ? null : (
                      <div key={topic}>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                          {t(`topics.${topic}`)}
                        </p>
                        <ul className="space-y-1.5">
                          {facts.map((fact: StructuredFact) => (
                            <li
                              key={fact.id}
                              className="rounded-lg border border-border p-2 text-xs text-foreground"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="leading-snug">{fact.value}</span>
                              </div>
                              <div className="flex items-center justify-between mt-1.5">
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] ${PROVENANCE_STYLE[fact.provenance] || ""}`}
                                >
                                  {fact.provenance.replace(/_/g, " ")}
                                </Badge>
                                {!fact.confirmed && fact.provenance === "AI_SUGGESTED" && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        factMutation.mutate({ topic, factId: fact.id, confirmed: true })
                                      }
                                      className="text-success hover:opacity-70"
                                      title={t("confirm")}
                                    >
                                      <ThumbsUp className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        factMutation.mutate({ topic, factId: fact.id, confirmed: false })
                                      }
                                      className="text-destructive hover:opacity-70"
                                      title={t("reject")}
                                    >
                                      <ThumbsDown className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {state && state.missing_topics.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-info" />
                  {t("missingTitle")}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {state.missing_topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-[10px]">
                      {t(`topics.${topic}`)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
