import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Julia — Descubrimiento de requisitos",
  description:
    "Cuestionario guiado para entender cómo trabajas y construir la aplicación que necesitas.",
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
