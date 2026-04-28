'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (!getSession()) router.replace('/login');
  }, [router]);

  if (typeof window !== 'undefined' && !getSession()) return null;
  return <>{children}</>;
}
