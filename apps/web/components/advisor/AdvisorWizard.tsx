'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { AdvisorResults, RecommendationPayload } from './AdvisorResults';

interface Config {
  goals: string[];
  concerns: Array<{ goal: 'HAIR' | 'SKIN'; name: string; slug: string }>;
  questions: Array<{
    key: string;
    label: string;
    goal: 'HAIR' | 'SKIN' | null;
    options: Array<{ value: string; label: string }>;
  }>;
}

type Step = 'goal' | 'concern' | 'profile' | 'results';

export function AdvisorWizard() {
  const params = useSearchParams();
  const [config, setConfig] = useState<Config | null>(null);
  const [step, setStep] = useState<Step>('goal');
  const [goal, setGoal] = useState<'HAIR' | 'SKIN' | null>(null);
  const [concern, setConcern] = useState<string | null>(null);
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [results, setResults] = useState<RecommendationPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Config>('/advisor/config')
      .then((c) => {
        setConfig(c);
        // deep-link support: /advisor?goal=HAIR&concern=hair-fall
        const g = params.get('goal') as 'HAIR' | 'SKIN' | null;
        const cn = params.get('concern');
        if (g && (g === 'HAIR' || g === 'SKIN')) {
          setGoal(g);
          if (cn && c.concerns.some((x) => x.slug === cn && x.goal === g)) {
            setConcern(cn);
            setStep('profile');
          } else {
            setStep('concern');
          }
        }
      })
      .catch(() => setError('The advisor is taking a break — please try again shortly.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResults = async (finalProfile: Record<string, string>) => {
    if (!goal || !concern) return;
    setLoading(true);
    setError('');
    try {
      const res = await api<RecommendationPayload>('/advisor/recommend', {
        method: 'POST',
        body: { goal, concern, profile: finalProfile },
      });
      setResults(res);
      setStep('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Could not build your routine — please try again.');
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStep('goal');
    setGoal(null);
    setConcern(null);
    setProfile({});
    setResults(null);
  };

  const concerns = config?.concerns.filter((c) => c.goal === goal) ?? [];
  const questions = config?.questions.filter((q) => q.goal === null || q.goal === goal) ?? [];
  const stepIndex = step === 'goal' ? 0 : step === 'concern' ? 1 : step === 'profile' ? 2 : 3;

  return (
    <div className="mx-auto max-w-3xl">
      {step !== 'results' && (
        <header className="text-center">
          <p className="eyebrow">AI Hair & Skin Advisor</p>
          <h1 className="heading-lg mt-3">Find My Perfect Products</h1>
          {/* progress */}
          <div className="mx-auto mt-8 flex max-w-xs items-center gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-300">
                <motion.div
                  className="h-full bg-forest-600"
                  animate={{ width: stepIndex > i ? '100%' : stepIndex === i ? '50%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            ))}
          </div>
        </header>
      )}

      {error && <p className="mt-8 rounded-lg bg-clay-500/10 p-4 text-center text-sm text-clay-700">{error}</p>}

      <AnimatePresence mode="wait">
        {step === 'goal' && (
          <StepShell key="goal" title="What shall we care for today?">
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { value: 'HAIR' as const, emoji: '💆‍♀️', title: 'Hair Care', text: 'Growth, dandruff, dryness, damage…' },
                { value: 'SKIN' as const, emoji: '✨', title: 'Skin Care', text: 'Acne, glow, dryness, sensitivity…' },
              ].map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setGoal(opt.value);
                    setConcern(null);
                    setStep('concern');
                  }}
                  className="rounded-organic bg-white p-10 text-center shadow-soft transition-shadow hover:shadow-lift"
                >
                  <span className="text-5xl" aria-hidden>{opt.emoji}</span>
                  <h2 className="mt-4 font-display text-2xl">{opt.title}</h2>
                  <p className="mt-2 text-sm text-ink-soft">{opt.text}</p>
                </motion.button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 'concern' && (
          <StepShell key="concern" title="What's your main concern?" onBack={() => setStep('goal')}>
            <div className="grid gap-3 sm:grid-cols-2">
              {concerns.map((c) => (
                <motion.button
                  key={c.slug}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setConcern(c.slug);
                    setStep('profile');
                  }}
                  className={`rounded-2xl border bg-white px-6 py-5 text-left font-display text-lg shadow-soft transition-colors ${
                    concern === c.slug ? 'border-forest-700' : 'border-transparent hover:border-forest-300'
                  }`}
                >
                  {c.name}
                </motion.button>
              ))}
            </div>
            {concerns.length === 0 && <p className="text-center text-sm text-ink-soft">Loading concerns…</p>}
          </StepShell>
        )}

        {step === 'profile' && (
          <StepShell
            key="profile"
            title="Tell us a little about you"
            subtitle="All optional — but the more you share, the sharper your routine."
            onBack={() => setStep('concern')}
          >
            <div className="space-y-8">
              {questions.map((q) => (
                <fieldset key={q.key}>
                  <legend className="text-sm font-semibold text-ink">{q.label}</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {q.options.map((o) => {
                      const selected = profile[q.key] === o.value;
                      return (
                        <button
                          key={o.value}
                          onClick={() =>
                            setProfile((p) => {
                              const next = { ...p };
                              if (selected) delete next[q.key];
                              else next[q.key] = o.value;
                              return next;
                            })
                          }
                          aria-pressed={selected}
                          className={`rounded-full border px-5 py-2.5 text-sm transition-all ${
                            selected
                              ? 'border-forest-700 bg-forest-700 text-cream-100'
                              : 'border-cream-400 bg-white hover:border-forest-500'
                          }`}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button variant="outline" onClick={() => getResults({})} disabled={loading}>
                Skip — just show products
              </Button>
              <Button size="lg" onClick={() => getResults(profile)} disabled={loading}>
                {loading ? 'Building your routine…' : 'Get My Recommendations'}
              </Button>
            </div>
          </StepShell>
        )}

        {step === 'results' && results && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AdvisorResults results={results} onRestart={restart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.35, ease: [0.21, 0.6, 0.35, 1] }}
      className="mt-12"
    >
      <div className="mb-8 text-center">
        {onBack && (
          <button onClick={onBack} className="mb-4 text-xs uppercase tracking-luxe text-ink-faint hover:text-forest-700">
            ← Back
          </button>
        )}
        <h2 className="font-display text-2xl sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {children}
    </motion.section>
  );
}
