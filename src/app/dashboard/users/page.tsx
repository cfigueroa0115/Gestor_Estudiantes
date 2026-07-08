'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/shared/Toast';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { UserTable } from '@/components/users/UserTable';
import { UserFilters } from '@/components/users/UserFilters';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { EditUserModal } from '@/components/users/EditUserModal';
import { Cargo, Estado } from '@/types';

interface UserRecord {
  id: string;
  usuario: string;
  nombre: string | null;
  cargo: Cargo;
  organizacion: string | null;
  estado: Estado;
  created_at: string;
  last_login_at: string | null;
}

export default function UsersPage() {
  const { showToast } = useToast();
  const router = useRouter();

  // Role check - redirect Profesores away
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data && data.cargo === 'Profesor') {
        router.replace('/dashboard');
      }
    }).catch(() => {});
  }, [router]);

  // Data state
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter state
  const [filterUsuario, setFilterUsuario] = useState('');
  const [filterCargo, setFilterCargo] = useState<Cargo | ''>('');
  const [filterEstado, setFilterEstado] = useState<Estado | ''>('');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [statusUser, setStatusUser] = useState<UserRecord | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (filterUsuario) params.set('usuario', filterUsuario);
      if (filterCargo) params.set('cargo', filterCargo);
      if (filterEstado) params.set('estado', filterEstado);

      const res = await fetch(`/api/users?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Error al cargar los usuarios');
      }

      const data = await res.json();
      setUsers(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalRecords(data.pagination.totalRecords);
    } catch {
      setError('No se pudieron cargar los usuarios. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterUsuario, filterCargo, filterEstado]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterUsuario, filterCargo, filterEstado]);

  // Handle status toggle
  const handleToggleStatus = async () => {
    if (!statusUser) return;

    setStatusLoading(true);
    try {
      const newEstado = statusUser.estado === 'Activo' ? 'Inactivo' : 'Activo';
      const res = await fetch(`/api/users/${statusUser.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newEstado }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        showToast(
          errorData?.error || 'Error al cambiar el estado del usuario',
          'error'
        );
        return;
      }

      showToast(
        newEstado === 'Activo'
          ? 'Usuario reactivado exitosamente'
          : 'Usuario desactivado exitosamente',
        'success'
      );
      fetchUsers();
    } catch {
      showToast('Error de conexión. Intente nuevamente.', 'error');
    } finally {
      setStatusLoading(false);
      setStatusUser(null);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 lg:px-16">
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
            Administración de usuarios
          </h1>
          <p className="mt-1 text-sm text-gris-600">
            Gestione los usuarios del sistema
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
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
          Nuevo usuario
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <UserFilters
          usuario={filterUsuario}
          cargo={filterCargo}
          estado={filterEstado}
          onUsuarioChange={setFilterUsuario}
          onCargoChange={setFilterCargo}
          onEstadoChange={setFilterEstado}
        />
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton rows={8} className="rounded-lg border border-gris-200 bg-white p-6" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <EmptyState message="No se encontraron usuarios con los filtros aplicados." />
      ) : (
        <UserTable
          users={users}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          onEdit={(user) => setEditUser(user)}
          onToggleStatus={(user) => setStatusUser(user)}
        />
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchUsers}
        showToast={showToast}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        onSuccess={fetchUsers}
        showToast={showToast}
        user={editUser}
      />

      {/* Status Confirmation Dialog */}
      {statusUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !statusLoading && setStatusUser(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="status-dialog-title"
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="status-dialog-title"
              className="mb-2 text-lg font-semibold text-gris-900"
            >
              {statusUser.estado === 'Activo'
                ? 'Desactivar usuario'
                : 'Reactivar usuario'}
            </h2>
            <p className="mb-6 text-sm text-gris-600">
              {statusUser.estado === 'Activo'
                ? `¿Está seguro de que desea desactivar al usuario "${statusUser.usuario}"? El usuario no podrá iniciar sesión mientras esté inactivo.`
                : `¿Está seguro de que desea reactivar al usuario "${statusUser.usuario}"? El usuario podrá iniciar sesión nuevamente.`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStatusUser(null)}
                disabled={statusLoading}
                className="rounded-lg border border-gris-300 px-4 py-2 text-sm font-medium text-gris-700 transition-colors hover:bg-gris-50 focus:outline-none focus:ring-2 focus:ring-gris-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusLoading}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  statusUser.estado === 'Activo'
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-verde-600 hover:bg-verde-700 focus:ring-verde-500'
                }`}
              >
                {statusLoading && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {statusUser.estado === 'Activo' ? 'Desactivar' : 'Reactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
