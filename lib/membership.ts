import Stripe from "stripe";
import { admin } from "./admin";
import { TRIAL_DAYS, type MembershipView, type Plan } from "./membership-shared";

/**
 * Server-only membership logic. Payments run through Stripe Checkout and the
 * Stripe customer portal, and Stripe tells us about every change through the
 * webhook. Each person's membership is kept in the `memberships` collection,
 * which only the server can read or write.
 *
 * Nothing is locked until MEMBERSHIP_REQUIRED is "1" and Stripe is set up, so
 * the app keeps working for everyone while the Stripe account is prepared.
 */

export interface MembershipRecord {
  status: Stripe.Subscription.Status | "none";
  plan?: Plan;
  customerId?: string;
  subscriptionId?: string;
  trialEnd?: number | null;
  periodEnd?: number | null;
  cancelAtPeriodEnd?: boolean;
  /** Set once a person has had a subscription, so the free week is given only once. */
  trialUsed?: boolean;
  updatedAt?: number;
}

let client: Stripe | null = null;

export function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}

export function membershipRequired() {
  return process.env.MEMBERSHIP_REQUIRED === "1" && stripe() !== null;
}

export function priceFor(plan: Plan) {
  return plan === "yearly" ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;
}

function planOf(priceId: string | undefined): Plan | undefined {
  if (!priceId) return undefined;
  if (priceId === process.env.STRIPE_PRICE_YEARLY) return "yearly";
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return "monthly";
  return undefined;
}

/** Statuses that keep the journal open. A failed renewal gets Stripe's retry period before it locks. */
export function statusGivesAccess(status: MembershipRecord["status"]) {
  return status === "trialing" || status === "active" || status === "past_due";
}

const ref = (uid: string) => admin()?.db.collection("memberships").doc(uid) ?? null;

export async function getMembership(uid: string): Promise<MembershipRecord> {
  const r = ref(uid);
  if (!r) return { status: "none" };
  const snap = await r.get();
  return (snap.data() as MembershipRecord | undefined) ?? { status: "none" };
}

/** Whether the person's sign-in email is on a comma-separated list in an environment variable. */
async function emailListed(uid: string, variable: string) {
  const list = (process.env[variable] ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!list.length) return false;
  const a = admin();
  if (!a) return false;
  try {
    // Not limited to verified emails: the app sends no verification email, so an email and
    // password account is never marked verified. Firebase allows one account per email, so
    // a listed email can only be used by whoever registered it.
    const user = await a.auth.getUser(uid);
    return Boolean(user.email && list.includes(user.email.toLowerCase()));
  } catch {
    return false;
  }
}

/**
 * People who use the app without paying, such as the owner, are listed in FREE_ACCESS_EMAILS.
 * Before membership is switched on for everyone, accounts listed in MEMBERSHIP_TEST_EMAILS
 * already see it, so the whole sign-up can be tried with a Stripe test card.
 */
export async function membershipView(uid: string): Promise<MembershipView> {
  const required = membershipRequired() || (stripe() !== null && (await emailListed(uid, "MEMBERSHIP_TEST_EMAILS")));
  const m = required ? await getMembership(uid) : { status: "none" as const };
  const free = required ? await emailListed(uid, "FREE_ACCESS_EMAILS") : false;
  return {
    required,
    access: !required || free || statusGivesAccess(m.status),
    free,
    status: m.status,
    plan: m.plan ?? null,
    trialEnd: m.trialEnd ?? null,
    periodEnd: m.periodEnd ?? null,
    cancelAtPeriodEnd: Boolean(m.cancelAtPeriodEnd),
    canManage: Boolean(m.customerId),
    trialAvailable: !m.trialUsed,
    trialDays: TRIAL_DAYS,
  };
}

/** For server routes that cost money to run, such as the coach and photo estimates. */
export async function canUse(uid: string) {
  return (await membershipView(uid)).access;
}

/** Copies a Stripe subscription onto the person's membership record. */
export async function saveSubscription(sub: Stripe.Subscription, uidHint?: string | null) {
  const uid = sub.metadata?.uid || uidHint;
  const r = uid ? ref(uid) : null;
  if (!r) {
    console.error("Stripe subscription without a known user:", sub.id);
    return;
  }
  const item = sub.items.data[0];
  const record: MembershipRecord = {
    status: sub.status,
    plan: planOf(item?.price.id),
    customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    subscriptionId: sub.id,
    trialEnd: sub.trial_end,
    periodEnd: item?.current_period_end ?? null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    trialUsed: true,
    updatedAt: Date.now(),
  };
  await r.set(record, { merge: true });
}

export function siteUrl(req: Request) {
  return process.env.SITE_URL || new URL(req.url).origin;
}
