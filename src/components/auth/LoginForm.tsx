'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logIn } from '@/lib/auth';
import { HiEye, HiEyeOff, HiOutlineLightningBolt, HiOutlineChartBar, HiOutlineWifi, HiOutlineLockClosed } from 'react-icons/hi';

const PERKS = [
  { icon: <HiOutlineLightningBolt size={20} />, text: 'Keep your streak alive every day' },
  { icon: <HiOutlineChartBar size={20} />, text: 'See your progress at a glance' },
  { icon: <HiOutlineWifi size={20} />, text: 'Works fully offline, no internet needed' },
  { icon: <HiOutlineLockClosed size={20} />, text: 'Your data never leaves your device' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const emailInvalid = emailTouched && email.length > 0 && !EMAIL_RE.test(email);
  const formValid = EMAIL_RE.test(email) && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid || loading) return;
    setLoading(true);
    setError(null);
    const result = logIn(email, password);
    if (result.error) { setError('Invalid email or password'); setLoading(false); }
    else { router.replace('/dashboard'); }
  }

  return (
    <div className="flex min-h-dvh w-full page-fade-in">
      {/* LEFT: brand panel */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 px-16 gap-6" style={{ background: 'var(--accent)' }}>
        <img src="/logo.png" alt="Habit Tracker" className="w-70 h-70 object-contain drop-shadow-2xl" />
        <div className="w-full max-w-[500px]">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--accent-text)' }}>Your habits. Your rules.</h2>
          <p className="mt-3 text-base opacity-75" style={{ color: 'var(--accent-text)' }}>Small actions, compounded daily,<br />build extraordinary lives.</p>
          <ul className="flex flex-col gap-4 mt-6">
            {PERKS.map(p => (
              <li key={p.text} className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
                <span>{p.icon}</span>{p.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT: form panel */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 px-6 py-12" style={{ background: '#FEFDD2' }}>
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img src="/logo.png" alt="Habit Tracker" className="w-20 h-20 object-contain drop-shadow-md mb-3" />
          </div>
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>Welcome back</h1>
            <p className="mt-1.5 text-sm" style={{ color: 'var(--muted)' }}>Your streak is waiting for you.</p>
          </div>

          <div className="rounded-2xl p-6 shadow-sm border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {error && (
                <div role="alert" className="rounded-xl px-4 py-3 text-sm border" style={{ background: 'var(--red-bg)', borderColor: 'var(--red-border)', color: 'var(--red)' }}>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Email address</label>
                <input
                  data-testid="auth-login-email"
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="you@example.com"
                  className="rounded-xl px-3.5 py-2.5 text-sm outline-none border transition-all"
                  style={{ background: 'var(--bg)', borderColor: emailInvalid ? 'var(--red)' : 'var(--border)', color: 'var(--text)' }}
                />
                {emailInvalid && (
                  <p className="text-xs" style={{ color: 'var(--red)' }}>Please use the format: you@example.com</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <div className="relative">
                  <input
                    data-testid="auth-login-password"
                    type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none border transition-all"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0"
                    style={{ color: 'var(--muted)' }}>
                    {showPw ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                data-testid="auth-login-submit"
                type="submit" disabled={!formValid || loading}
                className="mt-1 py-3 rounded-xl font-bold text-sm border-none transition-all"
                style={{
                  background: formValid ? 'var(--accent)' : 'var(--border)',
                  color: formValid ? 'var(--accent-text)' : 'var(--muted)',
                  cursor: formValid ? 'pointer' : 'not-allowed',
                  opacity: formValid ? 1 : 0.6,
                }}
              >
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm" style={{ color: 'var(--muted)' }}>
            No account yet?{' '}
            <a href="/signup" className="font-bold no-underline border-b" style={{ color: 'var(--accent-dark)', borderColor: 'var(--accent)' }}>Sign up free</a>
          </p>
        </div>
      </div>
    </div>
  );
}
