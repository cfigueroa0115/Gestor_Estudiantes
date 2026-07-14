"use client";

import { motion, useReducedMotion, type Transition } from "framer-motion";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onLoginClick: () => void;
  onAdminClick?: () => void;
}

export function HeroSection({ onLoginClick, onAdminClick }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const animationProps = (delay: number) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: "easeOut" } as Transition,
        };

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center md:px-8 lg:px-16">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-aguamarina-500/10 via-transparent to-verde-600/10" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <motion.div {...animationProps(0)}>
          <span className="mb-4 inline-block rounded-full bg-aguamarina-500/10 px-4 py-1.5 text-sm font-medium text-aguamarina-700">
            Universidad Cooperativa de Colombia
          </span>
        </motion.div>

        <motion.h1
          {...animationProps(0.1)}
          className="mt-4 text-3xl font-bold tracking-tight text-gris-900 sm:text-4xl md:text-5xl lg:text-6xl"
        >
          Portal de Gestión de{" "}
          <span className="bg-gradient-to-r from-aguamarina-500 to-verde-600 bg-clip-text text-transparent">
            Estudiantes
          </span>
        </motion.h1>

        <motion.p
          {...animationProps(0.2)}
          className="mx-auto mt-4 max-w-2xl text-base text-gris-600 sm:text-lg md:mt-6 md:text-xl"
        >
          Facultad de Ingeniería
        </motion.p>

        <motion.p
          {...animationProps(0.3)}
          className="mx-auto mt-2 max-w-xl text-sm text-gris-500 md:text-base"
        >
          Gestiona solicitudes estudiantiles, administra usuarios y exporta
          datos de forma eficiente y segura.
        </motion.p>

        <motion.div {...animationProps(0.4)} className="mt-8 flex flex-wrap items-center justify-center gap-4 md:mt-10">
          <Button
            onClick={onLoginClick}
            size="lg"
            className="w-48 rounded-full bg-gradient-to-r from-aguamarina-500 to-verde-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-aguamarina-600 hover:to-verde-700 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-aguamarina-500 focus-visible:ring-offset-2 md:w-56 md:px-10 md:py-4 md:text-lg"
          >
            Ingresa aquí
          </Button>
          {onAdminClick && (
            <Button
              onClick={onAdminClick}
              size="lg"
              className="w-48 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-blue-400 hover:to-indigo-400 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:w-56 md:px-10 md:py-4 md:text-lg"
            >
              Administración
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
