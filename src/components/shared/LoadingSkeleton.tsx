'use client';

import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export function LoadingSkeleton({ rows = 3, className }: LoadingSkeletonProps) {
  return (
    <div role="status" aria-label="Cargando contenido" className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-4 animate-pulse rounded bg-gris-200"
          style={{ width: `${100 - index * 10}%` }}
        />
      ))}
      <span className="sr-only">Cargando contenido...</span>
    </div>
  );
}
