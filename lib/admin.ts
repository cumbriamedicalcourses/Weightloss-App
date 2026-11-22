import { createHmac, timingSafeEqual } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Server-only access to the whole database, for jobs that act for every
 * user, such as reminder emails. It needs the FIREBASE_SERVICE_ACCOUNT
 * secret, which is set on the host and never committed.
 */
export function admin() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const app = getApps()[0] ?? initializeApp({ credential: cert(JSON.parse(raw)) });
    return { db: getFirestore(app), auth: getAuth(app) };
  } catch (err) {
    console.error("FIREBASE_SERVICE_ACCOUNT is not valid:", (err as Error).message);
    return null;
  }
}

/** A signature that lets the link in an email switch off that person's emails, and nothing else. */
export function unsubscribeToken(uid: string) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(`unsubscribe:${uid}`).digest("hex").slice(0, 32);
}

export function sameSecret(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
