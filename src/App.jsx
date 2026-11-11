import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play, Square, RotateCcw, Copy, Check, Minus, Plus, BookMarked, PanelLeftClose, PanelLeftOpen,
  Code2, Trophy, FileCode2, PanelRightClose, BookOpen, X, Cpu, Info,
} from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import LessonPanel from './components/LessonPanel.jsx';
import CodeEditor from './components/CodeEditor.jsx';
import Terminal from './components/Terminal.jsx';
import CheatSheet from './components/CheatSheet.jsx';
import { getCourse } from './data/course.js';
import { Runner, runWithInput, checkOutput, pyEngine } from './interpreter/runner.js';
import { loadState, saveState } from './lib/storage.js';
import { LANGS, LANG_ORDER, langOf } from './lib/lang.js';
import { LangContext } from './lib/lang-context.js';

const IDLE_RUN = { status: 'idle', segments: [], error: null, warnings: [], exitCode: null, ms: null, inputCount: 0 };

// Klucz zapisanego kodu. Dla C++ bez prefiksu – zgodność z zapisem sprzed wersji wielojęzycznej.
function docKey(view, lang) {
  const base = view.type === 'task' ? `task:${view.taskId}` : view.type === 'module' ? `example:${view.moduleId}` : 'sandbox';
  return lang === 'cpp' ? base : `${lang}:${base}`;
}

function defaultCodeFor(view, lang) {
  const course = getCourse(lang);
  const tpl = langOf(lang).template;
  if (view.type === 'task') return course.findTask(view.taskId)?.task.starter ?? tpl;
  if (view.type === 'module') return course.findModule(view.moduleId)?.example.code ?? tpl;
  return tpl;
}

// sprawdza zapisany widok (np. po aktualizacji kursu) i poprawia numer tematu zadania
function normalizeView(v, lang) {
  const course = getCourse(lang);
  if (!v || typeof v !== 'object') return null;
  if (v.type === 'sandbox') return v;
  if (v.type === 'module') return course.findModule(v.moduleId) ? v : null;
  if (v.type === 'task') {
    const f = course.findTask(v.taskId);
    return f ? { type: 'task', moduleId: f.module.id, taskId: v.taskId } : null;
  }
  return null;
}

function fileNameFor(view, lang) {
  const L = langOf(lang);
  if (view.type === 'task') return `${view.taskId}.${L.ext}`;
  if (view.type === 'module') return `temat_${String(getCourse(lang).findModule(view.moduleId)?.number ?? '').padStart(2, '0')}.${L.ext}`;
  return L.mainFile;
}

function initialViews(saved) {
  const views = {};
  const src = saved.views && typeof saved.views === 'object' ? saved.views : { cpp: saved.view };
  for (const id of LANG_ORDER) views[id] = normalizeView(src[id], id) || { type: 'sandbox' };
  return views;
}

function LangSwitcher({ value, onChange }) {
  return (
    <div className="flex items-center rounded-lg border border-[#3a3a3d] bg-[#252528] p-0.5" role="tablist" aria-label="Język programowania">
      {LANG_ORDER.map((id) => {
        const L = LANGS[id];
        const active = id === value;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`rounded-md px-2.5 py-1 text-[12.5px] font-semibold transition-colors sm:px-3 ${active ? `bg-gradient-to-br ${L.gradient} text-white shadow` : 'text-gray-400 hover:bg-[#2d2d30] hover:text-white'}`}
            title={`Kurs języka ${L.label}`}
          >
            {L.label}
          </button>
        );
      })}
    </div>
  );
}

