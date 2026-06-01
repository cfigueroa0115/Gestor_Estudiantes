'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/shared/Toast';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { RequestFilters } from '@/components/requests/RequestFilters';
import { ManageRequestModal } from '@/components/requests/ManageRequestModal';
import { Modalidad, TipoSolicitud, Cargo } from '@/types';

interface StudentRequestRecord {
  id: string;
  numero_radicado: string;
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
  estado_solicitud: string;
  estado_solicitud_fecha: string;
  gestion_count: number;
  created_at: string;
  creator: {
    usuario: string;
    cargo: Cargo;
  };
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

function renderNullable(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return value;
}

type SemaforoStatus = 'normal' | 'riesgo' | 'vencida';

/** Comprehensive traffic light (semaphore) system for request status */
function getSemaforoStatus(request: StudentRequestRecord): SemaforoStatus {
  const estadoDate = new Date(request.estado_solicitud_fecha || request.created_at);
  const now = new Date();
  const diffDays = (now.getTime() - estadoDate.getTime()) / (1000 * 60 * 60 * 24);

  switch (request.estado_solicitud) {
    case 'Radicada':
      if (diffDays > 1) return 'vencida';
      return 'normal';
    case 'EnProgreso':
      if (diffDays > 2) return 'vencida';
      if (diffDays > 1) return 'riesgo';
      return 'normal';
    case 'Escalada':
      if (diffDays > 5) return 'vencida';
      if (diffDays > 3) return 'riesgo';
      return 'normal';
    default:
      return 'normal';
  }
}

interface ColumnDef {
  key: string;
  label: string;
  sortable: boolean;
  minWidth?: string;
}

const COLUMNS: ColumnDef[] = [
  { key: 'accion', label: 'Acción', sortable: false, minWidth: '100px' },
  { key: 'semaforizacion', label: 'Semaforización', sortable: false, minWidth: '130px' },
  { key: 'numero_radicado', label: 'N° Radicado', sortable: true, minWidth: '150px' },
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
  { key: 'estado_solicitud', label: 'Estado actual', sortable: false, minWidth: '120px' },
  { key: 'creator_usuario', label: 'Usuario creador', sortable: false, minWidth: '120px' },
  { key: 'creator_cargo', label: 'Cargo creador', sortable: false, minWidth: '110px' },
  { key: 'created_at', label: 'Fecha creación', sortable: true, minWidth: '140px' },
];

function SortIcon({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) {
  if (!active) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 inline h-3 w-3 text-gris-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  if (direction === 'asc') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 inline h-3 w-3 text-aguamarina-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 inline h-3 w-3 text-aguamarina-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function getCellValue(request: StudentRequestRecord, key: string): string {
  switch (key) {
    case 'numero_radicado': return request.numero_radicado || '';
    case 'fecha_solicitud': return formatDate(request.fecha_solicitud);
    case 'id_estudiante': return request.id_estudiante;
    case 'nombres': return request.nombres;
    case 'apellidos': return request.apellidos;
    case 'correo': return request.correo;
    case 'celular': return request.celular;
    case 'programa': return request.programa;
    case 'modalidad': return request.modalidad;
    case 'tipo_solicitud': return TIPO_SOLICITUD_DISPLAY[request.tipo_solicitud] || request.tipo_solicitud;
    case 'solicitud_academica': return renderNullable(request.solicitud_academica);
    case 'solicitud_financiera': return renderNullable(request.solicitud_financiera);
    case 'descripcion_solicitud': return request.descripcion_solicitud;
    case 'requiere_escalar': return request.requiere_escalar ? 'Sí' : 'No';
    case 'area_escalar': return renderNullable(request.area_escalar);
    case 'estado_solicitud': return request.estado_solicitud || '';
    case 'creator_usuario': return request.creator?.usuario || '';
    case 'creator_cargo': return request.creator?.cargo || '';
    case 'created_at': return formatDateTime(request.created_at);
    default: return '';
  }
}

export default function ManageRequestsPage() {
  const { showToast } = useToast();
  const router = useRouter();

  // Data state
  const [requests, setRequests] = useState<StudentRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Sort state
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter state
  const [search, setSearch] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [idEstudiante, setIdEstudiante] = useState('');
  const [tipoSolicitud, setTipoSolicitud] = useState<TipoSolicitud | ''>('');
  const [modalidad, setModalidad] = useState<Modalidad | ''>('');
  const [areaEscalar, setAreaEscalar] = useState('');

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState<StudentRequestRecord | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Build query params
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    if (search) params.set('search', search);
    if (fechaDesde) params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params.set('fechaHasta', fechaHasta);
    if (idEstudiante) params.set('idEstudiante', idEstudiante);
    if (tipoSolicitud) params.set('tipoSolicitud', tipoSolicitud);
    if (modalidad) params.set('modalidad', modalidad);
    if (areaEscalar) params.set('areaEscalar', areaEscalar);
    return params;
  }, [page, pageSize, sortBy, sortOrder, search, fechaDesde, fechaHasta, idEstudiante, tipoSolicitud, modalidad, areaEscalar]);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = buildQueryParams();
      const res = await fetch(`/api/student-requests?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Error al cargar las solicitudes');
      }

      const data = await res.json();
      setRequests(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalRecords(data.pagination.totalRecords);
    } catch {
      setError('No se pudieron cargar las solicitudes. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, fechaDesde, fechaHasta, idEstudiante, tipoSolicitud, modalidad, areaEscalar]);

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  // Handle manage click
  const handleManageClick = (request: StudentRequestRecord) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  // Suppress unused variable warning
  void showToast;

  return (
    <div className="mx-auto max-w-full px-4 py-8 md:px-8 lg:px-16">
      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gris-600 transition-colors hover:text-aguamarina-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al Gestor
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gris-900 md:text-2xl">
          Gestionar solicitudes creadas
        </h1>
        <p className="mt-1 text-sm text-gris-600">
          Gestione y de seguimiento a las solicitudes radicadas por los estudiantes
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <RequestFilters
          search={search}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          idEstudiante={idEstudiante}
          tipoSolicitud={tipoSolicitud}
          modalidad={modalidad}
          areaEscalar={areaEscalar}
          onSearchChange={setSearch}
          onFechaDesdeChange={setFechaDesde}
          onFechaHastaChange={setFechaHasta}
          onIdEstudianteChange={setIdEstudiante}
          onTipoSolicitudChange={setTipoSolicitud}
          onModalidadChange={setModalidad}
          onAreaEscalarChange={setAreaEscalar}
        />
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton rows={8} className="rounded-lg border border-gris-200 bg-white p-6" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRequests} />
      ) : requests.length === 0 ? (
        <EmptyState message="No se encontraron solicitudes" />
      ) : (
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
                      onClick={col.sortable ? () => handleSortChange(col.key) : undefined}
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
                {requests.map((request) => {
                  const semaforo = getSemaforoStatus(request);
                  return (
                  <tr key={request.id} className={`transition-colors ${
                    semaforo === 'vencida' ? 'bg-red-50 hover:bg-red-100' :
                    semaforo === 'riesgo' ? 'bg-yellow-50 hover:bg-yellow-100' :
                    'hover:bg-gris-50'
                  }`}>
                    {COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className={`whitespace-nowrap px-3 py-2.5 ${
                          semaforo === 'vencida' ? 'text-red-800' :
                          semaforo === 'riesgo' ? 'text-yellow-800' :
                          'text-gris-700'
                        }`}
                        title={col.key !== 'accion' ? getCellValue(request, col.key) : undefined}
                      >
                        {col.key === 'accion' ? (
                          <button
                            onClick={() => handleManageClick(request)}
                            className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                              request.gestion_count === 0
                                ? 'bg-verde-600 hover:bg-verde-700 focus:ring-verde-500'
                                : request.gestion_count === 1
                                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                : request.gestion_count === 2
                                ? 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500'
                                : request.gestion_count === 3
                                ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                            }`}
                          >
                            {request.gestion_count === 0
                              ? 'Gestionar'
                              : `Gesti\u00f3n ${request.gestion_count + 1}`}
                          </button>
                        ) : col.key === 'descripcion_solicitud' ? (
                          <span className="block max-w-[200px] truncate">
                            {getCellValue(request, col.key)}
                          </span>
                        ) : col.key === 'estado_solicitud' ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              request.estado_solicitud === 'Escalada'
                                ? 'bg-amber-100 text-amber-800'
                                : request.estado_solicitud === 'EnProgreso'
                                ? 'bg-blue-100 text-blue-800'
                                : request.estado_solicitud === 'Cerrada'
                                ? 'bg-gris-100 text-gris-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {request.estado_solicitud === 'EnProgreso'
                              ? 'En progreso'
                              : request.estado_solicitud || 'Radicada'}
                          </span>
                        ) : col.key === 'semaforizacion' ? (
                          semaforo === 'vencida' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              Vencida
                            </span>
                          ) : semaforo === 'riesgo' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-bold text-yellow-800">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 10 2 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                              En riesgo
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">A tiempo</span>
                          )
                        ) : (
                          getCellValue(request, col.key)
                        )}
                      </td>
                    ))}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gris-200 bg-gris-50 px-4 py-3 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-gris-600">
              <span>Mostrar</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
                onClick={() => setPage(page - 1)}
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
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="rounded px-3 py-1.5 text-sm font-medium text-gris-700 transition-colors hover:bg-gris-200 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Página siguiente"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Request Modal */}
      <ManageRequestModal
        isOpen={showModal}
        request={selectedRequest}
        onClose={() => setShowModal(false)}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
