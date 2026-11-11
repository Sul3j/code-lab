import { useState } from 'react';
import {
  Play, Lightbulb, Eye, ChevronRight, ChevronLeft, CheckCircle2, ListChecks, Trophy, Code2,
  FilePlus2, Wand2, Keyboard, Target, RotateCcw, Loader2, ArrowRight, Sparkles,
} from 'lucide-react';
import { Blocks, Inline, CodeBlock } from './RichText.jsx';
import { iconFor } from '../lib/icons.js';
import { moduleColor } from './Sidebar.jsx';
import { useLang } from '../lib/lang-context.js';

function Stars({ n }) {
  const label = ['', 'łatwe', 'średnie', 'trudne'][n];
  const cls = ['', 'bg-emerald-900/50 text-emerald-300', 'bg-amber-900/50 text-amber-300', 'bg-red-900/50 text-red-300'][n];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>{label}</span>;
}

function Section({ icon: Icon, title, children, tone = 'text-sky-400', right }) {
  return (
    <section className="rounded-xl border border-[#2f2f33] bg-[#222225] p-4">
      <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-gray-300">
        <Icon size={15} className={tone} /> {title}
        {right ? <span className="ml-auto normal-case tracking-normal">{right}</span> : null}
      </h3>
      {children}
    </section>
  );
}

