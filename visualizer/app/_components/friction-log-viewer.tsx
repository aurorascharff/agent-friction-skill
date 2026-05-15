"use client";

import { useState, type ReactNode } from "react";
import { Check, ChevronRight, Link2, Search, Wrench } from "lucide-react";
import {
  extractTitle,
  parseSections,
  type LogEntry,
  type Section,
} from "../../lib/parse";

const FRICTION_DOT: Record<string, string> = {
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
};

const SOURCE_TAG_STYLE: Record<string, string> = {
  "web search": "bg-blue-500/15 text-blue-400",
  docs: "bg-purple-500/15 text-purple-400",
  "training data": "bg-amber-500/15 text-amber-400",
  "agents.md": "bg-emerald-500/15 text-emerald-400",
  skill: "bg-cyan-500/15 text-cyan-400",
  url: "bg-indigo-500/15 text-indigo-400",
  sandbox: "bg-orange-500/15 text-orange-400",
};

const SOURCE_TAG_RE =
  /\[(web search|docs|training data|agents\.md|skill|url|sandbox)\]/g;

const CODE_LIKE =
  /(?:^|\s)(\/[\w./-]+\.\w+|[\w./-]*\b(?:next\.config|tsconfig|package\.json|\.env|middleware|proxy\.ts)\b[\w.]*|\w+\(\))/g;

function autoCodeify(plain: string, keyBase: number): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m;
  CODE_LIKE.lastIndex = 0;

  while ((m = CODE_LIKE.exec(plain)) !== null) {
    const token = m[1] ?? m[0];
    const tokenStart = m.index + (m[0].length - token.length);
    if (tokenStart > last) {
      nodes.push(plain.slice(last, tokenStart));
    }
    nodes.push(
      <code
        key={`ac-${keyBase}-${tokenStart}`}
        className="rounded bg-muted px-1 py-0.5 text-[0.85em] font-mono text-foreground/90"
      >
        {token}
      </code>,
    );
    last = tokenStart + token.length;
  }

  if (last < plain.length) {
    nodes.push(plain.slice(last));
  }
  return nodes;
}

function FormattedText({ text }: { text: string }) {
  const sourceTags: { label: string; style: string }[] = [];
  const cleaned = text.replace(SOURCE_TAG_RE, (_, tag: string) => {
    sourceTags.push({ label: tag, style: SOURCE_TAG_STYLE[tag] ?? "" });
    return "";
  });

  const parts: ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        ...autoCodeify(cleaned.slice(lastIndex, match.index), match.index),
      );
    }
    if (match[2]) {
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-muted px-1 py-0.5 text-[0.85em] font-mono text-foreground/90"
        >
          {match[3]}
        </code>,
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < cleaned.length) {
    parts.push(...autoCodeify(cleaned.slice(lastIndex), lastIndex));
  }

  return (
    <>
      {parts}
      {sourceTags.map((tag, i) => (
        <span
          key={`src-${i}`}
          className={`ml-1.5 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${tag.style}`}
        >
          {tag.label}
        </span>
      ))}
    </>
  );
}

