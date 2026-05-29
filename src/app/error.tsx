'use client';

/**
 * Error Boundary - Catches unhandled errors in the app routes.
 * Never exposes internal error details to the user.
 * Validates: Requirements 11.3, 11.4
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
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
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-red-800">
            Ha ocurrido un error
          </h2>
          <p className="text-sm text-red-700">
            Ha ocurrido un error interno. Intente nuevamente.
          </p>
        </div>
        <button
          onClick={reset}
          className="rounded-md bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
