"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { nativePlatform } from "@/lib/native";

/**
 * Small adjustments when the site is open inside the iPhone or Android app:
 * the app starts at the journal rather than the sales homepage, and on iPhone
 * the page fills the screen with room left for the clock and the home bar.
 */
export default function NativeSetup() {
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    const platform = nativePlatform();
    if (!platform) return;
    const html = document.documentElement;
    html.classList.add("native-app", `native-${platform}`);
  }, []);

  useEffect(() => {
    // The homepage sells the membership, which the store rules keep out of the apps.
    if (path === "/" && nativePlatform()) router.replace("/journal");
  }, [path, router]);

  return null;
}
