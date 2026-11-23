"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import MembershipOffer from "@/components/membership-offer";
import { Icon } from "@/components/icons";
import { GUARANTEE_DAYS, PLANS } from "@/lib/membership-shared";
import { CONTACT_EMAIL } from "@/components/legal-page";
import { useMembership } from "@/lib/use-membership";

const longDate = (secs: number) =>
  new Date(secs * 1000).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

function Status() {
  const { view, manage, busy, error, refresh } = useMembership();
  const welcome = useSearchParams().get("welcome") === "1";

  // Stripe confirms a new membership a moment after the payment page closes, so check again shortly.
  useEffect(() => {
    if (!welcome || view?.access) return;
    const t = setTimeout(refresh, 2500);
    return () => clearTimeout(t);
  }, [welcome, view, refresh]);

  if (!view) return null;

  if (!view.required) {
    return (
      <section className="card p-5">
        <h1 className="font-display text-2xl text-ink">Membership</h1>
        <p className="mt-2 text-muted">Membership has not started yet, so everything in the journal is open to you for now.</p>
      </section>
    );
  }

  if (view.free) {
    return (
      <section className="card p-5">
        <h1 className="font-display text-2xl text-ink">Membership</h1>
        <p className="mt-2 text-muted">Your account has full access at no charge.</p>
      </section>
    );
  }

  if (!view.access) {
    if (welcome) return <p className="card p-5 text-muted" role="status">Confirming your membership…</p>;
    return <MembershipOffer />;
  }

  const plan = PLANS.find((p) => p.id === view.plan);
  const price = plan ? `${plan.price} ${plan.per}` : "your plan";
  let line: string;
  if (view.status === "trialing" && view.trialEnd) {
    line = view.cancelAtPeriodEnd
      ? `Your free trial ends on ${longDate(view.trialEnd)}. You have cancelled, so you will not be charged.`
      : `Your free trial runs until ${longDate(view.trialEnd)}. After that it is ${price}.`;
  } else if (view.status === "past_due") {
    line = "Your last payment did not go through. Please update your card to keep your journal open.";
  } else if (view.cancelAtPeriodEnd && view.periodEnd) {
    line = `Your membership is cancelled and stays open until ${longDate(view.periodEnd)}.`;
  } else {
    line = view.periodEnd ? `${plan?.name ?? "Your"} membership, ${price}. Next payment on ${longDate(view.periodEnd)}.` : "Your membership is active.";
  }

  return (
    <>
      {welcome ? (
        <p className="mb-4 flex items-center gap-2 rounded-2xl bg-clay-soft px-4 py-3 font-semibold text-clay" role="status">
          <Icon name="check" strokeWidth={2.4} /> Welcome! Your membership has started.
        </p>
      ) : null}
      <section className="card p-5">
        <h1 className="font-display text-2xl text-ink">Membership</h1>
        <p className="mt-2 text-ink">{line}</p>
        {error ? <p className="mt-3 rounded-xl bg-clay-soft px-3.5 py-3 text-sm text-clay" role="alert">{error}</p> : null}
        {view.canManage ? (
          <button type="button" className="btn-quiet mt-4 w-full" disabled={busy} onClick={() => void manage()}>
            {busy ? "Opening…" : "Change plan, update card or cancel"}
          </button>
        ) : null}
        <p className="mt-4 text-sm text-muted">
          {GUARANTEE_DAYS}-day money-back guarantee: ask within {GUARANTEE_DAYS} days of your first payment for a full refund
          {CONTACT_EMAIL ? (
            <>
              {" "}by emailing <a className="font-semibold text-leaf underline-offset-4 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </>
          ) : null}
          .
        </p>
      </section>
      <Link href="/journal" className="btn mt-4 w-full">Go to today</Link>
    </>
  );
}

export default function MembershipPage() {
  return (
    <Suspense fallback={null}>
      <Status />
    </Suspense>
  );
}
