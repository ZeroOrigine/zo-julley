'use client';

// CANONICAL learn flow for Julley: the single magic interaction of the whole
// product. A student completes one sentence (topic, place, language, age) and
// one call to POST /api/lesson returns a lesson composed natively in their
// language, set in their own place, with one hands-on activity, say-it-back
// prompts, and a closing spirit line. Nothing typed here is ever stored.
//
// Self-sufficient by design: pass initialLanguages from a server component
// for an instant picker, or render it bare and it fetches /api/languages
// itself. The marketing landing page can import this component directly.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ─── Invisible Cloudflare Turnstile (OPT-IN via env; absent = no-op) ─────────
// Keeps "free forever, no account": a background bot-check, never a login.
// The script loads lazily on first lesson request and only when the site key
// exists; execute() resolves an invisible challenge token or null on any
// failure (the server only enforces when ITS secret is configured too).
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (turnstileScriptPromise) return turnstileScriptPromise;
  turnstileScriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('turnstile script failed to load'));
    document.head.appendChild(s);
  });
  return turnstileScriptPromise;
}

async function getTurnstileToken(): Promise<string | null> {
  if (!TURNSTILE_SITE_KEY) return null; // feature off — nothing to do
  try {
    await loadTurnstileScript();
    if (!window.turnstile) return null;
    return await new Promise<string | null>((resolve) => {
      const holder = document.createElement('div');
      holder.style.display = 'none';
      document.body.appendChild(holder);
      const timeout = setTimeout(() => {
        holder.remove();
        resolve(null);
      }, 8000);
      window.turnstile!.render(holder, {
        sitekey: TURNSTILE_SITE_KEY,
        size: 'invisible',
        callback: (token: string) => {
          clearTimeout(timeout);
          holder.remove();
          resolve(token);
        },
        'error-callback': () => {
          clearTimeout(timeout);
          holder.remove();
          resolve(null);
        },
      });
    });
  } catch {
    return null; // the server decides whether a missing token blocks
  }
}
import type {
  ApiEnvelope,
  ComposedLesson,
  JulleyLanguage,
  JulleyLanguageCategory,
  PaginatedList,
} from '@/lib/db/types';

interface LearnFlowProps {
  initialLanguages?: JulleyLanguage[];
}

type Phase = 'idle' | 'composing' | 'ready' | 'failed';
type LangStatus = 'loading' | 'ready' | 'failed';

const CATEGORY_META: Record<JulleyLanguageCategory, { label: string; order: number }> = {
  eighth_schedule: { label: 'Languages of India', order: 0 },
  himalayan: { label: 'Ladakh and the Himalaya', order: 1 },
  world: { label: 'World languages', order: 2 },
};

const AGES = [10, 11, 12, 13, 14, 15, 16, 17, 18];

const EXAMPLES = [
  { topic: 'Photosynthesis', place: 'a farming village near Madurai', code: 'ta', langLabel: 'Tamil', age: 12 },
  { topic: 'Fractions', place: 'the old town of Leh, Ladakh', code: 'lbj', langLabel: 'Ladakhi', age: 11 },
  { topic: 'The water cycle', place: 'Srinagar, by the Jhelum river', code: 'ks', langLabel: 'Kashmiri', age: 13 },
  { topic: "Newton's third law", place: 'a fishing town on the Kerala coast', code: 'ml', langLabel: 'Malayalam', age: 15 },
];

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function shorten(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length > max ? trimmed.slice(0, max - 3) + '...' : trimmed;
}

function buildLessonText(lesson: ComposedLesson): string {
  const parts: string[] = [lesson.title];
  if (lesson.refused && lesson.refusal_note) {
    parts.push(lesson.refusal_note);
  }
  for (const section of lesson.sections) {
    parts.push(section.heading + '\n' + section.body);
  }
  parts.push(lesson.activity.title + '\nYou need: ' + lesson.activity.materials.join(', '));
  parts.push(lesson.activity.steps.map((step, index) => `${index + 1}. ${step}`).join('\n'));
  parts.push('Say it back:\n' + lesson.explain_back.map((prompt) => `- ${prompt}`).join('\n'));
  parts.push(
    lesson.spirit_line.text + (lesson.language.code !== 'en' ? '\n(' + lesson.spirit_line.english + ')' : '')
  );
  parts.push(`Composed by Julley in ${lesson.language.name_english}. Free forever at ${window.location.origin}`);
  return parts.join('\n\n');
}

