import type { Metadata, Viewport } from "next";
import "./globals.css";
import NativeSetup from "@/components/native-setup";

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
  themeColor: "#eaf4fb",
  width: "device-width",
  initialScale: 1,
  // Lets the iPhone app fill the screen; the safe-area padding keeps content clear of the clock and home bar.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <NativeSetup />
        {children}
      </body>
    </html>
  );
}