function AnchorLink({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        // Preserve the existing hash (which carries `log=<encoded>` on the
        // /view route) and add an `entry=<id>` param. Bare `#<id>` would
        // throw away the encoded log and break shareable deep-links.
        const params = new URLSearchParams(
          window.location.hash.replace(/^#/, ""),
        );
        params.set("entry", id);
        const newHash = `#${params.toString()}`;
        window.history.replaceState(null, "", newHash);
        navigator.clipboard.writeText(
          `${window.location.origin}${window.location.pathname}${window.location.search}${newHash}`,
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="opacity-0 group-hover/row:opacity-100 focus:opacity-100 shrink-0 mt-1 p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground transition-opacity"
      title="Copy link to this entry"
    >
      {copied ? (
        <Check className="w-3 h-3 text-green-500" />
      ) : (
        <Link2 className="w-3 h-3" />
      )}
    </button>
  );
}

function EntryToggle({
  entry,
  entryId,
}: {
  entry: LogEntry;
  entryId?: string;
}) {
  const isAction = entry.friction === "action";
  const hasChildren = entry.children.length > 0;
  const dot = entry.friction && !isAction ? FRICTION_DOT[entry.friction] : null;
  const ActionIcon = isAction
    ? entry.actionIcon === "search"
      ? Search
      : Wrench
    : null;

  if (!hasChildren) {
    return (
      <div
        id={entryId}
        className="flex items-start gap-2 py-1.5 sm:py-1 group/row rounded-md transition-colors min-w-0"
      >
        {entryId && <AnchorLink id={entryId} />}
        {dot && (
          <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
        )}
        {ActionIcon && (
          <ActionIcon className="w-3.5 h-3.5 mt-1 shrink-0 text-muted-foreground/60" />
        )}
        <span className="text-sm leading-relaxed text-foreground/80 min-w-0 [overflow-wrap:break-word]">
          <FormattedText text={entry.text} />
        </span>
      </div>
    );
  }

  return (
    <details id={entryId} className="group/entry">
      <summary className="list-none [&::-webkit-details-marker]:hidden flex items-start gap-2 py-1.5 sm:py-1 cursor-pointer w-full text-left rounded-md transition-colors min-w-0 group/row">
        {entryId && <AnchorLink id={entryId} />}
        <ChevronRight className="w-3.5 h-3.5 mt-1 shrink-0 text-muted-foreground/60 transition-transform group-open/entry:rotate-90" />
        {dot && (
          <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
        )}
        {ActionIcon && (
          <ActionIcon className="w-3.5 h-3.5 mt-1 shrink-0 text-muted-foreground/60" />
        )}
        <span className="text-sm leading-relaxed text-foreground/80 min-w-0 [overflow-wrap:break-word]">
          <FormattedText text={entry.text} />
        </span>
      </summary>
      <div className="pl-3 sm:pl-5 border-l border-border/40 ml-1.5 mt-0.5">
        {entry.children.map((child, i) => (
          <EntryToggle
            key={i}
            entry={child}
            entryId={entryId ? `${entryId}-${i}` : undefined}
          />
        ))}
      </div>
    </details>
  );
}

function RunInfoGrid({ entries }: { entries: LogEntry[] }) {
  // Render Run Info / Prompt entries with the same paragraph rhythm as
  // every other section so the dropdowns look visually consistent.
  // `FormattedText` already turns the `**Key:**` prefix into a bold span,
  // which carries the key/value distinction without a separate dl grid.
  return (
    <div>
      {entries
        .filter((entry) => entry.text.trim())
        .map((entry, i) => (
          <p
            key={i}
            className="pl-5 sm:pl-6 py-1.5 sm:py-1 text-sm leading-relaxed text-foreground/80 [overflow-wrap:break-word]"
          >
            <FormattedText text={entry.text} />
          </p>
        ))}
    </div>
  );
}

function PromptBlock({ entries }: { entries: LogEntry[] }) {
  // Renders the Prompt section as a terminal-style block: dark tinted
  // background, monospace, a `>` prompt prefix per line. Makes the
  // user's verbatim request visually distinct from the agent's
  // narrative below.
  const lines = entries
    .map((entry) => entry.text.replace(/^>\s?/, "").trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) {
    return <p className="text-xs text-muted-foreground/50 py-1">No prompt</p>;
  }
  return (
    <div className="rounded-md border border-border/60 bg-black/40 px-3 py-2 font-mono text-xs leading-relaxed text-foreground/80 overflow-x-auto">
      {lines.map((line, i) => (
        <div key={i} className="flex items-start gap-2 py-0.5">
          <span className="select-none text-green-500/70 shrink-0">&gt;</span>
          <span className="text-foreground/80 [overflow-wrap:break-word] min-w-0">
            <FormattedText text={line} />
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionToggle({
  section,
  sectionId,
  nested,
}: {
  section: Section;
  sectionId: string;
  nested?: boolean;
}) {
  const isEmpty =
    section.entries.length === 0 && section.subsections.length === 0;
  const isRunInfo = section.title === "Run Info";
  const isPrompt = section.title === "Prompt";

  const groupClass = nested ? "group/sub" : "group/section";
  const chevronRotate = nested
    ? "group-open/sub:rotate-90"
    : "group-open/section:rotate-90";

  return (
    <details
      id={sectionId}
      className={groupClass}
      open={section.defaultOpen || undefined}
    >
      <summary className="list-none [&::-webkit-details-marker]:hidden flex items-center gap-2 py-2.5 sm:py-2 cursor-pointer text-left group/row">
        <AnchorLink id={sectionId} />
        <ChevronRight
          className={`w-4 h-4 shrink-0 text-muted-foreground/50 transition-transform ${chevronRotate}`}
        />
        <span
          className={
            nested
              ? "text-sm text-muted-foreground min-w-0 [overflow-wrap:break-word]"
              : "text-sm font-medium min-w-0 [overflow-wrap:break-word]"
          }
        >
          {section.title}
        </span>
        {nested && section.entries.length > 0 && (
          <span className="text-xs text-muted-foreground/50 tabular-nums">
            {section.entries.length}
          </span>
        )}
      </summary>
      <div className="mt-1 mb-2 ml-3 sm:ml-6">
        {isPrompt ? (
          <PromptBlock entries={section.entries} />
        ) : isRunInfo ? (
          <RunInfoGrid entries={section.entries} />
        ) : (
          section.entries.map((entry, i) => (
            <EntryToggle
              key={i}
              entry={entry}
              entryId={`${sectionId}-e${i}`}
            />
          ))
        )}
        {section.subsections.map((sub, i) => (
          <SectionToggle
            key={`sub-${i}`}
            section={sub}
            sectionId={`${sectionId}-sub${i}`}
            nested
          />
        ))}
        {isEmpty && (
          <p className="text-xs text-muted-foreground/50 py-1">No content</p>
        )}
      </div>
    </details>
  );
}

export function FrictionLogViewer({ markdown }: { markdown: string }) {
  const title = extractTitle(markdown);
  const allSections = parseSections(markdown);

  const sectionOrder = (sectionTitle: string): number => {
    const lower = sectionTitle.toLowerCase();
    if (lower === "run info") return 0;
    if (lower === "prompt") return 1;
    if (lower === "tool timeline") return 2;
    if (lower === "summary") return 3;
    if (lower.includes("action")) return 4;
    if (lower === "log") return 5;
    if (lower.includes("skill feedback")) return 7;
    return 6;
  };
  const sections = [...allSections].sort(
    (a, b) => sectionOrder(a.title) - sectionOrder(b.title),
  );

  if (sections.length === 0 && !title) {
    return (
      <p className="text-sm text-muted-foreground py-6">
        Nothing to render — paste a friction log in the textarea above.
      </p>
    );
  }

  return (
    <div>
      {title && (
        <h1 className="text-2xl font-semibold tracking-tight mb-6 [overflow-wrap:break-word]">
          {title}
        </h1>
      )}
      <div className="space-y-1">
        {sections.map((section, i) => (
          <SectionToggle
            key={i}
            section={section}
            sectionId={`s-${i}-${section.title.toLowerCase().replace(/\s+/g, "-")}`}
          />
        ))}
      </div>
    </div>
  );
}
