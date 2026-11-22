"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth, type SessionUser } from "./auth";
import { dailyTarget } from "./calc";
import { dayKey } from "./dates";
import { store } from "./store";
import { withLivePace } from "./target";
import type { Profile, WeightLog } from "./types";

interface JournalState {
  user: SessionUser;
  /** Null until the person has filled in their profile. */
  profile: Profile | null;
  weights: WeightLog[];
  /** Most recent weigh-in, falling back to the starting weight. */
  currentKg: number;
  target: number;
}

const Ctx = createContext<JournalState | null>(null);

/** Loads the signed-in person's profile and weigh-ins for the journal pages. */
export function JournalProvider({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [weights, setWeights] = useState<WeightLog[]>([]);

  useEffect(() => {
    if (!user) return;
    const a = store.watchProfile(user.uid, setProfile);
    const b = store.watchWeights(user.uid, setWeights);
    return () => {
      a();
      b();
    };
  }, [user]);

  const value = useMemo<JournalState | null>(() => {
    if (!user || profile === undefined) return null;
    const currentKg = weights.at(-1)?.kg ?? profile?.startWeightKg ?? 0;
    // The pace follows the chosen date week by week, so the target does too.
    const target = profile ? dailyTarget(withLivePace(profile, currentKg, dayKey()), currentKg, new Date().getFullYear()) : 0;
    return { user, profile, weights, currentKg, target };
  }, [user, profile, weights]);

  if (!value) return <>{fallback}</>;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useJournal() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useJournal must be used inside JournalProvider");
  return v;
}
