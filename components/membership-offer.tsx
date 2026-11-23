"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { GUARANTEE_DAYS, PLANS, TRIAL_DAYS, type Plan } from "@/lib/membership-shared";
import { useMembership } from "@/lib/use-membership";

const INCLUDED: [IconName, string][] = [
  ["today", "Your daily journal with a personal calorie target"],
  ["camera", "Photo and barcode calorie estimates"],
  ["plans", "12 meal plans with swaps and shopping lists"],
  ["exercise", "An exercise programme for your age"],
  ["coach", "Your coach, answering from your own journal"],
  ["video", "14 short videos on the habits that matter"],
  ["report", "Progress charts and a GP report"],
];

const longDate = (secs: number) =>
  new Date(secs * 1000).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

/** The plans, the free week and the guarantee. Shown on the membership page and when the journal is locked. */
export default function MembershipOffer({ locked = false }: { locked?: boolean }) {
  const { view, checkout, busy, error } = useMembership();
  const [plan, setPlan] = useState<Plan>("yearly");
  const trial = view?.trialAvailable ?? true;
  // The first payment date, worked out once when the page opens.
  const [firstCharge] = useState(() =>
    new Date(Date.now() + TRIAL_DAYS * 86_400_000).toLocaleDateString(undefined, { day: "numeric", month: "long" }),
  );

  return (
    <section aria-label="Membership plans">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">
        {locked ? "Your plan is ready" : "Membership"}
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink">
        {trial ? `Start your ${TRIAL_DAYS}-day free trial` : "Choose your membership"}
      </h1>
      <p className="mt-2 text-muted">
        {trial
          ? `Everything in the journal, free for ${TRIAL_DAYS} days. Cancel any time before ${firstCharge} and you pay nothing.`
          : "Everything in the journal, for one simple price."}
      </p>

      <div className="mt-5 grid gap-3" role="radiogroup" aria-label="Choose a plan">
        {PLANS.map((p) => {
          const on = plan === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setPlan(p.id)}
              className={`relative flex items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left transition ${
                on ? "border-leaf" : "border-line hover:border-leaf/50"
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  on ? "border-leaf bg-leaf text-white" : "border-line"
                }`}
                aria-hidden
              >
                {on ? <Icon name="check" className="size-3.5" strokeWidth={3} /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{p.name}</span>
                <span className="block text-sm text-muted">{p.note}</span>
              </span>
              <span className="text-right">
                <span className="block font-display text-2xl text-ink">{p.price}</span>
                <span className="block text-xs text-muted">{p.per}</span>
              </span>
              {p.id === "yearly" ? (
                <span className="absolute -top-2.5 right-4 rounded-full bg-clay px-2.5 py-0.5 text-xs font-semibold text-white">
                  Best value
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {error ? <p className="mt-4 rounded-xl bg-clay-soft px-3.5 py-3 text-sm text-clay" role="alert">{error}</p> : null}

      <button type="button" className="btn mt-5 w-full" disabled={busy} onClick={() => void checkout(plan)}>
        {busy ? "Opening secure payment…" : trial ? "Start my free trial" : "Continue to payment"}
      </button>
      <p className="mt-3 text-center text-sm text-muted">
        {trial
          ? `Your card is needed to start, but nothing is taken until ${firstCharge}. We'll remind you by email before then.`
          : "Payment is handled securely by Stripe."}
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-leaf-soft p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-leaf">
          <Icon name="check" strokeWidth={2.4} />
        </span>
        <p className="text-sm text-ink">
          <span className="font-semibold">{GUARANTEE_DAYS}-day money-back guarantee.</span> If the journal is not for you,
          ask within {GUARANTEE_DAYS} days of your first payment and we will refund it in full.
        </p>
      </div>

      <h2 className="mt-8 font-semibold text-ink">Everything included</h2>
      <ul className="mt-3 space-y-2.5">
        {INCLUDED.map(([icon, text]) => (
          <li key={text} className="flex items-center gap-3 text-ink">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-leaf-soft text-leaf">
              <Icon name={icon} className="size-4" />
            </span>
            {text}
          </li>
        ))}
      </ul>
      {view?.periodEnd && !view.access && view.status !== "none" ? (
        <p className="mt-6 text-sm text-muted">Your last membership ended on {longDate(view.periodEnd)}.</p>
      ) : null}
    </section>
  );
}
