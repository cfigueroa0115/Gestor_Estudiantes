'use client';

import { Modalidad, TipoSolicitud, Cargo } from '@/types';

interface StudentRequestRecord {
  id: string;
  fecha_solicitud: string;
  id_estudiante: string;
  nombres: string;
  apellidos: string;
  correo: string;
  celular: string;
  programa: string;
  modalidad: Modalidad;
  tipo_solicitud: TipoSolicitud;
  solicitud_academica: string | null;
  solicitud_financiera: string | null;
  descripcion_solicitud: string;
  requiere_escalar: boolean;
  area_escalar: string | null;
  created_at: string;
  creator: {
    usuario: string;
    cargo: Cargo;
  };
}

interface RequestTableProps {
  requests: StudentRequestRecord[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (field: string) => void;
}

/** Map Prisma enum keys back to display values */
const TIPO_SOLICITUD_DISPLAY: Record<string, string> = {
  Academico: 'Académico',
  Financiero: 'Financiero',
  Certificados: 'Certificados',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Render null/undefined as empty string */
function renderNullable(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return value;
}

interface ColumnDef {
  key: string;
  label: string;
  sortable: boolean;
  minWidth?: string;
}

const COLUMNS: ColumnDef[] = [
  { key: 'fecha_solicitud', label: 'Fecha solicitud', sortable: true, minWidth: '120px' },
  { key: 'id_estudiante', label: 'ID Estudiante', sortable: true, minWidth: '110px' },
  { key: 'nombres', label: 'Nombres', sortable: true, minWidth: '120px' },
  { key: 'apellidos', label: 'Apellidos', sortable: true, minWidth: '120px' },
  { key: 'correo', label: 'Correo', sortable: true, minWidth: '160px' },
  { key: 'celular', label: 'Celular', sortable: false, minWidth: '100px' },
  { key: 'programa', label: 'Programa', sortable: false, minWidth: '140px' },
  { key: 'modalidad', label: 'Modalidad', sortable: true, minWidth: '100px' },
  { key: 'tipo_solicitud', label: 'Tipo solicitud', sortable: true, minWidth: '120px' },
  { key: 'solicitud_academica', label: 'Solicitud académica', sortable: false, minWidth: '140px' },
  { key: 'solicitud_financiera', label: 'Solicitud financiera', sortable: false, minWidth: '140px' },
  { key: 'descripcion_solicitud', label: 'Descripción', sortable: false, minWidth: '200px' },
  { key: 'requiere_escalar', label: 'Requiere escalar', sortable: false, minWidth: '120px' },
  { key: 'area_escalar', label: 'Área escalar', sortable: false, minWidth: '110px' },
  { key: 'creator_usuario', label: 'Usuario creador', sortable: false, minWidth: '120px' },
  { key: 'creator_cargo', label: 'Cargo creador', sortable: false, minWidth: '110px' },
  { key: 'created_at', label: 'Fecha creación', sortable: true, minWidth: '140px' },
];

function SortIcon({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) {
  if (!active) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="ml-1 inline h-3 w-3 text-gris-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }

  if (direction === 'asc') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="ml-1 inline h-3 w-3 text-aguamarina-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="ml-1 inline h-3 w-3 text-aguamarina-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function getCellValue(request: StudentRequestRecord, key: string): string {
  switch (key) {
    case 'fecha_solicitud':
      return formatDate(request.fecha_solicitud);
    case 'id_estudiante':
      return request.id_estudiante;
    case 'nombres':
      return request.nombres;
    case 'apellidos':
      return request.apellidos;
    case 'correo':
      return request.correo;
    case 'celular':
      return request.celular;
    case 'programa':
      return request.programa;
    case 'modalidad':
      return request.modalidad;
    case 'tipo_solicitud':
      return TIPO_SOLICITUD_DISPLAY[request.tipo_solicitud] || request.tipo_solicitud;
    case 'solicitud_academica':
      return renderNullable(request.solicitud_academica);
    case 'solicitud_financiera':
      return renderNullable(request.solicitud_financiera);
    case 'descripcion_solicitud':
      return request.descripcion_solicitud;
    case 'requiere_escalar':
      return request.requiere_escalar ? 'Sí' : 'No';
    case 'area_escalar':
      return renderNullable(request.area_escalar);
    case 'creator_usuario':
      return request.creator?.usuario || '';
    case 'creator_cargo':
      return request.creator?.cargo || '';
    case 'created_at':
      return formatDateTime(request.created_at);
    default:
      return '';
  }
}

export function RequestTable({
  requests,
  page,
  pageSize,
  totalPages,
  totalRecords,
  sortBy,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSortChange,
}: RequestTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gris-200 bg-white shadow-sm">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gris-200 bg-gris-50">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-3 py-3 font-medium text-gris-700 ${
                    col.sortable ? 'cursor-pointer select-none hover:bg-gris-100' : ''
                  }`}
                  style={{ minWidth: col.minWidth }}
                  onClick={col.sortable ? () => onSortChange(col.key) : undefined}
                  aria-sort={
                    col.sortable && sortBy === col.key
                      ? sortOrder === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    {col.sortable && (
                      <SortIcon active={sortBy === col.key} direction={sortOrder} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-100">
            {requests.map((request) => (
              <tr key={request.id} className="transition-colors hover:bg-gris-50">
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className="whitespace-nowrap px-3 py-2.5 text-gris-700"
                    title={getCellValue(request, col.key)}
                  >
                    {col.key === 'descripcion_solicitud' ? (
                      <span className="block max-w-[200px] truncate">
                        {getCellValue(request, col.key)}
                      </span>
                    ) : (
                      getCellValue(request, col.key)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-gris-200 bg-gris-50 px-4 py-3 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-gris-600">
          <span>Mostrar</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded border border-gris-300 bg-white px-2 py-1 text-sm focus:border-aguamarina-500 focus:outline-none focus:ring-1 focus:ring-aguamarina-500"
            aria-label="Registros por página"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>de {totalRecords} registros</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded px-3 py-1.5 text-sm font-medium text-gris-700 transition-colors hover:bg-gris-200 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Página anterior"
          >
            Anterior
          </button>
          <span className="px-3 py-1.5 text-sm text-gris-600">
            Página {page} de {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded px-3 py-1.5 text-sm font-medium text-gris-700 transition-colors hover:bg-gris-200 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Página siguiente"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
