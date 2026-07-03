import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://xiana-school.vercel.app"),
  title: "Xiana Language School",
  openGraph: {
    title: "Xiana Language School",
    images: [{ url: "/logo.png", width: 200, height: 200 }],
  },
  twitter: {
    card: "summary",
    title: "Xiana Language School",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-page text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}
