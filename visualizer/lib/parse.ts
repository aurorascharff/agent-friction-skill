/**
 * Friction-log markdown parser. Ported from the DX Agent dashboard's
 * `friction-log-viewer.tsx` and stripped of FrictionRun-specific bits.
 *
 * Output: a tree of sections (H1/H2/H3) where each section contains
 * a flat list of LogEntry nodes; bullet lists become nested entries.
 */

export type LogEntry = {
  text: string;
  indent: number;
  friction: "red" | "yellow" | "green" | "action" | null;
  actionIcon?: "wrench" | "search";
  children: LogEntry[];
};

export type Section = {
  title: string;
  entries: LogEntry[];
  subsections: Section[];
  defaultOpen: boolean;
};

function detectFriction(
  line: string,
): "red" | "yellow" | "green" | "action" | null {
  if (/🔴|:red_circle:/.test(line)) return "red";
  if (/🟡|:yellow_circle:/.test(line)) return "yellow";
  if (/🟢|:large_green_circle:/.test(line)) return "green";
  if (/🔧|🔍/.test(line)) return "action";
  return null;
}

export function parseLogEntries(text: string): LogEntry[] {
  const lines = text.split("\n");
  const root: LogEntry[] = [];
  const stack: { entries: LogEntry[]; indent: number }[] = [
    { entries: root, indent: -1 },
  ];

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (/^[─\-]{3,}$/.test(trimmed)) continue;

    const leadingSpaces = raw.search(/\S/);
    const isBullet = /^[•\-]\s/.test(trimmed) || /^\*\s(?!\*)/.test(trimmed);
    const indent = leadingSpaces;
    const stripped = isBullet ? trimmed.replace(/^[•\-*]\s+/, "") : trimmed;
    const cleanedText = stripped
      .replace(
        /🔴|🟡|🟢|🔧|🔍|:red_circle:|:yellow_circle:|:large_green_circle:/g,
        "",
      )
      .trim();

    const friction = detectFriction(stripped);
    const entry: LogEntry = {
      text: cleanedText,
      indent,
      friction,
      actionIcon:
        friction === "action"
          ? /🔧/.test(stripped)
            ? "wrench"
            : "search"
          : undefined,
      children: [],
    };

    while (stack.length > 1 && stack[stack.length - 1]!.indent >= indent) {
      stack.pop();
    }

    stack[stack.length - 1]!.entries.push(entry);

    if (isBullet) {
      stack.push({ entries: entry.children, indent });
    }
  }

  return root;
}

export function parseSections(markdown: string): Section[] {
  const sections: Section[] = [];
  const lines = markdown.split("\n");

  let preambleLines: string[] = [];
  let currentH2: Section | null = null;
  let currentH3: Section | null = null;
  let bodyLines: string[] = [];

  function flushBody() {
    const text = bodyLines.join("\n");
    const entries = parseLogEntries(text);
    if (currentH3) {
      currentH3.entries = entries;
    } else if (currentH2) {
      currentH2.entries.push(...entries);
    }
    bodyLines = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[─]{3,}$/.test(trimmed)) continue;

    const h3Match = trimmed.match(/^###\s+(.+)$/);
    const h2Match = trimmed.match(/^##\s+(.+)$/);
    const h1Match = trimmed.match(/^#\s+(.+)$/);
    const boldMatch = trimmed.match(/^\*\*(.+?)\*\*\s*$/);

    // H1 is the document title (rendered separately above the section
    // tree). Never treat it as a section — that produces a duplicate
    // "Friction Log: ..." block wedged in alongside the real sections.
    if (h1Match && !h2Match) {
      continue;
    }

    if (h3Match) {
      flushBody();
      currentH3 = {
        title: h3Match[1]!,
        entries: [],
        subsections: [],
        defaultOpen: true,
      };
      if (currentH2) {
        currentH2.subsections.push(currentH3);
      } else {
        sections.push(currentH3);
      }
      continue;
    }

    if (h2Match) {
      flushBody();
      if (currentH2) {
        sections.push(currentH2);
      } else if (preambleLines.length > 0) {
        const entries = parseLogEntries(preambleLines.join("\n"));
        if (entries.length > 0) {
          sections.push({
            title: "Run Info",
            entries,
            subsections: [],
            defaultOpen: false,
          });
        }
      }
      const title = h2Match[1]!;
      const lower = title.toLowerCase();
      currentH2 = {
        title,
        entries: [],
        subsections: [],
        defaultOpen:
          lower.includes("summary") ||
          lower.includes("action") ||
          lower.includes("log"),
      };
      currentH3 = null;
      preambleLines = [];
      continue;
    }

    if (boldMatch && !currentH2) {
      flushBody();
      if (preambleLines.length > 0) {
        const entries = parseLogEntries(preambleLines.join("\n"));
        if (entries.length > 0) {
          sections.push({
            title: "Run Info",
            entries,
            subsections: [],
            defaultOpen: false,
          });
        }
        preambleLines = [];
      }
      currentH2 = {
        title: boldMatch[1]!,
        entries: [],
        subsections: [],
        defaultOpen:
          boldMatch[1]!.toLowerCase().includes("summary") ||
          boldMatch[1]!.toLowerCase().includes("action") ||
          boldMatch[1]!.toLowerCase().includes("log"),
      };
      currentH3 = null;
      continue;
    }

    if (!currentH2) {
      preambleLines.push(line);
    } else {
      bodyLines.push(line);
    }
  }

  flushBody();
  if (currentH2) {
    sections.push(currentH2);
  } else if (preambleLines.length > 0) {
    const entries = parseLogEntries(preambleLines.join("\n"));
    if (entries.length > 0) {
      sections.push({
        title: "Run Info",
        entries,
        subsections: [],
        defaultOpen: false,
      });
    }
  }

  return sections;
}

/**
 * Pull a title from the first `# Friction Log: ...` heading, falling
 * back to the first non-empty line.
 */
export function extractTitle(markdown: string): string | null {
  const match = markdown.match(/^#\s+(?:Friction Log:\s*)?(.+)$/m);
  return match?.[1]?.trim() ?? null;
}
