import LearnChrome from "@/app/learn/chrome";
import type { Block } from "@/lib/articles";

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

/** Shared layout for the privacy policy and the terms. */
export default function LegalPage({ title, updated, body }: { title: string; updated: string; body: Block[] }) {
  return (
    <LearnChrome note="Calorie figures are estimates to help you keep a journal. They are not medical advice.">
      <h1 className="mt-6 font-display text-4xl text-ink">{title}</h1>
      <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
      <div className="mt-4 max-w-2xl leading-relaxed text-ink">
        {body.map((b, i) =>
          b.h ? (
            <h2 key={i} className="mt-8 font-display text-2xl text-ink">{b.h}</h2>
          ) : b.list ? (
            <ul key={i} className="mt-3 list-disc space-y-1.5 pl-6 marker:text-leaf">
              {b.list.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p key={i} className="mt-3">{b.p}</p>
          ),
        )}
      </div>
    </LearnChrome>
  );
}
