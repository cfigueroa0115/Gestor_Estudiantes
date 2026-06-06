'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

type ModalType = 'portal' | 'estructura' | null;

export function InfoPortalButtons() {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {/* Buttons */}
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={() => setOpenModal('portal')}
          className="group inline-flex items-center gap-2 rounded-full border border-aguamarina-200/60 bg-white/60 px-5 py-2.5 text-sm font-medium text-gris-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-aguamarina-400 hover:bg-white/80 hover:shadow-md hover:-translate-y-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-aguamarina-600 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          &iquest;Qu&eacute; es este portal?
        </button>

        <button
          onClick={() => setOpenModal('estructura')}
          className="group inline-flex items-center gap-2 rounded-full border border-verde-200/60 bg-white/60 px-5 py-2.5 text-sm font-medium text-gris-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-verde-400 hover:bg-white/80 hover:shadow-md hover:-translate-y-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-verde-600 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          &iquest;Cu&aacute;l es su estructura?
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-8"
            >
              {/* Close button */}
              <button
                onClick={() => setOpenModal(null)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-gris-400 transition-colors hover:bg-gris-100 hover:text-gris-700"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {openModal === 'portal' ? <PortalContent /> : <EstructuraContent />}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function PortalContent() {
  return (
    <div>
      {/* Icon */}
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-aguamarina-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-aguamarina-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h2 className="mb-4 text-center text-xl font-bold text-gris-900">&iquest;Qu&eacute; es este portal?</h2>

      <div className="space-y-4 text-sm leading-relaxed text-gris-700">
        <p>
          El <strong>Portal de Gesti&oacute;n de Estudiantes</strong> del Programa de Ingenier&iacute;a Industrial es una plataforma acad&eacute;mica y administrativa dise&ntilde;ada para centralizar, organizar y facilitar el registro, seguimiento y consulta de solicitudes estudiantiles.
        </p>
        <p>
          Este portal permite que los <strong>estudiantes</strong> cuenten con un canal m&aacute;s claro y ordenado para gestionar sus necesidades acad&eacute;micas, financieras o administrativas; que los <strong>profesores</strong> tengan una herramienta de apoyo para registrar y acompa&ntilde;ar los casos de sus estudiantes; y que los <strong>responsables administrativos</strong> puedan consultar, analizar y exportar informaci&oacute;n de manera m&aacute;s eficiente y segura.
        </p>
        <p>
          La soluci&oacute;n integra autenticaci&oacute;n de usuarios, administraci&oacute;n de accesos, formularios digitales, almacenamiento estructurado de informaci&oacute;n, consulta de datos y generaci&oacute;n de reportes, contribuyendo a una gesti&oacute;n m&aacute;s &aacute;gil, trazable y organizada dentro del programa.
        </p>
        <p>
          Un aspecto relevante del proyecto es que fue desarrollado a partir de <strong>conocimientos b&aacute;sicos en desarrollo de software</strong>, apoy&aacute;ndose en herramientas modernas e <strong>inteligencia artificial</strong> para acelerar la construcci&oacute;n, mejorar la calidad t&eacute;cnica y lograr una soluci&oacute;n funcional, escalable y alineada con las necesidades reales del entorno acad&eacute;mico.
        </p>
      </div>
    </div>
  );
}

function EstructuraContent() {
  return (
    <div>
      {/* Icon */}
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-verde-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-verde-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>

      <h2 className="mb-4 text-center text-xl font-bold text-gris-900">&iquest;Cu&aacute;l es su estructura?</h2>

      <div className="space-y-4 text-sm leading-relaxed text-gris-700">
        <p>
          La estructura del portal fue dise&ntilde;ada como una <strong>aplicaci&oacute;n web moderna</strong>, organizada por capas funcionales que permiten separar la presentaci&oacute;n visual, la autenticaci&oacute;n, la administraci&oacute;n de usuarios, la gesti&oacute;n de solicitudes, las APIs y la conexi&oacute;n con la base de datos.
        </p>
        <p>
          En su arquitectura se integran componentes de <strong>frontend</strong> para la experiencia visual del usuario, servicios <strong>backend</strong> para procesar la informaci&oacute;n, <strong>APIs</strong> para comunicar el portal con la base de datos, validaciones de seguridad, control de sesiones, administraci&oacute;n de usuarios y conexi&oacute;n con <strong>Neon PostgreSQL</strong> para almacenar la informaci&oacute;n de manera estructurada.
        </p>
        <p>
          El desarrollo se apoy&oacute; en herramientas de <strong>inteligencia artificial</strong> y asistentes de programaci&oacute;n como <strong>Kiro</strong>, <strong>Claude</strong> y <strong>ChatGPT</strong>, junto con tecnolog&iacute;as modernas de desarrollo web, control de versiones, despliegue y base de datos. Esta combinaci&oacute;n permiti&oacute; construir una soluci&oacute;n funcional y profesional, incluso partiendo de conocimientos b&aacute;sicos en desarrollo de software.
        </p>
        <p>
          El portal tambi&eacute;n se encuentra preparado para operar en un entorno productivo mediante integraci&oacute;n con <strong>GitHub</strong>, despliegue en <strong>Vercel</strong>, conexi&oacute;n con <strong>Neon</strong> y uso de APIs que permiten gestionar informaci&oacute;n de forma segura y organizada.
        </p>

        {/* Structure list */}
        <div className="mt-4 rounded-xl bg-gris-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase text-gris-500">Estructura general</p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              'P&aacute;gina principal institucional',
              'Login y autenticaci&oacute;n',
              'Administraci&oacute;n de usuarios',
              'Gesti&oacute;n de solicitudes',
              'APIs de comunicaci&oacute;n',
              'Base de datos Neon PostgreSQL',
              'Exportaci&oacute;n de informaci&oacute;n',
              'Despliegue en producci&oacute;n',
              'Dise&ntilde;o responsive',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gris-600">
                <span className="h-1.5 w-1.5 rounded-full bg-aguamarina-500" />
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
