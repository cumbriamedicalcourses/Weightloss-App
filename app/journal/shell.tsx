"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { JournalProvider, useJournal } from "@/lib/journal";
import { Icon, type IconName } from "@/components/icons";
import MembershipOffer from "@/components/membership-offer";
import { MembershipProvider, useMembership } from "@/lib/use-membership";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/journal", label: "Today", icon: "today" },
  { href: "/journal/plans", label: "Plans", icon: "plans" },
  { href: "/journal/progress", label: "Progress", icon: "progress" },
  { href: "/learn", label: "Learn", icon: "learn" },
  { href: "/journal/profile", label: "Profile", icon: "profile" },
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

/** Pages that stay open without a membership: setting up the profile, membership itself, and the person's data. */
const OPEN_PATHS = ["/journal/profile", "/journal/membership"];

/** Shows the plans instead of the journal when membership is switched on and the person has no trial or membership. */
function MembershipGate({ children }: { children: ReactNode }) {
  const { view, error, refresh } = useMembership();
  const path = usePathname();
  if (OPEN_PATHS.includes(path)) return <>{children}</>;
  if (!view) {
    if (!error) return <Loading />;
    return (
      <div className="card p-5 text-center" role="alert">
        <p className="text-ink">{error}</p>
        <button type="button" className="btn mt-4" onClick={refresh}>Try again</button>
      </div>
    );
  }
  if (!view.access) return <MembershipOffer locked />;
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
    <MembershipProvider>
      <JournalProvider fallback={<Loading />}>
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-28 pt-4 print:max-w-none print:p-0">
          {preview ? (
            <p className="mb-4 rounded-xl bg-clay-soft px-3.5 py-2.5 text-sm text-clay print:hidden">
              Preview mode: accounts are not connected yet, so this journal is saved in this browser only.
            </p>
          ) : null}
          <ProfileGate>
            <MembershipGate>{children}</MembershipGate>
          </ProfileGate>
        </div>
        <nav
          aria-label="Journal sections"
          className="fixed inset-x-0 bottom-0 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur print:hidden"
        >
          <ul className="mx-auto flex max-w-xl">
            {TABS.map((t) => {
              const active = path === t.href;
              return (
                <li key={t.href} className="flex-1">
                  <Link
                    href={t.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${
                      active ? "text-leaf" : "text-muted hover:text-ink"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-12 items-center justify-center rounded-full transition ${
                        active ? "bg-leaf-soft" : ""
                      }`}
                    >
                      <Icon name={t.icon} className="size-[22px]" strokeWidth={active ? 2.1 : 1.8} />
                    </span>
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </JournalProvider>
    </MembershipProvider>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Inner>{children}</Inner>
    </AuthProvider>
  );
}
