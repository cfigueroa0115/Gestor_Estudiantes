'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ToastProvider } from '@/components/shared/Toast';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Cargo } from '@/types';

interface UserData {
  usuario: string;
  cargo: Cargo;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.replace('/');
          return;
        }
        const data = await res.json();
        setUser({ usuario: data.usuario, cargo: data.cargo });
      } catch {
        router.replace('/');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gris-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gris-50">
        <DashboardHeader user={user} onLogout={handleLogout} />
        <main>{children}</main>
      </div>
    </ToastProvider>
  );
}
