'use client';

/**
 * Global Error Boundary - Catches errors in the root layout.
 * Replaces the entire HTML since the layout itself may have failed.
 * Never exposes internal error details to the user.
 * Validates: Requirements 11.3, 11.4
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-sans antialiased">
        <div
          role="alert"
          className="flex max-w-md flex-col items-center gap-6 rounded-lg border border-red-200 bg-red-50 p-8 text-center shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#991b1b' }}>
              Ha ocurrido un error
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#b91c1c' }}>
              Ha ocurrido un error interno. Intente nuevamente.
            </p>
          </div>
          <button
            onClick={reset}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.625rem 1.5rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
