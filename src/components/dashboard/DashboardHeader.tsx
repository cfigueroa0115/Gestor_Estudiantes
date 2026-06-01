'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Cargo } from '@/types';

interface DashboardHeaderProps {
  user: { usuario: string; nombre: string | null; cargo: Cargo };
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="border-b border-gris-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex items-center justify-between px-4 py-3 md:px-8 lg:px-16">
        {/* Logo UCC - clickeable, lleva al dashboard */}
        <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <Image
            src="/logo-ucc.jpeg"
            alt="Logo Universidad Cooperativa de Colombia"
            width={140}
            height={56}
            className="h-14 w-auto object-contain"
          />
        </Link>

        {/* User info + Avatar + Logout */}
        <div className="flex items-center gap-3">
          {/* Avatar con indicador online */}
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-aguamarina-500 to-verde-600 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </div>
            {/* Indicador online verde */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-green-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></span>
            </span>
          </div>

          {/* Info usuario */}
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-gris-800">{user.nombre || user.usuario}</p>
            <div className="flex items-center justify-end gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
              <p className="text-xs text-gris-500">{user.cargo} &middot; En l&iacute;nea</p>
            </div>
          </div>

          {/* Botón cerrar sesión */}
          <button
            onClick={onLogout}
            className="rounded-lg border border-gris-300 px-3 py-2 text-sm font-medium text-gris-700 transition-colors hover:bg-gris-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aguamarina-500 focus-visible:ring-offset-2"
            aria-label="Cerrar sesión"
          >
            Cerrar sesi&oacute;n
          </button>
        </div>
      </div>
    </header>
  );
}
