import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"
import { ClientToaster } from "@/components/ClientToaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AdSpark - AI-Powered Ad Creation",
  description: "Transform your ideas into stunning video advertisements with AI",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
          <ClientToaster />
        </AuthProvider>
      </body>
    </html>
  )
}
