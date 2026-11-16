import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "FlatMatch — rooms and flatmates",
  description:
    "Swipe to find a room or a flatmate in Bengaluru, Pune and Mumbai. Chat opens only when you both say yes.",
  applicationName: "FlatMatch",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f1ea",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-[#e7dfd2] text-foreground">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
