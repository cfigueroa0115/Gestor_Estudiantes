'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserSchema } from '@/lib/validations/user.schema';
import { Cargo } from '@/types';
import { z } from 'zod';

type UpdateUserFormData = z.input<typeof updateUserSchema>;

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  user: {
    id: string;
    usuario: string;
    cargo: Cargo;
  } | null;
}

export function EditUserModal({
  isOpen,
  onClose,
  onSuccess,
  showToast,
  user,
}: EditUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    values: {
      cargo: user?.cargo || 'Profesor',
      password: '',
    },
  });

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!user) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        showToast(
          errorData?.error || 'Error al actualizar el usuario',
          'error'
        );
        return;
      }

      showToast('Usuario actualizado exitosamente', 'success');
      reset();
      onSuccess();
      onClose();
    } catch {
      showToast('Error de conexión. Intente nuevamente.', 'error');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-user-title"
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="edit-user-title"
          className="mb-4 text-lg font-semibold text-gris-900"
        >
          Editar usuario: {user.usuario}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Cargo */}
          <div>
            <label
              htmlFor="edit-cargo"
              className="mb-1 block text-sm font-medium text-gris-700"
            >
              Cargo
            </label>
            <select
              id="edit-cargo"
              {...register('cargo')}
              className="w-full rounded-lg border border-gris-300 bg-white px-3 py-2 text-sm text-gris-900 focus:border-aguamarina-500 focus:outline-none focus:ring-2 focus:ring-aguamarina-500/20"
            >
              <option value="Profesor">Profesor</option>
              <option value="Jefe">Jefe</option>
              <option value="Administrativo">Administrativo</option>
            </select>
            {errors.cargo && (
              <p className="mt-1 text-xs text-red-600">{errors.cargo.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="edit-password"
              className="mb-1 block text-sm font-medium text-gris-700"
            >
              Nueva contraseña
            </label>
            <input
              id="edit-password"
              type="password"
              {...register('password')}
              className="w-full rounded-lg border border-gris-300 px-3 py-2 text-sm text-gris-900 placeholder:text-gris-400 focus:border-aguamarina-500 focus:outline-none focus:ring-2 focus:ring-aguamarina-500/20"
              placeholder="Dejar vacío para no cambiar"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
            <p className="mt-1 text-xs text-gris-500">
              Si deja este campo vacío, la contraseña actual se mantendrá sin cambios.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gris-300 px-4 py-2 text-sm font-medium text-gris-700 transition-colors hover:bg-gris-50 focus:outline-none focus:ring-2 focus:ring-gris-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-aguamarina-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-aguamarina-700 focus:outline-none focus:ring-2 focus:ring-aguamarina-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && (
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
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
