import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/auth-provider"

export const metadata: Metadata = {
  title: "E-Arzi | Anantnag District Arzi (Petition) Portal",
  description: "Official digital arzi (petition/complaint) portal for Anantnag District Administration, Jammu & Kashmir",
  keywords: "Anantnag, arzi, petition, complaint, district administration, J&K, government",
  openGraph: {
    title: "E-Arzi — Anantnag District Arzi Portal",
    description: "Submit, track and resolve arzis with the Anantnag District Administration",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Inter – body font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* Material Symbols Outlined – icon font (critical: must be loaded here) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
