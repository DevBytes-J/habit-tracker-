'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, logOut } from '@/lib/auth';
import { getHabitsForUser } from '@/lib/habits';
import type { Session } from '@/types/auth';
import type { Habit } from '@/types/habit';
import { HiStar } from 'react-icons/hi';
import HabitList from '@/components/habits/HabitList';

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace('/login'); return; }
    setSession(s);
    setHabits(getHabitsForUser(s.userId));
    setReady(true);
  }, [router]);

  function handleLogout() {
    logOut();
    router.replace('/login');
  }

  if (!ready) return null;

  return (
    <main data-testid="dashboard-page" className="max-w-lg mx-auto px-5 pb-20 page-fade-in">
      <header className="flex items-center justify-between py-5 mb-7 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Habit Tracker" className="w-12 h-12 object-contain" />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs max-w-[130px] truncate" style={{ color: 'var(--muted)' }}>{session?.email}</span>
          <button
            data-testid="auth-logout-button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer"
            style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Log out
          </button>
        </div>
      </header>

      <HabitList userId={session!.userId} initialHabits={habits} />
    </main>
  );
}
