'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleCards } from '@/components/dashboard/ModuleCards';

// Usuarios administradores que pueden ver el Dashboard
const ADMIN_USERS = ['1129564302', '52317897'];

export default function DashboardPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(ADMIN_USERS.includes(data.usuario));
        }
      } catch { /* ignore */ }
    }
    checkAdmin();
  }, []);

  const handleVirtualRoomClick = () => {
    router.push('/dashboard/requests');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 lg:px-16">
      {/* Title section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gris-900 md:text-3xl">
          Gestor de estudiantes
        </h1>
        <p className="mt-1 text-base text-gris-600 md:text-lg">
          Programa de Ingenier&iacute;a Industrial
        </p>
      </div>

      {/* Module cards */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gris-800">M&oacute;dulos</h2>
        <ModuleCards onVirtualRoomClick={handleVirtualRoomClick} />
      </section>

      {/* Admin buttons */}
      <section className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/users')}
          className="inline-flex items-center gap-2 rounded-lg border border-gris-300 bg-white px-4 py-2.5 text-sm font-medium text-gris-700 shadow-sm transition-colors hover:bg-gris-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aguamarina-500 focus-visible:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          Administraci&oacute;n de usuarios
        </button>

        {/* Dashboard button - solo visible para administradores */}
        {isAdmin && (
          <button
            onClick={() => router.push('/dashboard/analytics')}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-gris-700 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-gris-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gris-500 focus-visible:ring-offset-2"
          >
            <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"></span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span className="relative">Dashboard</span>
          </button>
        )}
      </section>
    </div>
  );
}
