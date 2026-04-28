import type { User, Session } from '@/types/auth';
import { getUsers, setUsers, getSession, setSession } from './storage';

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function signUp(email: string, password: string): { error: string | null } {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    return { error: 'User already exists' };
  }
  const user: User = { id: generateId(), email, password, createdAt: new Date().toISOString() };
  setUsers([...users, user]);
  setSession({ userId: user.id, email: user.email });
  return { error: null };
}

export function logIn(email: string, password: string): { error: string | null } {
  const user = getUsers().find((u) => u.email === email && u.password === password);
  if (!user) return { error: 'Invalid email or password' };
  setSession({ userId: user.id, email: user.email });
  return { error: null };
}

export function logOut(): void {
  setSession(null);
}

export { getSession };
