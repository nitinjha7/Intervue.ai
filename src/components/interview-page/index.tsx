"use client";
import React, { useEffect, useRef } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "../ui/label";
import { CodeEditor } from "./code-editor";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Button } from "../ui/button";
import VoiceInterpreter from "./voice-interpreter";
import { Tooltip, TooltipTrigger } from "../ui/tooltip";
import { Hand, Loader, MicIcon, Sparkles, TerminalSquare } from "lucide-react";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MessageContainer } from "../shared/message-container";
import { InterviewStatus } from "@/generated/prisma";
import { ttsServices } from "@/lib/tts.config";
import { Badge } from "../ui/badge";
import CompletedInterviewView from "./competed-interview-view";

export const InterviewPage = ({ interviewId }: { interviewId: string }) => {
  const SUPPORTED_LANGUAGES = ["cpp", "java", "python", "javascript"];
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("cpp");
  const [userCode, setUserCode] = React.useState<string>("");
  const [transcript, setTranscript] = React.useState<string>("");
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [recordAudio, setRecordAudio] = React.useState<boolean>(false);
  const [responseArrived, setResponseArrived] = React.useState<boolean>(false);

  const [restartingRecording, setRestartingRecording] =
    React.useState<boolean>(false);
  const [isInterviewEnded, setIsInterviewEnded] =
    React.useState<boolean>(false);
  const [messages, setMessages] = React.useState<
    {
      role: "user" | "assistant" | "system" | "developer";
      content: string;
    }[]
  >([]);
  const trpc = useTRPC();
  const { data: interviewData, isPending: loadingInterview } = useQuery(
    trpc.interviewRouter.getInterview.queryOptions({
      interviewId: interviewId,
    })
  );

  useEffect(() => {
    if (interviewData?.messages) {
      setMessages(JSON.parse(interviewData?.messages));
      if (interviewData?.interviewStatus === InterviewStatus.ended) {
        setRecordAudio(false);
        setIsRecording(false);
        setIsSending(false);
        setResponseArrived(false);
        setIsInterviewEnded(true);
      }
    }
  }, [loadingInterview]);
  const sendUserResponse = useMutation(
    trpc.interviewRouter.recordUserResponse.mutationOptions({
      onSuccess: (data) => {
        setMessages(data.messages);
        const assistantMessage = data.messages[data.messages.length - 1];
        if (assistantMessage.role === "assistant") {
          console.log(
            "Speaking out:",
            JSON.parse(assistantMessage.content).content
          );
          ttsServices.speakBrowser(
            JSON.parse(assistantMessage.content).content
          );
        }
        setIsInterviewEnded(data.isInterviewEnded);
        if (data.isInterviewEnded) {
          window.location.reload();
          setRecordAudio(false);
          setIsRecording(false);
          setIsSending(false);
          setResponseArrived(false);
        }
      },
    })
  );
  const endInterview = useMutation(
    trpc.interviewRouter.endInterview.mutationOptions({
      onSuccess: () => {
        setRecordAudio(false);
        setIsRecording(false);
        setIsSending(false);
        setResponseArrived(false);
        setIsInterviewEnded(true);
        window.location.reload();
      },
    })
  );
  async function callbackFn(
    finalTranscript: string,
    userCode: string,
    language: string
  ) {
    console.log("Main: Current userCode:", userCode); // ✅ Log userCode separately

    // Clear any existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    setRecordAudio(false);
    setIsRecording(false);
    setIsSending(true);
    setTranscript(""); // Clear transcript immediately

    try {
      await sendUserResponse.mutateAsync({
        interviewId: interviewId,
        userResponse: JSON.stringify({
          voice: finalTranscript,
          code: userCode.replace("Write your code here...", "").trim(),
          language: userCode.replace("Write your code here...", "").trim()
            ? language
            : "",
        }),
      });
      setIsSending(false);
      setResponseArrived(true);
      console.log("Main: Response sent successfully");
    } catch (error) {
      console.error("Main: Error sending response:", error);
      setIsSending(false);
      setRecordAudio(true); // Restart recording on error
    }
  }

  // Fix 2: Simplify restart recording logic
  async function restartRecording() {
    if (isInterviewEnded || isSending) return;

    setRestartingRecording(true);
    setResponseArrived(false);

    // Force stop current recording
    setRecordAudio(false);
    setIsRecording(false);
    setTranscript("");

    // Wait for VoiceInterpreter to properly stop
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Start fresh recording
    setRecordAudio(true);
    setRestartingRecording(false);
  }

  // Auto restart after response
  async function autoRestartRecording() {
    if (isInterviewEnded || isSending) return;

    setRestartingRecording(true);
    setResponseArrived(false);
    setTranscript("");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setRecordAudio(true);
    setRestartingRecording(false);
  }

  useEffect(() => {
    if (isInterviewEnded) {
      setRecordAudio(false);
      setIsRecording(false);
      setIsSending(false);
      setResponseArrived(false);
    }
    if (interviewData && !recordAudio && !restartingRecording) {
      setTimeout(() => {
        setRecordAudio(true);
      }, 1000);
    }
  }, [interviewData, isInterviewEnded, restartingRecording]);

  useEffect(() => {
    if (!transcript || transcript.trim() === "" || isSending) {
      return;
    }

    console.log("Transcript updated:", transcript);
    setIsRecording(true);

    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Set new timer with longer delay for better capture
    inactivityTimerRef.current = setTimeout(() => {
      console.log("Inactivity timer triggered");
      callbackFn(transcript, userCode, selectedLanguage);
    }, 2000); // Reduced from 5s for better responsiveness

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [transcript, isSending]); // Added isSending dependency

  useEffect(() => {
    if (responseArrived && !isInterviewEnded) {
      autoRestartRecording();
    }
  }, [responseArrived, isInterviewEnded]);

  return loadingInterview ? (
    <div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_30%),linear-gradient(180deg,rgba(2,6,23,1),rgba(2,6,23,0.96))] text-white">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg shadow-black/20 backdrop-blur">
        <Loader className="size-5 animate-spin text-cyan-300" />
        <span className="text-sm text-slate-300">Loading interview workspace...</span>
      </div>
    </div>
  ) : interviewData?.interviewStatus === InterviewStatus.ended ? (
    <CompletedInterviewView interviewData={interviewData} />
  ) : (
    <div className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.08),transparent_22%),linear-gradient(180deg,rgba(2,6,23,1),rgba(2,6,23,0.94))] p-4 text-foreground sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] opacity-30" />
      {interviewData && (
        <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                    Active interview
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
                    Speak naturally, code when needed, and use the right panel to follow the conversation in real time.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-136">
                <InfoPill label="Language" value={selectedLanguage} icon={<TerminalSquare className="size-4" />} />
                <InfoPill label="Status" value={isSending ? "Analyzing" : isRecording ? "Recording" : responseArrived ? "Replaying" : "Live"} icon={<Sparkles className="size-4" />} />
                <InfoPill label="Voice" value={recordAudio ? "Listening" : "Paused"} icon={<MicIcon className="size-4" />} />
              </div>
            </div>
          </div>

          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-0 flex-1 rounded-3xl border border-white/10 bg-black/25 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur"
          >
            <ResizablePanel defaultSize={50} className="flex min-h-0 flex-col gap-4 p-4 sm:p-6">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Coding workspace
                    </p>
                    <h2 className="text-xl font-semibold text-white">
                      Editor + response controls
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={setSelectedLanguage}
                      defaultValue={selectedLanguage}
                    >
                      <SelectTrigger value={selectedLanguage} className="w-[150px] border-white/10 bg-white/5">
                        {selectedLanguage}
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => restartRecording()}
                          className="border-white/10 bg-white/5 hover:bg-white/10"
                        >
                          {!restartingRecording ? (
                            <MicIcon className="size-4" />
                          ) : (
                            <Loader className="size-4 animate-spin" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-md border bg-black px-4 py-2 text-sm text-muted-foreground">
                        Restart recording
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => endInterview.mutate({ interviewId })}
                          className="border-amber-200/30 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20"
                          disabled={isInterviewEnded || endInterview.isPending}
                        >
                          <Hand className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-md border bg-black px-4 py-2 text-sm text-muted-foreground">
                        End interview early
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-400">
                  The editor is isolated from the interview transcript, so you can write code without losing the conversation context.
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-background/50">
                <CodeEditor
                  language={selectedLanguage}
                  setUserCode={setUserCode}
                  userCode={userCode}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={50} className="flex min-h-0 flex-col overflow-hidden p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Interview feed
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    Live interviewer + transcript
                  </h2>
                </div>
                {isInterviewEnded ? (
                  <Badge className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200">
                    Ended
                  </Badge>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {isSending && "Analyzing..."}
                    {isRecording && "Recording..."}
                    {responseArrived && "Replaying next turn..."}
                    {!isRecording && !isSending && !responseArrived && "Idle"}
                  </span>
                )}
              </div>
              <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-background/40">
                <MessageContainer messages={messages} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
      <VoiceInterpreter
        setTranscript={setTranscript}
        callbackFn={callbackFn}
        start={recordAudio}
        stop={!recordAudio}
        userCode={userCode}
        selectedLanguage={selectedLanguage}
        isInterviewEnded={isInterviewEnded}
      />
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
