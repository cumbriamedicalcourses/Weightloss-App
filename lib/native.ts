"use client";

import { useSyncExternalStore } from "react";

/**
 * The iPhone and Android apps (in /mobile) open this website inside the app
 * and add a small bridge called Capacitor. This file is the only place that
 * talks to it, so the website works the same as before in a normal browser.
 */

export type NativePlatform = "ios" | "android";

interface CapacitorBridge {
  isNativePlatform?(): boolean;
  getPlatform?(): string;
  isPluginAvailable?(name: string): boolean;
  nativePromise?<T>(plugin: string, method: string, options?: unknown): Promise<T>;
}

function bridge(): CapacitorBridge | null {
  if (typeof window === "undefined") return null;
  const cap = (window as unknown as { Capacitor?: CapacitorBridge }).Capacitor;
  return cap?.isNativePlatform?.() ? cap : null;
}

/** "ios" or "android" inside the phone apps, null in a browser. */
export function nativePlatform(): NativePlatform | null {
  const p = bridge()?.getPlatform?.();
  return p === "ios" || p === "android" ? p : null;
}

const noSubscribe = () => () => {};

/** The phone app platform, or null in a browser and while the page is first drawn on the server. */
export function useNativeApp(): NativePlatform | null {
  return useSyncExternalStore(noSubscribe, nativePlatform, () => null);
}

/** Calls a method of a plugin built into the phone app. */
export async function callNative<T>(plugin: string, method: string, options?: unknown): Promise<T> {
  const cap = bridge();
  if (!cap?.nativePromise) throw new Error("Not in the phone app");
  if (cap.isPluginAvailable && !cap.isPluginAvailable(plugin)) throw new Error(`${plugin} is not in this version of the app`);
  return cap.nativePromise<T>(plugin, method, options);
}
