'use client';

import { useState } from 'react';
import { useToast } from '@/components/shared/Toast';
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

interface ManageRequestModalProps {
  isOpen: boolean;
  request: StudentRequestRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

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

export function ManageRequestModal({ isOpen, request, onClose, onSuccess }: ManageRequestModalProps) {
  const { showToast } = useToast();
  const [estado, setEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const MAX_OBSERVACIONES = 1200;

  if (!isOpen || !request) return null;

  const handleSubmit = async () => {
    if (!estado) {
      showToast('Debe seleccionar un estado', 'error');
      return;
    }
    if (!observaciones.trim()) {
      showToast('Las observaciones son obligatorias', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/student-requests/${request.id}/manage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado_solicitud: estado,
          observaciones: observaciones.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar');
      }

      showToast('Gestión actualizada exitosamente', 'success');
      setEstado('');
      setObservaciones('');
      onSuccess();
      onClose();
    } catch {
      showToast('Error al actualizar la gestión. Intente nuevamente.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setEstado('');
    setObservaciones('');
    onClose();
  };

  const fields = [
    { label: 'N° Radicado', value: request.numero_radicado },
    { label: 'Fecha solicitud', value: formatDate(request.fecha_solicitud) },
    { label: 'ID Estudiante', value: request.id_estudiante },
    { label: 'Nombres', value: request.nombres },
    { label: 'Apellidos', value: request.apellidos },
    { label: 'Correo', value: request.correo },
    { label: 'Celular', value: request.celular },
    { label: 'Programa', value: request.programa },
    { label: 'Modalidad', value: request.modalidad },
    { label: 'Tipo solicitud', value: TIPO_SOLICITUD_DISPLAY[request.tipo_solicitud] || request.tipo_solicitud },
    { label: 'Solicitud académica', value: request.solicitud_academica || 'N/A' },
    { label: 'Solicitud financiera', value: request.solicitud_financiera || 'N/A' },
    { label: 'Descripción', value: request.descripcion_solicitud },
    { label: 'Requiere escalar', value: request.requiere_escalar ? 'Sí' : 'No' },
    { label: 'Área escalar', value: request.area_escalar || 'N/A' },
    { label: 'Estado actual', value: request.estado_solicitud || 'Radicada' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gris-900">Gestionar solicitud</h2>
          <button
            onClick={handleClose}
            className="rounded p-1 text-gris-500 hover:bg-gris-100 hover:text-gris-700"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Read-only fields in 2 columns */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className={field.label === 'Descripción' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-gris-500">{field.label}</label>
              <p className="mt-0.5 text-sm text-gris-900">{field.value}</p>
            </div>
          ))}
        </div>

        <hr className="mb-6 border-gris-200" />

        {/* State change section */}
        <div className="mb-4">
          <label htmlFor="estado-select" className="block text-sm font-medium text-gris-700">
            Cambiar estado <span className="text-red-500">*</span>
          </label>
          <select
            id="estado-select"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gris-300 px-3 py-2 text-sm text-gris-900 focus:border-aguamarina-500 focus:outline-none focus:ring-1 focus:ring-aguamarina-500"
          >
            <option value="">Seleccione un estado</option>
            <option value="EnProgreso">En progreso</option>
            <option value="Cerrada">Cerrada</option>
          </select>
        </div>

        {/* Observaciones - shown when estado is selected */}
        {estado && (
          <div className="mb-6">
            <label htmlFor="observaciones-textarea" className="block text-sm font-medium text-gris-700">
              Observaciones <span className="text-red-500">*</span>
            </label>
            <textarea
              id="observaciones-textarea"
              value={observaciones}
              onChange={(e) => {
                if (e.target.value.length <= MAX_OBSERVACIONES) {
                  setObservaciones(e.target.value);
                }
              }}
              maxLength={MAX_OBSERVACIONES}
              rows={4}
              placeholder="Describa la gestión que permitieron el cambio de estado..."
              className="mt-1 w-full rounded-lg border border-gris-300 px-3 py-2 text-sm text-gris-900 placeholder:text-gris-400 focus:border-aguamarina-500 focus:outline-none focus:ring-1 focus:ring-aguamarina-500"
            />
            <p className="mt-1 text-right text-xs text-gris-500">
              {observaciones.length}/{MAX_OBSERVACIONES} caracteres
            </p>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-aguamarina-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-aguamarina-700 focus:outline-none focus:ring-2 focus:ring-aguamarina-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Actualizando...' : 'Actualizar gestión'}
          </button>
        </div>
      </div>
    </div>
  );
}
