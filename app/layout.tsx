import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://myweightlossjournal.com"),
  title: {
    default: "My Weight Loss Journal",
    template: "%s · My Weight Loss Journal",
  },
  description:
    "The companion app to the Weight Loss Journal book. Log what you eat and how you move, and see your calories in and out each day.",
  appleWebApp: { capable: true, title: "Journal", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f5efe3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
