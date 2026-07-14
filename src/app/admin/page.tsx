'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ADMIN_USERS = ['1129564302', '52317897', '455651', '330032'];

interface ProgramaStats {
  codigo: string;
  nombre: string;
  total: number;
  radicadas: number;
  escaladas: number;
  enProgreso: number;
  cerradas: number;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState<ProgramaStats[]>([]);
  const [exporting, setExporting] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && ADMIN_USERS.includes(data.usuario)) {
          setAuthenticated(true);
          setUserName(data.nombre || data.usuario);
          fetchAllStats();
        } else {
          setShowLogin(true);
          setLoading(false);
        }
      })
      .catch(() => { setShowLogin(true); setLoading(false); });
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const formData = new FormData(e.currentTarget);
    const usuario = formData.get('usuario') as string;
    const contrasena = formData.get('contrasena') as string;

    try {
      // Try all cargos since admin users can have different roles
      const cargos = ['Profesor', 'Jefe', 'Administrativo'];
      let loginSuccess = false;

      for (const cargo of cargos) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario, contrasena, cargo }),
        });
        const data = await res.json();
        if (data.success) {
          loginSuccess = true;
          break;
        }
      }

      if (loginSuccess) {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (ADMIN_USERS.includes(meData.usuario)) {
          setAuthenticated(true);
          setShowLogin(false);
          setUserName(meData.nombre || meData.usuario);
          fetchAllStats();
        } else {
          setLoginError('No tiene permisos de administración');
        }
      } else {
        setLoginError('Credenciales inválidas');
      }
    } catch {
      setLoginError('Error de conexión');
    }
    setLoginLoading(false);
  };

  const fetchAllStats = async () => {
    try {
      const res = await fetch('/api/admin/stats-all');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleExport = async () => {
    setExporting(true);
    window.location.href = '/api/admin/export-all';
    setTimeout(() => setExporting(false), 3000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthenticated(false);
    setShowLogin(true);
    setStats([]);
    setUserName('');
  };

  if (!authenticated || loading) {
    if (showLogin) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-aguamarina-50 via-white to-verde-50">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <Image src="/logo-ucc.jpeg" alt="UCC" width={120} height={48} className="mx-auto mb-4 h-12 w-auto" />
              <h2 className="text-xl font-bold text-gris-900">Administración General</h2>
              <p className="mt-1 text-sm text-gris-500">Ingrese sus credenciales de administrador</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gris-700">Usuario</label>
                <input name="usuario" type="text" inputMode="numeric" required className="w-full rounded-lg border border-gris-300 px-3 py-2 text-sm focus:border-aguamarina-500 focus:ring-1 focus:ring-aguamarina-500" placeholder="ID numérico" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gris-700">Contraseña</label>
                <div className="relative">
                  <input name="contrasena" type={showPassword ? "text" : "password"} required className="w-full rounded-lg border border-gris-300 px-3 py-2 pr-10 text-sm focus:border-aguamarina-500 focus:ring-1 focus:ring-aguamarina-500" placeholder="Contraseña" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gris-500 hover:text-gris-700" tabIndex={-1}>
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              {loginError && <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">{loginError}</p>}
              <button type="submit" disabled={loginLoading} className="w-full rounded-lg bg-aguamarina-600 py-2.5 text-sm font-semibold text-white hover:bg-aguamarina-700 disabled:opacity-50">
                {loginLoading ? 'Verificando...' : 'Ingresar'}
              </button>
              <Link href="/" className="block text-center text-sm text-gris-500 hover:text-aguamarina-600">Volver al portal</Link>
            </form>
          </div>
        </main>
      );
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-gris-50">
        <div className="animate-pulse text-gris-500">Cargando...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gris-50">
      {/* Header */}
      <header className="border-b border-gris-200 bg-white px-4 py-4 shadow-sm md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image src="/logo-ucc.jpeg" alt="UCC" width={120} height={48} className="h-10 w-auto" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gris-900">Administración General</h1>
              <p className="text-xs text-gris-500">Dashboard consolidado de todos los programas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* User info with online indicator */}
            <div className="hidden items-center gap-2 sm:flex">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
              </div>
              <div>
                <p className="text-xs font-medium text-gris-900">{userName}</p>
                <p className="text-[10px] text-green-600">● En línea</p>
              </div>
            </div>
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gris-300 px-4 py-2 text-sm font-medium text-gris-700 transition-colors hover:bg-red-50 hover:border-red-300 hover:text-red-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Export button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gris-900">Dashboards por Programa</h2>
            <p className="mt-1 text-sm text-gris-500">Seleccione un programa para ver sus estadísticas detalladas</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg bg-verde-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-verde-700 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exporting ? 'Generando...' : 'Exportar Reporte Consolidado'}
          </button>
        </div>

        {/* Program cards grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((prog) => (
            <div key={prog.codigo} className="overflow-hidden rounded-xl border border-gris-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="bg-gradient-to-r from-aguamarina-500 to-verde-600 px-5 py-3">
                <h3 className="text-sm font-bold text-white">{prog.nombre}</h3>
                <p className="text-xs text-white/80">{prog.codigo}</p>
              </div>
              <div className="p-5">
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gris-50 p-3 text-center">
                    <p className="text-2xl font-bold text-gris-900">{prog.total}</p>
                    <p className="text-[10px] font-medium uppercase text-gris-500">Total</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3 text-center">
                    <p className="text-2xl font-bold text-blue-700">{prog.radicadas}</p>
                    <p className="text-[10px] font-medium uppercase text-blue-500">Radicadas</p>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-3 text-center">
                    <p className="text-2xl font-bold text-orange-700">{prog.escaladas}</p>
                    <p className="text-[10px] font-medium uppercase text-orange-500">Escaladas</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3 text-center">
                    <p className="text-2xl font-bold text-green-700">{prog.enProgreso + prog.cerradas}</p>
                    <p className="text-[10px] font-medium uppercase text-green-500">Gestionadas</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stats.length === 0 && !loading && (
          <div className="rounded-xl border border-gris-200 bg-white p-12 text-center">
            <p className="text-gris-500">No hay datos disponibles aún</p>
          </div>
        )}
      </div>
    </main>
  );
}
