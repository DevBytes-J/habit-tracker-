import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SESSION_KEY, HABITS_KEY } from '@/lib/constants';
import type { Habit } from '@/types/habit';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

import HabitList from '@/components/habits/HabitList';

const userId = 'u1';

function seedHabit(overrides: Partial<Habit> = {}): Habit {
  const habit: Habit = {
    id: 'h1',
    userId,
    name: 'Drink Water',
    description: 'Stay hydrated',
    frequency: 'daily',
    createdAt: '2026-01-01T00:00:00.000Z',
    completions: [],
    ...overrides,
  };
  localStorage.setItem(HABITS_KEY, JSON.stringify([habit]));
  return habit;
}

describe('habit form', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, email: 'test@test.com' }));
  });

  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup();
    render(<HabitList userId={userId} initialHabits={[]} />);
    await user.click(screen.getByTestId('create-habit-button'));
    await user.click(screen.getByTestId('habit-save-button'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Habit name is required');
  });

  it('creates a new habit and renders it in the list', async () => {
    const user = userEvent.setup();
    render(<HabitList userId={userId} initialHabits={[]} />);
    await user.click(screen.getByTestId('create-habit-button'));
    await user.type(screen.getByTestId('habit-name-input'), 'Drink Water');
    await user.click(screen.getByTestId('habit-save-button'));
    expect(await screen.findByTestId('habit-card-drink-water')).toBeInTheDocument();
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const habit = seedHabit();
    const user = userEvent.setup();
    render(<HabitList userId={userId} initialHabits={[habit]} />);
    await user.click(screen.getByTestId('habit-edit-drink-water'));
    const nameInput = screen.getByTestId('habit-name-input');
    await user.clear(nameInput);
    await user.type(nameInput, 'Read Books');
    await user.click(screen.getByTestId('habit-save-button'));
    expect(await screen.findByTestId('habit-card-read-books')).toBeInTheDocument();
    const stored: Habit[] = JSON.parse(localStorage.getItem(HABITS_KEY) ?? '[]');
    expect(stored[0].id).toBe(habit.id);
    expect(stored[0].userId).toBe(habit.userId);
    expect(stored[0].createdAt).toBe(habit.createdAt);
    expect(stored[0].completions).toEqual(habit.completions);
  });

  it('deletes a habit only after explicit confirmation', async () => {
    const habit = seedHabit();
    const user = userEvent.setup();
    render(<HabitList userId={userId} initialHabits={[habit]} />);
    await user.click(screen.getByTestId('habit-delete-drink-water'));
    expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument();
    await user.click(screen.getByTestId('confirm-delete-button'));
    await waitFor(() => {
      expect(screen.queryByTestId('habit-card-drink-water')).not.toBeInTheDocument();
    });
  });

  it('toggles completion and updates the streak display', async () => {
    const habit = seedHabit();
    const user = userEvent.setup();
    render(<HabitList userId={userId} initialHabits={[habit]} />);
    const streakEl = screen.getByTestId('habit-streak-drink-water');
    expect(streakEl).toHaveTextContent('0');
    await user.click(screen.getByTestId('habit-complete-drink-water'));
    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('1');
    await user.click(screen.getByTestId('habit-complete-drink-water'));
    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('0');
  });
});
