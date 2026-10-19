import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const interMono = Inter({ subsets: ["latin"], variable: "--font-inter-mono" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: "BuildCalc Pro — Plan. Calculate. Build Smarter.",
  description:
    "AI-powered residential construction, cost estimation and structural design tools built for modern India. Created by Siddhu Pogula.",
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
  authors: [{ name: "Siddhu Pogula", url: "https://github.com/P-Siddhu" }],
  creator: "Siddhu Pogula",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5FA" },
    { media: "(prefers-color-scheme: dark)", color: "#100F14" },
  ],
  userScalable: true,
  width: "device-width",
  initialScale: 1,
}

// No-flash theme initializer — runs before React hydrates.
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('buildcalc-theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (_) {
    document.documentElement.classList.remove('dark');
  }
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${interMono.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased bg-background text-foreground">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
