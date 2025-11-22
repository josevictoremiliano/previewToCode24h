import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ozires - A Reimaginação de Landing Pages",
  description: "Plataforma SaaS para criação de landing pages personalizadas entregues em até 24 horas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={instrumentSans.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
