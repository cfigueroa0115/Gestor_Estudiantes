'use client';

import { useRouter } from 'next/navigation';
import { ModuleCards } from '@/components/dashboard/ModuleCards';

export default function DashboardPage() {
  const router = useRouter();

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
          Programa de Ingeniería Industrial
        </p>
      </div>

      {/* Module cards */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gris-800">Módulos</h2>
        <ModuleCards onVirtualRoomClick={handleVirtualRoomClick} />
      </section>

      {/* Admin button */}
      <section>
        <button
          onClick={() => router.push('/dashboard/users')}
          className="inline-flex items-center gap-2 rounded-lg border border-gris-300 bg-white px-4 py-2.5 text-sm font-medium text-gris-700 shadow-sm transition-colors hover:bg-gris-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aguamarina-500 focus-visible:ring-offset-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          Administración de usuarios
        </button>
      </section>
    </div>
  );
}
