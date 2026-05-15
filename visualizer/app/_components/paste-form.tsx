"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { EXAMPLE_LOG } from "../../lib/example";
import { encodeShare } from "../../lib/share";

export function PasteForm() {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  function navigateToView(markdown: string) {
    startTransition(async () => {
      const fragment = await encodeShare(markdown);
      router.push(`/view#log=${fragment}`);
    });
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData.getData("text");
    if (pasted.trim()) {
      e.preventDefault();
      setText(pasted);
      navigateToView(pasted);
    }
  }

  function handleSubmit() {
    if (text.trim()) navigateToView(text);
  }

  return (
    <>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={handlePaste}
        placeholder="# Friction Log: ..."
        spellCheck={false}
        autoFocus
        className="w-full min-h-[220px] sm:min-h-[280px] rounded-lg border border-border bg-card text-card-foreground px-4 py-3 font-mono text-xs leading-relaxed placeholder:text-muted-foreground/40 resize-y focus:outline-none focus:border-foreground/40 transition-colors"
      />

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          onClick={() => setText(EXAMPLE_LOG)}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40"
          title="Fill the textarea with a sample friction log"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Fill with example
        </button>
        <div className="flex items-center gap-2">
          {text && (
            <button
              onClick={() => setText("")}
              className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-accent px-3 py-1.5 text-xs font-medium hover:bg-accent/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Opening…" : "View"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
