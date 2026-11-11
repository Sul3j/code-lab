import { useEffect, useRef, useState } from 'react';
import { useLang } from '../lib/lang-context.js';
import {
  TerminalSquare, ListChecks, Trash2, CheckCircle2, XCircle, AlertTriangle, Loader2, CornerDownLeft, ArrowRight,
} from 'lucide-react';

const KIND_LABEL = {
  compile: 'Błąd kompilacji',
  runtime: 'Błąd wykonania',
  limit: 'Program przerwany',
  internal: 'Błąd środowiska',
};

function StatusPill({ status }) {
  const map = {
    idle: ['bg-[#2d2d30] text-gray-400', 'Gotowy'],
    running: ['bg-sky-900/60 text-sky-300', 'Działa…'],
    waiting: ['bg-amber-900/50 text-amber-300', 'Czeka na dane'],
    done: ['bg-emerald-900/50 text-emerald-300', 'Zakończony'],
    error: ['bg-red-900/50 text-red-300', 'Błąd'],
    stopped: ['bg-[#3a3a3d] text-gray-300', 'Zatrzymany'],
  };
  const [cls, label] = map[status] || map.idle;
  return (
    <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>
      {status === 'running' && <Loader2 size={11} className="animate-spin" />}
      {label}
    </span>
  );
}

