'use client';

import { Cargo, Estado } from '@/types';

interface UserFiltersProps {
  usuario: string;
  cargo: Cargo | '';
  estado: Estado | '';
  onUsuarioChange: (value: string) => void;
  onCargoChange: (value: Cargo | '') => void;
  onEstadoChange: (value: Estado | '') => void;
}

export function UserFilters({
  usuario,
  cargo,
  estado,
  onUsuarioChange,
  onCargoChange,
  onEstadoChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search by usuario */}
      <div className="relative flex-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gris-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar por usuario..."
          value={usuario}
          onChange={(e) => onUsuarioChange(e.target.value)}
          className="w-full rounded-lg border border-gris-300 bg-white py-2 pl-10 pr-3 text-sm text-gris-900 placeholder:text-gris-400 focus:border-aguamarina-500 focus:outline-none focus:ring-2 focus:ring-aguamarina-500/20"
          aria-label="Buscar por usuario"
        />
      </div>

      {/* Cargo dropdown */}
      <select
        value={cargo}
        onChange={(e) => onCargoChange(e.target.value as Cargo | '')}
        className="rounded-lg border border-gris-300 bg-white px-3 py-2 text-sm text-gris-900 focus:border-aguamarina-500 focus:outline-none focus:ring-2 focus:ring-aguamarina-500/20"
        aria-label="Filtrar por cargo"
      >
        <option value="">Todos los cargos</option>
        <option value="Profesor">Profesor</option>
        <option value="Jefe">Jefe</option>
        <option value="Administrativo">Administrativo</option>
      </select>

      {/* Estado dropdown */}
      <select
        value={estado}
        onChange={(e) => onEstadoChange(e.target.value as Estado | '')}
        className="rounded-lg border border-gris-300 bg-white px-3 py-2 text-sm text-gris-900 focus:border-aguamarina-500 focus:outline-none focus:ring-2 focus:ring-aguamarina-500/20"
        aria-label="Filtrar por estado"
      >
        <option value="">Todos los estados</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
      </select>
    </div>
  );
}
