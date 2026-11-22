import Link from "next/link";
import type { ReactNode } from "react";

/** Header and footer shared by the public Learn pages. */
export default function LearnChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-5">
        <Link href="/" className="font-display text-lg text-ink">My Weight Loss Journal</Link>
        <Link href="/journal" className="text-sm font-semibold text-leaf underline-offset-4 hover:underline">
          Open my journal
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16">{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-3xl px-5 py-8 text-sm leading-relaxed text-muted">
          <p>
            These articles are general information and not medical advice. Speak to your GP before starting a weight
            loss plan, especially if you have a health condition, are pregnant, or are under 18.
          </p>
          <p className="mt-3">© {new Date().getFullYear()} My Weight Loss Journal</p>
        </div>
      </footer>
    </>
  );
}
