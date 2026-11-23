import { NextResponse } from "next/server";
import { admin } from "@/lib/admin";
import { getMembership, priceFor, siteUrl, stripe } from "@/lib/membership";
import { TRIAL_DAYS, type Plan } from "@/lib/membership-shared";
import { verifyRequest } from "@/lib/verify-token";

/**
 * Starts Stripe Checkout for the chosen plan. The card is taken at the start
 * and the first payment is on day 8, unless the person has had a free week before.
 */
export async function POST(req: Request) {
  const uid = await verifyRequest(req);
  if (!uid) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const s = stripe();
  const a = admin();
  const body = (await req.json().catch(() => ({}))) as { plan?: Plan };
  const plan: Plan = body.plan === "yearly" ? "yearly" : "monthly";
  const price = priceFor(plan);
  if (!s || !a || !price) {
    return NextResponse.json({ error: "Payments are not set up yet. Please try again later." }, { status: 503 });
  }

  try {
    const [m, user] = await Promise.all([getMembership(uid), a.auth.getUser(uid)]);
    const base = siteUrl(req);
    const session = await s.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      client_reference_id: uid,
      ...(m.customerId ? { customer: m.customerId } : { customer_email: user.email ?? undefined }),
      subscription_data: {
        metadata: { uid },
        ...(m.trialUsed ? {} : { trial_period_days: TRIAL_DAYS }),
      },
      payment_method_collection: "always",
      allow_promotion_codes: true,
      success_url: `${base}/journal/membership?welcome=1`,
      cancel_url: `${base}/journal/membership`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout could not start:", (err as Error).message);
    return NextResponse.json({ error: "The payment page could not be opened. Please try again." }, { status: 502 });
  }
}
