import type { Habit } from '@/types/habit';
import { getHabits, setHabits } from './storage';

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const completions = habit.completions.includes(date)
    ? habit.completions.filter((d) => d !== date)
    : [...new Set([...habit.completions, date])];
  return { ...habit, completions };
}

export function getHabitsForUser(userId: string): Habit[] {
  return getHabits().filter((h) => h.userId === userId);
}

export function saveHabit(habit: Habit): void {
  setHabits([...getHabits(), habit]);
}

export function updateHabit(updated: Habit): void {
  setHabits(getHabits().map((h) => (h.id === updated.id ? updated : h)));
}

export function deleteHabit(id: string): void {
  setHabits(getHabits().filter((h) => h.id !== id));
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createHabit(userId: string, name: string, description: string): Habit {
  const habit: Habit = {
    id: generateId(),
    userId,
    name,
    description,
    frequency: 'daily',
    createdAt: new Date().toISOString(),
    completions: [],
  };
  saveHabit(habit);
  return habit;
}
