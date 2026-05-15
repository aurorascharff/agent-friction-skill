import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  ViewContent,
  ViewSkeleton,
} from "../_components/view-content";

export const metadata: Metadata = {
  title: "Friction Log Viewer — View",
  description: "Render a friction log from a shareable URL fragment.",
};

export const unstable_instant = {};

export default function ViewPage() {
  return (
    <main>
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Paste another
        </Link>
      </div>
      <Suspense fallback={<ViewSkeleton />}>
        <ViewContent />
      </Suspense>
    </main>
  );
}
