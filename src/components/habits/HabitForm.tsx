'use client';
import { useState } from 'react';
import { validateHabitName } from '@/lib/validators';
import type { Habit } from '@/types/habit';

type Props = { initial?: Habit; onSave: (name: string, description: string) => void; onCancel: () => void; };

export default function HabitForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validateHabitName(name);
    if (!result.valid) { setError(result.error); return; }
    setError(null);
    onSave(result.value, description.trim());
  }

  const inputCls = "rounded-xl px-3.5 py-2.5 text-sm outline-none border w-full transition-shadow";
  const inputStyle = { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };
  const labelCls = "flex flex-col gap-1.5 text-xs font-semibold";
  const labelStyle = { color: 'var(--text-secondary)' };

  return (
    <form data-testid="habit-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="m-0 font-bold text-sm" style={{ color: 'var(--accent-dark)' }}>
        {initial ? 'Edit habit' : 'New habit'}
      </p>

      {error && (
        <p role="alert" className="m-0 rounded-xl px-4 py-3 text-sm border" style={{ background: 'var(--red-bg)', borderColor: 'var(--red-border)', color: 'var(--red)' }}>
          {error}
        </p>
      )}

      <label className={labelCls} style={labelStyle}>
        Habit name
        <input data-testid="habit-name-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Drink water" className={inputCls} style={inputStyle} />
      </label>

      <label className={labelCls} style={labelStyle}>
        Description <span className="font-normal text-xs" style={{ color: 'var(--muted)' }}>(optional)</span>
        <input data-testid="habit-description-input" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Why does this matter?" className={inputCls} style={inputStyle} />
      </label>

      <label className={labelCls} style={labelStyle}>
        Frequency
        <select data-testid="habit-frequency-select" defaultValue="daily" className={`${inputCls} cursor-pointer`} style={inputStyle}>
          <option value="daily">Daily</option>
        </select>
      </label>

      <div className="flex gap-2 mt-1">
        <button data-testid="habit-save-button" type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-sm border-none cursor-pointer" style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
          Save habit
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl font-medium text-sm cursor-pointer border" style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
