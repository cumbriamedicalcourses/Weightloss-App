import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { saveSubscription, stripe } from "@/lib/membership";

/**
 * Stripe calls this address whenever a membership starts, renews, changes or
 * ends. The signature check means only Stripe can update a membership.
 */
export async function POST(req: Request) {
  const s = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s || !secret) return NextResponse.json({ error: "Not set up" }, { status: 503 });

  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode === "subscription" && session.subscription) {
          const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          await saveSubscription(await s.subscriptions.retrieve(id), session.client_reference_id);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await saveSubscription(event.data.object);
        break;
    }
  } catch (err) {
    // A 500 makes Stripe send the event again later.
    console.error("Stripe event could not be saved:", event.type, (err as Error).message);
    return NextResponse.json({ error: "Not saved" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
