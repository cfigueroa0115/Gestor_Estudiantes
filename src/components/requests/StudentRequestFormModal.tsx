'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  studentRequestSchema,
  type StudentRequestInput,
} from '@/lib/validations/student-request.schema';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';

interface StudentRequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MODALIDAD_OPTIONS = ['Presencial', 'Virtual', 'Funza'] as const;
const TIPO_SOLICITUD_OPTIONS = ['Académico', 'Financiero', 'Certificados'] as const;
const SOLICITUD_ACADEMICA_OPTIONS = [
  'Validación', 'Inscripción de cursos', 'Actualización de nota',
  'Campus virtual', 'Calificación', 'Nota', 'Homologación',
] as const;
const SOLICITUD_FINANCIERA_OPTIONS = ['Descuento', 'Saldo', 'Pago total', 'Pago parcial'] as const;
const AREA_ESCALAR_OPTIONS = ['Financiera', 'Registro', 'Tesorería'] as const;

function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function StudentRequestFormModal({ isOpen, onClose, onSuccess }: StudentRequestFormModalProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [radicadoConfirmation, setRadicadoConfirmation] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<StudentRequestInput>({
    resolver: zodResolver(studentRequestSchema),
    defaultValues: {
      fecha_solicitud: getTodayDate(), id_estudiante: '', nombres: '', apellidos: '',
      correo: '', celular: '', programa: 'Ingeniería industrial',
      modalidad: undefined, tipo_solicitud: undefined,
      solicitud_academica: null, solicitud_financiera: null,
      descripcion_solicitud: '', requiere_escalar: undefined as unknown as boolean, area_escalar: null,
    },
  });

  const tipoSolicitud = watch('tipo_solicitud');
  const requiereEscalar = watch('requiere_escalar');
  const descripcion = watch('descripcion_solicitud') || '';
  const caracteresRestantes = 1200 - descripcion.length;

  const onSubmit = async (data: StudentRequestInput) => {
    setIsSubmitting(true);
    const payload: StudentRequestInput = {
      ...data,
      solicitud_academica: data.tipo_solicitud === 'Académico' ? data.solicitud_academica : null,
      solicitud_financiera: data.tipo_solicitud === 'Financiero' ? data.solicitud_financiera : null,
      area_escalar: data.requiere_escalar ? data.area_escalar : null,
    };
    try {
      const response = await fetch('/api/student-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (response.ok) {
        const result = await response.json();
        reset(); onClose(); onSuccess();
        setRadicadoConfirmation(result.numero_radicado);
      } else {
        const result = await response.json();
        showToast(result.error || 'No se pudo registrar la solicitud.', 'error');
        setIsSubmitting(false);
      }
    } catch {
      showToast('Error de conexión. Intente nuevamente.', 'error');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => { if (!isSubmitting) { reset(); onClose(); } };

  const handleTipoSolicitudChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('tipo_solicitud', e.target.value as StudentRequestInput['tipo_solicitud']);
    setValue('solicitud_academica', null);
    setValue('solicitud_financiera', null);
  };

  const handleRequiereEscalarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'true';
    setValue('requiere_escalar', value);
    if (!value) setValue('area_escalar', null);
  };

  if (!isOpen) return null;

  // Popup de confirmación de radicado
  if (radicadoConfirmation) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Solicitud radicada">
        <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gris-900 mb-2">¡Solicitud Radicada!</h2>
          <p className="text-sm text-gris-600 mb-6">Su solicitud ha sido registrada exitosamente en el sistema.</p>
          <div className="rounded-xl bg-aguamarina-50 border-2 border-aguamarina-200 p-5 mb-6">
            <p className="text-xs font-medium text-aguamarina-700 uppercase tracking-wide mb-1">Número de Radicado</p>
            <p className="text-2xl font-bold text-aguamarina-800 tracking-wider">{radicadoConfirmation}</p>
          </div>
          <p className="text-xs text-gris-500 mb-6">Guarde este número para consultar el estado de su solicitud.</p>
          <button
            onClick={() => setRadicadoConfirmation(null)}
            className="w-full rounded-lg bg-aguamarina-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-aguamarina-700 focus:outline-none focus:ring-2 focus:ring-aguamarina-500 focus:ring-offset-2"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-aguamarina-500 focus:ring-1 focus:ring-aguamarina-500 ${hasError ? 'border-red-500' : 'border-gris-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleClose} role="dialog" aria-modal="true" aria-label="Formulario de solicitud estudiantil">
      <div className="mx-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-gris-900">Nueva Solicitud Estudiantil</h2>
          <p className="mt-1 text-sm text-gris-500">Complete todos los campos para registrar la solicitud</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Sección 1: Datos del estudiante - Grid 2 columnas */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-gris-700">Datos del estudiante</legend>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="fecha_solicitud" className="mb-1 block text-sm font-medium text-gris-700">Fecha de solicitud</label>
                <input id="fecha_solicitud" type="text" readOnly className="w-full rounded-lg border border-gris-300 bg-gris-50 px-3 py-2 text-sm text-gris-600" {...register('fecha_solicitud')} />
              </div>
              <div>
                <label htmlFor="id_estudiante" className="mb-1 block text-sm font-medium text-gris-700">ID Estudiante</label>
                <input id="id_estudiante" type="text" inputMode="numeric" maxLength={10} placeholder="Máximo 10 dígitos" className={inputClass(!!errors.id_estudiante)} {...register('id_estudiante')} disabled={isSubmitting} />
                {errors.id_estudiante && <p className="mt-1 text-xs text-red-600">{errors.id_estudiante.message}</p>}
              </div>
              <div>
                <label htmlFor="nombres" className="mb-1 block text-sm font-medium text-gris-700">Nombres</label>
                <input id="nombres" type="text" maxLength={100} placeholder="Nombres del estudiante" className={inputClass(!!errors.nombres)} {...register('nombres')} disabled={isSubmitting} />
                {errors.nombres && <p className="mt-1 text-xs text-red-600">{errors.nombres.message}</p>}
              </div>
              <div>
                <label htmlFor="apellidos" className="mb-1 block text-sm font-medium text-gris-700">Apellidos</label>
                <input id="apellidos" type="text" maxLength={100} placeholder="Apellidos del estudiante" className={inputClass(!!errors.apellidos)} {...register('apellidos')} disabled={isSubmitting} />
                {errors.apellidos && <p className="mt-1 text-xs text-red-600">{errors.apellidos.message}</p>}
              </div>
              <div>
                <label htmlFor="correo" className="mb-1 block text-sm font-medium text-gris-700">Correo electrónico</label>
                <input id="correo" type="email" placeholder="correo@ejemplo.com" className={inputClass(!!errors.correo)} {...register('correo')} disabled={isSubmitting} />
                {errors.correo && <p className="mt-1 text-xs text-red-600">{errors.correo.message}</p>}
              </div>
              <div>
                <label htmlFor="celular" className="mb-1 block text-sm font-medium text-gris-700">Celular</label>
                <input id="celular" type="text" inputMode="numeric" maxLength={15} placeholder="Máximo 15 dígitos" className={inputClass(!!errors.celular)} {...register('celular')} disabled={isSubmitting} />
                {errors.celular && <p className="mt-1 text-xs text-red-600">{errors.celular.message}</p>}
              </div>
            </div>
          </fieldset>

          {/* Sección 2: Datos del programa - Grid 2 columnas */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-gris-700">Datos del programa</legend>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="programa" className="mb-1 block text-sm font-medium text-gris-700">Programa</label>
                <input id="programa" type="text" readOnly className="w-full rounded-lg border border-gris-300 bg-gris-50 px-3 py-2 text-sm text-gris-600" {...register('programa')} />
              </div>
              <div>
                <label htmlFor="modalidad" className="mb-1 block text-sm font-medium text-gris-700">Modalidad</label>
                <select id="modalidad" className={inputClass(!!errors.modalidad)} {...register('modalidad')} disabled={isSubmitting} defaultValue="">
                  <option value="" disabled>Seleccione una modalidad</option>
                  {MODALIDAD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {errors.modalidad && <p className="mt-1 text-xs text-red-600">{errors.modalidad.message}</p>}
              </div>
              <div>
                <label htmlFor="tipo_solicitud" className="mb-1 block text-sm font-medium text-gris-700">Tipo de solicitud</label>
                <select id="tipo_solicitud" className={inputClass(!!errors.tipo_solicitud)} onChange={handleTipoSolicitudChange} value={tipoSolicitud || ''} disabled={isSubmitting}>
                  <option value="" disabled>Seleccione un tipo</option>
                  {TIPO_SOLICITUD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {errors.tipo_solicitud && <p className="mt-1 text-xs text-red-600">{errors.tipo_solicitud.message}</p>}
              </div>
              {tipoSolicitud === 'Académico' && (
                <div>
                  <label htmlFor="solicitud_academica" className="mb-1 block text-sm font-medium text-gris-700">Solicitud académica</label>
                  <select id="solicitud_academica" className={inputClass(!!errors.solicitud_academica)} onChange={(e) => setValue('solicitud_academica', e.target.value as StudentRequestInput['solicitud_academica'])} value={watch('solicitud_academica') || ''} disabled={isSubmitting}>
                    <option value="" disabled>Seleccione una opción</option>
                    {SOLICITUD_ACADEMICA_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {errors.solicitud_academica && <p className="mt-1 text-xs text-red-600">{errors.solicitud_academica.message}</p>}
                </div>
              )}
              {tipoSolicitud === 'Financiero' && (
                <div>
                  <label htmlFor="solicitud_financiera" className="mb-1 block text-sm font-medium text-gris-700">Solicitud financiera</label>
                  <select id="solicitud_financiera" className={inputClass(!!errors.solicitud_financiera)} onChange={(e) => setValue('solicitud_financiera', e.target.value as StudentRequestInput['solicitud_financiera'])} value={watch('solicitud_financiera') || ''} disabled={isSubmitting}>
                    <option value="" disabled>Seleccione una opción</option>
                    {SOLICITUD_FINANCIERA_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {errors.solicitud_financiera && <p className="mt-1 text-xs text-red-600">{errors.solicitud_financiera.message}</p>}
                </div>
              )}
            </div>
          </fieldset>

          {/* Sección 3: Detalle y escalamiento */}
          <fieldset>
            <div className="mb-4">
              <label htmlFor="descripcion_solicitud" className="mb-1 block text-sm font-semibold text-gris-700">Descripción de la solicitud</label>
              <textarea id="descripcion_solicitud" rows={3} maxLength={1200} placeholder="Describa la solicitud del estudiante..." className={`w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-aguamarina-500 focus:ring-1 focus:ring-aguamarina-500 ${errors.descripcion_solicitud ? 'border-red-500' : 'border-gris-300'}`} {...register('descripcion_solicitud')} disabled={isSubmitting} />
              <p className={`mt-1 text-xs ${caracteresRestantes < 0 ? 'text-red-600' : 'text-gris-500'}`}>{caracteresRestantes} caracteres restantes</p>
              {errors.descripcion_solicitud && <p className="mt-1 text-xs text-red-600">{errors.descripcion_solicitud.message}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="requiere_escalar" className="mb-1 block text-sm font-medium text-gris-700">¿Requiere escalar?</label>
                <select id="requiere_escalar" className={inputClass(!!errors.requiere_escalar)} onChange={handleRequiereEscalarChange} value={requiereEscalar === true ? 'true' : requiereEscalar === false ? 'false' : ''} disabled={isSubmitting}>
                  <option value="" disabled>Seleccione una opción</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
                {errors.requiere_escalar && <p className="mt-1 text-xs text-red-600">{errors.requiere_escalar.message}</p>}
              </div>
              {requiereEscalar === true && (
                <div>
                  <label htmlFor="area_escalar" className="mb-1 block text-sm font-medium text-gris-700">Área a escalar</label>
                  <select id="area_escalar" className={inputClass(!!errors.area_escalar)} onChange={(e) => setValue('area_escalar', e.target.value as StudentRequestInput['area_escalar'])} value={watch('area_escalar') || ''} disabled={isSubmitting}>
                    <option value="" disabled>Seleccione un área</option>
                    {AREA_ESCALAR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {errors.area_escalar && <p className="mt-1 text-xs text-red-600">{errors.area_escalar.message}</p>}
                </div>
              )}
            </div>
          </fieldset>

          {/* Buttons side by side */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} disabled={isSubmitting} className="flex-1 rounded-lg bg-gris-100 px-4 py-2.5 text-sm font-medium text-gris-700 transition-colors hover:bg-gris-200 disabled:opacity-50">
              Cancelar
            </button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-aguamarina-600 text-white hover:bg-aguamarina-700 disabled:opacity-50">
              {isSubmitting ? <span className="flex items-center justify-center gap-2"><LoadingSpinner />Registrando...</span> : 'Registrar solicitud'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
