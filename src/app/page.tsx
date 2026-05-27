"use client";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";
import { extractText, getDocumentProxy } from "unpdf";

const ResumePage = () => {
  const trpc = useTRPC();
  const { data: resumes, isPending: loadingResumes } = useQuery(
    trpc.resumeRouter.getAllResumes.queryOptions()
  );
  const resumeCount = resumes?.length ?? 0;

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                  Resume library
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200"
                >
                  {resumeCount} saved resume{resumeCount === 1 ? "" : "s"}
                </Badge>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Your resume vault
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                  Upload a PDF once and reuse it across multiple interviews.
                  From here you can manage resumes, then launch an interview with one click.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/interview">
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                >
                  Manage Interview
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <AddResumeForm />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <HeroMetric
              title="Saved resumes"
              value={`${resumeCount}`}
              description="These are available for interview selection."
              icon={<FileText className="size-4" />}
            />
            <HeroMetric
              title="Workflow"
              value="PDF → parse → interview"
              description="Upload once, then reuse in the interview flow."
              icon={<Sparkles className="size-4" />}
            />
            <HeroMetric
              title="Next step"
              value="Start interview"
              description="Pick a resume and launch the interview workspace."
              icon={<ArrowRight className="size-4" />}
            />
          </div>
        </div>

        <div className="grid min-h-0 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-black/25 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Resume vault
                </p>
                <h2 className="text-xl font-semibold text-white">
                  Stored documents
                </h2>
              </div>
              <Badge
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200"
              >
                {loadingResumes ? "Loading" : `${resumeCount} item${resumeCount === 1 ? "" : "s"}`}
              </Badge>
            </div>

            {loadingResumes ? (
              <div className="flex min-h-[352px] items-center justify-center text-sm text-slate-400">
                Loading resumes...
              </div>
            ) : resumes && resumes.length > 0 ? (
              <div className="grid gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-3">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 transition-transform duration-200 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/8"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-white">
                          {resume.title}
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                          Saved {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="rounded-full border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-slate-300"
                      >
                        Ready
                      </Badge>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-400">
                      Use this resume in the interview flow or generate a new resume review from the completed report.
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[352px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/5 text-center">
                <p className="text-lg font-medium text-white">No resumes found.</p>
                <p className="max-w-md text-sm leading-6 text-slate-400">
                  Upload a PDF to start building your interview vault.
                </p>
                <AddResumeForm />
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur">
            <div className="space-y-3 border-b border-white/10 pb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Workflow guide
              </p>
              <h2 className="text-xl font-semibold text-white">How the app works</h2>
              <p className="text-sm leading-6 text-slate-400">
                Upload a resume first, then create an interview using the resume selector. When the interview ends, open the final report to generate both critique and resume review.
              </p>
            </div>
            <div className="mt-4 space-y-3">
              <StepCard
                step="01"
                title="Upload resume"
                description="Convert your PDF into searchable text and store it in the vault."
              />
              <StepCard
                step="02"
                title="Launch interview"
                description="Pick a resume, add a role and company, then start the mock interview."
              />
              <StepCard
                step="03"
                title="Review final report"
                description="After the interview ends, generate the interview critique and resume review."
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
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
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-sm font-semibold text-cyan-100">
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

export function AddResumeForm() {
  const [resumeTitle, setResumeTitle] = React.useState("");
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);

  const trpc = useTRPC();
  const addNewResume = useMutation(
    trpc.resumeRouter.addResume.mutationOptions()
  );

  async function handleSubjmit() {
    if (!resumeTitle || !resumeFile) return;

    try {
      const arrayBuffer = await resumeFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const textPdf = new Uint8Array(uint8Array);

      const { text } = await extractText(await getDocumentProxy(textPdf), {
        mergePages: true,
      });

      await addNewResume.mutateAsync({
        title: resumeTitle,
        resumeContent: text,
      });
      setResumeTitle("");
      setResumeFile(null);
      window.location.reload();
    } catch (e: any) {
      console.log(e);
    }
  }

  return (
    <Dialog>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
        }}
      >
        <DialogTrigger asChild>
          <Button variant="default">New Resume</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Resume</DialogTitle>
            <DialogDescription>
              Upload a PDF, extract its text, and add it to the vault.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Nitin_sde_2026"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="resume-file">Resume PDF</Label>
              <Input
                id="resume-file"
                name="resume-file"
                type="file"
                onChange={(e) => {
                  setResumeFile(e.target.files ? e.target.files[0] : null);
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
                handleSubjmit();
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

export default ResumePage;
