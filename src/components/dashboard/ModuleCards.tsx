'use client';

import { useToast } from '@/components/shared/Toast';

interface ModuleCardsProps {
  onVirtualRoomClick: () => void;
}

interface ModuleCard {
  title: string;
  description: string;
  enabled: boolean;
  badge?: string;
}

const modules: ModuleCard[] = [
  {
    title: 'Radicar solicitud salas virtuales',
    description: 'Radicar solicitudes de estudiantiles del programa',
    enabled: true,
  },
  {
    title: 'Gestión salas docentes',
    description: 'Administra las salas de docentes',
    enabled: false,
    badge: 'Próximamente',
  },
  {
    title: 'Gestión salas administrativas',
    description: 'Administra las salas administrativas',
    enabled: false,
    badge: 'Próximamente',
  },
];

export function ModuleCards({ onVirtualRoomClick }: ModuleCardsProps) {
  const { showToast } = useToast();

  const handleCardClick = (module: ModuleCard) => {
    if (module.enabled) {
      onVirtualRoomClick();
    } else {
      showToast('Módulo en construcción', 'error');
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => (
        <button
          key={module.title}
          onClick={() => handleCardClick(module)}
          disabled={false}
          className={`group relative overflow-hidden rounded-xl border p-6 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aguamarina-500 focus-visible:ring-offset-2 ${
            module.enabled
              ? 'border-aguamarina-200 bg-white shadow-sm hover:border-aguamarina-400 hover:shadow-md'
              : 'cursor-pointer border-gris-200 bg-gris-50 opacity-60'
          }`}
          aria-label={
            module.enabled
              ? module.title
              : `${module.title} - Módulo en construcción`
          }
        >
          {/* Gradient accent for enabled cards */}
          {module.enabled && (
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-aguamarina-500 to-verde-600" />
          )}

          {/* Badge */}
          {module.badge && (
            <span className="mb-3 inline-block rounded-full bg-gris-200 px-2.5 py-0.5 text-xs font-medium text-gris-600">
              {module.badge}
            </span>
          )}

          {/* Icon */}
          <div
            className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
              module.enabled
                ? 'bg-aguamarina-100 text-aguamarina-600'
                : 'bg-gris-200 text-gris-400'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-3.14 1.346 2.352 1.005a1 1 0 00.788 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>

          {/* Title */}
          <h3
            className={`text-base font-semibold ${
              module.enabled ? 'text-gris-900' : 'text-gris-500'
            }`}
          >
            {module.title}
          </h3>

          {/* Description */}
          <p
            className={`mt-1 text-sm ${
              module.enabled ? 'text-gris-600' : 'text-gris-400'
            }`}
          >
            {module.description}
          </p>

          {/* Arrow indicator for enabled cards */}
          {module.enabled && (
            <div className="mt-4 flex items-center text-sm font-medium text-aguamarina-600 transition-transform group-hover:translate-x-1">
              Acceder
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-1 h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
