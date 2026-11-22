import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle } from "@/lib/articles";
import LearnChrome from "../chrome";

const AMAZON_URL = process.env.NEXT_PUBLIC_AMAZON_URL;
// Videos are only embedded from our video host.
const VIDEO_HOST = "https://iframe.mediadelivery.net/";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/learn/${article.slug}` },
  };
}

export default async function ArticlePage({ params }: PageProps<"/learn/[slug]">) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const more = ARTICLES.filter((a) => a.slug !== article.slug && a.topic === article.topic)
    .concat(ARTICLES.filter((a) => a.topic !== article.topic))
    .slice(0, 3);

  return (
    <LearnChrome>
      <p className="mt-6 text-sm">
        <Link href="/learn" className="font-semibold text-leaf underline-offset-4 hover:underline">
          ‹ All articles
        </Link>
      </p>
      <article className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">{article.topic}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink">{article.title}</h1>
        <p className="mt-3 text-sm text-muted">{article.minutes} minute read</p>

        {article.video?.startsWith(VIDEO_HOST) ? (
          <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-line bg-card">
            <iframe
              src={article.video}
              title={`Video: ${article.title}`}
              loading="lazy"
              allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          </div>
        ) : null}

        <div className="mt-6 max-w-2xl text-lg leading-relaxed text-ink">
          {article.body.map((b, i) =>
            b.h ? (
              <h2 key={i} className="mt-8 font-display text-2xl text-ink">{b.h}</h2>
            ) : b.list ? (
              <ul key={i} className="mt-4 list-disc space-y-2 pl-6 marker:text-leaf">
                {b.list.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <p key={i} className="mt-4">{b.p}</p>
            ),
          )}
        </div>
      </article>

      <section className="card mt-10 p-6">
        <h2 className="font-display text-2xl text-ink">Put it into practice</h2>
        <p className="mt-2 text-muted">
          Keep your food, exercise and weight in one place, and see where you stand each day.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/journal" className="btn">Open my journal</Link>
          {AMAZON_URL ? (
            <a href={AMAZON_URL} className="btn-quiet" rel="noopener">Get the book on Amazon</a>
          ) : null}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">Read next</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {more.map((a) => (
            <li key={a.slug}>
              <Link href={`/learn/${a.slug}`} className="card block h-full p-4 transition hover:border-leaf">
                <span className="block font-semibold text-ink">{a.title}</span>
                <span className="mt-1 block text-sm text-muted">{a.minutes} minute read</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </LearnChrome>
  );
}
