'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
import { HiEye, HiEyeOff, HiOutlinePencil, HiOutlinePlusCircle, HiOutlineCheckCircle, HiOutlineStar, HiCheck } from 'react-icons/hi';

const STEPS = [
  { icon: <HiOutlinePencil size={20} />, title: 'Create your account', desc: 'Takes less than 30 seconds.' },
  { icon: <HiOutlinePlusCircle size={20} />, title: 'Add your first habit', desc: "Start with just one, that's enough." },
  { icon: <HiOutlineCheckCircle size={20} />, title: 'Check it off daily', desc: 'Watch your streak grow.' },
  { icon: <HiOutlineStar size={20} />, title: 'Build momentum', desc: 'Consistency beats perfection.' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getStrength(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length === 0) return 0;
  let score = 1; // any input = at least weak
  if (pw.length >= 8 && /[^a-zA-Z0-9]/.test(pw)) score = 3;       // very strong
  else if (pw.length >= 8 || /[^a-zA-Z0-9]/.test(pw)) score = 2;  // strong
  return score as 0 | 1 | 2 | 3;
}

const STRENGTH_LABEL = ['', 'Weak', 'Strong', 'Very strong'];
const STRENGTH_COLOR = ['', '#dc2626', '#eab308', '#16a34a'];

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const emailInvalid = emailTouched && email.length > 0 && !EMAIL_RE.test(email);
  const strength = getStrength(password);
  const canSubmit = EMAIL_RE.test(email) && strength >= 1 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    const result = signUp(email, password);
    if (result.error) { setError(result.error); setLoading(false); }
    else { router.replace('/dashboard'); }
  }

  return (
    <div className="flex min-h-dvh w-full page-fade-in">
      {/* LEFT: form panel */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 px-6 py-12" style={{ background: '#FEFDD2' }}>
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img src="/logo.png" alt="Habit Tracker" className="w-20 h-20 object-contain drop-shadow-md mb-3" />
          </div>
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>Start your journey</h1>
            <p className="mt-1.5 text-sm" style={{ color: 'var(--muted)' }}>Build habits that stick — free, forever.</p>
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
                  data-testid="auth-signup-email"
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
                    data-testid="auth-signup-password"
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

                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map(level => (
                        <div
                          key={level}
                          className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{ background: strength >= level ? STRENGTH_COLOR[strength] : 'var(--border)' }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-semibold" style={{ color: STRENGTH_COLOR[strength] }}>
                      {STRENGTH_LABEL[strength]}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Use 8+ characters, a symbol (#, _, !, etc.) and a number for a stronger password.
                    </p>
                  </div>
                )}
              </div>

              <button
                data-testid="auth-signup-submit"
                type="submit" disabled={!canSubmit}
                className="mt-1 py-3 rounded-xl font-bold text-sm border-none transition-all"
                style={{
                  background: canSubmit ? 'var(--accent)' : 'var(--border)',
                  color: canSubmit ? 'var(--accent-text)' : 'var(--muted)',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  opacity: canSubmit ? 1 : 0.6,
                }}
              >
                {loading ? 'Creating account…' : 'Create free account →'}
              </button>
            </form>
          </div>


          <p className="mt-5 text-center text-sm" style={{ color: 'var(--muted)' }}>
            Already have an account?{' '}
            <a href="/login" className="font-bold no-underline border-b" style={{ color: 'var(--accent-dark)', borderColor: 'var(--accent)' }}>Sign in</a>
          </p>
        </div>
      </div>

      {/* RIGHT: brand panel */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 px-16 gap-6" style={{ background: 'var(--accent)' }}>
        <img src="/logo.png" alt="Habit Tracker" className="w-70 h-70 object-contain drop-shadow-2xl" />
        <div className="w-full  text-center">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--accent-text)' }}>How it works</h2>
          <p className="mt-3 text-base opacity-75" style={{ color: 'var(--accent-text)' }}>Four simple steps to a better you.</p>
          <ol className="flex flex-row gap-2 mt-6 justify-center flex-wrap items-start max-w-[10000px]">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex items-start">
                <div className="flex flex-col items-center gap-2 text-center w-20">
                  <span style={{ color: 'var(--accent-text)' }}>{s.icon}</span>
                  <p className="text-xs font-bold leading-tight" style={{ color: 'var(--accent-text)' }}>{s.title}</p>
                  <p className="text-xs opacity-70" style={{ color: 'var(--accent-text)' }}>{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="mt-1 px-1 opacity-50 text-sm" style={{ color: 'var(--accent-text)' }}>→</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
