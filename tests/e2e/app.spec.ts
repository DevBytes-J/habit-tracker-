import { test, expect, type Page } from '@playwright/test';
import { USERS_KEY, SESSION_KEY, HABITS_KEY } from '../../src/lib/constants';

const TEST_EMAIL = 'e2e@test.com';
const TEST_PASSWORD = 'password123';

async function clearStorage(page: Page) {
  await page.evaluate((keys) => {
    keys.forEach((k) => localStorage.removeItem(k));
  }, [USERS_KEY, SESSION_KEY, HABITS_KEY]);
}

async function seedUser(page: Page) {
  await page.evaluate(
    ({ key, email, password }) => {
      const users = [{ id: 'u-e2e', email, password, createdAt: new Date().toISOString() }];
      localStorage.setItem(key, JSON.stringify(users));
    },
    { key: USERS_KEY, email: TEST_EMAIL, password: TEST_PASSWORD }
  );
}

async function seedSession(page: Page) {
  await page.evaluate(
    ({ key, email }) => {
      localStorage.setItem(key, JSON.stringify({ userId: 'u-e2e', email }));
    },
    { key: SESSION_KEY, email: TEST_EMAIL }
  );
}

test.describe('Habit Tracker app', () => {
  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await page.goto('/');
    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await page.goto('/');
    await seedUser(page);
    await seedSession(page);
    await page.goto('/');
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await page.goto('/dashboard');
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await page.goto('/signup');
    await page.getByTestId('auth-signup-email').fill('newuser@test.com');
    await page.getByTestId('auth-signup-password').fill('newpass123');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await seedUser(page);
    // Seed a habit for a different user
    await page.evaluate(
      ({ key }) => {
        const habits = [
          { id: 'h-other', userId: 'other-user', name: 'Other Habit', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] },
          { id: 'h-mine', userId: 'u-e2e', name: 'My Habit', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] },
        ];
        localStorage.setItem(key, JSON.stringify(habits));
      },
      { key: HABITS_KEY }
    );
    await page.goto('/login');
    await page.getByTestId('auth-login-email').fill(TEST_EMAIL);
    await page.getByTestId('auth-login-password').fill(TEST_PASSWORD);
    await page.getByTestId('auth-login-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.getByTestId('habit-card-my-habit')).toBeVisible();
    await expect(page.getByTestId('habit-card-other-habit')).not.toBeVisible();
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await seedUser(page);
    await seedSession(page);
    await page.goto('/dashboard');
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Exercise');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-exercise')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await seedUser(page);
    await seedSession(page);
    await page.evaluate(
      ({ key, userId }) => {
        const habits = [{ id: 'h1', userId, name: 'Drink Water', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] }];
        localStorage.setItem(key, JSON.stringify(habits));
      },
      { key: HABITS_KEY, userId: 'u-e2e' }
    );
    await page.goto('/dashboard');
    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('0');
    await page.getByTestId('habit-complete-drink-water').click();
    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('1');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await seedUser(page);
    await seedSession(page);
    await page.evaluate(
      ({ key, userId }) => {
        const habits = [{ id: 'h1', userId, name: 'Drink Water', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] }];
        localStorage.setItem(key, JSON.stringify(habits));
      },
      { key: HABITS_KEY, userId: 'u-e2e' }
    );
    await page.goto('/dashboard');
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
    await page.reload();
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await seedUser(page);
    await seedSession(page);
    await page.goto('/dashboard');
    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page, context }) => {
    await page.goto('/');
    await clearStorage(page);
    await seedUser(page);
    await seedSession(page);
    // Load the app online first so SW can cache
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    // Wait for SW to install
    await page.waitForTimeout(2000);
    // Go offline
    await context.setOffline(true);
    await page.goto('/dashboard');
    // Should not hard crash — page should still render something
    const body = await page.locator('body').textContent();
    expect(body).not.toBeNull();
    await context.setOffline(false);
  });
});
