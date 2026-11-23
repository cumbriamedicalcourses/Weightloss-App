import { NextResponse } from "next/server";
import { getMembership, siteUrl, stripe } from "@/lib/membership";
import { verifyRequest } from "@/lib/verify-token";

/** Opens Stripe's customer portal, where people change plan, update their card, see invoices or cancel. */
export async function POST(req: Request) {
  const uid = await verifyRequest(req);
  if (!uid) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const s = stripe();
  if (!s) return NextResponse.json({ error: "Payments are not set up yet." }, { status: 503 });
  try {
    const m = await getMembership(uid);
    if (!m.customerId) return NextResponse.json({ error: "There is no membership to manage yet." }, { status: 404 });
    const portal = await s.billingPortal.sessions.create({
      customer: m.customerId,
      return_url: `${siteUrl(req)}/journal/membership`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (err) {
    console.error("Customer portal could not open:", (err as Error).message);
    return NextResponse.json({ error: "Your membership page could not be opened. Please try again." }, { status: 502 });
  }
}
