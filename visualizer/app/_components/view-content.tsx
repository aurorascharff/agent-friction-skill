"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Link2 } from "lucide-react";
import { FrictionLogViewer } from "./friction-log-viewer";
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

export function ViewContent() {
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
    <>
      {state.kind === "ok" && (
        <div className="flex justify-end mb-6">
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
        </div>
      )}

      {state.kind === "loading" && <ViewSkeleton />}

      {state.kind === "empty" && (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No log in the URL fragment.{" "}
            <Link
              href="/"
              className="text-foreground underline underline-offset-2"
            >
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
    </>
  );
}

export function ViewSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-7 w-2/3 rounded bg-muted/60" />
      <div className="space-y-2 pt-3">
        <div className="h-4 w-24 rounded bg-muted/60" />
        <div className="h-4 w-1/2 rounded bg-muted/40" />
      </div>
      <div className="space-y-2 pt-4">
        <div className="h-4 w-20 rounded bg-muted/60" />
        <div className="h-3 w-full rounded bg-muted/40" />
        <div className="h-3 w-11/12 rounded bg-muted/40" />
        <div className="h-3 w-10/12 rounded bg-muted/40" />
      </div>
      <div className="space-y-2 pt-4">
        <div className="h-4 w-28 rounded bg-muted/60" />
        <div className="h-3 w-3/4 rounded bg-muted/40" />
        <div className="h-3 w-2/3 rounded bg-muted/40" />
      </div>
    </div>
  );
}