export default function LearnFlow({ initialLanguages }: LearnFlowProps) {
  const [languages, setLanguages] = useState<JulleyLanguage[]>(initialLanguages ?? []);
  const [langStatus, setLangStatus] = useState<LangStatus>(
    initialLanguages && initialLanguages.length > 0 ? 'ready' : 'loading'
  );

  const [topic, setTopic] = useState('');
  const [place, setPlace] = useState('');
  const [languageCode, setLanguageCode] = useState('');
  const [age, setAge] = useState(13);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [phase, setPhase] = useState<Phase>('idle');
  const [lesson, setLesson] = useState<ComposedLesson | null>(null);
  const [failMessage, setFailMessage] = useState('');
  const [askedPlace, setAskedPlace] = useState('');

  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusIndex, setStatusIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [toast, setToast] = useState('');
  const [ctaPulse, setCtaPulse] = useState(false);

  const recomposeOnPick = useRef(false);
  const didInit = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const topicRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const pickerTriggerRef = useRef<HTMLButtonElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedLanguage = useMemo(
    () => languages.find((lang) => lang.code === languageCode) ?? null,
    [languages, languageCode]
  );
  const langLabel = selectedLanguage?.name_english ?? 'your language';

  const fetchLanguages = useCallback(async () => {
    setLangStatus('loading');
    try {
      const res = await fetch('/api/languages?limit=100');
      const body = (await res.json()) as ApiEnvelope<PaginatedList<JulleyLanguage>>;
      if (!res.ok || !body.data) {
        throw new Error('catalog unavailable');
      }
      setLanguages(body.data.items);
      setLangStatus('ready');
    } catch {
      setLangStatus('failed');
    }
  }, []);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (languages.length === 0) {
      void fetchLanguages();
    }
  }, [fetchLanguages, languages.length]);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(''), 3400);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const statusLines = useMemo(
    () => [
      `Reading about ${shorten(topic || 'your topic', 36)}...`,
      `Walking through ${shorten(place || 'your place', 36)}...`,
      `Thinking in ${langLabel}...`,
      'Finding free materials near you...',
      'Writing your say-it-back prompts...',
    ],
    [topic, place, langLabel]
  );

  useEffect(() => {
    if (phase !== 'composing') return;
    setStatusIndex(0);
    setElapsed(0);
    const spinner = setInterval(() => setStatusIndex((index) => index + 1), 2600);
    const ticker = setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
    return () => {
      clearInterval(spinner);
      clearInterval(ticker);
    };
  }, [phase]);

  const compose = useCallback(
    async (codeOverride?: string) => {
      const code = codeOverride ?? languageCode;
      const nextErrors: Record<string, string> = {};
      if (topic.trim().length < 2) nextErrors.topic = 'Give Julley the chapter or concept name.';
      if (place.trim().length < 2) nextErrors.place = 'Your village, town, or district is enough.';
      if (!code) nextErrors.languageCode = 'Pick the language you think in.';
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        if (nextErrors.languageCode && !nextErrors.topic && !nextErrors.place) {
          setPickerOpen(true);
        }
        return;
      }

      setPhase('composing');
      setLesson(null);
      setFailMessage('');
      setAskedPlace(place.trim());
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      try {
        // Invisible Turnstile token, only when the site is configured for it
        // (NEXT_PUBLIC_TURNSTILE_SITE_KEY set). Absent config = no challenge,
        // no extra field — Julley stays "free forever, no account".
        const turnstileToken = await getTurnstileToken();
        const res = await fetch('/api/lesson', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            topic: topic.trim(),
            place: place.trim(),
            languageCode: code,
            age,
            ...(turnstileToken ? { turnstileToken } : {}),
          }),
        });
        const body = (await res.json().catch(() => null)) as ApiEnvelope<ComposedLesson> | null;
        if (!res.ok || !body || !body.data) {
          const apiError = body && body.error ? body.error : null;
          if (apiError && apiError.fields) {
            setErrors((prev) => ({ ...prev, ...apiError.fields }));
          }
          setFailMessage(
            apiError?.message ?? 'The lesson did not come together this time. Please try once more.'
          );
          setPhase('failed');
          return;
        }
        setLesson(body.data);
        setPhase('ready');
        showToast('Julley! Your lesson is ready.');
      } catch {
        setFailMessage('We could not reach Julley. Check your connection and try again.');
        setPhase('failed');
      }
    },
    [age, languageCode, place, showToast, topic]
  );

  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPickerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const focusTimer = setTimeout(() => searchRef.current?.focus(), 30);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(focusTimer);
      document.body.style.overflow = '';
      pickerTriggerRef.current?.focus();
    };
  }, [pickerOpen]);

  const groupedLanguages = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? languages.filter(
          (lang) =>
            lang.name_english.toLowerCase().includes(query) ||
            lang.name_native.toLowerCase().includes(query) ||
            lang.code.includes(query) ||
            lang.script.toLowerCase().includes(query)
        )
      : languages;
    const byCategory = new Map<JulleyLanguageCategory, JulleyLanguage[]>();
    for (const lang of filtered) {
      const bucket = byCategory.get(lang.category) ?? [];
      bucket.push(lang);
      byCategory.set(lang.category, bucket);
    }
    return (Object.keys(CATEGORY_META) as JulleyLanguageCategory[])
      .sort((a, b) => CATEGORY_META[a].order - CATEGORY_META[b].order)
      .map((category) => ({ category, label: CATEGORY_META[category].label, items: byCategory.get(category) ?? [] }))
      .filter((group) => group.items.length > 0);
  }, [languages, search]);

  function clearError(key: string) {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function pickLanguage(code: string) {
    setLanguageCode(code);
    clearError('languageCode');
    setPickerOpen(false);
    setSearch('');
    if (recomposeOnPick.current) {
      recomposeOnPick.current = false;
      void compose(code);
    }
  }

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setTopic(example.topic);
    setPlace(example.place);
    setLanguageCode(example.code);
    setAge(example.age);
    setErrors({});
    setCtaPulse(true);
    setTimeout(() => setCtaPulse(false), 1600);
  }

  function startNewTopic() {
    setLesson(null);
    setPhase('idle');
    setTopic('');
    setErrors({});
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => topicRef.current?.focus(), 350);
  }

  function sameTopicNewLanguage() {
    recomposeOnPick.current = true;
    setPickerOpen(true);
  }

  async function copyLesson() {
    if (!lesson) return;
    try {
      await navigator.clipboard.writeText(buildLessonText(lesson));
      showToast('Copied. Share it with someone at home.');
    } catch {
      showToast('Copy did not work on this browser.');
    }
  }

  const composing = phase === 'composing';

  return (
    <div className="w-full">
      <form
        ref={formRef}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void compose();
        }}
        className="scroll-mt-24 rounded-3xl border border-amber-100 bg-white p-6 shadow-xl shadow-amber-900/5 md:p-10"
      >
        <div className="space-y-7">
          <div>
            <label className="flex flex-wrap items-baseline gap-x-3 gap-y-2 text-xl font-medium text-stone-800 md:text-2xl">
              <span>I need to learn</span>
              <input
                ref={topicRef}
                type="text"
                value={topic}
                onChange={(event) => {
                  setTopic(event.target.value);
                  clearError('topic');
                }}
                disabled={composing}
                maxLength={200}
                placeholder="photosynthesis, fractions, the Mughal empire..."
                aria-invalid={Boolean(errors.topic)}
                aria-describedby={errors.topic ? 'topic-error' : undefined}
                className="min-w-[14rem] flex-1 border-0 border-b-2 border-dashed border-amber-400 bg-transparent px-1 pb-1 text-xl font-semibold text-amber-900 placeholder:font-normal placeholder:text-stone-300 focus:border-solid focus:border-amber-600 md:text-2xl"
              />
            </label>
            {errors.topic && (
              <p id="topic-error" className="mt-2 text-sm font-medium text-red-700">
                {errors.topic}
              </p>
            )}
          </div>

          <div>
            <label className="flex flex-wrap items-baseline gap-x-3 gap-y-2 text-xl font-medium text-stone-800 md:text-2xl">
              <span>I live in</span>
              <input
                type="text"
                value={place}
                onChange={(event) => {
                  setPlace(event.target.value);
                  clearError('place');
                }}
                disabled={composing}
                maxLength={120}
                placeholder="your village, town, or city"
                aria-invalid={Boolean(errors.place)}
                aria-describedby={errors.place ? 'place-error' : undefined}
                className="min-w-[14rem] flex-1 border-0 border-b-2 border-dashed border-amber-400 bg-transparent px-1 pb-1 text-xl font-semibold text-amber-900 placeholder:font-normal placeholder:text-stone-300 focus:border-solid focus:border-amber-600 md:text-2xl"
              />
            </label>
            {errors.place && (
              <p id="place-error" className="mt-2 text-sm font-medium text-red-700">
                {errors.place}
              </p>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-3 text-xl font-medium text-stone-800 md:text-2xl">
              <span>Teach me in</span>
              <button
                ref={pickerTriggerRef}
                type="button"
                onClick={() => setPickerOpen(true)}
                disabled={composing}
                aria-haspopup="dialog"
                aria-expanded={pickerOpen}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-2 text-left transition-colors hover:border-amber-500"
              >
                {selectedLanguage ? (
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span dir="auto" className="text-lg font-bold text-amber-900">
                      {selectedLanguage.name_native}
                    </span>
                    <span className="text-sm font-medium text-stone-500">{selectedLanguage.name_english}</span>
                  </span>
                ) : (
                  <span className="text-lg font-semibold text-amber-700">pick your language</span>
                )}
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <label className="flex items-center gap-3">
                <span>and I am</span>
                <select
                  value={age}
                  onChange={(event) => setAge(Number(event.target.value))}
                  disabled={composing}
                  className="min-h-[48px] rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2 text-lg font-bold text-amber-900 transition-colors hover:border-amber-500"
                >
                  {AGES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <span>years old.</span>
            </div>
            {errors.languageCode && (
              <p className="mt-2 text-sm font-medium text-red-700">{errors.languageCode}</p>
            )}
            {langStatus === 'failed' && (
              <p className="mt-2 text-sm text-stone-600">
                The language list did not load.{' '}
                <button
                  type="button"
                  onClick={() => void fetchLanguages()}
                  className="font-semibold text-amber-800 underline underline-offset-2"
                >
                  Load it again
                </button>
              </p>
            )}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={composing}
              className={cx(
                'inline-flex w-full items-center justify-center rounded-2xl bg-amber-700 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-amber-700/25 transition-all hover:bg-amber-800 hover:shadow-xl active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 sm:w-auto',
                ctaPulse && 'animate-pulse'
              )}
            >
              {composing ? `Composing in ${langLabel}...` : 'Julley, teach me'}
            </button>
            <p className="mt-3 text-sm text-stone-500">
              Free forever. No account. Nothing you type is stored anywhere.
            </p>
          </div>

          {phase === 'idle' && !lesson && (
            <div className="border-t border-amber-100 pt-6">
              <p className="text-sm font-semibold text-stone-600">No idea where to start? Tap one:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <button
                    key={example.topic}
                    type="button"
                    onClick={() => applyExample(example)}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm transition-colors hover:border-amber-500 hover:bg-amber-50"
                  >
                    <span className="font-semibold text-stone-800">{example.topic}</span>
                    <span className="text-stone-500">in {example.langLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>

      <div ref={resultRef} className="scroll-mt-24">
        {composing && (
          <div aria-busy="true" className="mt-8">
            <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-xl shadow-amber-900/5 md:p-10">
              <p role="status" className="text-lg font-semibold text-amber-800">
                {statusLines[statusIndex % statusLines.length]}
              </p>
              {elapsed >= 15 && (
                <p className="mt-2 text-sm text-stone-500">
                  Longer topics can take up to a minute. Julley writes every word in {langLabel}, it does not
                  translate.
                </p>
              )}
              <div className="mt-6 space-y-6">
                <div className="skeleton h-9 w-3/4" />
                <div className="space-y-3">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-11/12" />
                  <div className="skeleton h-4 w-4/5" />
                </div>
                <div className="space-y-3">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-10/12" />
                </div>
                <div className="skeleton h-44 w-full rounded-2xl" />
                <div className="skeleton h-28 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {phase === 'failed' && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 md:p-8">
            <h2 className="font-display text-xl text-red-900">That one did not come together</h2>
            <p className="mt-2 leading-7 text-red-800">{failMessage}</p>
            <button type="button" onClick={() => void compose()} className="btn-primary mt-5 px-8">
              Try again
            </button>
          </div>
        )}

        {phase === 'ready' && lesson && (
          <article
            dir={lesson.language.direction}
            className="pop-in mt-8 rounded-3xl border border-amber-100 bg-white p-6 shadow-xl shadow-amber-900/5 md:p-10"
          >
            <div dir="ltr" className="flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                <span dir="auto">{lesson.language.name_native}</span> · {lesson.language.name_english}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
                {lesson.age_band.label}
              </span>
              {askedPlace && (
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
                  Set in {shorten(askedPlace, 32)}
                </span>
              )}
            </div>

            <h2 className="rise-in mt-5 font-display text-3xl leading-snug text-stone-900 md:text-4xl">
              {lesson.title}
            </h2>

            {lesson.refused && lesson.refusal_note && (
              <div className="rise-in rise-1 mt-6 rounded-2xl border border-amber-300 bg-amber-100/70 p-5">
                <p className="lesson-native text-lg font-medium text-amber-950">{lesson.refusal_note}</p>
                <p dir="ltr" className="mt-3 text-sm text-amber-900/80">
                  Julley never hands over exam answers or text to submit. Here is the idea itself, retaught for
                  you.
                </p>
              </div>
            )}

            <div className="mt-6 space-y-8">
              {lesson.sections.map((section, index) => (
                <section key={section.heading + index} className={cx('rise-in', `rise-${Math.min(index + 1, 5)}`)}>
                  <h3 className="font-display text-xl text-amber-800 md:text-2xl">{section.heading}</h3>
                  {section.body.split('\n').map(
                    (paragraph, pIndex) =>
                      paragraph.trim().length > 0 && (
                        <p key={pIndex} className="lesson-native mt-3 text-lg text-stone-800">
                          {paragraph}
                        </p>
                      )
                  )}
                </section>
              ))}

              <section className="rise-in rise-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8">
                <p dir="ltr" className="text-xs font-bold uppercase tracking-widest text-amber-700">
                  Try it with your hands
                </p>
                <h3 className="mt-2 font-display text-xl text-stone-900 md:text-2xl">{lesson.activity.title}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {lesson.activity.materials.map((material) => (
                    <span
                      key={material}
                      className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-base text-stone-800"
                    >
                      {material}
                    </span>
                  ))}
                </div>
                <ol className="lesson-native mt-5 list-decimal space-y-3 ps-6 text-lg text-stone-800 marker:font-bold marker:text-amber-700">
                  {lesson.activity.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </section>

              <section className="rise-in rise-4 rounded-2xl border border-sky-200 bg-sky-50 p-6 md:p-8">
                <p dir="ltr" className="text-xs font-bold uppercase tracking-widest text-sky-700">
                  Say it back
                </p>
                <ul className="mt-4 space-y-3">
                  {lesson.explain_back.map((prompt, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        viewBox="0 0 24 24"
                        className="mt-1.5 h-5 w-5 shrink-0 text-sky-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 01-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 111
6.1-3.8z" />
                      </svg>
                      <span className="lesson-native text-lg text-stone-800">{prompt}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <figure className="rise-in rise-5 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 p-7 text-amber-50 md:p-9">
                <p dir="ltr" className="text-xs font-bold uppercase tracking-widest text-amber-200">
                  From the Julley philosophy
                </p>
                <blockquote className="lesson-native mt-3 font-display text-2xl leading-relaxed text-white md:text-3xl">
                  {lesson.spirit_line.text}
                </blockquote>
                {lesson.language.code !== 'en' && (
                  <figcaption dir="ltr" className="mt-3 text-sm text-amber-100/90">
                    {lesson.spirit_line.english}
                  </figcaption>
                )}
              </figure>
            </div>

            <div dir="ltr" className="mt-8 border-t border-amber-100 pt-6">
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => void copyLesson()} className="btn-secondary">
                  Copy lesson
                </button>
                <button type="button" onClick={sameTopicNewLanguage} className="btn-secondary">
                  Same topic, another language
                </button>
                <button type="button" onClick={startNewTopic} className="btn-primary">
                  New topic
                </button>
              </div>
              <p className="mt-4 text-sm text-stone-500">
                Tonight, teach this to someone at home in your own words. That is the real exam.
              </p>
            </div>
          </article>
        )}
      </div>

      {pickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pick your language"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          <button
            type="button"
            aria-label="Close language picker"
            onClick={() => setPickerOpen(false)}
            className="absolute inset-0 bg-stone-900/50"
          />
          <div className="pop-in relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between gap-4 border-b border-stone-100 p-4 sm:p-5">
              <h2 className="font-display text-lg text-stone-900">Which language do you think in?</h2>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="Close"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="px-4 pt-4 sm:px-5">
              <label htmlFor="language-search" className="sr-only">
                Search languages
              </label>
              <input
                id="language-search"
                ref={searchRef}
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${languages.length || 37} languages`}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base placeholder:text-stone-400"
              />
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-5">
              {langStatus === 'loading' && (
                <div className="space-y-2" aria-busy="true">
                  <div className="skeleton h-14 w-full rounded-xl" />
                  <div className="skeleton h-14 w-full rounded-xl" />
                  <div className="skeleton h-14 w-full rounded-xl" />
                  <div className="skeleton h-14 w-full rounded-xl" />
                </div>
              )}
              {langStatus === 'failed' && (
                <div className="py-8 text-center">
                  <p className="text-stone-600">The language list did not load just now.</p>
                  <button type="button" onClick={() => void fetchLanguages()} className="btn-primary mt-4">
                    Load languages again
                  </button>
                </div>
              )}
              {langStatus === 'ready' && groupedLanguages.length === 0 && (
                <p className="py-8 text-center text-stone-600">
                  No match. Try the English name, like Tamil or Urdu.
                </p>
              )}
              {langStatus === 'ready' &&
                groupedLanguages.map((group) => (
                  <div key={group.category}>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                      {group.label}
                    </h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {group.items.map((lang) => {
                        const selected = lang.code === languageCode;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => pickLanguage(lang.code)}
                            className={cx(
                              'flex min-h-[52px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                              selected
                                ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600'
                                : 'border-stone-200 hover:border-amber-400 hover:bg-amber-50/50'
                            )}
                          >
                            <span className="flex min-w-0 flex-col">
                              <span dir="auto" className="truncate text-lg font-bold leading-tight text-stone-900">
                                {lang.name_native}
                              </span>
                              <span className="truncate text-xs text-stone-500">
                                {lang.name_english} · {lang.script}
                              </span>
                            </span>
                            {selected && (
                              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div role="status" className="pop-in rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-amber-50 shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
