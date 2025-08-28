import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Contract Analyzer Pro | AI-Powered Contract Analysis",
  description: "Advanced AI-powered contract analysis and review platform. Upload, analyze, and get instant insights on your legal documents.",
  keywords: "contract analysis, AI, legal documents, contract review, PDF analysis",
  authors: [{ name: "Contract Analyzer Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-black text-white overflow-x-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