function ConfirmDialog({ dialog, onClose }) {
  useEffect(() => {
    if (!dialog) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog, onClose]);
  if (!dialog) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="pop-in w-full max-w-md rounded-xl border border-[#3a3a3d] bg-[#252528] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3 className="mb-2 text-[16px] font-semibold text-white">{dialog.title}</h3>
        <p className="mb-5 text-[14px] leading-relaxed text-gray-300">{dialog.message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md px-3 py-1.5 text-[13px] text-gray-300 hover:bg-[#3a3a3d]">Anuluj</button>
          <button
            autoFocus
            onClick={() => { dialog.onConfirm(); onClose(); }}
            className={`rounded-md px-3 py-1.5 text-[13px] font-medium text-white ${dialog.danger ? 'bg-red-600 hover:bg-red-500' : 'bg-sky-600 hover:bg-sky-500'}`}
          >
            {dialog.confirmLabel || 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onClose, toast.duration || 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  return (
    <div className="pop-in fixed bottom-10 right-5 z-[70] flex items-center gap-3 rounded-lg border border-[#3a3a3d] bg-[#252528] px-4 py-3 shadow-2xl">
      {toast.icon === 'trophy' ? <Trophy size={20} className="text-amber-300" /> : <Check size={18} className="text-emerald-400" />}
      <div>
        <div className="text-[13.5px] font-medium text-white">{toast.title}</div>
        {toast.text && <div className="text-[12px] text-gray-400">{toast.text}</div>}
      </div>
      <button onClick={onClose} className="ml-2 text-gray-500 hover:text-white"><X size={14} /></button>
    </div>
  );
}

export default function App() {
  const saved = useMemo(loadState, []);
  const [lang, setLang] = useState(() => (LANGS[saved.lang] ? saved.lang : 'cpp'));
  const [views, setViews] = useState(() => initialViews(saved));
  const view = views[lang];
  const setView = useCallback((v) => setViews((p) => ({ ...p, [lang]: v })), [lang]);
  const course = getCourse(lang);
  const L = langOf(lang);
  const { ALL_TASKS, findTask, findModule } = course;
  const [pyStatus, setPyStatus] = useState('idle');
  const [codes, setCodes] = useState(() => saved.codes || {});
  const [done, setDone] = useState(() => saved.done || {});
  const [fontSize, setFontSize] = useState(() => saved.fontSize || 14);
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= 1024));
  const [lessonOpen, setLessonOpen] = useState(true);
  const [cheatOpen, setCheatOpen] = useState(false);
  const [run, setRun] = useState(IDLE_RUN);
  const [tests, setTests] = useState(null);
  const [termTab, setTermTab] = useState('console');
  const [termHeight, setTermHeight] = useState(() => saved.termHeight || 280);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const runnerRef = useRef(null);
  if (!runnerRef.current) runnerRef.current = new Runner();
  const sessionRef = useRef(null);
  const editorRef = useRef(null);
  const checkToken = useRef(0);

  const key = docKey(view, lang);
  const taskCtx = view.type === 'task' ? findTask(view.taskId) : null;
  const code = codes[key] ?? defaultCodeFor(view, lang);

  const setCode = useCallback((c) => setCodes((p) => ({ ...p, [key]: c })), [key]);

  useEffect(() => {
    saveState({ lang, views, codes, done, fontSize, termHeight });
  }, [lang, views, codes, done, fontSize, termHeight]);

  useEffect(() => pyEngine.onStatus(setPyStatus), []);
  // Python: pobierz interpreter w tle od razu po wybraniu języka
  useEffect(() => { if (lang === 'python') pyEngine.ensure(); }, [lang]);

  // zmiana widoku – zatrzymaj program i wyczyść konsolę
  useEffect(() => {
    runnerRef.current.stop();
    checkToken.current++;
    setRun(IDLE_RUN);
    setTests(null);
    setTermTab('console');
  }, [key]);

  const select = useCallback((v) => {
    setView(v);
    if (window.innerWidth < 1024) setSidebarOpen(false);
    setLessonOpen(true);
  }, [setView]);

  const runCode = useCallback(() => {
    setTermTab('console');
    setRun({ ...IDLE_RUN, status: 'running' });
    sessionRef.current = runnerRef.current.start(code, {
      lang,
      onUpdate: (segments, waiting) => setRun((r) => ({ ...r, segments, status: waiting ? 'waiting' : 'running' })),
      onNeedInput: () => setRun((r) => ({ ...r, status: 'waiting', inputCount: r.inputCount + 1 })),
      onFinish: (result, segments) => setRun({
        status: result.status === 'error' ? 'error' : 'done',
        segments,
        error: result.error,
        warnings: result.warnings || [],
        exitCode: result.exitCode,
        ms: result.ms,
        inputCount: 0,
      }),
    });
  }, [code, lang]);

  const stopCode = useCallback(() => {
    if (runnerRef.current.stop()) setRun((r) => ({ ...r, status: 'stopped' }));
  }, []);

  const submitInput = useCallback((line) => {
    sessionRef.current?.provideInput(line);
    setRun((r) => ({ ...r, status: 'running' }));
  }, []);

  const checkTask = useCallback(async () => {
    if (!taskCtx) return;
    const { task } = taskCtx;
    runnerRef.current.stop();
    const token = ++checkToken.current;
    setTermTab('tests');
    const stripped = lang === 'python'
      ? code.replace(/#[^\n]*/g, '')
      : code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    const checks = (task.checks || []).map((c) => ({ message: c.message, ok: new RegExp(c.pattern).test(stripped) }));
    const results = [];
    setTests({ running: true, results: [], checks });
    for (const t of task.tests) {
      const r = await runWithInput(code, t.input, lang === 'python' ? 6000 : 4000, lang);
      if (token !== checkToken.current) return;
      const output = (r.segments || []).filter((s) => s.type === 'out').map((s) => s.text).join('');
      const ok = r.status === 'done' && checkOutput(output, t.expected);
      results.push({ input: t.input, expected: t.expected, output, ok, error: r.error });
      setTests({ running: true, results: [...results], checks });
      if (r.status === 'error' && r.error?.kind === 'compile') {
        for (const rest of task.tests.slice(results.length)) {
          results.push({ input: rest.input, expected: rest.expected, output: '', ok: false, error: r.error });
        }
        break;
      }
    }
    const allOk = results.every((r) => r.ok) && checks.every((c) => c.ok);
    setTests({ running: false, results, checks, allOk });
    if (allOk) {
      setDone((d) => ({ ...d, [task.id]: true }));
      setToast({ icon: 'trophy', title: 'Zadanie zaliczone!', text: `„${task.title}” – wszystkie testy przeszły.`, duration: 4000 });
    }
  }, [taskCtx, code, lang]);

  const loadCode = useCallback((newCode, label) => {
    const target = L.ensure(newCode);
    if (code === target) return;
    setDialog({
      title: `${label}: zastąpić kod w edytorze?`,
      message: 'Obecna zawartość edytora zostanie zastąpiona. Tej operacji nie można cofnąć przyciskiem Ctrl+Z.',
      confirmLabel: 'Zastąp kod',
      onConfirm: () => setCode(target),
    });
  }, [code, setCode, L]);

  const resetCode = useCallback(() => {
    const def = defaultCodeFor(view, lang);
    setDialog({
      title: 'Zresetować kod?',
      message: view.type === 'task'
        ? 'Edytor wróci do kodu startowego tego zadania. Twoje zmiany zostaną utracone.'
        : view.type === 'module' ? 'Edytor wróci do oryginalnego kodu przykładu.' : 'Edytor zostanie wypełniony szablonem startowym nowego projektu.',
      confirmLabel: 'Resetuj',
      danger: true,
      onConfirm: () => setCode(def),
    });
  }, [view, lang, setCode]);

  const insertSnippet = useCallback((snippet) => {
    editorRef.current?.insertAtCursor(snippet);
    setTimeout(() => setCodes((p) => ({ ...p, [key]: L.ensure(p[key] ?? defaultCodeFor(view, lang)) })), 0);
  }, [key, view, lang, L]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* brak schowka */ }
  };

  const resetProgress = () => setDialog({
    title: `Wyczyścić postęp w kursie ${L.label}?`,
    message: `Usunięte zostaną zaliczenia zadań oraz cały zapisany kod w kursie ${L.label}. Postęp w pozostałych językach zostanie zachowany.`,
    confirmLabel: 'Wyczyść postęp',
    danger: true,
    onConfirm: () => {
      const ids = new Set(ALL_TASKS.map((t) => t.id));
      const ownsKey = (k) => (lang === 'cpp' ? !/^(csharp|python):/.test(k) : k.startsWith(`${lang}:`));
      setCodes((p) => Object.fromEntries(Object.entries(p).filter(([k]) => !ownsKey(k))));
      setDone((d) => Object.fromEntries(Object.entries(d).filter(([k]) => !ids.has(k))));
    },
  });

  const switchLang = useCallback((id) => {
    if (id === lang) return;
    runnerRef.current.stop();
    setLang(id);
  }, [lang]);

  // przeciąganie granicy między edytorem a konsolą
  const dragRef = useRef(null);
  const startDrag = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = termHeight;
    const move = (ev) => setTermHeight(Math.min(Math.max(startH - (ev.clientY - startY), 120), window.innerHeight - 220));
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const goToLine = useCallback((n) => editorRef.current?.focusLine(n), []);
  const closeCheat = useCallback(() => setCheatOpen(false), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const closeToast = useCallback(() => setToast(null), []);

  const errorLine = (run.error && run.error.line) || (tests?.results?.find((r) => r.error?.kind === 'compile')?.error.line) || null;
  const doneCount = ALL_TASKS.filter((t) => done[t.id]).length;
  const isRunning = run.status === 'running' || run.status === 'waiting';
  const pct = Math.round((doneCount / ALL_TASKS.length) * 100);

  return (
    <LangContext.Provider value={lang}>
    <div className="flex h-full flex-col bg-vsc-bg text-gray-200">
      {/* ─── Nagłówek ─── */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[#2b2b2b] bg-[#1f1f1f] px-3">
        <button onClick={() => setSidebarOpen((o) => !o)} className="rounded-md p-1.5 text-gray-400 hover:bg-[#2d2d30] hover:text-white" title={sidebarOpen ? 'Ukryj panel modułów' : 'Pokaż panel modułów'}>
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
        <div className="flex items-center gap-2.5">
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${L.gradient} font-mono text-[11px] font-bold text-white shadow`}>{L.badge}</span>
          <div className="hidden leading-tight sm:block">
            <div className="text-[14px] font-semibold text-white">School Code Lab</div>
            <div className="hidden text-[11px] text-gray-500 xl:block">Interaktywne laboratorium programowania</div>
          </div>
        </div>
        <LangSwitcher value={lang} onChange={switchLang} />
        <div className="mx-auto hidden items-center gap-3 md:flex">
          <span className="text-[12px] text-gray-400">Postęp</span>
          <div className="h-2 w-48 overflow-hidden rounded-full bg-[#2d2d30]">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[12px] tabular-nums text-gray-300">{doneCount}/{ALL_TASKS.length} zadań</span>
          {doneCount > 0 && (
            <button onClick={resetProgress} className="text-[11px] text-gray-600 hover:text-red-400" title="Wyczyść postęp">wyczyść</button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button onClick={() => setCheatOpen(true)} className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-1.5 text-[13px] font-medium text-amber-300 hover:bg-amber-500/20">
            <BookMarked size={15} /> <span className="hidden sm:inline">Ściąga</span>
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* ─── Panel boczny ─── */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 top-12 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <aside className="fixed bottom-0 left-0 top-12 z-40 w-72 shrink-0 border-r border-[#2b2b2b] lg:static lg:z-auto">
              <Sidebar key={lang} view={view} onSelect={select} done={done} onOpenCheatsheet={() => setCheatOpen(true)} />
            </aside>
          </>
        )}

        <main className="flex min-w-0 flex-1 flex-col lg:flex-row">
          {/* ─── Panel lekcji ─── */}
          {lessonOpen ? (
            <section className="relative max-h-[45vh] min-h-0 shrink-0 overflow-y-auto border-b border-[#2b2b2b] bg-[#1c1c1f] lg:max-h-none lg:w-[42%] lg:max-w-[640px] lg:border-b-0 lg:border-r">
              <button onClick={() => setLessonOpen(false)} className="absolute right-3 top-3 z-10 rounded-md p-1 text-gray-500 hover:bg-[#2d2d30] hover:text-white" title="Zwiń panel lekcji">
                <PanelRightClose size={16} />
              </button>
              <LessonPanel
                view={view}
                done={done}
                tests={tests}
                onSelect={select}
                onCheck={checkTask}
                onLoadCode={loadCode}
                onInsert={insertSnippet}
                onRun={runCode}
                onConfirm={setDialog}
              />
            </section>
          ) : (
            <button onClick={() => setLessonOpen(true)} className="flex shrink-0 items-center justify-center gap-2 border-b border-[#2b2b2b] bg-[#1c1c1f] px-1.5 py-1.5 text-[12px] text-gray-400 hover:text-white lg:w-9 lg:flex-col lg:border-b-0 lg:border-r lg:py-3" title="Pokaż panel lekcji">
              <BookOpen size={16} /> <span className="lg:[writing-mode:vertical-rl]">Lekcja</span>
            </button>
          )}

          {/* ─── Edytor + konsola ─── */}
          <section className="flex min-h-[420px] min-w-0 flex-1 flex-col">
            <div className="flex h-10 shrink-0 items-center gap-1 border-b border-[#2b2b2b] bg-[#252526] pr-2">
              <div className="flex h-full items-center gap-2 border-r border-[#2b2b2b] border-t-2 border-t-sky-500 bg-vsc-bg px-4 text-[13px] text-gray-200">
                <FileCode2 size={14} className="text-sky-400" />
                {fileNameFor(view, lang)}
              </div>
              <div className="ml-auto flex items-center gap-1">
                <div className="mr-1 hidden items-center rounded-md border border-[#3a3a3d] sm:flex">
                  <button onClick={() => setFontSize((f) => Math.max(11, f - 1))} className="px-1.5 py-1 text-gray-400 hover:text-white" title="Mniejsza czcionka"><Minus size={13} /></button>
                  <span className="w-7 text-center text-[11px] tabular-nums text-gray-400">{fontSize}</span>
                  <button onClick={() => setFontSize((f) => Math.min(24, f + 1))} className="px-1.5 py-1 text-gray-400 hover:text-white" title="Większa czcionka"><Plus size={13} /></button>
                </div>
                <button onClick={copyCode} className="rounded-md p-1.5 text-gray-400 hover:bg-[#2d2d30] hover:text-white" title="Kopiuj kod">
                  {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                </button>
                <button onClick={resetCode} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12.5px] text-gray-300 hover:bg-[#2d2d30] hover:text-white" title="Przywróć szablon startowy">
                  <RotateCcw size={14} /> <span className="hidden xl:inline">Resetuj</span>
                </button>
                {taskCtx && (
                  <button
                    onClick={checkTask}
                    disabled={tests?.running}
                    className="flex items-center gap-1.5 rounded-md bg-sky-700 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-sky-600 disabled:opacity-60"
                  >
                    <Check size={14} /> Sprawdź
                  </button>
                )}
                {isRunning ? (
                  <button onClick={stopCode} className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-red-500">
                    <Square size={13} fill="currentColor" /> Stop
                  </button>
                ) : (
                  <button onClick={runCode} className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-emerald-500" title="Uruchom (Ctrl+Enter)">
                    <Play size={14} fill="currentColor" /> Uruchom
                  </button>
                )}
              </div>
            </div>

            <CodeEditor
              ref={editorRef}
              value={code}
              onChange={setCode}
              errorLine={errorLine}
              fontSize={fontSize}
              onRun={isRunning ? undefined : runCode}
              onCursor={setCursor}
              lang={lang}
            />

            <div
              ref={dragRef}
              onMouseDown={startDrag}
              className="h-1 shrink-0 cursor-row-resize bg-[#2b2b2b] transition-colors hover:bg-sky-600"
              title="Przeciągnij, aby zmienić wysokość konsoli"
            />
            <div style={{ height: termHeight }} className="shrink-0">
              <Terminal
                tab={termTab}
                onTab={setTermTab}
                run={run}
                tests={tests}
                task={taskCtx?.task}
                onSubmitInput={submitInput}
                onClear={() => !isRunning && setRun(IDLE_RUN)}
                onGoToLine={goToLine}
                pyStatus={pyStatus}
              />
            </div>
          </section>
        </main>
      </div>

      {/* ─── Pasek stanu (VS Code) ─── */}
      <footer className="flex h-6 shrink-0 items-center gap-4 bg-vsc-accent px-3 text-[11.5px] text-white/95">
        <span className="flex items-center gap-1.5"><Code2 size={12} /> School Code Lab · {L.label}</span>
        <span className="hidden sm:inline">
          {view.type === 'sandbox' ? 'Piaskownica' : view.type === 'module'
            ? `Temat ${findModule(view.moduleId)?.number}: ${findModule(view.moduleId)?.title}` : `Temat ${taskCtx?.module.number} · ${taskCtx?.task.title}`}
        </span>
        <span className="flex items-center gap-1"><Info size={11} /> kod zapisywany automatycznie</span>
        <span className="ml-auto">Ln {cursor.line}, Col {cursor.col}</span>
        <span className="hidden sm:inline">Spacje: 4</span>
        <span className="hidden sm:inline">UTF-8</span>
        <span className="hidden items-center gap-1 sm:flex">
          <Cpu size={11} /> {L.engine}
          {lang === 'python' && pyStatus === 'loading' ? ' · ładowanie…' : ''}
        </span>
      </footer>

      <CheatSheet key={lang} open={cheatOpen} onClose={closeCheat} />
      <ConfirmDialog dialog={dialog} onClose={closeDialog} />
      <Toast toast={toast} onClose={closeToast} />
    </div>
    </LangContext.Provider>
  );
}
