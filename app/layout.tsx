import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/lib/themeContext";
import { NetworkProvider } from "@/lib/networkContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hyperliquid Explorer | Powered by Lava Network",
  description: "Real-time blockchain explorer for Hyperliquid powered by Lava Network's high-performance RPC API",
  keywords: ["Hyperliquid", "blockchain", "explorer", "Lava Network", "crypto", "DeFi"],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <NetworkProvider>
            <Providers>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                  {children}
                </main>
                <Footer />
              </div>
              <ChatBot />
            </Providers>
          </NetworkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}