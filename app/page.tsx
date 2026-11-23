import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { GUARANTEE_DAYS, PLANS, TRIAL_DAYS } from "@/lib/membership-shared";

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

const features: { icon: IconName; title: string; body: string }[] = [
  { icon: "camera", title: "Photo estimates", body: "Snap your plate and check the suggested calories." },
  { icon: "barcode", title: "Barcode scanner", body: "Scan packets and cans for exact label figures." },
  { icon: "plans", title: "12 meal plans", body: "With swaps and a ready-made shopping list." },
  { icon: "exercise", title: "Exercise programme", body: "A weekly plan for under 50s and over 50s." },
  { icon: "coach", title: "Personal coach", body: "Questions answered using your own journal." },
  { icon: "video", title: "Short videos", body: "14 narrated lessons on the habits that matter." },
  { icon: "progress", title: "Progress and streaks", body: "Weight trend, measurements and milestones." },
  { icon: "report", title: "GP report", body: "A tidy summary to take to your appointment." },
];

/** A stand-in for the book cover until the real cover image is added. */
function BookCover() {
  return (
    <div className="relative flex aspect-[2/3] w-32 flex-col justify-between rounded-r-lg rounded-l-sm bg-gradient-to-br from-leaf to-[#0b2c4d] p-3.5 text-white shadow-[0_30px_60px_-25px_rgb(18_40_58/0.7)] sm:w-44 sm:p-4">
      <div className="absolute inset-y-0 left-0 w-2 rounded-l-sm bg-black/20" aria-hidden />
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ffb98c]">The book</p>
      <div>
        <p className="font-display text-xl leading-tight sm:text-3xl">Weight Loss Journal</p>
        <div className="mt-3 h-0.5 w-10 bg-clay" aria-hidden />
      </div>
      <p className="text-[11px] text-white/75">Your daily record</p>
    </div>
  );
}

/** A phone showing a simplified Today screen. */
function PhonePreview() {
  const r = 34;
  const c = 2 * Math.PI * r;
  const meals: [IconName, string, string][] = [
    ["breakfast", "Porridge with banana", "310"],
    ["lunch", "Chicken salad wrap", "450"],
    ["dinner", "Salmon and greens", "560"],
  ];
  return (
    <div className="w-60 rounded-[2.4rem] border-[7px] border-ink bg-paper p-3 shadow-[0_40px_80px_-30px_rgb(18_40_58/0.6)] sm:w-64">
      <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-ink/80" aria-hidden />
      <div className="flex items-center justify-between px-1">
        <p className="font-display text-lg text-ink">Today</p>
        <p className="inline-flex items-center gap-1 rounded-full bg-clay-soft px-2 py-0.5 text-[10px] font-semibold text-clay">
          <Icon name="flame" className="size-3" /> 12-day streak
        </p>
      </div>
      <div className="card mt-2 flex items-center gap-3 p-3">
        <div className="relative size-24 shrink-0">
          <svg viewBox="0 0 80 80" className="size-full -rotate-90" aria-hidden>
            <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-leaf-soft" />
            <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * 0.2} className="stroke-leaf" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-xl leading-none text-leaf">200</span>
            <span className="text-[9px] text-muted">kcal left</span>
          </div>
        </div>
        <dl className="flex-1 space-y-1 text-[11px]">
          <div className="flex justify-between"><dt className="text-muted">Target</dt><dd className="tabular-nums">1,520</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Eaten</dt><dd className="tabular-nums">1,320</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Exercise</dt><dd className="tabular-nums text-leaf">215</dd></div>
        </dl>
      </div>
      <ul className="card mt-2 px-3 text-[11px]">
        {meals.map(([icon, food, kcal]) => (
          <li key={food} className="flex items-center gap-2 border-b border-line py-2 last:border-b-0">
            <span className="flex size-6 items-center justify-center rounded-md bg-leaf-soft text-leaf">
              <Icon name={icon} className="size-3.5" />
            </span>
            <span className="flex-1 truncate">{food}</span>
            <span className="tabular-nums">{kcal}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 grid grid-cols-5 border-t border-line pt-2 text-leaf/70" aria-hidden>
        {(["today", "plans", "progress", "learn", "profile"] as IconName[]).map((n, i) => (
          <Icon key={n} name={n} className={`mx-auto size-4 ${i === 0 ? "text-leaf" : "text-muted"}`} />
        ))}
      </div>
    </div>
  );
}

function BookAndPhone() {
  return (
    <div className="relative pb-4">
      <div className="ml-[88px] sm:ml-[132px]">
        <PhonePreview />
      </div>
      <div className="absolute bottom-0 left-0 z-10 -rotate-6">
        <BookCover />
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
              Weight Loss Journal gives you the pages. This app does the sums: log your food,
              drink and exercise, follow a plan made for you, and see your progress week by week.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login?new=1" className="btn">
                Start your 7-day free trial
              </Link>
              {AMAZON_URL ? (
                <a href={AMAZON_URL} className="btn-quiet" target="_blank" rel="noopener noreferrer">
                  Get the book on Amazon
                </a>
              ) : null}
            </div>
            <p className="mt-4 text-sm text-muted">7-day free trial, then one simple membership. Works on your phone, tablet and computer.</p>
          </div>
          <div className="flex justify-center md:justify-end">
            <BookAndPhone />
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

        <section className="mx-auto w-full max-w-5xl px-5 pt-16">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">Everything in one place</p>
          <h2 className="mt-3 font-display text-3xl text-ink">One app for the whole journey</h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {features.map((f) => (
              <li key={f.title} className="card p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-leaf-soft text-leaf">
                  <Icon name={f.icon} />
                </span>
                <h3 className="mt-3 font-semibold text-ink">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{f.body}</p>
              </li>
            ))}
          </ul>
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
        </section>

        <section className="border-t border-line bg-card" aria-labelledby="pricing">
          <div className="mx-auto w-full max-w-5xl px-5 py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">One simple membership</p>
            <h2 id="pricing" className="mt-3 font-display text-3xl text-ink">Try everything free for {TRIAL_DAYS} days</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted">
              Every feature is included in both plans. Cancel before your free week ends and you pay nothing.
            </p>
            <div className="mt-8 grid gap-4 md:max-w-3xl md:grid-cols-2">
              {PLANS.map((p) => (
                <div key={p.id} className={`relative rounded-2xl border-2 p-6 ${p.id === "yearly" ? "border-leaf" : "border-line"}`}>
                  {p.id === "yearly" ? (
                    <span className="absolute -top-3 left-6 rounded-full bg-clay px-3 py-0.5 text-xs font-semibold text-white">Best value</span>
                  ) : null}
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="mt-2">
                    <span className="font-display text-4xl text-ink">{p.price}</span>
                    <span className="ml-1 text-muted">{p.per}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted">{p.note}</p>
                </div>
              ))}
            </div>
            <ul className="mt-6 space-y-2 text-ink">
              {[
                `${TRIAL_DAYS}-day free trial, then your chosen plan`,
                `${GUARANTEE_DAYS}-day money-back guarantee on your first payment`,
                "Cancel at any time from your profile",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Icon name="check" className="size-5 text-leaf" strokeWidth={2.4} /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/login?new=1" className="btn">
                Start your {TRIAL_DAYS}-day free trial
              </Link>
            </div>
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
