'use client';
import { useState } from 'react';
import type { Habit } from '@/types/habit';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';
import { toggleHabitCompletion } from '@/lib/habits';
import { HiOutlineFire, HiCheck } from 'react-icons/hi';
import HabitForm from './HabitForm';

type Props = { habit: Habit; onUpdate: (h: Habit) => void; onDelete: (id: string) => void; };

export default function HabitCard({ habit, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const slug = getHabitSlug(habit.name);
  const today = new Date().toISOString().slice(0, 10);
  const streak = calculateCurrentStreak(habit.completions, today);
  const done = habit.completions.includes(today);

  function handleToggle() {
    onUpdate(toggleHabitCompletion(habit, today));
  }

  const cardBase = "rounded-2xl border p-4 transition-colors";
  const cardStyle = done
    ? { background: 'var(--green-bg)', borderColor: 'var(--green-border)' }
    : { background: 'var(--surface)', borderColor: 'var(--border)' };

  if (editing) {
    return (
      <div data-testid={`habit-card-${slug}`} className={cardBase} style={cardStyle}>
        <HabitForm initial={habit} onSave={(name, desc) => { onUpdate({ ...habit, name, description: desc }); setEditing(false); }} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div data-testid={`habit-card-${slug}`} className={cardBase} style={cardStyle}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          data-testid={`habit-complete-${slug}`}
          onClick={handleToggle}
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
          className="mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors text-xs font-black"
          style={{
            background: done ? 'var(--accent)' : 'transparent',
            borderColor: 'var(--border-strong)',
            color: 'var(--accent-text)',
          }}
        >
          {done && <HiCheck className="check-pop" size={14} />}
        </button>

        {/* Name + desc */}
        <div className="flex-1 min-w-0">
          <p className="m-0 font-bold text-sm truncate transition-colors" style={{ color: done ? 'var(--muted)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none' }}>
            {habit.name}
          </p>
          {habit.description && (
            <p className="mt-0.5 m-0 text-xs truncate" style={{ color: 'var(--muted)' }}>{habit.description}</p>
          )}
        </div>

        {/* Streak badge */}
        <div
          data-testid={`habit-streak-${slug}`}
          className="flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border"
          style={streak > 0
            ? { background: 'rgba(213,174,54,0.12)', borderColor: 'var(--accent)', color: 'var(--accent-dark)' }
            : { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          {streak > 0 ? <HiOutlineFire size={13} /> : '–'} {streak}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          data-testid={`habit-edit-${slug}`}
          onClick={() => setEditing(true)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium border cursor-pointer transition-colors"
          style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          Edit
        </button>
        <button
          data-testid={`habit-delete-${slug}`}
          onClick={() => setConfirmDelete(true)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium border cursor-pointer transition-colors"
          style={{ background: 'transparent', borderColor: 'var(--red-border)', color: 'var(--red)' }}
        >
          Delete
        </button>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="mt-3 rounded-xl p-3 border flex flex-col gap-2" style={{ background: 'var(--red-bg)', borderColor: 'var(--red-border)' }}>
          <p className="m-0 text-sm font-medium" style={{ color: 'var(--red)' }}>
            Delete &quot;{habit.name}&quot;? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              data-testid="confirm-delete-button"
              onClick={() => onDelete(habit.id)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer"
              style={{ background: 'transparent', borderColor: 'var(--red-border)', color: 'var(--red)' }}
            >
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium border cursor-pointer"
              style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
