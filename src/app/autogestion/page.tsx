'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { lookupStudent } from '@/lib/use-student-lookup';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  studentRequestSchema,
  type StudentRequestInput,
} from '@/lib/validations/student-request.schema';
import { Button } from '@/components/ui/button';

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

export default function AutogestionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [radicado, setRadicado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [studentFound, setStudentFound] = useState(false);

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

  const handleIdEstudianteBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const id = e.target.value;
    if (!id || id.length < 3) {
      setValue('nombres', '');
      setValue('apellidos', '');
      setValue('correo', '');
      setValue('celular', '');
      setStudentFound(false);
      return;
    }
    const result = await lookupStudent(id);
    if (result) {
      if (result.nombres) setValue('nombres', result.nombres);
      if (result.apellidos) setValue('apellidos', result.apellidos);
      if (result.correo) setValue('correo', result.correo);
      if (result.celular) setValue('celular', result.celular);
      setStudentFound(true);
    } else {
      setStudentFound(false);
    }
  };

  const inputClass = (hasError: boolean, readonly?: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-aguamarina-500 focus:ring-1 focus:ring-aguamarina-500 ${hasError ? 'border-red-500' : 'border-gris-300'} ${readonly ? 'bg-gris-100 text-gris-600 cursor-not-allowed' : ''}`;

  const onSubmit = async (data: StudentRequestInput) => {
    setIsSubmitting(true);
    setError(null);
    const payload: StudentRequestInput = {
      ...data,
      solicitud_academica: data.tipo_solicitud === 'Académico' ? data.solicitud_academica : null,
      solicitud_financiera: data.tipo_solicitud === 'Financiero' ? data.solicitud_financiera : null,
      area_escalar: data.requiere_escalar ? data.area_escalar : null,
    };
    try {
      const response = await fetch('/api/autogestion', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (response.ok) {
        const result = await response.json();
        setRadicado(result.numero_radicado);
        reset();
      } else {
        const result = await response.json();
        setError(result.error || 'No se pudo registrar la solicitud.');
        setIsSubmitting(false);
      }
    } catch {
      setError('Error de conexión. Intente nuevamente.');
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (radicado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gris-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gris-900 mb-2">¡Solicitud Radicada!</h2>
          <p className="text-sm text-gris-600 mb-6">Su solicitud ha sido registrada exitosamente.</p>
          <div className="rounded-xl bg-aguamarina-50 border-2 border-aguamarina-200 p-5 mb-6">
            <p className="text-xs font-medium text-aguamarina-700 uppercase tracking-wide mb-1">N&uacute;mero de Radicado</p>
            <p className="text-2xl font-bold text-aguamarina-800 tracking-wider">{radicado}</p>
          </div>
          <p className="text-xs text-gris-500 mb-6">Guarde este n&uacute;mero para consultar el estado de su solicitud.</p>
          <button onClick={() => { setRadicado(null); setIsSubmitting(false); }} className="w-full rounded-lg bg-aguamarina-600 px-6 py-3 text-sm font-semibold text-white hover:bg-aguamarina-700">
            Radicar otra solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gris-50">
      {/* Header */}
      <header className="border-b border-gris-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex items-center justify-center px-4 py-3">
          <Image src="/logo-ucc.jpeg" alt="UCC" width={120} height={48} className="h-12 w-auto object-contain" priority />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gris-900 md:text-2xl">Autogesti&oacute;n Estudiantil</h1>
          <p className="mt-1 text-sm text-gris-600">Diligencie el formulario para radicar su solicitud</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">{error}</div>}

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Sección 1 */}
            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-gris-700">Datos del estudiante</legend>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="fecha_solicitud" className="mb-1 block text-sm font-medium text-gris-700">Fecha de solicitud</label>
                  <input id="fecha_solicitud" type="text" readOnly className="w-full rounded-lg border border-gris-300 bg-gris-50 px-3 py-2 text-sm text-gris-600" {...register('fecha_solicitud')} />
                </div>
                <div>
                  <label htmlFor="id_estudiante" className="mb-1 block text-sm font-medium text-gris-700">ID Estudiante</label>
                  <input id="id_estudiante" type="text" inputMode="numeric" maxLength={10} placeholder="Máximo 10 dígitos" className={inputClass(!!errors.id_estudiante)} {...register('id_estudiante')} disabled={isSubmitting} onBlur={handleIdEstudianteBlur} />
                  {errors.id_estudiante && <p className="mt-1 text-xs text-red-600">{errors.id_estudiante.message}</p>}
                </div>
                <div>
                  <label htmlFor="nombres" className="mb-1 block text-sm font-medium text-gris-700">Nombres</label>
                  <input id="nombres" type="text" maxLength={100} placeholder="Nombres" className={inputClass(!!errors.nombres, studentFound)} {...register('nombres')} disabled={isSubmitting || studentFound} />
                  {errors.nombres && <p className="mt-1 text-xs text-red-600">{errors.nombres.message}</p>}
                </div>
                <div>
                  <label htmlFor="apellidos" className="mb-1 block text-sm font-medium text-gris-700">Apellidos</label>
                  <input id="apellidos" type="text" maxLength={100} placeholder="Apellidos" className={inputClass(!!errors.apellidos, studentFound)} {...register('apellidos')} disabled={isSubmitting || studentFound} />
                  {errors.apellidos && <p className="mt-1 text-xs text-red-600">{errors.apellidos.message}</p>}
                </div>
                <div>
                  <label htmlFor="correo" className="mb-1 block text-sm font-medium text-gris-700">Correo electr&oacute;nico</label>
                  <input id="correo" type="email" placeholder="correo@ejemplo.com" className={inputClass(!!errors.correo, studentFound)} {...register('correo')} disabled={isSubmitting || studentFound} />
                  {errors.correo && <p className="mt-1 text-xs text-red-600">{errors.correo.message}</p>}
                </div>
                <div>
                  <label htmlFor="celular" className="mb-1 block text-sm font-medium text-gris-700">Celular</label>
                  <input id="celular" type="text" inputMode="numeric" maxLength={15} placeholder="Máximo 15 dígitos" className={inputClass(!!errors.celular, studentFound)} {...register('celular')} disabled={isSubmitting || studentFound} />
                  {errors.celular && <p className="mt-1 text-xs text-red-600">{errors.celular.message}</p>}
                </div>
              </div>
            </fieldset>

            {/* Sección 2 */}
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
                    <option value="" disabled>Seleccione</option>
                    {MODALIDAD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {errors.modalidad && <p className="mt-1 text-xs text-red-600">{errors.modalidad.message}</p>}
                </div>
                <div>
                  <label htmlFor="tipo_solicitud" className="mb-1 block text-sm font-medium text-gris-700">Tipo de solicitud</label>
                  <select id="tipo_solicitud" className={inputClass(!!errors.tipo_solicitud)} onChange={(e) => { setValue('tipo_solicitud', e.target.value as StudentRequestInput['tipo_solicitud']); setValue('solicitud_academica', null); setValue('solicitud_financiera', null); }} value={tipoSolicitud || ''} disabled={isSubmitting}>
                    <option value="" disabled>Seleccione</option>
                    {TIPO_SOLICITUD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {errors.tipo_solicitud && <p className="mt-1 text-xs text-red-600">{errors.tipo_solicitud.message}</p>}
                </div>
                {tipoSolicitud === 'Académico' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gris-700">Solicitud acad&eacute;mica</label>
                    <select className={inputClass(!!errors.solicitud_academica)} onChange={(e) => setValue('solicitud_academica', e.target.value as StudentRequestInput['solicitud_academica'])} value={watch('solicitud_academica') || ''} disabled={isSubmitting}>
                      <option value="" disabled>Seleccione</option>
                      {SOLICITUD_ACADEMICA_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {errors.solicitud_academica && <p className="mt-1 text-xs text-red-600">{errors.solicitud_academica.message}</p>}
                  </div>
                )}
                {tipoSolicitud === 'Financiero' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gris-700">Solicitud financiera</label>
                    <select className={inputClass(!!errors.solicitud_financiera)} onChange={(e) => setValue('solicitud_financiera', e.target.value as StudentRequestInput['solicitud_financiera'])} value={watch('solicitud_financiera') || ''} disabled={isSubmitting}>
                      <option value="" disabled>Seleccione</option>
                      {SOLICITUD_FINANCIERA_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {errors.solicitud_financiera && <p className="mt-1 text-xs text-red-600">{errors.solicitud_financiera.message}</p>}
                  </div>
                )}
              </div>
            </fieldset>

            {/* Sección 3 */}
            <fieldset>
              <div className="mb-4">
                <label htmlFor="descripcion_solicitud" className="mb-1 block text-sm font-semibold text-gris-700">Descripci&oacute;n de la solicitud</label>
                <textarea id="descripcion_solicitud" rows={3} maxLength={1200} placeholder="Describa su solicitud..." className={`w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-aguamarina-500 focus:ring-1 focus:ring-aguamarina-500 ${errors.descripcion_solicitud ? 'border-red-500' : 'border-gris-300'}`} {...register('descripcion_solicitud')} disabled={isSubmitting} />
                <p className={`mt-1 text-xs ${caracteresRestantes < 0 ? 'text-red-600' : 'text-gris-500'}`}>{caracteresRestantes} caracteres restantes</p>
                {errors.descripcion_solicitud && <p className="mt-1 text-xs text-red-600">{errors.descripcion_solicitud.message}</p>}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="requiere_escalar" className="mb-1 block text-sm font-medium text-gris-700">&iquest;Requiere escalar?</label>
                  <select id="requiere_escalar" className={inputClass(!!errors.requiere_escalar)} onChange={(e) => { const v = e.target.value === 'true'; setValue('requiere_escalar', v); if (!v) setValue('area_escalar', null); }} value={requiereEscalar === true ? 'true' : requiereEscalar === false ? 'false' : ''} disabled={isSubmitting}>
                    <option value="" disabled>Seleccione</option>
                    <option value="true">S&iacute;</option>
                    <option value="false">No</option>
                  </select>
                  {errors.requiere_escalar && <p className="mt-1 text-xs text-red-600">{errors.requiere_escalar.message}</p>}
                </div>
                {requiereEscalar === true && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gris-700">&Aacute;rea a escalar</label>
                    <select className={inputClass(!!errors.area_escalar)} onChange={(e) => setValue('area_escalar', e.target.value as StudentRequestInput['area_escalar'])} value={watch('area_escalar') || ''} disabled={isSubmitting}>
                      <option value="" disabled>Seleccione</option>
                      {AREA_ESCALAR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {errors.area_escalar && <p className="mt-1 text-xs text-red-600">{errors.area_escalar.message}</p>}
                  </div>
                )}
              </div>
            </fieldset>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-aguamarina-600 py-3 text-white hover:bg-aguamarina-700 disabled:opacity-50">
              {isSubmitting ? 'Registrando...' : 'Radicar solicitud'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gris-500">&copy; Mgtr. Carlos Alberto Figueroa &middot; Universidad Cooperativa de Colombia</p>
      </div>
    </div>
  );
}
