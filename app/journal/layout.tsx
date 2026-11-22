import type { Metadata } from "next";
import Shell from "./shell";

export const metadata: Metadata = { title: "Journal" };

export default function JournalLayout({ children }: LayoutProps<"/journal">) {
  return <Shell>{children}</Shell>;
}
