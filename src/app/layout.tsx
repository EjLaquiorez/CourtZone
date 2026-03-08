import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { QueryProvider } from "@/lib/providers/query-provider";
import AuthProvider from "@/components/auth/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LARO - Basketball Community Platform",
    template: "%s | LARO Basketball"
  },
  description: "Find your game, build your legacy. Connect with basketball players, discover courts, build teams, and compete in the ultimate basketball matchmaking platform.",
  keywords: ["basketball", "sports", "community", "teams", "courts", "games", "matchmaking"],
  authors: [{ name: "LARO Team" }],
  creator: "LARO Basketball",
  publisher: "LARO Basketball",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "LARO - Basketball Community Platform",
    description: "Find your game, build your legacy. Connect with basketball players, discover courts, build teams, and compete.",
    siteName: "LARO Basketball",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LARO Basketball Community Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "LARO - Basketball Community Platform",
    description: "Find your game, build your legacy. Connect with basketball players, discover courts, build teams, and compete.",
    images: ["/og-image.jpg"],
    creator: "@LaroBasketball"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <QueryProvider>
            <ToastProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ToastProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
