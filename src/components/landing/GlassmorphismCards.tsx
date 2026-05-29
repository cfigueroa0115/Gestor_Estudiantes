"use client";

import { motion, useReducedMotion, type Transition } from "framer-motion";

interface CardData {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const cards: CardData[] = [
  {
    title: "Gestión de Solicitudes",
    description:
      "Registra y da seguimiento a solicitudes académicas, financieras y de certificados.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
        />
      </svg>
    ),
  },
  {
    title: "Administración de Usuarios",
    description:
      "Gestiona docentes, jefes y administrativos con control de acceso seguro.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      </svg>
    ),
  },
  {
    title: "Exportación de Datos",
    description:
      "Exporta solicitudes a CSV compatible con Excel para análisis externo.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
    ),
  },
];

export function GlassmorphismCards() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="px-4 py-12 md:px-8 md:py-16 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              {...(shouldReduceMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 30 },
                    animate: { opacity: 1, y: 0 },
                    transition: {
                      duration: 0.5,
                      delay: 0.5 + index * 0.15,
                      ease: "easeOut",
                    } as Transition,
                  })}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { scale: 1.03, y: -4 }
              }
              className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-6 shadow-lg backdrop-blur-md transition-shadow duration-300 hover:shadow-xl md:p-8"
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-aguamarina-500/20 via-transparent to-verde-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Gradient top accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-aguamarina-500 to-verde-600" />

              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-aguamarina-500/10 to-verde-600/10 p-3 text-aguamarina-600">
                  {card.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gris-900 md:text-xl">
                  {card.title}
                </h3>
                <p className="text-sm text-gris-600 md:text-base">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
