# Habit Tracker

A mobile-first Progressive Web App for tracking daily habits. Built with Next.js App Router, React, TypeScript, and Tailwind CSS. All data is persisted locally in `localStorage` — no backend or external auth service required.

## Live Demo

[View live](https://tic-i14.vercel.app/)

## Setup

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm run dev      
npm run build   
npm run start    
```

## Test

```bash
npm run test:unit         
npm run test:integration  
npm run test:e2e          
npm run test              
```

Coverage threshold: 80% line coverage for `src/lib/**`.

## Local Persistence Structure

All state is stored in `localStorage` under three keys:

| Key | Shape |
|-----|-------|
| `habit-tracker-users` | `User[]` — `{ id, email, password, createdAt }` |
| `habit-tracker-session` | `Session \| null` — `{ userId, email }` |
| `habit-tracker-habits` | `Habit[]` — `{ id, userId, name, description, frequency, createdAt, completions }` |

`completions` is an array of unique `YYYY-MM-DD` strings representing days the habit was completed. Streaks are calculated client-side from this array on every render.

## PWA Support

- `public/manifest.json` — declares `name`, `short_name`, `start_url`, `display: standalone`, `background_color`, `theme_color`, and icons at 192×192 and 512×512, so browsers offer an "Add to Home Screen" prompt.
- `public/sw.js` — a cache-first service worker. On install it attempts to pre-cache the app shell (`/`, `/login`, `/signup`, `/dashboard`) using `Promise.allSettled` so a single failed URL does not abort the install. On every successful navigation it also caches app shell URLs at runtime, so the cache is populated even if the install-time fetch fails (common in Next.js dev mode). When offline, cached responses are served; if nothing is cached, the SW falls back to `/`.
- The service worker is registered in `src/app/layout.tsx` via an inline `<script>` that runs after the page loads.
- `public/icons/icon-192.png` and `public/icons/icon-512.png` are the PWA icons, generated from the app logo at the required sizes.

## Trade-offs and Limitations

- **No password hashing** — passwords are stored in plain text in `localStorage`. Acceptable for a local-only demo; not suitable for production.
- **No token expiry** — the session persists until the user explicitly logs out.
- **localStorage only** — data does not sync across devices or browsers.
- **Daily frequency only** — the `frequency` field is fixed to `'daily'`; other cadences are not implemented.
- **Service worker caching in dev mode** — Next.js dev mode serves HTML via chunked streaming, which can prevent clean caching on install. The runtime caching fallback in the `fetch` handler ensures the cache is populated after the first online visit regardless.

## Test File Map

| File | Behaviour verified |
|------|--------------------|
| `tests/unit/slug.test.ts` | `getHabitSlug` converts habit names to lowercase hyphenated slugs, trims spaces, collapses repeated spaces, and strips non-alphanumeric characters |
| `tests/unit/validators.test.ts` | `validateHabitName` rejects empty input and names over 60 characters, returns a trimmed value for valid input |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` returns 0 for empty or incomplete-today completions, counts consecutive days correctly, deduplicates, and breaks on gaps |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` adds/removes a date, does not mutate the original object, and never produces duplicate dates |
| `tests/integration/auth-flow.test.tsx` | Signup creates a session and redirects; duplicate email shows an error; login stores a session and redirects; wrong credentials show an error |
| `tests/integration/habit-form.test.tsx` | Empty name shows a validation error; creating a habit renders it; editing preserves immutable fields; deletion requires confirmation; toggling completion updates the streak display |
| `tests/e2e/app.spec.ts` | Full browser flows: splash screen, auth redirects, signup, login with per-user habit isolation, create/complete habits, persistence across reload, logout, and offline app-shell rendering |


