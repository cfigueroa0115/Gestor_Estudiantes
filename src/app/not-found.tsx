import Link from 'next/link';

/**
 * Custom 404 Page - Shown when a route is not found.
 * Validates: Requirements 11.3 (HTTP 404)
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="flex max-w-md flex-col items-center gap-6 rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <span className="text-4xl font-bold text-gray-400">404</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Página no encontrada
          </h2>
          <p className="text-sm text-gray-600">
            La página que buscas no existe o ha sido movida.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-md bg-teal-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
