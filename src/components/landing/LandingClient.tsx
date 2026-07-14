"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "./HeroSection";
import { GlassmorphismCards } from "./GlassmorphismCards";
import { QRAutoGestionButton } from "./QRButton";
import { LoginModal } from "@/components/auth/LoginModal";

export function LandingClient() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleLoginClick = () => {
    try {
      setModalError(null);
      setIsLoginModalOpen(true);
    } catch {
      setModalError("No se pudo abrir el formulario de inicio de sesión. Intente nuevamente.");
    }
  };

  const handleAdminClick = () => {
    router.push("/admin");
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <>
      <HeroSection onLoginClick={handleLoginClick} onAdminClick={handleAdminClick} />
      <GlassmorphismCards />

      {/* Floating QR Button */}
      <QRAutoGestionButton />

      {/* Error message if modal fails to load (Req 1.7) */}
      {modalError && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
          {modalError}
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseModal} />
    </>
  );
}
