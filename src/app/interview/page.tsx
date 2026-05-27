"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { extractText, getDocumentProxy } from "unpdf";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectItem } from "@radix-ui/react-select";
import { ResumeData } from "@/generated/prisma";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Briefcase, Calendar, Sparkles } from "lucide-react";

const Page = () => {
  const trpc = useTRPC();
  const { data: interviews, isPending: loadingInterviews } = useQuery(
    trpc.interviewRouter.getAllInterviewes.queryOptions()
  );
  const interviewItems = (interviews ?? []) as InterviewListItem[];
  const totalInterviews = interviewItems.length;
  const completedCount = interviewItems.reduce(
    (count, item) => count + (item?.messages ? 1 : 0),
    0
  );
  const pendingCount = totalInterviews - completedCount;

  return (
    <div
      className="relative min-h-screen overflow-hidden p-4 text-foreground sm:p-6"
      style={{
        backgroundImage:
          "radial-gradient(circle at top left, rgba(16, 185, 129, 0.16), transparent 28%), radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 24%), linear-gradient(180deg, rgba(2, 6, 23, 1), rgba(2, 6, 23, 0.94))",
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-100">
                  Interview manager
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200"
                >
                  {loadingInterviews ? "Loading" : `${totalInterviews} total`}
                </Badge>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Build and review interviews
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                  Create a mock interview from any saved resume. When the session ends, open the final report to review feedback and resume critique in one place.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                >
                  Manage Resumes
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <NewInterviewForm />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <HeroMetric
              title="Scheduled"
              value={`${pendingCount}`}
              description="Ready to start or still in progress."
              icon={<Calendar className="size-4" />}
            />
            <HeroMetric
              title="Completed"
              value={`${completedCount}`}
              description="Ended sessions with reports available."
              icon={<Sparkles className="size-4" />}
            />
            <HeroMetric
              title="Next step"
              value="Open a report"
              description="Click an interview to review feedback."
              icon={<Briefcase className="size-4" />}
            />
          </div>
        </div>

        <div className="grid min-h-0 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-black/25 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Interview vault
                </p>
                <h2 className="text-xl font-semibold text-white">Recent interviews</h2>
              </div>
              <Badge
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200"
              >
                {loadingInterviews ? "Loading" : `${totalInterviews} total`}
              </Badge>
            </div>

            {loadingInterviews ? (
              <div className="flex min-h-[352px] items-center justify-center text-sm text-slate-400">
                Loading interviews...
              </div>
            ) : interviewItems.length > 0 ? (
              <div className="grid gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-3">
                {interviewItems.map((interview) => (
                  <div
                    key={interview.id}
                    className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 transition-transform duration-200 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/8"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          {interview.companyName}
                        </p>
                        <h3 className="mt-1 truncate text-lg font-semibold text-white">
                          {interview.jobRole}
                        </h3>
                      </div>
                      <Badge
                        className={
                          interview?.messages
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                            : "border-amber-400/30 bg-amber-400/10 text-amber-100"
                        }
                      >
                        {interview?.messages ? "Ended" : "Pending"}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-400">
                      <p className="line-clamp-1">Resume: {interview.resume?.title}</p>
                      {interview.coverLetter && (
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Cover letter attached
                        </p>
                      )}
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/interview/${interview.id}`} className="mt-5">
                      <Button variant="outline" size="sm" className="w-full">
                        View interview
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[352px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/5 text-center">
                <p className="text-lg font-medium text-white">No interviews yet.</p>
                <p className="max-w-md text-sm leading-6 text-slate-400">
                  Create a new interview to generate a full report and resume review.
                </p>
                <NewInterviewForm />
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur">
            <div className="space-y-3 border-b border-white/10 pb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                What happens next
              </p>
              <h2 className="text-xl font-semibold text-white">Interview flow</h2>
              <p className="text-sm leading-6 text-slate-400">
                Start from your resume vault, create an interview here, then open a session to see the live workspace and final report.
              </p>
            </div>
            <div className="mt-4 space-y-3">
              <StepCard
                step="01"
                title="Create interview"
                description="Select a resume and add job details before starting."
              />
              <StepCard
                step="02"
                title="Complete session"
                description="Answer questions and record responses in the workspace."
              />
              <StepCard
                step="03"
                title="Review report"
                description="Generate interview feedback and resume review."
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
    // </div>
  );
};

type InterviewListItem = {
  id: string;
  companyName: string;
  jobRole: string;
  coverLetter?: string | null;
  createdAt: Date;
  messages?: string | null;
  resume?: {
    title?: string | null;
  } | null;
};

function HeroMetric({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 shadow-inner shadow-black/15">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
          {icon}
        </span>
        {title}
      </div>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-sm font-semibold text-emerald-100">
          {step}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-sm leading-6 text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function NewInterviewForm() {
  // const [resumeTitle, setResumeTitle] = React.useState("");
  const [coverLetterFile, setCoverLetterFile] = React.useState<File | null>(
    null
  );
  const [companyName, setCompanyName] = React.useState("");
  const [jobRole, setJobRole] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [duration, setDuration] = React.useState<number>(15 * 60 * 1000);
  const [selectedResumeId, setSelectedResumeId] = React.useState<string>("");

  const trpc = useTRPC();

  const { data: availableResume, isPending: loadingResumes } = useQuery(
    trpc.resumeRouter.getAllResumes.queryOptions()
  );

  const addInterview = useMutation(
    trpc.interviewRouter.addInterview.mutationOptions({
      onSuccess: () => {
        window.location.reload();
      },
    })
  );

  async function handleSubmit() {
    if (!companyName || !jobRole || !jobDescription || !duration) return;

    let coverLetterContent: string = "";

    if (coverLetterFile) {
      try {
        const arrayBuffer = await coverLetterFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Clone for text extraction
        const textPdf = new Uint8Array(uint8Array);

        // Clone for rendering
        // const renderPdf = new Uint8Array(uint8Array);

        const { text } = await extractText(await getDocumentProxy(textPdf), {
          mergePages: true,
        });
        coverLetterContent = text;
        // await addNewResume.mutateAsync({
        //   title: resumeTitle,
        //   resumeContent: text,
        // });
        // setResumeTitle("");
        // setResumeFile(null);
        // window.location.reload();
      } catch (e: any) {
        console.log(e);
      }
    }

    await addInterview.mutateAsync({
      jobRole: jobRole,
      jobDescription,
      resumeId: selectedResumeId,
      durationMs: duration.toString(),
      companyName,
      coverLetterContent: coverLetterContent ? coverLetterContent : "",
    });
  }
  return (
    <Dialog>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
        }}
      >
        <DialogTrigger asChild>
          <Button variant="default">New Interview</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate new interview here</DialogTitle>
            <DialogDescription>
              Pick one of your saved resumes and create a new interview.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="resume">Resume</Label>
              {loadingResumes ? (
                <Skeleton className="w-full h-12" />
              ) : (
                <Select
                  onValueChange={(value) => {
                    setSelectedResumeId(value);
                  }}
                >
                  <SelectTrigger
                    className="w-full"
                    value={`${duration / (60 * 1000)}`}
                  >
                    {selectedResumeId && availableResume
                      ? availableResume.find(
                          (resume: ResumeData) => resume.id === selectedResumeId
                        )?.title
                      : "Select one resume"}
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto flex flex-col gap-4">
                    {availableResume && availableResume.length > 0 ? (
                      availableResume.map((resume: ResumeData) => (
                        <SelectItem
                          key={resume.id}
                          value={resume.id}
                          className="py-2 hover:bg-background px-2"
                        >
                          {resume.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="#" disabled>
                        No saved resumes found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="companyNAme">Company Name</Label>
              <Input
                id="companyNAme"
                name="companyNAme"
                placeholder="google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="job-role">Job Role</Label>
              <Input
                id="job-role"
                name="job-role"
                placeholder="Software Development Engineer"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                name="job-description"
                placeholder="We are looking for a Software Development Engineer..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="max-h-32"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="duration">Duration (in minutes)</Label>
              <Select
                onValueChange={(value) => {
                  setDuration(+value * 60 * 1000);
                }}
              >
                <SelectTrigger
                  className="w-full"
                  value={`${duration / (60 * 1000)}`}
                >
                  {duration / (60 * 1000)} Mins
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto flex flex-col gap-4">
                  <SelectItem
                    value="10"
                    className="py-2 hover:bg-background px-2"
                  >
                    10 Mins
                  </SelectItem>
                  <SelectItem
                    value="15"
                    className="py-2 hover:bg-background px-2"
                  >
                    15 Mins
                  </SelectItem>
                  <SelectItem
                    value="30"
                    className="py-2 hover:bg-background px-2"
                  >
                    30 Mins
                  </SelectItem>
                  <SelectItem
                    value="45"
                    className="py-2 hover:bg-background px-2"
                  >
                    45 Mins
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="cover-letter-file">
                Cover Letter PDF {"(Optional)"}
              </Label>
              <Input
                id="cover-letter-file"
                name="cover-letter-file"
                type="file"
                onChange={(e) => {
                  setCoverLetterFile(e.target.files ? e.target.files[0] : null);
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={() => {
                handleSubmit();
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

export default Page;
