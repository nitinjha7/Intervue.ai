"use client";
import { Interview, ResumeData } from "@/generated/prisma";
import React from "react";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { MessageContainer } from "../shared/message-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import MarkdownRenderer from "../shared/markdown-renderer";
import { Separator } from "../ui/separator";
import { Clock3, FileText, Sparkles, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  interviewData: Interview & { resume: ResumeData };
}

function parseFeedback(raw?: string | null) {
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw) as { feedback?: string };
    return parsed.feedback || raw;
  } catch {
    return raw;
  }
}

function formatDuration(durationMs?: string) {
  const minutes = Number(durationMs || 0) / (60 * 1000);
  if (!Number.isFinite(minutes) || minutes <= 0) return "Unknown";
  return `${Math.round(minutes)} min`;
}

const CompletedInterviewView = ({ interviewData }: Props) => {
  const trpc = useTRPC();
  const getInterviewFeedback = useMutation(
    trpc.interviewRouter.getInterviewFeedBack.mutationOptions({
      onSuccess: () => {
        window.location.reload();
      },
    })
  );
  const getResumeFeedback = useMutation(
    trpc.interviewRouter.getResumeFeedBack.mutationOptions({
      onSuccess: () => {
        window.location.reload();
      },
    })
  );

  const interviewFeedback = parseFeedback(interviewData?.interviewFeedback);
  const resumeFeedback = parseFeedback(interviewData?.resumeFeedback);
  const hasInterviewFeedback = Boolean(interviewFeedback);
  const hasResumeFeedback = Boolean(resumeFeedback);

  return (
    <div
      className="relative min-h-screen overflow-hidden p-4 text-foreground sm:p-6"
      style={{
        backgroundImage:
          "radial-gradient(circle at top left, rgba(56, 189, 248, 0.12), transparent 24%), radial-gradient(circle at top right, rgba(244, 114, 182, 0.08), transparent 22%), linear-gradient(180deg, rgba(2, 6, 23, 1), rgba(2, 6, 23, 0.94))",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                  Interview complete
                </Badge>
                <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                  {interviewData.companyName}
                </Badge>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {interviewData.jobRole}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                  This screen is the final report: the transcript on the left,
                  the interview critique and resume review on the right.
                </p>
              </div>
            </div>
            <div
              className="grid gap-3 sm:grid-cols-3"
              style={{ minWidth: "34rem" }}
            >
              <InfoPill label="Resume" value={interviewData.resume.title} icon={<FileText className="size-4" />} />
              <InfoPill label="Duration" value={formatDuration(interviewData.durationMs)} icon={<Clock3 className="size-4" />} />
              <InfoPill
                label="Report"
                value={hasInterviewFeedback || hasResumeFeedback ? "Ready" : "Pending"}
                icon={<Sparkles className="size-4" />}
              />
            </div>
          </div>
        </div>

        {!hasInterviewFeedback && !hasResumeFeedback && (
          <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4 text-amber-100 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">
                  Report not generated yet
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-100/90">
                  The interview ended, but the reports are generated on-demand. Use the buttons to create the interview feedback and resume review.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="border-amber-200/40 bg-transparent text-amber-100 hover:bg-amber-200/10"
                  onClick={() => getInterviewFeedback.mutate({ interviewId: interviewData.id })}
                  disabled={getInterviewFeedback.isPending}
                >
                  Generate interview feedback
                </Button>
                <Button
                  className="bg-amber-100 text-amber-950 hover:bg-amber-100/90"
                  onClick={() => getResumeFeedback.mutate({ interviewId: interviewData.id })}
                  disabled={getResumeFeedback.isPending}
                >
                  Generate resume review
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex min-h-0 flex-col rounded-3xl border border-white/10 bg-black/30 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-2 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Interview transcript
                </p>
                <h2 className="text-lg font-semibold text-white">
                  Conversation log
                </h2>
              </div>
              <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                Archived
              </Badge>
            </div>
            <Separator className="bg-white/10" />
            <div
              className="mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-background/40"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#888 transparent" }}
            >
              <MessageContainer
                messages={JSON.parse(interviewData.messages as string)}
              />
            </div>
          </section>

          <section className="flex min-h-0 flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">
                  Final report
                </p>
                <h2 className="text-xl font-semibold text-white">
                  Interview critique + resume review
                </h2>
                <p className="max-w-xl text-sm leading-6 text-slate-400">
                  Generate both report sections when you are ready. These are the
                  post-interview outputs the app already supports.
                </p>
              </div>
              <Badge variant="outline" className={cn("rounded-full border-white/10 px-3 py-1", hasInterviewFeedback || hasResumeFeedback ? "bg-emerald-500/10 text-emerald-200" : "bg-white/5 text-slate-300")}>
                {hasInterviewFeedback || hasResumeFeedback ? "Ready" : "Not generated"}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MiniReportCard
                title="Interview feedback"
                description="Overall critique of the conversation, problem solving, and communication."
                ready={hasInterviewFeedback}
                isPending={getInterviewFeedback.isPending}
                onGenerate={() => {
                  getInterviewFeedback.mutate({ interviewId: interviewData.id });
                }}
                accent="cyan"
              />
              <MiniReportCard
                title="Resume review"
                description="Actionable resume feedback matched against the job description."
                ready={hasResumeFeedback}
                isPending={getResumeFeedback.isPending}
                onGenerate={() => {
                  getResumeFeedback.mutate({ interviewId: interviewData.id });
                }}
                accent="violet"
              />
            </div>

            <Tabs className="flex min-h-0 flex-1 flex-col gap-4" defaultValue="interveiw-feedback">
              <TabsList className="grid w-full grid-cols-2 rounded-2xl border border-white/10 bg-black/30 p-1">
                <TabsTrigger
                  value="interveiw-feedback"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-black"
                >
                  Interview Feedback
                </TabsTrigger>
                <TabsTrigger
                  value="resume-feedback"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-black"
                >
                  Resume Review
                </TabsTrigger>
              </TabsList>

              <TabsContent value="interveiw-feedback" className="min-h-0 flex-1">
                {!hasInterviewFeedback ? (
                  <EmptyReportState
                    title="No interview feedback yet"
                    description="Generate the report to see a blunt interview teardown, competency scorecard, and final verdict."
                    isPending={getInterviewFeedback.isPending}
                    onGenerate={() =>
                      getInterviewFeedback.mutate({ interviewId: interviewData.id })
                    }
                    buttonLabel="Generate interview feedback"
                    icon={<ShieldAlert className="size-4" />}
                  />
                ) : (
                  <MarkdownRenderer markdown={interviewFeedback} />
                )}
              </TabsContent>

              <TabsContent value="resume-feedback" className="min-h-0 flex-1">
                {!hasResumeFeedback ? (
                  <EmptyReportState
                    title="No resume review yet"
                    description="Generate the resume review to get ATS notes, rewrite suggestions, and a cleaner action plan."
                    isPending={getResumeFeedback.isPending}
                    onGenerate={() =>
                      getResumeFeedback.mutate({ interviewId: interviewData.id })
                    }
                    buttonLabel="Generate resume review"
                    icon={<Sparkles className="size-4" />}
                  />
                ) : (
                  <MarkdownRenderer markdown={resumeFeedback} />
                )}
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  );
};

function InfoPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 shadow-inner shadow-black/15">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

function MiniReportCard({
  title,
  description,
  ready,
  isPending,
  onGenerate,
  accent,
}: {
  title: string;
  description: string;
  ready: boolean;
  isPending: boolean;
  onGenerate: () => void;
  accent: "cyan" | "violet";
}) {
  const accentClasses =
    accent === "cyan"
      ? "border-cyan-400/15 bg-cyan-400/5 text-cyan-100"
      : "border-violet-400/15 bg-violet-400/5 text-violet-100";

  return (
    <div className={cn("rounded-2xl border p-4", accentClasses)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs leading-5 text-slate-300">{description}</p>
        </div>
        <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200">
          {ready ? "Ready" : "Empty"}
        </Badge>
      </div>
      {!ready && (
        <Button
          type="button"
          size="sm"
          className="mt-4 w-full"
          onClick={onGenerate}
          disabled={isPending}
        >
          {isPending ? "Generating..." : "Generate now"}
        </Button>
      )}
    </div>
  );
}

function EmptyReportState({
  title,
  description,
  isPending,
  onGenerate,
  buttonLabel,
  icon,
}: {
  title: string;
  description: string;
  isPending: boolean;
  onGenerate: () => void;
  buttonLabel: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="max-w-md text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <Button type="button" onClick={onGenerate} disabled={isPending}>
        {isPending ? "Generating..." : buttonLabel}
      </Button>
    </div>
  );
}

export default CompletedInterviewView;
