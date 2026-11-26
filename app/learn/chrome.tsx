import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { LearnTabs } from "@/components/app-tabs";

/** Header and footer shared by the public Learn pages. */
export default function LearnChrome({
  children,
  note = "These articles are general information and not medical advice. Speak to your GP before starting a weight loss plan, especially if you have a health condition, are pregnant, or are under 18.",
}: {
  children: ReactNode;
  note?: string;
}) {
  return (
    <>
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-5">
        <Link href="/"><Logo /></Link>
        <Link href="/journal" className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold text-leaf">
          Open my journal
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16">{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-3xl px-5 py-8 text-sm leading-relaxed text-muted">
          <p>{note}</p>
          <p className="mt-3">
            © {new Date().getFullYear()} My Weight Loss Journal ·{" "}
            <Link href="/learn" className="underline-offset-4 hover:underline">Learn</Link> ·{" "}
            <Link href="/how-we-calculate" className="underline-offset-4 hover:underline">How we calculate</Link> ·{" "}
            <Link href="/privacy" className="underline-offset-4 hover:underline">Privacy</Link> ·{" "}
            <Link href="/terms" className="underline-offset-4 hover:underline">Terms</Link>
          </p>
        </div>
      </footer>
      <LearnTabs />
    </>
  );
}
