import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "BuildCalc Pro — Intelligent Structural Estimator | by Siddhu Pogula",
  description:
    "Production-grade residential construction estimator for the Indian market. IS 456, IS 875 & IS 1893 compliant validation engine with educational reasoning. Created by Siddhu Pogula.",
  generator: "v0.app",
  keywords: [
    "construction estimator India",
    "IS 456",
    "IS 1893",
    "structural calculator",
    "RCC estimator",
    "BuildCalc Pro",
    "Siddhu Pogula",
  ],
  authors: [{ name: "Siddhu Pogula" }],
  creator: "Siddhu Pogula",
}

export const viewport: Viewport = {
  themeColor: "#020617",
  userScalable: true,
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} dark`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