export function ErrorBox({ error, onGoToLine }) {
  const { id: langId } = useLang();
  if (!error) return null;
  const label = langId === 'python' && error.kind === 'compile' ? 'Błąd składni' : KIND_LABEL[error.kind];
  return (
    <div className="mt-2 rounded-md border border-red-800/70 bg-red-950/40 px-3 py-2 font-sans text-[13px] text-red-200">
      <div className="flex items-start gap-2">
        <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-red-300">
            {label || 'Błąd'}{error.line ? ` (linia ${error.line})` : ''}:
          </span>{' '}
          <span className="break-words">{error.message}</span>
          {error.line && onGoToLine ? (
            <button
              onClick={() => onGoToLine(error.line)}
              className="ml-2 inline-flex items-center gap-1 rounded bg-red-900/60 px-1.5 py-0.5 text-[11px] text-red-100 hover:bg-red-800/80"
            >
              przejdź do linii <ArrowRight size={11} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Warnings({ warnings, onGoToLine }) {
  if (!warnings || !warnings.length) return null;
  return (
    <div className="mb-2 space-y-1 font-sans text-[12.5px]">
      {warnings.map((w, k) => (
        <div key={k} className="flex items-start gap-2 text-amber-300/90">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            Ostrzeżenie{w.line ? (
              <button className="underline decoration-dotted hover:text-amber-200" onClick={() => onGoToLine?.(w.line)}> (linia {w.line})</button>
            ) : ''}: {w.message}
          </span>
        </div>
      ))}
    </div>
  );
}

function ConsoleView({ run, onSubmitInput, onGoToLine, pyStatus }) {
  const { lang } = useLang();
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const [line, setLine] = useState('');

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [run.segments, run.status, run.error]);

  useEffect(() => {
    if (run.status === 'waiting') {
      setLine('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [run.status, run.inputCount]);

  const submit = (e) => {
    e.preventDefault();
    if (run.status !== 'waiting') return;
    onSubmitInput(line);
    setLine('');
  };

  const empty = run.status === 'idle' && !run.segments.length;

  return (
    <div
      ref={bodyRef}
      className="h-full overflow-auto bg-black px-4 py-3 font-mono text-[13px] leading-[1.55]"
      onClick={() => run.status === 'waiting' && inputRef.current?.focus()}
    >
      {empty ? (
        <div className="font-sans text-[13px] text-gray-500">
          <p className="mb-1 text-gray-400">Konsola programu</p>
          <p>Naciśnij <kbd className="rounded border border-[#444] bg-[#1e1e1e] px-1.5 text-[11px] text-gray-300">Ctrl</kbd> + <kbd className="rounded border border-[#444] bg-[#1e1e1e] px-1.5 text-[11px] text-gray-300">Enter</kbd> lub przycisk <span className="text-emerald-400">Uruchom</span>, aby uruchomić program.</p>
          <p className="mt-1">Gdy program użyje <code className="text-[#d7ba7d]">{lang.inputName}</code>, wpisz dane tutaj i zatwierdź Enterem.</p>
        </div>
      ) : (
        <>
          <div className="mb-1 select-none text-[12px] text-gray-500">{lang.command}</div>
          {lang.id === 'python' && pyStatus === 'loading' && (run.status === 'running' || run.status === 'waiting') && (
            <div className="mb-1 flex select-none items-center gap-1.5 font-sans text-[12px] text-sky-300">
              <Loader2 size={12} className="animate-spin" /> Ładowanie interpretera Pythona (Pyodide)… pierwsze uruchomienie może potrwać kilkanaście sekund
            </div>
          )}
          {lang.id === 'python' && pyStatus === 'error' && (
            <div className="mb-1 select-none font-sans text-[12px] text-red-300">Nie udało się pobrać interpretera Pythona – sprawdź połączenie z internetem i spróbuj ponownie.</div>
          )}
          <Warnings warnings={run.warnings} onGoToLine={onGoToLine} />
          <pre className="m-0 whitespace-pre-wrap break-words font-mono">
            {run.segments.map((s, k) => (
              <span
                key={k}
                className={s.type === 'in' ? 'font-semibold text-white' : (s.type === 'err' ? 'text-red-400' : 'text-[#4af626]')}
              >
                {s.text}
              </span>
            ))}
            {run.status === 'waiting' && (
              <form onSubmit={submit} className="inline">
                <input
                  ref={inputRef}
                  value={line}
                  onChange={(e) => setLine(e.target.value)}
                  className="inline-block min-w-[2ch] bg-transparent font-mono font-semibold text-white caret-white outline-none"
                  style={{ width: `${Math.max(line.length + 2, 12)}ch` }}
                  aria-label="Dane wejściowe programu"
                  spellCheck={false}
                  autoComplete="off"
                />
              </form>
            )}
            {run.status === 'running' && <span className="caret-blink text-[#4af626]">▋</span>}
          </pre>
          {run.status === 'waiting' && (
            <div className="mt-1 flex select-none items-center gap-1.5 font-sans text-[11.5px] text-amber-300/80">
              <CornerDownLeft size={12} /> Program czeka na dane ({lang.inputName}) – wpisz wartość i naciśnij Enter
            </div>
          )}
          <ErrorBox error={run.error} onGoToLine={onGoToLine} />
          {run.status === 'done' && (
            <div className="mt-2 select-none font-sans text-[12px] text-gray-500">
              ── Proces zakończony z kodem <span className={run.exitCode === 0 ? 'text-emerald-400' : 'text-amber-400'}>{run.exitCode}</span>
              {typeof run.ms === 'number' ? ` · ${run.ms} ms` : ''} ──
            </div>
          )}
          {run.status === 'stopped' && (
            <div className="mt-2 select-none font-sans text-[12px] text-gray-400">── Program zatrzymany przez użytkownika ──</div>
          )}
        </>
      )}
    </div>
  );
}

function TestsView({ tests, task }) {
  if (!task) {
    return (
      <div className="p-4 font-sans text-[13px] text-gray-500">
        Testy automatyczne są dostępne w zadaniach. Wybierz zadanie z panelu bocznego i kliknij <span className="text-sky-400">Sprawdź rozwiązanie</span>.
      </div>
    );
  }
  if (!tests || (!tests.running && !tests.results)) {
    return (
      <div className="p-4 font-sans text-[13px] text-gray-500">
        To zadanie ma {task.tests.length} test(ów). Kliknij <span className="text-sky-400">Sprawdź rozwiązanie</span>, aby uruchomić program na przygotowanych danych.
      </div>
    );
  }
  const results = tests.results || [];
  const passed = results.filter((r) => r.ok).length;
  return (
    <div className="h-full overflow-auto bg-[#111] p-3 font-sans text-[13px]">
      {tests.running ? (
        <div className="mb-2 flex items-center gap-2 text-sky-300"><Loader2 size={14} className="animate-spin" /> Sprawdzanie… ({results.length}/{task.tests.length})</div>
      ) : (
        <div className={`mb-3 flex items-center gap-2 font-semibold ${tests.allOk ? 'text-emerald-400' : 'text-amber-300'}`}>
          {tests.allOk ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          Zaliczone testy: {passed}/{task.tests.length}
          {tests.checks?.some((c) => !c.ok) ? ' · niespełnione wymagania zadania' : ''}
        </div>
      )}
      {tests.checks?.length ? (
        <div className="mb-3 space-y-1">
          {tests.checks.map((c, k) => (
            <div key={k} className={`flex items-center gap-2 ${c.ok ? 'text-emerald-300/90' : 'text-red-300'}`}>
              {c.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {c.message}
            </div>
          ))}
        </div>
      ) : null}
      <div className="space-y-2">
        {results.map((r, k) => (
          <details key={k} open={!r.ok} className={`rounded-md border ${r.ok ? 'border-emerald-900/60 bg-emerald-950/20' : 'border-red-900/60 bg-red-950/20'}`}>
            <summary className="flex cursor-pointer select-none items-center gap-2 px-3 py-1.5">
              {r.ok ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
              <span className="text-gray-200">Test {k + 1}</span>
              <span className="text-gray-500">{r.ok ? 'zaliczony' : (r.error ? 'błąd programu' : 'zły wynik')}</span>
            </summary>
            <div className="grid gap-2 px-3 pb-3 pt-1 md:grid-cols-3">
              <IOBox label="Wejście" text={r.input || '(brak)'} />
              <IOBox label="Oczekiwane wyjście" text={r.expected} />
              <IOBox label="Wyjście programu" text={r.output || '(brak)'} tone={r.ok ? 'ok' : 'bad'} />
            </div>
            {r.error ? <div className="px-3 pb-3"><ErrorBox error={r.error} /></div> : null}
          </details>
        ))}
      </div>
      {!tests.running && !tests.allOk && (
        <p className="mt-3 text-[12px] text-gray-500">
          Wskazówka: test porównuje linie wyniku. Komunikaty typu „Podaj liczbę:” są dozwolone, ale sam wynik musi mieć dokładnie taki format jak w treści zadania.
        </p>
      )}
    </div>
  );
}

function IOBox({ label, text, tone }) {
  const color = tone === 'ok' ? 'text-[#4af626]' : tone === 'bad' ? 'text-red-300' : 'text-gray-200';
  return (
    <div className="min-w-0">
      <div className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <pre className={`max-h-32 overflow-auto rounded bg-black/70 p-2 font-mono text-[12px] ${color}`}>{text}</pre>
    </div>
  );
}

export default function Terminal({ tab, onTab, run, tests, task, onSubmitInput, onClear, onGoToLine, pyStatus }) {
  const tabBtn = (id, Icon, label, badge) => (
    <button
      onClick={() => onTab(id)}
      className={`flex h-full items-center gap-1.5 border-b-2 px-3 text-[12px] uppercase tracking-wide transition-colors ${tab === id ? 'border-sky-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
    >
      <Icon size={14} /> {label}
      {badge}
    </button>
  );
  const testBadge = tests?.results && !tests.running ? (
    <span className={`ml-1 rounded-full px-1.5 text-[10px] font-bold ${tests.allOk ? 'bg-emerald-700 text-white' : 'bg-red-800 text-white'}`}>
      {tests.results.filter((r) => r.ok).length}/{task?.tests.length}
    </span>
  ) : null;
  return (
    <div className="flex h-full min-h-0 flex-col border-t border-[#2b2b2b] bg-[#181818]">
      <div className="flex h-9 shrink-0 items-center justify-between pr-2">
        <div className="flex h-full">
          {tabBtn('console', TerminalSquare, 'Konsola')}
          {tabBtn('tests', ListChecks, 'Testy', testBadge)}
        </div>
        <div className="flex items-center gap-2">
          {tab === 'console' && <StatusPill status={run.status} />}
          {tab === 'console' && (
            <button onClick={onClear} title="Wyczyść konsolę" className="rounded p-1 text-gray-500 hover:bg-[#2d2d30] hover:text-gray-200">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1">
        {tab === 'console'
          ? <ConsoleView run={run} onSubmitInput={onSubmitInput} onGoToLine={onGoToLine} pyStatus={pyStatus} />
          : <TestsView tests={tests} task={task} />}
      </div>
    </div>
  );
}
