"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { JournalProvider, useJournal } from "@/lib/journal";

const TABS = [
  { href: "/journal", label: "Today" },
  { href: "/journal/plans", label: "Plans" },
  { href: "/journal/progress", label: "Progress" },
  { href: "/journal/profile", label: "Profile" },
];

function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center text-muted" role="status">
      Opening your journal…
    </div>
  );
}

/** Sends new people to the profile page first, so a target can be worked out. */
function ProfileGate({ children }: { children: ReactNode }) {
  const { profile } = useJournal();
  const path = usePathname();
  const router = useRouter();
  const needsSetup = !profile && path !== "/journal/profile";

  useEffect(() => {
    if (needsSetup) router.replace("/journal/profile");
  }, [needsSetup, router]);

  if (needsSetup) return <Loading />;
  return <>{children}</>;
}

function Inner({ children }: { children: ReactNode }) {
  const { user, loading, preview } = useAuth();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <Loading />;

  return (
    <JournalProvider fallback={<Loading />}>
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-28 pt-4">
        {preview ? (
          <p className="mb-4 rounded-xl bg-clay-soft px-3.5 py-2.5 text-sm text-clay">
            Preview mode: accounts are not connected yet, so this journal is saved in this browser only.
          </p>
        ) : null}
        <ProfileGate>{children}</ProfileGate>
      </div>
      <nav
        aria-label="Journal sections"
        className="fixed inset-x-0 bottom-0 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <ul className="mx-auto flex max-w-xl">
          {TABS.map((t) => {
            const active = path === t.href;
            return (
              <li key={t.href} className="flex-1">
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 items-center justify-center text-sm font-semibold ${
                    active ? "text-leaf" : "text-muted hover:text-ink"
                  }`}
                >
                  <span className={`border-b-2 pb-0.5 ${active ? "border-leaf" : "border-transparent"}`}>
                    {t.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </JournalProvider>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Inner>{children}</Inner>
    </AuthProvider>
  );
}
