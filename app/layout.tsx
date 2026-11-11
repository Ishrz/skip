import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthRefresh } from "@/components/auth/auth-refresh";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skip",
  description: "A unified design language for Skip learning platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <AuthRefresh />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}