'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export function QRAutoGestionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Floating QR Button */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-aguamarina-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-aguamarina-400"
          aria-label="Ver QR de Autogestión"
        >
          {/* Animated pulsing rings */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-aguamarina-400 to-verde-500 animate-ping opacity-20" />
          <span className="absolute inset-[-3px] rounded-full bg-gradient-to-br from-aguamarina-300 via-verde-400 to-aguamarina-500 opacity-60 animate-pulse" />
          
          {/* Glowing border */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-aguamarina-400 via-verde-500 to-aguamarina-600 shadow-lg shadow-aguamarina-500/50" />
          
          {/* Shimmer overlay */}
          <span className="absolute inset-0 rounded-full overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </span>

          {/* QR Icon */}
          <span className="relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
              <rect x="2" y="2" width="6" height="6" rx="1"/>
              <rect x="16" y="2" width="6" height="6" rx="1"/>
              <rect x="2" y="16" width="6" height="6" rx="1"/>
              <path d="M10 2h1v4h-1z"/>
              <path d="M2 10h4v1H2z"/>
              <path d="M10 10h1v1h-1z"/>
              <path d="M16 14h6v2h-6z"/>
              <path d="M16 18h6v2h-6z"/>
              <path d="M14 16h1v6h-1z"/>
              <path d="M10 16h2v2h-2z"/>
              <path d="M10 20h2v2h-2z"/>
            </svg>
          </span>
        </button>

        {/* Label */}
        <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-aguamarina-700 shadow-md backdrop-blur-sm border border-aguamarina-200/50">
          QR Autogestión
        </span>
      </div>

      {/* QR Popup Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              onClick={() => setIsOpen(false)}
              role="dialog"
              aria-modal="true"
            >
              {/* Overlay */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />

              {/* Modal */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-gris-100"
              >
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-4 z-20 rounded-full bg-gris-100/80 p-2 text-gris-500 transition-all hover:bg-gris-200 hover:text-gris-700 hover:scale-110"
                  aria-label="Cerrar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Content */}
                <div className="p-6 text-center">
                  {/* Icon */}
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-aguamarina-400 to-verde-500 shadow-lg shadow-aguamarina-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="6" height="6" rx="1"/>
                      <rect x="16" y="2" width="6" height="6" rx="1"/>
                      <rect x="2" y="16" width="6" height="6" rx="1"/>
                      <path d="M10 2h1v4h-1z"/>
                      <path d="M2 10h4v1H2z"/>
                      <path d="M10 10h1v1h-1z"/>
                      <path d="M16 14h6v2h-6z"/>
                      <path d="M16 18h6v2h-6z"/>
                      <path d="M14 16h1v6h-1z"/>
                      <path d="M10 16h2v2h-2z"/>
                      <path d="M10 20h2v2h-2z"/>
                    </svg>
                  </div>

                  <h3 className="mb-1 text-lg font-bold text-gris-900">Portal de Autogestión</h3>
                  <p className="mb-5 text-sm text-gris-500">Escanea el código QR para acceder al portal de autogestión estudiantil</p>

                  {/* QR Image */}
                  <div className="mx-auto rounded-2xl overflow-hidden border-2 border-aguamarina-100 shadow-md">
                    <img
                      src="/qr-autogestion.jpeg"
                      alt="Código QR - Portal de Autogestión de Estudiantes UCC"
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  {/* URL hint */}
                  <p className="mt-4 text-xs text-gris-400">
                    gestor-estudiantes-ucc.vercel.app/autogestion
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
