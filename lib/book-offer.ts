"use client";

/**
 * Remembers, in this browser, that the person arrived through the book's QR code
 * (myweightlossjournal.com/book), so their free trial is the longer book owners' one.
 * Kept for 60 days. Browser storage can be blocked, so every access is guarded.
 */
const KEY = "wlj-book-offer";
const KEEP_MS = 60 * 86_400_000;

export function saveBookOffer() {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* storage unavailable: the person still gets the standard trial */
  }
}

export function hasBookOffer(): boolean {
  try {
    const at = Number(localStorage.getItem(KEY));
    return Boolean(at) && Date.now() - at < KEEP_MS;
  } catch {
    return false;
  }
}
