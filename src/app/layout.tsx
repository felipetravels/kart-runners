import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import OneSignalSetup from "@/components/OneSignalSetup";
import Navbar from "@/components/Navbar"; // Przywracamy Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kart Runners Hub",
  description: "Panel logistyczny ekipy biegowej",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={inter.className} style={{background: "#0a0a0a", color: "#fff", margin: 0}}>
        <OneSignalSetup />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
