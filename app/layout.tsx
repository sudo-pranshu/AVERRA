import type { Metadata, Viewport } from "next";
import "@fontsource-variable/sora";
import "./globals.css";

export const metadata: Metadata = {
  title: "AVERRA — Engineering better movement intelligence",
  description: "AVERRA builds accessible wearable and assistive technology: ParkinSense measures movement; TremoSense assists people with tremor.",
  icons: { icon: "/brand/averra-mark-dark.svg", apple: "/brand/averra-mark-dark-512.png" },
};

export const viewport: Viewport = { themeColor: "#0F172A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
