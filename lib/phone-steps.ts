"use client";

import { useSyncExternalStore } from "react";
import { addDays, dayKey, parseDay } from "./dates";
import { STEPS_MAX } from "./steps";
import { callNative, nativePlatform, type NativePlatform } from "./native";

/**
 * Steps read automatically from Apple Health (iPhone) or Health Connect
 * (Android) inside the phone apps. The person switches it on once on this
 * phone; it is remembered on the phone, not in the account, because another
 * phone or a computer has no access to this phone's health data.
 */

const KEY = "wlj-phone-steps";
const EVENT = "wlj-phone-steps-change";
/** Days read on each sync, so a few days without opening the app still fill in. */
export const SYNC_DAYS = 7;

export const healthAppName = (p: NativePlatform) => (p === "ios" ? "Apple Health" : "Health Connect");

function readOn(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

function writeOn(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, "on");
    else localStorage.removeItem(KEY);
  } catch {
    // Storage can be blocked; the switch then lasts until the app closes.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** True when automatic steps are switched on in the phone app on this phone. */
export function usePhoneStepsOn(): boolean {
  return useSyncExternalStore(subscribe, () => readOn() && nativePlatform() !== null, () => false);
}

export type ConnectResult = { ok: true } | { ok: false; message: string };

/** Asks the phone for permission to read steps and switches syncing on. */
export async function connectPhoneSteps(): Promise<ConnectResult> {
  const platform = nativePlatform();
  if (!platform) return { ok: false, message: "Automatic steps work in the iPhone and Android apps." };
  try {
    const available = await callNative<{ available: boolean }>("Health", "isAvailable");
    if (!available.available) {
      return {
        ok: false,
        message:
          platform === "android"
            ? "Health Connect isn't set up on this phone. Install Health Connect from Google Play, then try again."
            : "Apple Health isn't available on this device.",
      };
    }
    const status = await callNative<{ readAuthorized?: string[] }>("Health", "requestAuthorization", {
      read: ["steps"],
      write: [],
    });
    // Android says whether steps were allowed. iPhone never says, for privacy,
    // so a "no" there only shows as no steps arriving.
    if (platform === "android" && !status.readAuthorized?.includes("steps")) {
      return { ok: false, message: "Steps weren't allowed. You can allow them in Health Connect, then try again." };
    }
    writeOn(true);
    return { ok: true };
  } catch {
    return { ok: false, message: `We couldn't connect to ${healthAppName(platform)}. Please try again.` };
  }
}

export function disconnectPhoneSteps() {
  writeOn(false);
}

/** Daily step totals for the last `days` days, by day (YYYY-MM-DD). Days with no steps are left out. */
export async function readPhoneSteps(days = SYNC_DAYS): Promise<Record<string, number>> {
  const today = dayKey();
  const start = parseDay(addDays(today, -(days - 1)));
  const { samples } = await callNative<{ samples: { startDate: string; value: number }[] }>("Health", "queryAggregated", {
    dataType: "steps",
    startDate: start.toISOString(),
    endDate: new Date().toISOString(),
    bucket: "day",
    aggregation: "sum",
  });
  const out: Record<string, number> = {};
  for (const s of samples ?? []) {
    const n = Math.round(s.value);
    const date = dayKey(new Date(s.startDate));
    if (Number.isFinite(n) && n > 0 && date <= today) out[date] = Math.min(n, STEPS_MAX);
  }
  return out;
}
