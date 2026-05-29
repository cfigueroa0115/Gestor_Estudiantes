'use client';

import { Cargo } from '@/types';

interface DashboardHeaderProps {
  user: { usuario: string; cargo: Cargo };
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="border-b border-gris-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex items-center justify-between px-4 py-3 md:px-8 lg:px-16">
        {/* Logo UCC */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-aguamarina-500 to-verde-600">
            <span className="text-lg font-bold text-white">U</span>
          </div>
          <span className="text-sm font-semibold text-gris-800 md:text-base">
            UCC
          </span>
        </div>

        {/* User info + Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-gris-800">{user.usuario}</p>
            <p className="text-xs text-gris-500">{user.cargo}</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg border border-gris-300 px-3 py-2 text-sm font-medium text-gris-700 transition-colors hover:bg-gris-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aguamarina-500 focus-visible:ring-offset-2"
            aria-label="Cerrar sesión"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
