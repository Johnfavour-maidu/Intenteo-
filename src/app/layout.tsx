import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SidebarProvider } from "@/components/layout/sidebar-context"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Intenteo — Live with Intentionality",
  description: "The world's first AI-powered Intentional Living Platform. Connect every action to purpose.",
  icons: {
    icon: "/favicon-40.png",
    apple: "/favicon-40.png",
  },
  openGraph: {
    title: "Intenteo — Live with Intentionality",
    description: "The world's first AI-powered Intentional Living Platform. Connect every action to purpose.",
    images: ["/logo.png"],
    siteName: "Intenteo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Intenteo — Live with Intentionality",
    description: "The world's first AI-powered Intentional Living Platform. Connect every action to purpose.",
    images: ["/logo.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
