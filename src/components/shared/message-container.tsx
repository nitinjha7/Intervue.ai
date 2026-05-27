"use client";
import React, { useEffect, useRef } from "react";
import MarkdownRenderer from "./markdown-renderer";
import { cn } from "@/lib/utils";

export const MessageContainer = ({
  messages,
}: {
  messages: {
    role: "user" | "assistant" | "system" | "developer";
    content: string;
  }[];
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="w-full h-full overflow-y-auto">
      {messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center">
          <p className="text-lg font-medium text-white">No messages yet.</p>
          <p className="max-w-md text-sm leading-6 text-slate-400">
            Start speaking or type into the code editor to begin the interview.
            If the listener stalls, restart it from the microphone icon.
          </p>
        </div>
      )}
      <div className="overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {messages.map(
          (msg, index) =>
            msg?.role !== "system" &&
            (() => {
              const parsed = JSON.parse(msg.content);

              if (msg.role === "assistant") {
                return (
                  <div className="flex flex-col gap-3" key={index}>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-200/80">
                      <span className="h-2 w-2 rounded-full bg-cyan-300" />
                      Interviewer
                    </div>
                    <div className="max-w-[92%] max-h-[260px] self-start overflow-y-auto rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20">
                      <MarkdownRenderer markdown={parsed.content} />
                    </div>
                    {parsed.problem_statement && (
                      <div className="max-w-[92%] max-h-[260px] self-start overflow-y-auto rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                        <MarkdownRenderer markdown={parsed.problem_statement} />
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div className="flex flex-col items-end gap-3" key={index}>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-200/80">
                    Candidate
                    <span className="h-2 w-2 rounded-full bg-amber-300" />
                  </div>
                  <div className="max-w-[92%] max-h-[220px] self-end overflow-y-auto rounded-3xl border border-amber-400/15 bg-amber-400/5 p-4 shadow-lg shadow-black/10">
                    <MarkdownRenderer markdown={parsed.voice} />
                  </div>
                </div>
              );
            })()
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
