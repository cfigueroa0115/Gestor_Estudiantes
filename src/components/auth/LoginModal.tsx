"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import { Button } from "@/components/ui/button";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usuario: "",
      contrasena: "",
      cargo: undefined,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success === true) {
        reset();
        router.push("/dashboard");
      } else {
        setErrorMessage(result.error || "Error de autenticación");
        setIsLoading(false);
      }
    } catch {
      setErrorMessage("Error de conexión. Intente nuevamente.");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setErrorMessage(null);
      setShowPassword(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Iniciar sesión"
    >
      <div
        className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-gris-900">
            Iniciar Sesión
          </h2>
          <p className="mt-1 text-sm text-gris-500">
            Ingrese sus credenciales para acceder al portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Usuario */}
          <div>
            <label
              htmlFor="usuario"
              className="mb-1 block text-sm font-medium text-gris-700"
            >
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              placeholder="Ingrese su usuario numérico"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-aguamarina-500 focus:ring-1 focus:ring-aguamarina-500 ${
                errors.usuario
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gris-300"
              }`}
              {...register("usuario")}
              disabled={isLoading}
            />
            {errors.usuario && (
              <p className="mt-1 text-xs text-red-600">
                {errors.usuario.message}
              </p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div>
            <label
              htmlFor="contrasena"
              className="mb-1 block text-sm font-medium text-gris-700"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="contrasena"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Ingrese su contraseña"
                className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none transition-colors focus:border-aguamarina-500 focus:ring-1 focus:ring-aguamarina-500 ${
                  errors.contrasena
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gris-300"
                }`}
                {...register("contrasena")}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gris-500 hover:text-gris-700"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.contrasena && (
              <p className="mt-1 text-xs text-red-600">
                {errors.contrasena.message}
              </p>
            )}
          </div>

          {/* Campo Cargo */}
          <div>
            <label
              htmlFor="cargo"
              className="mb-1 block text-sm font-medium text-gris-700"
            >
              Cargo
            </label>
            <select
              id="cargo"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-aguamarina-500 focus:ring-1 focus:ring-aguamarina-500 ${
                errors.cargo
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gris-300"
              }`}
              {...register("cargo")}
              disabled={isLoading}
              defaultValue=""
            >
              <option value="" disabled>
                Seleccione su cargo
              </option>
              <option value="Docente">Docente</option>
              <option value="Jefe">Jefe</option>
              <option value="Administrativo">Administrativo</option>
            </select>
            {errors.cargo && (
              <p className="mt-1 text-xs text-red-600">
                {errors.cargo.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-aguamarina-600 text-white hover:bg-aguamarina-700 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner />
                Ingresando...
              </span>
            ) : (
              "Ingresar"
            )}
          </Button>
        </form>

        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="mt-4 w-full rounded-lg bg-gris-100 px-4 py-2 text-sm font-medium text-gris-700 transition-colors hover:bg-gris-200 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// Inline SVG icons to avoid external dependencies
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
