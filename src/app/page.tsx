import Image from "next/image";
import Link from "next/link";
import { LandingClient } from "@/components/landing/LandingClient";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gris-50">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-aguamarina-500/5 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-verde-600/5 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-aguamarina-500/3 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8 lg:px-16">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <Image
            src="/logo-ucc.jpeg"
            alt="Logo Universidad Cooperativa de Colombia"
            width={160}
            height={64}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>
      </header>

      {/* Client-side interactive content */}
      <div className="relative z-10">
        <LandingClient />
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gris-200 bg-white/80 px-4 py-6 text-center backdrop-blur-sm md:px-8">
        <p className="text-sm text-gris-600">
          © Mgtr. Carlos Alberto Figueroa Martínez || Programa de Ingenieria industrial
        </p>
      </footer>
    </main>
  );
}
