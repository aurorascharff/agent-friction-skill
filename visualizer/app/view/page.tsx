"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Link2 } from "lucide-react";
import { FrictionLogViewer } from "../_components/friction-log-viewer";
import { decodeShare, readShareFragment } from "../../lib/share";

type State =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "ok"; markdown: string }
  | { kind: "error"; message: string };

function readEntryId(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return params.get("entry");
}

function scrollAndHighlight(entryId: string) {
  const el = document.getElementById(entryId);
  if (!el) return;
  // Force-open every <details> ancestor so the target row is visible.
  let parent: HTMLElement | null = el.parentElement;
  while (parent) {
    if (parent.tagName === "DETAILS") {
      (parent as HTMLDetailsElement).open = true;
    }
    parent = parent.parentElement;
  }
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("animate-highlight");
  window.setTimeout(() => el.classList.remove("animate-highlight"), 2600);
}

export default function ViewPage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fragment = readShareFragment();
    if (!fragment) {
      setState({ kind: "empty" });
      return;
    }
    decodeShare(fragment)
      .then((markdown) => setState({ kind: "ok", markdown }))
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Could not decode log";
        setState({ kind: "error", message });
      });
  }, []);

  // After the viewer renders, if the URL fragment carried an `entry=<id>`,
  // expand its ancestor sections, scroll to it, and flash it. Two RAFs to
  // give the section's collapsed → open transition a frame to land.
  useEffect(() => {
    if (state.kind !== "ok") return;
    const entryId = readEntryId();
    if (!entryId) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollAndHighlight(entryId));
    });
  }, [state]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <main>
      <div className="flex items-center justify-between gap-2 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Paste another
        </Link>
        {state.kind === "ok" && (
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-accent px-3 py-1.5 text-xs font-medium hover:bg-accent/70 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                Link copied
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" />
                Copy share link
              </>
            )}
          </button>
        )}
      </div>

      {state.kind === "loading" && (
        <p className="text-sm text-muted-foreground py-6">Decoding…</p>
      )}

      {state.kind === "empty" && (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No log in the URL fragment.{" "}
            <Link href="/" className="text-foreground underline underline-offset-2">
              Paste one on the home page
            </Link>{" "}
            to get a share link.
          </p>
        </div>
      )}

      {state.kind === "error" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to decode log: {state.message}
          </p>
        </div>
      )}

      {state.kind === "ok" && <FrictionLogViewer markdown={state.markdown} />}
    </main>
  );
}
