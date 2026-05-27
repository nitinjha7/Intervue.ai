import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import React from "react";

const ResumePage = () => {
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
      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col justify-center gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
              Resume details
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200"
            >
              Locked view
            </Badge>
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                <FileText className="size-5" />
              </span>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                Resume details are not stored
              </h1>
            </div>
            <p className="text-sm leading-6 text-slate-400 sm:text-base">
              For privacy, the app only stores the parsed text used in interviews and reports.
              If you want to create a new interview or review a resume, head back to the resume vault.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/">
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
                <ArrowLeft className="mr-2 size-4" />
                Back to resumes
              </Button>
            </Link>
            <Link href="/interview">
              <Button className="bg-white text-slate-950 hover:bg-white/90">
                Go to interviews
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;