'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

type ModalType = 'portal' | 'estructura' | 'arquitectura' | null;

export function HeaderInfoButtons() {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {/* Buttons in the top-right header area */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {/* Button: ¿Qué es este portal? */}
        <button
          onClick={() => setOpenModal('portal')}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-aguamarina-500/30 md:px-5 md:py-2.5 md:text-sm"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-aguamarina-500 via-verde-500 to-aguamarina-600 transition-all duration-500 group-hover:from-verde-600 group-hover:via-aguamarina-500 group-hover:to-verde-500" />
          <span className="absolute inset-0 rounded-full border-2 border-white/30 group-hover:border-white/60 transition-all duration-300" />
          <span className="absolute inset-[-2px] rounded-full bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 animate-shimmer" />
          <span className="relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
              <path d="M8 12h.01"/>
              <path d="M16 12h.01"/>
              <path d="M9 9h.01"/>
              <path d="M15 9h.01"/>
              <path d="M9 15h.01"/>
              <path d="M15 15h.01"/>
            </svg>
          </span>
          <span className="relative z-10 hidden sm:inline">¿Qué es este portal?</span>
          <span className="relative z-10 sm:hidden">Portal</span>
        </button>

        {/* Button: ¿Cuál es su estructura? */}
        <button
          onClick={() => setOpenModal('estructura')}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-verde-500/30 md:px-5 md:py-2.5 md:text-sm"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-verde-500 via-emerald-500 to-verde-600 transition-all duration-500 group-hover:from-emerald-600 group-hover:via-verde-500 group-hover:to-emerald-500" />
          <span className="absolute inset-0 rounded-full border-2 border-white/30 group-hover:border-white/60 transition-all duration-300" />
          <span className="absolute inset-[-2px] rounded-full bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 animate-shimmer" />
          <span className="relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </span>
          <span className="relative z-10 hidden sm:inline">¿Cuál es su estructura?</span>
          <span className="relative z-10 sm:hidden">Estructura</span>
        </button>

        {/* Button: Arquitectura del portal */}
        <button
          onClick={() => setOpenModal('arquitectura')}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 md:px-5 md:py-2.5 md:text-sm"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 group-hover:from-purple-600 group-hover:via-blue-500 group-hover:to-indigo-500" />
          <span className="absolute inset-0 rounded-full border-2 border-white/30 group-hover:border-white/60 transition-all duration-300" />
          <span className="absolute inset-[-2px] rounded-full bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 animate-shimmer" />
          <span className="relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="6" height="6" rx="1"/>
              <rect x="16" y="2" width="6" height="6" rx="1"/>
              <rect x="9" y="16" width="6" height="6" rx="1"/>
              <path d="M5 8v3a1 1 0 001 1h12a1 1 0 001-1V8"/>
              <path d="M12 12v4"/>
            </svg>
          </span>
          <span className="relative z-10 hidden sm:inline">Arquitectura del portal</span>
          <span className="relative z-10 sm:hidden">Arquitectura</span>
        </button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {openModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setOpenModal(null)}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpenModal(null); }}
            role="dialog"
            aria-modal="true"
          >
            {/* Overlay */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl shadow-2xl"
            >
              {/* AI-themed translucent background */}
              <div className="absolute inset-0 rounded-3xl bg-white/90 backdrop-blur-xl" />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-aguamarina-50/80 via-white/60 to-verde-50/80" />
              {/* AI circuit pattern overlay */}
              <div className="absolute inset-0 rounded-3xl opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
              {/* Floating AI particles */}
              <div className="absolute top-4 left-8 h-2 w-2 rounded-full bg-aguamarina-400/30 animate-pulse" />
              <div className="absolute top-12 right-12 h-1.5 w-1.5 rounded-full bg-verde-400/40 animate-pulse" />
              <div className="absolute bottom-16 left-12 h-1 w-1 rounded-full bg-blue-400/30 animate-pulse" />
              <div className="absolute bottom-8 right-20 h-2.5 w-2.5 rounded-full bg-aguamarina-300/20 animate-pulse" />

              {/* Content */}
              <div className="relative z-10 p-6 md:p-8">
                {/* Close button */}
                <button
                  onClick={() => setOpenModal(null)}
                  className="absolute right-4 top-4 rounded-full bg-gris-100/80 p-2 text-gris-500 transition-all hover:bg-gris-200 hover:text-gris-700 hover:scale-110"
                  aria-label="Cerrar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {openModal === 'portal' && <PortalContent />}
                {openModal === 'estructura' && <EstructuraContent />}
                {openModal === 'arquitectura' && <ArquitecturaContent />}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Backwards compatibility export
export function InfoPortalButtons() {
  return <HeaderInfoButtons />;
}

function PortalContent() {
  return (
    <div>
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-aguamarina-400 to-verde-500 shadow-lg shadow-aguamarina-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
          <path d="M8 12h.01"/>
          <path d="M16 12h.01"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
          <path d="M9 15h.01"/>
          <path d="M15 15h.01"/>
        </svg>
      </div>

      <h2 className="mb-5 text-center text-xl font-bold text-gris-900">¿Qué es este portal?</h2>

      <div className="space-y-4 text-sm leading-relaxed text-gris-700 text-justify">
        <p>
          El <strong>Portal de Gestión de Estudiantes</strong> del Programa de Ingeniería Industrial es una plataforma académica y administrativa diseñada para centralizar, organizar y facilitar el registro, seguimiento y consulta de solicitudes estudiantiles.
        </p>
        <p>
          Este portal permite que los <strong>estudiantes</strong> cuenten con un canal más claro y ordenado para gestionar sus necesidades académicas, financieras o administrativas; que los <strong>profesores</strong> tengan una herramienta de apoyo para registrar y acompañar los casos de sus estudiantes; y que los <strong>responsables administrativos</strong> puedan consultar, analizar y exportar información de manera más eficiente y segura.
        </p>
        <p>
          La solución integra autenticación de usuarios, administración de accesos, formularios digitales, almacenamiento estructurado de información, consulta de datos y generación de reportes, contribuyendo a una gestión más ágil, trazable y organizada dentro del programa.
        </p>
        <p>
          Un aspecto relevante del proyecto es que fue desarrollado a partir de <strong>conocimientos básicos en desarrollo de software</strong>, apoyándose en herramientas modernas e <strong>inteligencia artificial</strong> para acelerar la construcción, mejorar la calidad técnica y lograr una solución funcional, escalable y alineada con las necesidades reales del entorno académico.
        </p>
      </div>
    </div>
  );
}

function EstructuraContent() {
  return (
    <div>
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-verde-400 to-emerald-500 shadow-lg shadow-verde-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 17l10 5 10-5"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 12l10 5 10-5"/>
        </svg>
      </div>

      <h2 className="mb-5 text-center text-xl font-bold text-gris-900">¿Cuál es su estructura?</h2>

      <div className="space-y-4 text-sm leading-relaxed text-gris-700 text-justify">
        <p>
          La estructura del portal fue diseñada como una <strong>aplicación web moderna</strong>, organizada por capas funcionales que permiten separar la presentación visual, la autenticación, la administración de usuarios, la gestión de solicitudes, las APIs y la conexión con la base de datos.
        </p>
        <p>
          En su arquitectura se integran componentes de <strong>frontend</strong> para la experiencia visual del usuario, servicios <strong>backend</strong> para procesar la información, <strong>APIs</strong> para comunicar el portal con la base de datos, validaciones de seguridad, control de sesiones, administración de usuarios y conexión con <strong>Neon PostgreSQL</strong> para almacenar la información de manera estructurada.
        </p>
        <p>
          El desarrollo se apoyó en herramientas de <strong>inteligencia artificial</strong> y asistentes de programación como <strong>Kiro</strong>, <strong>Claude</strong> y <strong>ChatGPT</strong>, junto con tecnologías modernas de desarrollo web, control de versiones, despliegue y base de datos. Esta combinación permitió construir una solución funcional y profesional, incluso partiendo de conocimientos básicos en desarrollo de software.
        </p>
        <p>
          El portal también se encuentra preparado para operar en un entorno productivo mediante integración con <strong>GitHub</strong>, despliegue en <strong>Vercel</strong>, conexión con <strong>Neon</strong> y uso de APIs que permiten gestionar información de forma segura y organizada.
        </p>

        <div className="mt-5 rounded-2xl bg-gradient-to-br from-gris-50 to-aguamarina-50/50 p-5 border border-aguamarina-100/50">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gris-500">Estructura general</p>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {[
              'Página principal institucional',
              'Login y autenticación',
              'Administración de usuarios',
              'Gestión de solicitudes',
              'APIs de comunicación',
              'Base de datos Neon PostgreSQL',
              'Exportación de información',
              'Despliegue en producción',
              'Diseño responsive',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gris-600">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-aguamarina-500/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-aguamarina-500" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ArquitecturaContent() {
  return (
    <div>
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="6" height="6" rx="1"/>
          <rect x="16" y="2" width="6" height="6" rx="1"/>
          <rect x="9" y="16" width="6" height="6" rx="1"/>
          <path d="M5 8v3a1 1 0 001 1h12a1 1 0 001-1V8"/>
          <path d="M12 12v4"/>
        </svg>
      </div>

      <h2 className="mb-5 text-center text-xl font-bold text-gris-900">Arquitectura del Portal</h2>

      <div className="mb-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 border border-blue-100/50 overflow-hidden">
        <svg viewBox="0 0 700 480" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradHeader" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#059669" stopOpacity="0.9"/>
            </linearGradient>
            <linearGradient id="gradFrontend" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.08"/>
            </linearGradient>
            <linearGradient id="gradBackend" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.08"/>
            </linearGradient>
            <linearGradient id="gradDB" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.08"/>
            </linearGradient>
            <linearGradient id="gradDeploy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#db2777" stopOpacity="0.08"/>
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/>
            </filter>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b"/>
            </marker>
          </defs>

          <rect x="150" y="10" width="400" height="36" rx="18" fill="url(#gradHeader)"/>
          <text x="350" y="33" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">ARQUITECTURA - Portal Gestión Estudiantes UCC</text>

          <rect x="20" y="60" width="660" height="100" rx="12" fill="url(#gradFrontend)" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" filter="url(#shadow)"/>
          <text x="40" y="82" fill="#0891b2" fontSize="11" fontWeight="bold">FRONTEND (Next.js 14 + React 18 + Tailwind CSS)</text>
          
          <rect x="40" y="92" width="120" height="52" rx="8" fill="white" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.5"/>
          <text x="100" y="114" textAnchor="middle" fill="#155e75" fontSize="9" fontWeight="bold">Landing Page</text>
          <text x="100" y="130" textAnchor="middle" fill="#64748b" fontSize="8">Institucional + Login</text>
          
          <rect x="175" y="92" width="120" height="52" rx="8" fill="white" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.5"/>
          <text x="235" y="114" textAnchor="middle" fill="#155e75" fontSize="9" fontWeight="bold">Dashboard</text>
          <text x="235" y="130" textAnchor="middle" fill="#64748b" fontSize="8">Solicitudes + Analytics</text>
          
          <rect x="310" y="92" width="120" height="52" rx="8" fill="white" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.5"/>
          <text x="370" y="114" textAnchor="middle" fill="#155e75" fontSize="9" fontWeight="bold">Autogestión</text>
          <text x="370" y="130" textAnchor="middle" fill="#64748b" fontSize="8">Acceso público QR</text>
          
          <rect x="445" y="92" width="120" height="52" rx="8" fill="white" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.5"/>
          <text x="505" y="114" textAnchor="middle" fill="#155e75" fontSize="9" fontWeight="bold">Admin Usuarios</text>
          <text x="505" y="130" textAnchor="middle" fill="#64748b" fontSize="8">CRUD + Estados</text>

          <rect x="580" y="92" width="85" height="52" rx="8" fill="white" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.5"/>
          <text x="622" y="114" textAnchor="middle" fill="#155e75" fontSize="9" fontWeight="bold">Exportar</text>
          <text x="622" y="130" textAnchor="middle" fill="#64748b" fontSize="8">CSV / Excel</text>

          <path d="M350 160 L350 175" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>

          <rect x="120" y="178" width="460" height="38" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.5" filter="url(#shadow)"/>
          <text x="350" y="201" textAnchor="middle" fill="#92400e" fontSize="10" fontWeight="bold">Middleware: JWT Auth + Bot Blocking + DELETE Blocking + Headers</text>

          <path d="M350 216 L350 232" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>

          <rect x="20" y="235" width="660" height="100" rx="12" fill="url(#gradBackend)" stroke="#8b5cf6" strokeWidth="1.5" strokeOpacity="0.4" filter="url(#shadow)"/>
          <text x="40" y="257" fill="#6d28d9" fontSize="11" fontWeight="bold">BACKEND (API Routes - Next.js Server)</text>
          
          <rect x="40" y="267" width="105" height="52" rx="8" fill="white" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.5"/>
          <text x="92" y="289" textAnchor="middle" fill="#4c1d95" fontSize="9" fontWeight="bold">/api/auth</text>
          <text x="92" y="305" textAnchor="middle" fill="#64748b" fontSize="8">Login/Logout/Me</text>

          <rect x="158" y="267" width="105" height="52" rx="8" fill="white" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.5"/>
          <text x="210" y="289" textAnchor="middle" fill="#4c1d95" fontSize="9" fontWeight="bold">/api/users</text>
          <text x="210" y="305" textAnchor="middle" fill="#64748b" fontSize="8">CRUD Usuarios</text>

          <rect x="276" y="267" width="135" height="52" rx="8" fill="white" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.5"/>
          <text x="343" y="289" textAnchor="middle" fill="#4c1d95" fontSize="9" fontWeight="bold">/api/student-requests</text>
          <text x="343" y="305" textAnchor="middle" fill="#64748b" fontSize="8">Solicitudes + Stats</text>

          <rect x="424" y="267" width="120" height="52" rx="8" fill="white" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.5"/>
          <text x="484" y="289" textAnchor="middle" fill="#4c1d95" fontSize="9" fontWeight="bold">/api/estudiantes</text>
          <text x="484" y="305" textAnchor="middle" fill="#64748b" fontSize="8">Auto-lookup</text>

          <rect x="557" y="267" width="108" height="52" rx="8" fill="white" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.5"/>
          <text x="611" y="289" textAnchor="middle" fill="#4c1d95" fontSize="9" fontWeight="bold">/api/autogestion</text>
          <text x="611" y="305" textAnchor="middle" fill="#64748b" fontSize="8">Registro público</text>

          <path d="M350 335 L350 352" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>

          <rect x="120" y="355" width="460" height="60" rx="12" fill="url(#gradDB)" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.4" filter="url(#shadow)"/>
          <text x="350" y="377" textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="bold">BASE DE DATOS (Prisma 7 + Neon PostgreSQL)</text>
          
          <rect x="140" y="385" width="100" height="22" rx="6" fill="white" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.5"/>
          <text x="190" y="400" textAnchor="middle" fill="#78350f" fontSize="8" fontWeight="bold">Users (11)</text>
          
          <rect x="255" y="385" width="130" height="22" rx="6" fill="white" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.5"/>
          <text x="320" y="400" textAnchor="middle" fill="#78350f" fontSize="8" fontWeight="bold">StudentRequests</text>
          
          <rect x="400" y="385" width="130" height="22" rx="6" fill="white" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.5"/>
          <text x="465" y="400" textAnchor="middle" fill="#78350f" fontSize="8" fontWeight="bold">Estudiantes (171)</text>

          <rect x="120" y="430" width="460" height="40" rx="12" fill="url(#gradDeploy)" stroke="#ec4899" strokeWidth="1.5" strokeOpacity="0.4" filter="url(#shadow)"/>
          <text x="350" y="455" textAnchor="middle" fill="#9d174d" fontSize="11" fontWeight="bold">DESPLIEGUE: GitHub - Vercel (Auto-deploy) + Resend + Neon Cloud</text>
        </svg>
      </div>

      <div className="space-y-3 text-sm leading-relaxed text-gris-700 text-justify">
        <p>
          La arquitectura del portal sigue un patrón de <strong>aplicación fullstack moderna</strong> basado en capas: presentación, lógica de negocio, acceso a datos y despliegue continuo.
        </p>
        <p>
          El <strong>frontend</strong> utiliza Next.js 14 con React 18 y Tailwind CSS para una experiencia visual fluida y responsive. El <strong>backend</strong> aprovecha las API Routes de Next.js para manejar autenticación JWT, operaciones CRUD y lógica de negocio. La <strong>base de datos</strong> Neon PostgreSQL se conecta mediante Prisma 7 con pooling serverless para máxima eficiencia.
        </p>
        <p>
          Todo el sistema se despliega automáticamente desde <strong>GitHub</strong> hacia <strong>Vercel</strong>, con integración de <strong>Resend</strong> para correos de escalamiento y alertas de vencimiento.
        </p>
      </div>
    </div>
  );
}
