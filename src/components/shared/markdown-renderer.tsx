"use client";
import React, { JSX, useState } from "react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import ReactMarkdown, { ExtraProps } from "react-markdown";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  markdown?: string;
}

const CodeContainer = ({
  match,
  children,
}: {
  match: RegExpExecArray;
  children: React.ReactNode;
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-black/35 p-4 shadow-inner shadow-black/20">
      <span className="flex w-full items-center justify-between gap-3">
        <Badge
          className="rounded-full border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          variant="outline"
        >
          {match[1]} Code
        </Badge>
        <Button
          size={"sm"}
          variant={"ghost"}
          type="button"
          onClick={() => {
            window.navigator.clipboard.writeText(
              String(children).replace(/\n$/, "")
            );
            setIsCopied(true);
            setTimeout(() => {
              setIsCopied(false);
            }, 2000);
          }}
          disabled={isCopied}
        >
          {isCopied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
        </Button>
      </span>
      <SyntaxHighlighter
        PreTag="div"
        language={match[1]}
        style={atomDark}
        customStyle={{
          background: "transparent", // Let the parent div's bg show
          padding: "0", // 20px
          fontSize: "0.95rem",
          borderRadius: "0.75rem", // 12px
        }}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
};

export default function MarkdownRenderer({
  markdown = "## Hello world \n```cpp\ncout>>'Hello World'\n```\n",
}: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-invert max-w-none w-full rounded-2xl border border-white/10 bg-black/20 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)]",
        "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-p:leading-7 prose-li:my-1 prose-a:text-cyan-300 prose-strong:text-white"
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 text-3xl font-semibold tracking-tight text-white">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-8 text-2xl font-semibold tracking-tight text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-6 text-xl font-semibold text-white">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-sm leading-7 text-slate-300">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-2 pl-6 text-sm text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-2 pl-6 text-sm text-slate-300">
              {children}
            </ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-4 border-l-2 border-cyan-400/60 pl-4 italic text-slate-300">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <table className="w-full">{children}</table>
            </div>
          ),
          code: (props: JSX.IntrinsicElements["code"] & ExtraProps) => {
            const { children, className } = props;

            const match = /language-(\w+)/.exec(className + "  " || "");
            return match ? (
              <CodeContainer match={match}>{children}</CodeContainer>
            ) : (
              <code
                className={cn(
                  className,
                  "rounded bg-white/10 px-1.5 py-0.5 text-[0.9em] text-amber-200"
                )}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
