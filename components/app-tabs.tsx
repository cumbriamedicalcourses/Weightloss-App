"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Icon, type IconName } from "@/components/icons";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/journal", label: "Today", icon: "today" },
  { href: "/journal/plans", label: "Plans", icon: "plans" },
  { href: "/journal/progress", label: "Progress", icon: "progress" },
  { href: "/learn", label: "Learn", icon: "learn" },
  { href: "/journal/profile", label: "Profile", icon: "profile" },
];

/** The menu along the bottom of the journal and the Learn pages. */
export default function AppTabs() {
  const path = usePathname();
  return (
    <nav
      aria-label="Journal sections"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur print:hidden"
    >
      <ul className="mx-auto flex max-w-xl">
        {TABS.map((t) => {
          const active = t.href === "/learn" ? path.startsWith("/learn") : path === t.href;
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
  );
}

function SignedInTabs() {
  const { user, loading } = useAuth();
  if (loading || !user) return null;
  return (
    <>
      {/* Room at the bottom so the menu never covers the footer. */}
      <div aria-hidden className="h-24 print:hidden" />
      <AppTabs />
    </>
  );
}

/** On the public Learn pages, shows the bottom menu to people who are signed in. */
export function LearnTabs() {
  return (
    <AuthProvider>
      <SignedInTabs />
    </AuthProvider>
  );
}