// ───────────────────────── Piaskownica ─────────────────────────
function SandboxPanel({ onLoadCode, onInsert, onRun }) {
  const { lang, course } = useLang();
  const SANDBOX_TEMPLATES = lang.templates;
  const SNIPPETS = lang.snippets;
  return (
    <div className="space-y-4 p-5">
      <div className="rounded-xl border border-emerald-900/50 bg-gradient-to-br from-emerald-950/60 to-[#1f1f22] p-5">
        <div className="mb-2 flex items-center gap-2 text-emerald-300">
          <Sparkles size={18} />
          <span className="text-[12px] font-semibold uppercase tracking-wider">Piaskownica</span>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">Witaj w School Code Lab!</h2>
        <p className="text-[14px] leading-relaxed text-gray-300">
          To Twoje laboratorium – napisz dowolny program w języku <b className="text-white">{lang.label}</b> i od razu go uruchom.
          Wybierz temat z lewej strony, aby przejść {course.MODULES.length} tematów kursu: materiały z przykładami do uruchomienia
          i zadania sprawdzane automatycznie. Język zmienisz przełącznikiem w górnym pasku.
        </p>
        {lang.id === 'python' && (
          <p className="mt-2 text-[12.5px] text-gray-400">
            Python działa dzięki Pyodide – przy pierwszym uruchomieniu interpreter (ok. 10 MB) pobiera się z internetu, potem działa od razu.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onRun} className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-emerald-500">
            <Play size={14} /> Uruchom kod
          </button>
          <button onClick={() => onLoadCode(SANDBOX_TEMPLATES[0].code, 'Nowy projekt')} className="flex items-center gap-1.5 rounded-md bg-[#2d2d30] px-3 py-1.5 text-[13px] text-gray-200 hover:bg-[#3a3a3d]">
            <FilePlus2 size={14} /> Nowy projekt
          </button>
        </div>
      </div>

      <Section icon={FilePlus2} title="Szablony programów" tone="text-emerald-400">
        <div className="grid gap-2 sm:grid-cols-2">
          {SANDBOX_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onLoadCode(t.code, t.title)}
              className="rounded-lg border border-[#333] bg-[#1a1a1d] p-3 text-left transition-colors hover:border-emerald-700 hover:bg-[#1d2420]"
            >
              <div className="text-[13px] font-medium text-gray-100">{t.title}</div>
              <div className="mt-0.5 text-[12px] text-gray-500">{t.description}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section icon={Wand2} title="Szybkie wstawki" tone="text-violet-400">
        <p className="mb-2 text-[12.5px] text-gray-500">Wstawiają fragment kodu w miejscu kursora w edytorze.</p>
        <div className="flex flex-wrap gap-1.5">
          {SNIPPETS.map((s) => (
            <button
              key={s.label}
              onClick={() => onInsert(s.code)}
              className="rounded-md border border-[#3a3a3d] bg-[#2a2a2d] px-2.5 py-1 font-mono text-[12px] text-gray-200 hover:border-violet-600 hover:text-white"
              title={s.code}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={Keyboard} title="Skróty klawiszowe" tone="text-amber-400">
        <ul className="space-y-1.5 text-[13px] text-gray-300">
          {[
            ['Ctrl + Enter', 'uruchom program'],
            ['Tab / Shift + Tab', 'wcięcie / cofnięcie wcięcia (także zaznaczonych linii)'],
            ['Ctrl + /', 'zakomentuj / odkomentuj linie'],
            ['Ctrl + Z', 'cofnij zmianę'],
            lang.id === 'python' ? ['Enter po :', 'automatyczne wcięcie bloku'] : ['Enter po {', 'automatyczne wcięcie bloku'],
          ].map(([k, d]) => (
            <li key={k} className="flex items-center gap-3">
              <kbd className="min-w-[128px] rounded border border-[#444] bg-[#1a1a1a] px-2 py-0.5 text-center font-mono text-[11.5px] text-gray-200">{k}</kbd>
              <span className="text-gray-400">{d}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

// ───────────────────────── Moduł (teoria) ─────────────────────────
function ModulePanel({ module, done, onSelect, onLoadCode, onRun }) {
  const Icon = iconFor(module.icon);
  return (
    <div className="space-y-4 p-5">
      <header className="flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${moduleColor(module.number)} text-white shadow-lg`}>
          <Icon size={22} />
        </span>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Temat {module.number}</div>
          <h2 className="text-xl font-semibold text-white">{module.title}</h2>
          <p className="text-[13px] text-gray-400">{module.subtitle}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-sky-900/50 px-2 py-0.5 text-[11px] font-medium text-sky-300">Materiały</span>
            {module.practice && (
              <span className="rounded-full bg-amber-900/50 px-2 py-0.5 text-[11px] font-medium text-amber-300">Zadanie praktyczne</span>
            )}
          </div>
        </div>
      </header>

      <Section icon={Lightbulb} title="Materiały" tone="text-sky-400">
        <Blocks blocks={module.theory} onOpenCode={(c) => onLoadCode(c, 'Program z materiałów')} />
      </Section>

      <Section
        icon={Code2}
        title={`Przykład: ${module.example.title}`}
        tone="text-emerald-400"
        right={(
          <span className="flex gap-1.5">
            <button onClick={() => onLoadCode(module.example.code, 'Przykład')} className="flex items-center gap-1 rounded-md bg-[#2d2d30] px-2 py-1 text-[11.5px] text-gray-300 hover:bg-[#3a3a3d]" title="Przywróć oryginalny przykład w edytorze">
              <RotateCcw size={12} /> Przywróć
            </button>
            <button onClick={onRun} className="flex items-center gap-1 rounded-md bg-emerald-700 px-2 py-1 text-[11.5px] font-medium text-white hover:bg-emerald-600">
              <Play size={12} /> Uruchom
            </button>
          </span>
        )}
      >
        <p className="mb-3 text-[13.5px] text-gray-400"><Inline text={module.example.description} /> Kod przykładu jest już w edytorze – możesz go zmieniać i eksperymentować.</p>
        <CodeBlock code={module.example.code} compact />
      </Section>

      {module.tasks.length > 0 && (
      <Section icon={Target} title={module.practice ? 'Zadanie praktyczne' : 'Ćwiczenia'} tone="text-amber-400">
        {!module.practice && (
          <p className="mb-2 text-[12.5px] text-gray-500">Ćwiczenia utrwalające wiedzę z tego tematu – sprawdzane automatycznie.</p>
        )}
        <div className="space-y-2">
          {module.tasks.map((t, k) => (
            <button
              key={t.id}
              onClick={() => onSelect({ type: 'task', moduleId: module.id, taskId: t.id })}
              className="group flex w-full items-center gap-3 rounded-lg border border-[#333] bg-[#1a1a1d] p-3 text-left transition-colors hover:border-sky-700"
            >
              {done[t.id] ? <CheckCircle2 size={20} className="shrink-0 text-emerald-400" /> : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-600 text-[11px] text-gray-400">{k + 1}</span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-medium text-gray-100">{t.title}</span>
                <span className="block truncate text-[12px] text-gray-500">{t.description.replace(/[`*]/g, '')}</span>
              </span>
              <Stars n={t.difficulty} />
              <ChevronRight size={16} className="text-gray-600 group-hover:text-sky-400" />
            </button>
          ))}
        </div>
      </Section>
      )}
    </div>
  );
}

// ───────────────────────── Zadanie ─────────────────────────
function TaskPanel({ module, task, done, tests, onCheck, onLoadCode, onSelect, onConfirm }) {
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const { course: { ALL_TASKS } } = useLang();
  const idx = ALL_TASKS.findIndex((t) => t.id === task.id);
  const prev = ALL_TASKS[idx - 1];
  const next = ALL_TASKS[idx + 1];
  const k = module.tasks.findIndex((t) => t.id === task.id);
  const running = tests?.running;

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
        <button className="hover:text-gray-300" onClick={() => onSelect({ type: 'module', moduleId: module.id })}>Temat {module.number}: {module.title}</button>
        <ChevronRight size={12} />
        <span className="text-gray-400">{module.practice ? 'Zadanie' : 'Ćwiczenie'} {k + 1}</span>
      </div>
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-white">{task.title}</h2>
          <Stars n={task.difficulty} />
          {done[task.id] && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-900/60 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
              <CheckCircle2 size={12} /> zaliczone
            </span>
          )}
        </div>
      </header>

      <Section icon={Target} title="Treść zadania" tone="text-sky-400">
        <div className="prose-lab space-y-2 text-[14.5px] leading-relaxed text-gray-300">
          {task.description.split('\n\n').map((p, i) => <p key={i}><Inline text={p} /></p>)}
        </div>
        <div className={`mt-3 grid gap-2 ${task.exampleInput !== undefined ? 'sm:grid-cols-2' : ''}`}>
          {task.exampleInput !== undefined && (
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">Przykładowe wejście</div>
              <pre className="rounded-md border border-[#333] bg-black px-3 py-2 font-mono text-[13px] text-white">{task.exampleInput}</pre>
            </div>
          )}
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">Oczekiwane wyjście</div>
            <pre className="rounded-md border border-[#333] bg-black px-3 py-2 font-mono text-[13px] text-[#4af626]">{task.expectedOutput}</pre>
          </div>
        </div>
        {task.checks?.length ? (
          <div className="mt-3 rounded-md border border-[#333] bg-[#1a1a1d] px-3 py-2">
            <div className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">Wymagania</div>
            <ul className="space-y-0.5 text-[13px] text-gray-300">
              {task.checks.map((c) => <li key={c.pattern} className="flex gap-2"><span className="text-sky-500">•</span>{c.message}</li>)}
            </ul>
          </div>
        ) : null}
      </Section>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onCheck}
          disabled={running}
          className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-[14px] font-semibold text-white shadow hover:bg-sky-500 disabled:opacity-60"
        >
          {running ? <Loader2 size={16} className="animate-spin" /> : <ListChecks size={16} />}
          Sprawdź rozwiązanie
        </button>
        <span className="self-center text-[12px] text-gray-500">{task.tests.length} testy automatyczne</span>
      </div>

      {tests?.allOk && !running && (
        <div className="pop-in flex items-center gap-3 rounded-xl border border-emerald-700/60 bg-gradient-to-r from-emerald-950/80 to-emerald-900/30 p-4">
          <Trophy size={28} className="shrink-0 text-amber-300" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-emerald-200">Brawo! Zadanie zaliczone.</div>
            <div className="text-[13px] text-emerald-300/80">Twój program przeszedł wszystkie testy.</div>
          </div>
          {next && (
            <button onClick={() => onSelect({ type: 'task', moduleId: next.moduleId, taskId: next.id })} className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-emerald-500">
              Dalej <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}
      {tests && !tests.allOk && !running && tests.results && (
        <div className="rounded-lg border border-amber-800/50 bg-amber-950/20 p-3 text-[13px] text-amber-200">
          Jeszcze nie wszystko działa – szczegóły znajdziesz w zakładce <b>Testy</b> pod edytorem. Nie poddawaj się! 💪
        </div>
      )}

      <Section icon={Lightbulb} title="Podpowiedzi" tone="text-amber-400" right={<span className="text-[12px] text-gray-500">{hints}/{task.hints.length}</span>}>
        <div className="space-y-2">
          {task.hints.slice(0, hints).map((h, i) => (
            <div key={i} className="pop-in flex gap-2 rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-[13.5px] text-amber-100">
              <span className="font-semibold text-amber-400">{i + 1}.</span>
              <span className="prose-lab"><Inline text={h} /></span>
            </div>
          ))}
          {hints < task.hints.length ? (
            <button onClick={() => setHints((h) => h + 1)} className="flex items-center gap-1.5 rounded-md bg-[#2d2d30] px-3 py-1.5 text-[13px] text-amber-200 hover:bg-[#3a3a3d]">
              <Lightbulb size={14} /> {hints === 0 ? 'Pokaż pierwszą podpowiedź' : 'Pokaż kolejną podpowiedź'}
            </button>
          ) : (
            <p className="text-[12px] text-gray-500">To już wszystkie podpowiedzi.</p>
          )}
        </div>
      </Section>

      <Section icon={Eye} title="Rozwiązanie wzorcowe" tone="text-violet-400">
        {!showSolution ? (
          <div>
            <p className="mb-2 text-[13px] text-gray-400">Najpierw spróbuj samodzielnie – rozwiązanie najlepiej oglądać po zaliczeniu zadania albo gdy podpowiedzi nie pomogły.</p>
            <button
              onClick={() => (done[task.id] || hints >= task.hints.length
                ? setShowSolution(true)
                : onConfirm({
                  title: 'Pokazać rozwiązanie?',
                  message: 'Nie wykorzystano jeszcze wszystkich podpowiedzi. Samodzielne rozwiązanie zadania da Ci dużo więcej satysfakcji!',
                  confirmLabel: 'Pokaż mimo to',
                  onConfirm: () => setShowSolution(true),
                }))}
              className="flex items-center gap-1.5 rounded-md bg-[#2d2d30] px-3 py-1.5 text-[13px] text-violet-200 hover:bg-[#3a3a3d]"
            >
              <Eye size={14} /> Pokaż rozwiązanie
            </button>
          </div>
        ) : (
          <div className="pop-in space-y-2">
            <CodeBlock code={task.solution} compact />
            <button onClick={() => onLoadCode(task.solution, 'Rozwiązanie')} className="flex items-center gap-1.5 rounded-md bg-violet-700 px-3 py-1.5 text-[13px] text-white hover:bg-violet-600">
              <Code2 size={14} /> Wstaw do edytora
            </button>
          </div>
        )}
      </Section>

      <div className="flex justify-between pt-1">
        {prev ? (
          <button onClick={() => onSelect({ type: 'task', moduleId: prev.moduleId, taskId: prev.id })} className="flex items-center gap-1 text-[13px] text-gray-400 hover:text-white">
            <ChevronLeft size={15} /> {prev.title}
          </button>
        ) : <span />}
        {next ? (
          <button onClick={() => onSelect({ type: 'task', moduleId: next.moduleId, taskId: next.id })} className="flex items-center gap-1 text-[13px] text-gray-400 hover:text-white">
            {next.title} <ChevronRight size={15} />
          </button>
        ) : <span />}
      </div>
    </div>
  );
}

export default function LessonPanel(props) {
  const { view } = props;
  const { course: { MODULES, findTask } } = useLang();
  if (view.type === 'module') {
    const module = MODULES.find((m) => m.id === view.moduleId);
    if (module) return <ModulePanel module={module} {...props} />;
  }
  if (view.type === 'task') {
    const found = findTask(view.taskId);
    if (found) return <TaskPanel key={found.task.id} module={found.module} task={found.task} {...props} />;
  }
  return <SandboxPanel {...props} />;
}
