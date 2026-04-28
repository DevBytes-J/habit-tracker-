'use client';
import { useEffect, useState } from 'react';

const HABITS = ['Exercise', 'Read', 'Meditate', 'Hydrate', 'Sleep early', 'Journal', 'Walk', 'Stretch'];

// Fixed positions so pills never overlap the centre
const PILL_POSITIONS = [
  { top: '8%',  left: '5%'  },
  { top: '15%', left: '72%' },
  { top: '28%', left: '80%' },
  { top: '55%', left: '78%' },
  { top: '72%', left: '68%' },
  { top: '80%', left: '8%'  },
  { top: '62%', left: '3%'  },
  { top: '38%', left: '2%'  },
];

export default function SplashScreen() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      data-testid="splash-screen"
      className="relative flex flex-col items-center justify-center min-h-dvh overflow-hidden"
      style={{ background: '#FEFDD2' }}
    >
      {/* Floating habit pills — absolutely positioned away from centre */}
      {HABITS.map((h, i) => (
        <span
          key={h}
          className="splash-pill"
          style={{
            top: PILL_POSITIONS[i].top,
            left: PILL_POSITIONS[i].left,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${3.2 + (i % 3) * 0.9}s`,
          }}
        >
          {h}
        </span>
      ))}

      {/* Centre content */}
      <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6">
        <img
          src="/logo.png"
          alt="Habit Tracker"
          className="anim-splash-logo w-70 h-70 object-contain drop-shadow-xl"
        />
        <div className="anim-splash-tag">
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            Habit Tracker
          </h1>
        </div>

        {/* Bouncing dots */}
        <div className="flex items-end gap-2 h-7 mt-2">
          {[0, 1, 2, 3].map(i => (
            <span key={i} className="bounce-dot" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>

        {/* Cycling habit name */}
        <p key={tick} className="text-xs font-bold tracking-widest uppercase splash-cycle" style={{ color: 'var(--accent-dark)' }}>
          {HABITS[tick % HABITS.length]}
        </p>
      </div>
    </div>
  );
}
