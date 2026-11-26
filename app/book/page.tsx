import type { Metadata } from "next";
import LearnChrome from "@/app/learn/chrome";
import { BOOK_TRIAL_DAYS, GUARANTEE_DAYS, PLANS, TRIAL_DAYS } from "@/lib/membership-shared";
import ClaimOffer from "./claim";

export const metadata: Metadata = {
  title: "Book owners' offer",
  description: `Own the Weight Loss Journal book? Try the companion app free for ${BOOK_TRIAL_DAYS} days.`,
};

const WHAT: string[] = [
  "Your own daily calorie and protein targets, worked out for you",
  "Food search, barcode scanning and photo estimates, so the numbers in your book are quick to find",
  "Your weight chart, measurements and a report to take to your GP",
  "Meal plans with shopping lists, and an exercise plan for your age",
  "Short videos for the topics in the book's guide",
];

/** Landing page for the QR code on the back of the paperback. */
export default function BookOfferPage() {
  const monthly = PLANS.find((p) => p.id === "monthly");
  const yearly = PLANS.find((p) => p.id === "yearly");
  return (
    <LearnChrome note="The app gives general information to help you keep a journal. It is not medical advice.">
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-clay">For book owners</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Try the companion app free for {BOOK_TRIAL_DAYS} days</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Thank you for buying the <i>Weight Loss Journal</i>. As a book owner, your free trial of the app is {BOOK_TRIAL_DAYS} days
        instead of the usual {TRIAL_DAYS}. Use it alongside your book, or on its own.
      </p>
      <ClaimOffer />
      <h2 className="mt-10 font-display text-2xl text-ink">What the app adds to your book</h2>
      <ul className="mt-3 max-w-2xl list-disc space-y-1.5 pl-6 leading-relaxed text-ink marker:text-leaf">
        {WHAT.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <h2 className="mt-10 font-display text-2xl text-ink">How the offer works</h2>
      <ul className="mt-3 max-w-2xl list-disc space-y-1.5 pl-6 leading-relaxed text-ink marker:text-leaf">
        <li>Create your account on this device, using the button above, so the offer is applied.</li>
        <li>Your card is needed to start the trial, but nothing is taken for {BOOK_TRIAL_DAYS} days. We will remind you by email before then.</li>
        <li>
          After the trial, membership is {monthly?.price} {monthly?.per} or {yearly?.price} {yearly?.per}. Cancel any time before
          the trial ends and you pay nothing.
        </li>
        <li>{GUARANTEE_DAYS}-day money-back guarantee on your first payment.</li>
        <li>The free trial is offered once per person. If you have already had one, the offer cannot be added again.</li>
        <li>Memberships are started on this website, not in the iPhone or Android app. Once you have an account, sign in to the phone app with the same email.</li>
      </ul>
    </LearnChrome>
  );
}
