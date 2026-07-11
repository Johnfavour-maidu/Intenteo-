import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SidebarProvider } from "@/components/layout/sidebar-context"
import { UndoRedoProvider } from "@/components/providers/undo-redo-provider"
import { AuthProviderWrapper } from "@/components/providers/auth-provider"

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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/favicon-180.png", sizes: "180x180", type: "image/png" },
    ],
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
    <html lang="en-GB" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProviderWrapper>
            <SidebarProvider>
              <UndoRedoProvider>
                {children}
              </UndoRedoProvider>
            </SidebarProvider>
          </AuthProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
