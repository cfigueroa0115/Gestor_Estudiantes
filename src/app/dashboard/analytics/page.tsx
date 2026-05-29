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

interface Stats {
  total: number;
  estadoCounts: Record<string, number>;
  tipoCounts: Record<string, number>;
  modalidadCounts: Record<string, number>;
  areaCounts: Record<string, number>;
  perDay: Record<string, number>;
  escaladas: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie - Estados */}
        <div className="rounded-xl border border-gris-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gris-800">Distribuci&oacute;n por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={estadoData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
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
    </div>
  );
}
