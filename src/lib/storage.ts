import type { User, Session } from '@/types/auth';
import type { Habit } from '@/types/habit';
import { USERS_KEY, SESSION_KEY, HABITS_KEY } from './constants';

function read<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const getUsers = (): User[] => read<User[]>(USERS_KEY) ?? [];
export const setUsers = (users: User[]): void => write(USERS_KEY, users);

export const getSession = (): Session | null => read<Session>(SESSION_KEY);
export const setSession = (session: Session | null): void => write(SESSION_KEY, session);

export const getHabits = (): Habit[] => read<Habit[]>(HABITS_KEY) ?? [];
export const setHabits = (habits: Habit[]): void => write(HABITS_KEY, habits);
