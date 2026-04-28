
> Good. I have a clear picture. Here's my full plan before writing a single line of code:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


## Plan

### 1. Cleanup & Config

- Delete the default app/ directory (the scaffold put it at root, but the spec requires src/app/)
- Move app/globals.css, app/layout.tsx, app/page.tsx into src/app/
- Update tsconfig.json to point paths at src/
- Update next.config.ts to use src/ as the app directory
- Add vitest.config.ts with jsdom environment, coverage thresholds (80% for src/lib), and include patterns for
unit/integration tests
- Add playwright.config.ts pointing at tests/e2e/, base URL http://localhost:3000
- Update package.json scripts to match the required 5 scripts exactly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


### 2. Types (src/types/)

- auth.ts — exports User and Session exactly as specified
- habit.ts — exports Habit exactly as specified

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


### 3. Lib utilities (src/lib/)

- constants.ts — localStorage key constants (habit-tracker-users, habit-tracker-session, habit-tracker-habits)
- storage.ts — thin wrappers: getUsers, setUsers, getSession, setSession, getHabits, setHabits (all using the 
constants, all safe for SSR with typeof window guards)
- auth.ts — signUp(email, password), logIn(email, password), logOut(), getActiveSession() — all operating on 
localStorage via storage.ts
- slug.ts — exports getHabitSlug(name) per spec rules
- validators.ts — exports validateHabitName(name) per spec rules
- streaks.ts — exports calculateCurrentStreak(completions, today?) per spec rules
- habits.ts — exports toggleHabitCompletion(habit, date) per spec rules; also internal helpers 
getHabitsForUser, saveHabit, updateHabit, deleteHabit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


### 4. Components (src/app/components/)

shared/
- SplashScreen.tsx — centered "Habit Tracker" text, data-testid="splash-screen"
- ProtectedRoute.tsx — client component that checks session, redirects to /login if none

auth/
- LoginForm.tsx — email + password inputs with required test IDs, calls logIn, redirects to /dashboard, shows 
"Invalid email or password" on failure
- SignupForm.tsx — email + password inputs with required test IDs, calls signUp, redirects to /dashboard, 
shows "User already exists" on duplicate

habits/
- HabitForm.tsx — form with habit-form, habit-name-input, habit-description-input, habit-frequency-select, 
habit-save-button; used for both create and edit; validates name via validateHabitName
- HabitCard.tsx — renders one habit with all slug-based test IDs; shows streak via calculateCurrentStreak; 
toggle complete button; edit/delete buttons; delete requires confirmation with confirm-delete-button
- HabitList.tsx — renders list of HabitCards or empty-state when empty; includes create-habit-button that 
shows HabitForm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


### 5. Routes (src/app/)

- layout.tsx — root layout, registers service worker on client side, Tailwind globals
- page.tsx — splash route /: renders SplashScreen, uses useEffect to check session after 800–2000ms delay, 
then router.replace to /dashboard or /login
- login/page.tsx — renders LoginForm
- signup/page.tsx — renders SignupForm
- dashboard/page.tsx — wraps in ProtectedRoute, renders HabitList with data-testid="dashboard-page"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


### 6. PWA files (public/)

- manifest.json — name, short_name, start_url /, display standalone, background_color, theme_color, icons for 
192 and 512
- sw.js — install event caches app shell URLs; fetch event serves from cache first, falls back to network
- icons/icon-192.png and icons/icon-512.png — minimal valid PNG files (generated programmatically)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


### 7. Tests

Unit (tests/unit/)
- slug.test.ts — describe('getHabitSlug') with 3 required titles
- validators.test.ts — describe('validateHabitName') with 3 required titles
- streaks.test.ts — describe('calculateCurrentStreak') with 5 required titles
- habits.test.ts — describe('toggleHabitCompletion') with 4 required titles

Integration (tests/integration/)
- auth-flow.test.tsx — describe('auth flow') with 4 required titles; renders LoginForm/SignupForm in isolation
with mocked localStorage
- habit-form.test.tsx — describe('habit form') with 5 required titles; renders HabitList with mocked session/
storage

E2E (tests/e2e/)
- app.spec.ts — test.describe('Habit Tracker app') with 10 required titles; full browser tests against running
dev server

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


### 8. README

A README.md covering all 8 required sections: overview, setup, run, test instructions, persistence structure, 
PWA implementation, trade-offs, and test file map.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


### Key decisions / trade-offs

- **No server components for protected pages** — auth state lives in localStorage, so dashboard and auth forms
are client components. The splash page uses useEffect for the redirect delay.
- **src/app/components/ not src/components/** — the spec's folder structure places components inside 
src/app/components/, not at src/components/. I'll follow the spec exactly.
- **Integration tests mock localStorage** — since there's no server, integration tests use vitest's jsdom 
environment with localStorage available natively.
- **E2E tests require the dev server running** — playwright.config.ts will use webServer to auto-start 
next dev before the suite.
- **Icons** — generated as minimal valid 1×1 PNGs using a Node script at build time, since the spec requires 
the files to exist but doesn't specify artwork.
- **Service worker registration** — done in layout.tsx via a useEffect in a client component wrapper, since 
Next.js App Router's root layout can be a server component.