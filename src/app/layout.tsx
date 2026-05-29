import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Portal de Gestión de Estudiantes - UCC",
  description:
    "Portal de Gestión de Estudiantes para el programa de Ingeniería Industrial de la Universidad Cooperativa de Colombia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", inter.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
