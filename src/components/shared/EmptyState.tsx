'use client';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ message, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-gris-200 bg-gris-50 p-8 text-center',
        className
      )}
    >
      {icon || (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-gris-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      )}
      <p className="text-sm text-gris-600">{message}</p>
    </div>
  );
}
