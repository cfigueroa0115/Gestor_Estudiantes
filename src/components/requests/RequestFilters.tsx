'use client';

import { Modalidad, TipoSolicitud } from '@/types';

interface RequestFiltersProps {
  search: string;
  fechaDesde: string;
  fechaHasta: string;
  idEstudiante: string;
  tipoSolicitud: TipoSolicitud | '';
  modalidad: Modalidad | '';
  areaEscalar: string;
  onSearchChange: (value: string) => void;
  onFechaDesdeChange: (value: string) => void;
  onFechaHastaChange: (value: string) => void;
  onIdEstudianteChange: (value: string) => void;
  onTipoSolicitudChange: (value: TipoSolicitud | '') => void;
  onModalidadChange: (value: Modalidad | '') => void;
  onAreaEscalarChange: (value: string) => void;
}

export function RequestFilters({
  search,
  fechaDesde,
  fechaHasta,
  idEstudiante,
  tipoSolicitud,
  modalidad,
  areaEscalar,
  onSearchChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onIdEstudianteChange,
  onTipoSolicitudChange,
  onModalidadChange,
  onAreaEscalarChange,
}: RequestFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Row 1: Search + ID Estudiante */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* General search */}
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
            placeholder="Buscar por nombre, correo, ID o descripción..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gris-300 bg-white py-2 pl-10 pr-3 text-sm text-gris-900 placeholder:text-gris-400 focus:border-aguamarina-500 focus:outline-none focus:ring-2 focus:ring-aguamarina-500/20"
            aria-label="Búsqueda general"
          />
        </div>

        {/* ID Estudiante */}
        <input
          type="text"
          placeholder="ID Estudiante"
          value={idEstudiante}
          onChange={(e) => onIdEstudianteChange(e.target.value)}
          className="w-full rounded-lg border border-gris-300 bg-white px-3 py-2 text-sm text-gris-900 placeholder:text-gris-400 focus:border-aguamarina-500 focus:outline-none focus:ring-2 focus:ring-aguamarina-500/20 sm:w-40"
          aria-label="Filtrar por ID estudiante"
        />
      </div>

      {/* Row 2: Date range + Dropdowns */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Fecha desde */}
        <div className="flex items-center gap-2">
          <label htmlFor="fechaDesde" className="shrink-0 text-xs text-gris-600">
            Desde:
          </label>
          <input
            id="fechaDesde"
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
            className="rounded-lg border border-gris-300 bg-white px-3 py-2 text-sm text-gris-900 focus:border-aguamarina-500 focus:outline-none focus:ring-2 focus:ring-aguamarina-500/20"
            aria-label="Fecha desde"
          />
        </div>

        {/* Fecha hasta */}
        <div className="flex items-center gap-2">
          <label htmlFor="fechaHasta" className="shrink-0 text-xs text-gris-600">
            Hasta:
          </label>
          <input
            id="fechaHasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => onFechaHastaChange(e.target.value)}
            className="rounded-lg border border-gris-300 bg-white px-3 py-2 text-sm text-gris-900 focus:border-aguamarina-500 focus:outline-none focus:ring-2 focus:ring-aguamarina-500/20"
            aria-label="Fecha hasta"
          />
        </div>

        {/* Tipo solicitud dropdown */}
        <select
          value={tipoSolicitud}
          onChange={(e) => onTipoSolicitudChange(e.target.value as TipoSolicitud | '')}
          className="rounded-lg border border-gris-300 bg-white px-3 py-2 text-sm text-gris-900 focus:border-aguamarina-500 focus:outline-none focus:ring-2 focus:ring-aguamarina-500/20"
          aria-label="Filtrar por tipo de solicitud"
        >
          <option value="">Todos los tipos</option>
          <option value="Académico">Académico</option>
          <option value="Financiero">Financiero</option>
          <option value="Certificados">Certificados</option>
        </select>

        {/* Modalidad dropdown */}
        <select
          value={modalidad}
          onChange={(e) => onModalidadChange(e.target.value as Modalidad | '')}
          className="rounded-lg border border-gris-300 bg-white px-3 py-2 text-sm text-gris-900 focus:border-aguamarina-500 focus:outline-none focus:ring-2 focus:ring-aguamarina-500/20"
          aria-label="Filtrar por modalidad"
        >
          <option value="">Todas las modalidades</option>
          <option value="Presencial">Presencial</option>
          <option value="Virtual">Virtual</option>
          <option value="Funza">Funza</option>
        </select>

        {/* Área escalar dropdown */}
        <select
          value={areaEscalar}
          onChange={(e) => onAreaEscalarChange(e.target.value)}
          className="rounded-lg border border-gris-300 bg-white px-3 py-2 text-sm text-gris-900 focus:border-aguamarina-500 focus:outline-none focus:ring-2 focus:ring-aguamarina-500/20"
          aria-label="Filtrar por área a escalar"
        >
          <option value="">Todas las áreas</option>
          <option value="Financiera">Financiera</option>
          <option value="Registro">Registro</option>
          <option value="Tesorería">Tesorería</option>
        </select>
      </div>
    </div>
  );
}
