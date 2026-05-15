import type { Metadata } from "next";
import { PasteForm } from "./_components/paste-form";

export const metadata: Metadata = {
  title: "Friction Log Viewer",
  description:
    "Paste a friction log produced by the agent-friction skill and view it cleanly.",
};

export const unstable_instant = {};

export default function HomePage() {
  return (
    <main className="relative">
      {/* Vercel-style ambient background: a top radial halo plus a faint
          dotted grid masked to fade out toward the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-[-20%] h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,black,transparent_75%)]" />
      </div>

      <div className="flex flex-col items-center pt-10 sm:pt-14 pb-12">
        <div className="w-full max-w-2xl">
          {/* Headline */}
          <h1 className="text-center text-4xl sm:text-5xl font-semibold tracking-tight mb-3 text-foreground">
            Friction Log.
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-8 [text-wrap:balance] max-w-md mx-auto">
            Paste a log from the{" "}
            <a
              href="https://github.com/aurorascharff/agent-friction-skill"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/90 hover:text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground/40 transition-colors"
            >
              agent-friction skill
            </a>{" "}
            to read it cleanly. Nothing leaves your browser.
          </p>

          {/* Editor-style card */}
          <div className="rounded-xl border border-border bg-card/80 backdrop-blur shadow-2xl shadow-black/40 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-black/40">
              <div className="flex gap-1.5" aria-hidden>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              <span className="ml-1 text-[11px] font-mono text-muted-foreground tabular-nums">
                friction-log.md
              </span>
            </div>
            <PasteForm />
          </div>
        </div>
      </div>
    </main>
  );
}
