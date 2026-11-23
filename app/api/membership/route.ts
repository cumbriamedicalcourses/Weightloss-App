import { NextResponse } from "next/server";
import { membershipView } from "@/lib/membership";
import { verifyRequest } from "@/lib/verify-token";

export const dynamic = "force-dynamic";

/** The signed-in person's membership, for the app to decide what to show. */
export async function GET(req: Request) {
  const uid = await verifyRequest(req);
  if (!uid) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  try {
    return NextResponse.json(await membershipView(uid), { headers: { "cache-control": "no-store" } });
  } catch (err) {
    console.error("Membership could not be read:", (err as Error).message);
    return NextResponse.json({ error: "Your membership could not be checked. Please try again." }, { status: 503 });
  }
}
