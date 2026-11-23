import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES, TOPICS } from "@/lib/articles";
import LearnChrome from "./chrome";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Short, practical guides to losing weight: how it works, setting a goal, plateaus, eating out, emotional eating and sleep.",
};

export default function LearnPage() {
  return (
    <LearnChrome>
      <h1 className="mt-6 font-display text-4xl text-ink">Learn</h1>
      <p className="mt-3 max-w-xl text-lg leading-relaxed text-muted">
        Short, practical guides to go with your journal, each with a short video. Each one takes a few minutes.
      </p>
      {TOPICS.map((topic) => {
        const list = ARTICLES.filter((a) => a.topic === topic);
        if (!list.length) return null;
        return (
          <section key={topic} className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">{topic}</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {list.map((a) => (
                <li key={a.slug}>
                  <Link href={`/learn/${a.slug}`} className="card block h-full p-5 transition hover:border-leaf">
                    <span className="block font-display text-xl text-ink">{a.title}</span>
                    <span className="mt-1.5 block text-muted">{a.summary}</span>
                    <span className="mt-3 flex items-center gap-3 text-sm text-muted">
                      {a.video ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-leaf-soft px-2.5 py-0.5 font-semibold text-leaf">
                          <Icon name="video" className="size-4" /> Video
                        </span>
                      ) : null}
                      {a.minutes} minute read
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </LearnChrome>
  );
}
