'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
} from 'recharts';

const COLORS = ['#00ccaf', '#43a047', '#ff9800', '#607d8b', '#e91e63', '#9c27b0'];
const ESTADO_COLORS: Record<string, string> = {
  Radicada: '#4caf50',
  Escalada: '#ff9800',
  EnProgreso: '#2196f3',
  Cerrada: '#607d8b',
};
const ESTADO_LABELS: Record<string, string> = {
  Radicada: 'Radicada',
  Escalada: 'Escalada',
  EnProgreso: 'En progreso',
  Cerrada: 'Cerrada',
};
const TIPO_LABELS: Record<string, string> = {
  Academico: 'Acad\u00e9mico',
  Financiero: 'Financiero',
  Certificados: 'Certificados',
};

interface SemaforoItem {
  numero_radicado: string;
  fecha_solicitud: string;
  id_estudiante: string;
  nombres: string;
  apellidos: string;
}

interface Stats {
  total: number;
  estadoCounts: Record<string, number>;
  tipoCounts: Record<string, number>;
  modalidadCounts: Record<string, number>;
  areaCounts: Record<string, number>;
  perDay: Record<string, number>;
  escaladas: number;
  semaforo: { aTiempo: number; enRiesgo: number; vencida: number };
  semaforoItems: { aTiempo: SemaforoItem[]; enRiesgo: SemaforoItem[]; vencida: SemaforoItem[] };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [popupType, setPopupType] = useState<'aTiempo' | 'enRiesgo' | 'vencida' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Role check - redirect Profesores away
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data && data.cargo === 'Profesor') {
        router.replace('/dashboard');
      }
    }).catch(() => {});
  }, [router]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student-requests/stats');
      if (!res.ok) throw new Error('Error');
      const data = await res.json();
      setStats(data);
    } catch {
      setError('No se pudieron cargar las estadísticas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="p-8"><ErrorState message={error} onRetry={fetchStats} /></div>;
  if (!stats) return null;

  const estadoData = Object.entries(stats.estadoCounts).map(([name, value]) => ({
    name: ESTADO_LABELS[name] || name, value, fill: ESTADO_COLORS[name] || '#999',
  }));
  const tipoData = Object.entries(stats.tipoCounts).map(([name, value]) => ({
    name: TIPO_LABELS[name] || name, value,
  }));
  const modalidadData = Object.entries(stats.modalidadCounts).map(([name, value]) => ({
    name, value,
  }));
  const areaData = Object.entries(stats.areaCounts).map(([name, value]) => ({
    name, value,
  }));
  const timelineData = Object.entries(stats.perDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: date.slice(5), solicitudes: count }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-16">
      {/* Back */}
      <button onClick={() => router.push('/dashboard')} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gris-600 transition-colors hover:text-aguamarina-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Volver al Gestor
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gris-900 md:text-3xl">Dashboard Anal&iacute;tico</h1>
        <p className="mt-1 text-sm text-gris-600">Indicadores de gesti&oacute;n de solicitudes estudiantiles</p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gris-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gris-500 uppercase">Total solicitudes</p>
          <p className="mt-1 text-3xl font-bold text-gris-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-xs font-medium text-green-700 uppercase">Radicadas</p>
          <p className="mt-1 text-3xl font-bold text-green-800">{stats.estadoCounts.Radicada || 0}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-medium text-amber-700 uppercase">Escaladas</p>
          <p className="mt-1 text-3xl font-bold text-amber-800">{stats.escaladas}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-xs font-medium text-blue-700 uppercase">En progreso</p>
          <p className="mt-1 text-3xl font-bold text-blue-800">{stats.estadoCounts.EnProgreso || 0}</p>
        </div>
      </div>

      {/* Semaphore Section */}
      <div className="mb-8 rounded-2xl border border-gris-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-gris-900">Semaforización de Solicitudes</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* KPI Semaphore Cards */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 cursor-pointer hover:bg-green-100 transition-colors" onClick={() => setPopupType('aTiempo')}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-800">{stats.semaforo?.aTiempo || 0}</p>
                <p className="text-sm font-medium text-green-700">A tiempo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 cursor-pointer hover:bg-yellow-100 transition-colors" onClick={() => setPopupType('enRiesgo')}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500 animate-[glow-yellow_2s_ease-in-out_infinite]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-800">{stats.semaforo?.enRiesgo || 0}</p>
                <p className="text-sm font-medium text-yellow-700">En riesgo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setPopupType('vencida')}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 animate-[glow-red_1.5s_ease-in-out_infinite]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-800">{stats.semaforo?.vencida || 0}</p>
                <p className="text-sm font-medium text-red-700">Vencidas</p>
              </div>
            </div>
          </div>

          {/* Pie Chart - Semaphore */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'A tiempo', value: stats.semaforo?.aTiempo || 0, fill: '#22c55e' },
                    { name: 'En riesgo', value: stats.semaforo?.enRiesgo || 0, fill: '#eab308' },
                    { name: 'Vencidas', value: stats.semaforo?.vencida || 0, fill: '#ef4444' },
                  ]}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  strokeWidth={3}
                  stroke="#fff"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#eab308" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie - Estados */}
        <div className="rounded-xl border border-gris-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gris-800">Distribuci&oacute;n por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={estadoData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {estadoData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar - Tipo solicitud */}
        <div className="rounded-xl border border-gris-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gris-800">Solicitudes por Tipo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tipoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Solicitudes" radius={[6, 6, 0, 0]}>
                {tipoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar - Modalidad */}
        <div className="rounded-xl border border-gris-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gris-800">Solicitudes por Modalidad</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={modalidadData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" name="Solicitudes" radius={[0, 6, 6, 0]} fill="#00ccaf" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie - Areas escaladas */}
        <div className="rounded-xl border border-gris-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gris-800">&Aacute;reas de Escalamiento</h3>
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={areaData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {areaData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-gris-500">Sin datos de escalamiento</div>
          )}
        </div>

        {/* Area chart - Timeline */}
        <div className="rounded-xl border border-gris-200 bg-white p-6 shadow-sm md:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-gris-800">Solicitudes &uacute;ltimos 30 d&iacute;as</h3>
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="solicitudes" stroke="#00ccaf" fill="#00ccaf" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-gris-500">Sin datos en los &uacute;ltimos 30 d&iacute;as</div>
          )}
        </div>
      </div>

      {/* Popup de detalle de semaforización */}
      {popupType && stats.semaforoItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPopupType(null)}>
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className={`text-lg font-bold ${popupType === 'vencida' ? 'text-red-800' : popupType === 'enRiesgo' ? 'text-yellow-800' : 'text-green-800'}`}>
                {popupType === 'aTiempo' ? 'Solicitudes A tiempo' : popupType === 'enRiesgo' ? 'Solicitudes En riesgo' : 'Solicitudes Vencidas'}
              </h3>
              <button onClick={() => setPopupType(null)} className="rounded p-1 text-gris-500 hover:bg-gris-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <p className="mb-3 text-xs text-gris-500">Haz clic en un registro para ir a Gestionar solicitudes</p>
            <div className="divide-y divide-gris-100">
              {(stats.semaforoItems[popupType] || []).map((item) => (
                <button key={item.numero_radicado} onClick={() => router.push(`/dashboard/manage-requests?search=${item.numero_radicado}`)} className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-gris-50 rounded-lg">
                  <div className={`h-3 w-3 rounded-full ${popupType === 'vencida' ? 'bg-red-500' : popupType === 'enRiesgo' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gris-900">{item.numero_radicado}</p>
                    <p className="text-xs text-gris-500">{item.nombres} {item.apellidos} &middot; ID: {item.id_estudiante}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gris-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </button>
              ))}
              {(stats.semaforoItems[popupType] || []).length === 0 && (
                <p className="py-4 text-center text-sm text-gris-500">No hay solicitudes en esta categor&iacute;a</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
