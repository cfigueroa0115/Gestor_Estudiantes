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
      {/* Floating QR Button - bottom right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1.5 sm:bottom-8 sm:right-8 sm:gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none sm:h-16 sm:w-16"
          aria-label="Ver QR de Autogestión"
        >
          {/* Animated outer glow ring */}
          <span className="absolute inset-[-6px] rounded-full bg-gradient-to-br from-aguamarina-400/40 to-verde-500/40 animate-pulse" />
          
          {/* Main circle background */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-aguamarina-400 to-verde-600 shadow-lg shadow-aguamarina-500/40" />
          
          {/* Inner highlight */}
          <span className="absolute inset-[2px] rounded-full bg-gradient-to-br from-white/20 to-transparent" />

          {/* QR Icon - Clean, authentic QR code look */}
          <span className="relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="white" className="drop-shadow-sm sm:w-[30px] sm:h-[30px]">
              {/* Top-left QR square */}
              <rect x="2" y="2" width="8" height="8" rx="1" fill="none" stroke="white" strokeWidth="2"/>
              <rect x="4.5" y="4.5" width="3" height="3" rx="0.5"/>
              {/* Top-right QR square */}
              <rect x="14" y="2" width="8" height="8" rx="1" fill="none" stroke="white" strokeWidth="2"/>
              <rect x="16.5" y="4.5" width="3" height="3" rx="0.5"/>
              {/* Bottom-left QR square */}
              <rect x="2" y="14" width="8" height="8" rx="1" fill="none" stroke="white" strokeWidth="2"/>
              <rect x="4.5" y="16.5" width="3" height="3" rx="0.5"/>
              {/* Data pattern dots */}
              <rect x="13" y="13" width="2" height="2" rx="0.3"/>
              <rect x="16" y="13" width="2" height="2" rx="0.3"/>
              <rect x="19" y="13" width="2" height="2" rx="0.3"/>
              <rect x="13" y="16" width="2" height="2" rx="0.3"/>
              <rect x="16" y="16" width="2" height="2" rx="0.3"/>
              <rect x="13" y="19" width="2" height="2" rx="0.3"/>
              <rect x="19" y="19" width="2" height="2" rx="0.3"/>
            </svg>
          </span>
        </button>

        {/* Label */}
        <span className="rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-aguamarina-700 shadow-sm border border-aguamarina-100 sm:px-3 sm:text-[10px]">
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
                className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-gris-100 sm:max-w-md"
              >
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-3 top-3 z-20 rounded-full bg-gris-100/80 p-2 text-gris-500 transition-all hover:bg-gris-200 hover:text-gris-700 hover:scale-110"
                  aria-label="Cerrar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Content */}
                <div className="p-5 text-center sm:p-6">
                  {/* Icon */}
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-aguamarina-400 to-verde-500 shadow-lg shadow-aguamarina-500/30 sm:h-14 sm:w-14">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <rect x="2" y="2" width="8" height="8" rx="1" fill="none" stroke="white" strokeWidth="2"/>
                      <rect x="4.5" y="4.5" width="3" height="3" rx="0.5"/>
                      <rect x="14" y="2" width="8" height="8" rx="1" fill="none" stroke="white" strokeWidth="2"/>
                      <rect x="16.5" y="4.5" width="3" height="3" rx="0.5"/>
                      <rect x="2" y="14" width="8" height="8" rx="1" fill="none" stroke="white" strokeWidth="2"/>
                      <rect x="4.5" y="16.5" width="3" height="3" rx="0.5"/>
                      <rect x="13" y="13" width="2" height="2" rx="0.3"/>
                      <rect x="16" y="13" width="2" height="2" rx="0.3"/>
                      <rect x="19" y="13" width="2" height="2" rx="0.3"/>
                      <rect x="13" y="16" width="2" height="2" rx="0.3"/>
                      <rect x="16" y="16" width="2" height="2" rx="0.3"/>
                      <rect x="13" y="19" width="2" height="2" rx="0.3"/>
                      <rect x="19" y="19" width="2" height="2" rx="0.3"/>
                    </svg>
                  </div>

                  <h3 className="mb-1 text-base font-bold text-gris-900 sm:text-lg">Portal de Autogestión</h3>
                  <p className="mb-4 text-xs text-gris-500 sm:text-sm">Escanea el código QR para acceder al portal de autogestión estudiantil</p>

                  {/* QR Image */}
                  <div className="mx-auto max-w-[280px] rounded-2xl overflow-hidden border-2 border-aguamarina-100 shadow-md sm:max-w-[320px]">
                    <img
                      src="/qr-autogestion.jpeg"
                      alt="Código QR - Portal de Autogestión de Estudiantes UCC"
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  {/* URL hint */}
                  <p className="mt-3 text-[10px] text-gris-400 sm:text-xs">
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
