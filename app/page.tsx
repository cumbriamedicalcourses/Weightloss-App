import Link from "next/link";

const AMAZON_URL = process.env.NEXT_PUBLIC_AMAZON_URL;

const steps = [
  {
    title: "Write down what you eat",
    body: "Search a food, type it in yourself, or take a photo of your plate and let the app suggest the calories. You check every entry before it is saved.",
  },
  {
    title: "Write down how you move",
    body: "Pick an activity and how long you did it. The journal works out the calories from your own weight, from a walk to the shops to a swim.",
  },
  {
    title: "Read the day at a glance",
    body: "One line tells you where you stand: calories in, calories out, and what is left of today's target. Your weight is charted week by week.",
  },
];

function LedgerPreview() {
  const rows = [
    ["Breakfast", "Porridge with banana", "310"],
    ["Lunch", "Chicken salad wrap", "450"],
    ["Dinner", "Salmon, new potatoes, greens", "560"],
    ["Snack", "Apple", "80"],
  ];
  return (
    <div className="card relative w-full max-w-sm rotate-1 p-6 shadow-[0_24px_60px_-30px_rgb(31_42_36/0.45)]">
      <div className="absolute inset-y-0 left-9 w-px bg-clay/30" aria-hidden />
      <p className="pl-8 font-display text-lg text-ink">Tuesday</p>
      <ul className="mt-3 text-sm">
        {rows.map(([meal, food, kcal]) => (
          <li key={meal} className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 pl-8">
            <span>
              <span className="block text-xs uppercase tracking-wide text-muted">{meal}</span>
              {food}
            </span>
            <span className="tabular-nums text-ink">{kcal}</span>
          </li>
        ))}
        <li className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 pl-8">
          <span>
            <span className="block text-xs uppercase tracking-wide text-muted">Exercise</span>
            Brisk walk, 40 minutes
          </span>
          <span className="tabular-nums text-leaf">−215</span>
        </li>
      </ul>
      <div className="mt-4 flex items-baseline justify-between pl-8">
        <span className="text-sm text-muted">Left today</span>
        <span className="font-display text-3xl tabular-nums text-leaf">465</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <span className="font-display text-lg text-ink">My Weight Loss Journal</span>
        <nav className="flex items-center gap-5" aria-label="Site">
          <Link href="/learn" className="text-sm font-semibold text-leaf underline-offset-4 hover:underline">
            Learn
          </Link>
          <Link href="/login" className="text-sm font-semibold text-leaf underline-offset-4 hover:underline">
            Sign in
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-5xl items-center gap-12 px-5 pb-20 pt-8 md:grid-cols-[1.1fr_0.9fr] md:pt-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">
              The companion to the book
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.08] text-ink sm:text-6xl">
              Your journal, kept up to date in your pocket.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Weight Loss Journal gives you the pages. This free app does the sums: log your food,
              drink and exercise, and see your calories in and out for the day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login?new=1" className="btn">
                Start your journal
              </Link>
              {AMAZON_URL ? (
                <a href={AMAZON_URL} className="btn-quiet" target="_blank" rel="noopener noreferrer">
                  Get the book on Amazon
                </a>
              ) : null}
            </div>
            <p className="mt-4 text-sm text-muted">Free to use. Works on your phone, tablet and computer.</p>
          </div>
          <div className="flex justify-center md:justify-end">
            <LedgerPreview />
          </div>
        </section>

        <section className="border-y border-line bg-card">
          <div className="mx-auto w-full max-w-5xl px-5 py-16">
            <h2 className="font-display text-3xl text-ink">How the journal works</h2>
            <ol className="mt-10 grid gap-10 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className="font-display text-4xl text-clay">{i + 1}</span>
                  <h3 className="mt-3 text-lg font-semibold text-ink">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-5 py-16">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl text-ink">Take a photo, check the estimate</h2>
              <p className="mt-4 leading-relaxed text-muted">
                Not sure how many calories are on the plate? Take a photo and the app lists what it
                sees with an estimate for each item. Change anything that looks wrong, then save. The
                photo is used for the estimate and is not kept.
              </p>
            </div>
            <div>
              <h2 className="font-display text-3xl text-ink">A target that fits you</h2>
              <p className="mt-4 leading-relaxed text-muted">
                Tell the journal your height, weight and goal, and it suggests a daily calorie target
                for steady, sustainable loss. You can set your own number at any time.
              </p>
            </div>
          </div>
          <div className="mt-12">
            <Link href="/login?new=1" className="btn">
              Start your journal
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-5xl px-5 py-8 text-sm leading-relaxed text-muted">
          <p>
            Calorie figures are estimates to help you keep a journal. They are not medical advice.
            Speak to your GP before starting a weight loss plan, especially if you have a health
            condition, are pregnant, or are under 18.
          </p>
          <p className="mt-3">
            © {new Date().getFullYear()} My Weight Loss Journal ·{" "}
            <Link href="/learn" className="underline-offset-4 hover:underline">Learn</Link> ·{" "}
            <Link href="/privacy" className="underline-offset-4 hover:underline">Privacy</Link> ·{" "}
            <Link href="/terms" className="underline-offset-4 hover:underline">Terms</Link>
          </p>
        </div>
      </footer>
    </>
  );
}
