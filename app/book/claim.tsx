"use client";

import Link from "next/link";
import { useEffect } from "react";
import { saveBookOffer } from "@/lib/book-offer";

/** Saves the book owners' offer in this browser, then sends the person to create an account. */
export default function ClaimOffer() {
  // Opening this page is enough to claim the offer, in case the person signs up later from another page.
  useEffect(saveBookOffer, []);
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <Link href="/login?new=1" className="btn">Start my 30-day free trial</Link>
      <Link href="/login" className="btn-quiet">I already have an account</Link>
    </div>
  );
}
