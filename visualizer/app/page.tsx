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
    <main className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Paste a friction log
          </h1>
          <p className="text-sm text-muted-foreground">
            Drop a log produced by the{" "}
            <a
              href="https://github.com/aurorascharff/agent-friction-skill"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground/40 transition-colors"
            >
              agent-friction skill
            </a>{" "}
            and view it cleanly. Nothing leaves your browser.
          </p>
        </div>
        <PasteForm />
      </div>
    </main>
  );
}
