"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import type { MembershipView, Plan } from "./membership-shared";
import { hasBookOffer } from "./book-offer";

interface State {
  view: MembershipView | null;
  error: string;
  refresh(): void;
  /** Sends the person to Stripe to start a trial or membership. */
  checkout(plan: Plan): Promise<void>;
  /** Sends the person to Stripe's page for changing plan, card or cancelling. */
  manage(): Promise<void>;
  busy: boolean;
}

const Ctx = createContext<State | null>(null);

export function MembershipProvider({ children }: { children: ReactNode }) {
  const { getToken, preview } = useAuth();
  const [view, setView] = useState<MembershipView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const token = await getToken();
        if (!token && !preview) throw new Error("Please sign in again.");
        const res = await fetch("/api/membership", {
          headers: token ? { authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Your membership could not be checked.");
        if (live) {
          setView(data as MembershipView);
          setError("");
        }
      } catch (err) {
        if (live) setError((err as Error).message || "Your membership could not be checked.");
      }
    })();
    return () => {
      live = false;
    };
  }, [getToken, preview, tick]);

  const go = useCallback(
    async (path: string, body?: unknown) => {
      setBusy(true);
      setError("");
      try {
        const token = await getToken();
        const res = await fetch(path, {
          method: "POST",
          headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(body ?? {}),
        });
        const data = await res.json();
        if (!res.ok || !data.url) throw new Error(data.error || "Something went wrong. Please try again.");
        window.location.assign(data.url);
      } catch (err) {
        setError((err as Error).message);
        setBusy(false);
      }
    },
    [getToken],
  );

  const value: State = {
    view,
    error,
    busy,
    refresh: () => setTick((t) => t + 1),
    checkout: (plan) => go("/api/membership/checkout", hasBookOffer() ? { plan, offer: "book" } : { plan }),
    manage: () => go("/api/membership/portal"),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMembership() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMembership outside MembershipProvider");
  return v;
}
