'use client';
import { useState } from 'react';
import { HiSparkles, HiStar } from 'react-icons/hi';
import type { Habit } from '@/types/habit';
import { createHabit, updateHabit, deleteHabit } from '@/lib/habits';
import HabitCard from './HabitCard';
import HabitForm from './HabitForm';

type Props = { userId: string; initialHabits: Habit[] };

export default function HabitList({ userId, initialHabits }: Props) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [creating, setCreating] = useState(false);

  function handleCreate(name: string, description: string) {
    const habit = createHabit(userId, name, description);
    setHabits(prev => [...prev, habit]);
    setCreating(false);
  }
  function handleUpdate(updated: Habit) {
    updateHabit(updated);
    setHabits(prev => prev.map(h => h.id === updated.id ? updated : h));
  }
  function handleDelete(id: string) {
    deleteHabit(id);
    setHabits(prev => prev.filter(h => h.id !== id));
  }

  const today = new Date().toISOString().slice(0, 10);
  const done = habits.filter(h => h.completions.includes(today)).length;
  const total = habits.length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">

      {/* Progress */}
      {total > 0 && (
        <div className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex justify-between items-baseline mb-2.5">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Today&apos;s progress
            </span>
            <span className="text-sm font-bold" style={{ color: done === total ? 'var(--green)' : 'var(--accent-dark)' }}>
              {done} / {total}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: done === total ? 'var(--green)' : 'var(--accent)' }}
            />
          </div>
          {done === total && total > 0 && (
            <p className="mt-2.5 mb-0 text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--green)' }}>
              <HiSparkles size={14} /> All habits done for today!
            </p>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          My Habits
        </h2>
        {!creating && (
          <button
            data-testid="create-habit-button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm border-none cursor-pointer"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <span>+</span> New habit
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <HabitForm onSave={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      {/* Empty state */}
      {habits.length === 0 && !creating && (
        <div data-testid="empty-state" className="flex flex-col items-center gap-3 py-14 px-5 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border" style={{ background: 'rgba(213,174,54,0.12)', borderColor: 'var(--border)' }}>
            <HiStar size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <p className="m-0 font-bold text-base" style={{ color: 'var(--text)' }}>No habits yet</p>
          <p className="m-0 text-sm" style={{ color: 'var(--muted)' }}>Create your first habit and start building momentum</p>
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-col gap-2.5">
        {habits.map(habit => (
          <HabitCard key={habit.id} habit={habit} onUpdate={handleUpdate} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
