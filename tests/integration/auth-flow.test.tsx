import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USERS_KEY, SESSION_KEY } from '@/lib/constants';

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

function seedUser() {
  const users = [{ id: 'u1', email: 'test@test.com', password: 'pass123', createdAt: '2026-01-01T00:00:00.000Z' }];
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

describe('auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
    mockReplace.mockClear();
  });

  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByTestId('auth-signup-email'), 'new@test.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'password123');
    await user.click(screen.getByTestId('auth-signup-submit'));
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null');
    expect(session).not.toBeNull();
    expect(session.email).toBe('new@test.com');
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for duplicate signup email', async () => {
    seedUser();
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByTestId('auth-signup-email'), 'test@test.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'pass123');
    await user.click(screen.getByTestId('auth-signup-submit'));
    expect(await screen.findByRole('alert')).toHaveTextContent('User already exists');
  });

  it('submits the login form and stores the active session', async () => {
    seedUser();
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByTestId('auth-login-email'), 'test@test.com');
    await user.type(screen.getByTestId('auth-login-password'), 'pass123');
    await user.click(screen.getByTestId('auth-login-submit'));
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null');
    expect(session).not.toBeNull();
    expect(session.email).toBe('test@test.com');
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for invalid login credentials', async () => {
    seedUser();
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByTestId('auth-login-email'), 'test@test.com');
    await user.type(screen.getByTestId('auth-login-password'), 'wrongpassword');
    await user.click(screen.getByTestId('auth-login-submit'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });
});
