import { NextResponse } from "next/server";
import { getMembership, saveSubscription, stripe } from "@/lib/membership";
import { verifyRequest } from "@/lib/verify-token";

/** Ends the membership straight away. Used when someone deletes their account, so they are never charged again. */
export async function POST(req: Request) {
  const uid = await verifyRequest(req);
  if (!uid) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const s = stripe();
  if (!s) return NextResponse.json({ ok: true });
  try {
    const m = await getMembership(uid);
    if (m.subscriptionId && m.status !== "canceled") {
      await saveSubscription(await s.subscriptions.cancel(m.subscriptionId), uid);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Membership could not be cancelled:", (err as Error).message);
    return NextResponse.json({ error: "Your membership could not be cancelled. Please try again." }, { status: 502 });
  }
}
