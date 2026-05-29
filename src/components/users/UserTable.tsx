'use client';

import { Cargo, Estado } from '@/types';

interface UserRecord {
  id: string;
  usuario: string;
  cargo: Cargo;
  estado: Estado;
  created_at: string;
  last_login_at: string | null;
}

interface UserTableProps {
  users: UserRecord[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (user: UserRecord) => void;
  onToggleStatus: (user: UserRecord) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function UserTable({
  users,
  page,
  pageSize,
  totalPages,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onToggleStatus,
}: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gris-200 bg-white shadow-sm">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gris-200 bg-gris-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gris-700">Usuario</th>
              <th className="px-4 py-3 font-medium text-gris-700">Cargo</th>
              <th className="px-4 py-3 font-medium text-gris-700">Estado</th>
              <th className="px-4 py-3 font-medium text-gris-700">Creado</th>
              <th className="px-4 py-3 font-medium text-gris-700">Último acceso</th>
              <th className="px-4 py-3 font-medium text-gris-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gris-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gris-900">
                  {user.usuario}
                </td>
                <td className="px-4 py-3 text-gris-700">{user.cargo}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.estado === 'Activo'
                        ? 'bg-verde-100 text-verde-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-gris-600">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-3 text-gris-600">
                  {formatDate(user.last_login_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="rounded p-1.5 text-gris-500 transition-colors hover:bg-aguamarina-50 hover:text-aguamarina-700 focus:outline-none focus:ring-2 focus:ring-aguamarina-500"
                      aria-label={`Editar usuario ${user.usuario}`}
                      title="Editar"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onToggleStatus(user)}
                      className={`rounded p-1.5 transition-colors focus:outline-none focus:ring-2 ${
                        user.estado === 'Activo'
                          ? 'text-gris-500 hover:bg-red-50 hover:text-red-700 focus:ring-red-500'
                          : 'text-gris-500 hover:bg-verde-50 hover:text-verde-700 focus:ring-verde-500'
                      }`}
                      aria-label={
                        user.estado === 'Activo'
                          ? `Desactivar usuario ${user.usuario}`
                          : `Reactivar usuario ${user.usuario}`
                      }
                      title={user.estado === 'Activo' ? 'Desactivar' : 'Reactivar'}
                    >
                      {user.estado === 'Activo' ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
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
