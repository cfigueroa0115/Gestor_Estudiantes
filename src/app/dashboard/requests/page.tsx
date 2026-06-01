'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/shared/Toast';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { RequestTable } from '@/components/requests/RequestTable';
import { RequestFilters } from '@/components/requests/RequestFilters';
import { StudentRequestFormModal } from '@/components/requests/StudentRequestFormModal';
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
  created_at: string;
  creator: {
    usuario: string;
    cargo: Cargo;
  };
}

export default function RequestsPage() {
  const { showToast } = useToast();
  const router = useRouter();

  // Admin check
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data) setIsAdmin(['1129564302', '52317897'].includes(data.usuario));
    }).catch(() => {});
  }, []);

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
  const [showFormModal, setShowFormModal] = useState(false);

  // Build query params from current state
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

  // Handle CSV export
  const handleExport = () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (fechaDesde) params.set('fechaDesde', fechaDesde);
      if (fechaHasta) params.set('fechaHasta', fechaHasta);
      if (idEstudiante) params.set('idEstudiante', idEstudiante);
      if (tipoSolicitud) params.set('tipoSolicitud', tipoSolicitud);
      if (modalidad) params.set('modalidad', modalidad);
      if (areaEscalar) params.set('areaEscalar', areaEscalar);

      const queryString = params.toString();
      const url = queryString
        ? `/api/student-requests/export?${queryString}`
        : '/api/student-requests/export';

      window.location.href = url;
    } catch {
      showToast('Error al exportar. Intente nuevamente.', 'error');
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    fetchRequests();
  };

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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gris-900 md:text-2xl">
            Solicitudes estudiantiles
          </h1>
          <p className="mt-1 text-sm text-gris-600">
            Visualice y gestione las solicitudes de los estudiantes
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export CSV button - solo admins */}
          {isAdmin && (
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-gris-300 bg-white px-4 py-2.5 text-sm font-medium text-gris-700 shadow-sm transition-colors hover:bg-gris-50 focus:outline-none focus:ring-2 focus:ring-aguamarina-500 focus:ring-offset-2"
            aria-label="Exportar solicitudes a CSV"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Exportar CSV
          </button>
          )}

          {/* New request button */}
          <button
            onClick={() => setShowFormModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-aguamarina-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-aguamarina-700 focus:outline-none focus:ring-2 focus:ring-aguamarina-500 focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nueva solicitud
          </button>
        </div>
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
        <RequestTable
          requests={requests}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          totalRecords={totalRecords}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          onSortChange={handleSortChange}
        />
      )}

      {/* Student Request Form Modal */}
      <StudentRequestFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
