import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, FlaskConical, BookOpen, BookMarked, GraduationCap } from 'lucide-react';
import { iconFor } from '../lib/icons.js';
import { useLang } from '../lib/lang-context.js';

const MODULE_COLORS = [
  'from-sky-500 to-blue-600', 'from-violet-500 to-purple-600', 'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600', 'from-pink-500 to-rose-600', 'from-cyan-500 to-sky-600',
  'from-lime-500 to-green-600', 'from-red-500 to-orange-600', 'from-indigo-500 to-violet-600',
];
export const moduleColor = (n) => MODULE_COLORS[(n - 1) % MODULE_COLORS.length];

function Dots({ n }) {
  return (
    <span className="flex gap-0.5" title={`Poziom trudności: ${n}/3`}>
      {[1, 2, 3].map((k) => <span key={k} className={`h-1.5 w-1.5 rounded-full ${k <= n ? 'bg-amber-400' : 'bg-[#3a3a3d]'}`} />)}
    </span>
  );
}

export default function Sidebar({ view, onSelect, done, onOpenCheatsheet }) {
  const { course: { MODULES, PARTS } } = useLang();
  const activeModule = view.type === 'module' ? view.moduleId : view.type === 'task' ? view.moduleId : null;
  const [open, setOpen] = useState(() => new Set(activeModule ? [activeModule] : [MODULES[0].id]));

  useEffect(() => {
    if (activeModule) setOpen((o) => (o.has(activeModule) ? o : new Set([...o, activeModule])));
  }, [activeModule]);

  const toggle = (id) => setOpen((o) => {
    const n = new Set(o);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const item = (active) => `flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${active ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'}`;

  return (
    <nav className="flex h-full flex-col bg-vsc-side">
      <div className="px-3 pb-2 pt-3">
        <button onClick={() => onSelect({ type: 'sandbox' })} className={item(view.type === 'sandbox')}>
          <FlaskConical size={16} className="text-emerald-400" />
          <span className="font-medium">Piaskownica</span>
          <span className="ml-auto text-[11px] text-gray-500">wolny kod</span>
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
        {MODULES.map((m, idx) => {
          const Icon = iconFor(m.icon);
          const doneCount = m.tasks.filter((t) => done[t.id]).length;
          const isOpen = open.has(m.id);
          const complete = doneCount === m.tasks.length;
          const newPart = idx === 0 || MODULES[idx - 1].part !== m.part;
          const part = PARTS.find((p) => p.id === m.part);
          const partTasks = MODULES.filter((x) => x.part === m.part).flatMap((x) => x.tasks);
          return (
            <div key={m.id}>
              {newPart && part && (
                <div className={`flex items-center gap-2 px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 ${idx === 0 ? 'pt-1' : 'mt-3 border-t border-[#2b2b2b] pt-3'}`}>
                  <GraduationCap size={13} className={m.part === 'oop' ? 'text-violet-400' : 'text-sky-400'} />
                  <span className="flex-1">{part.title}</span>
                  <span className="font-normal normal-case tracking-normal tabular-nums">{partTasks.filter((t) => done[t.id]).length}/{partTasks.length}</span>
                </div>
              )}
              <button
                onClick={() => { toggle(m.id); if (!isOpen) onSelect({ type: 'module', moduleId: m.id }); }}
                className={`group flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors ${activeModule === m.id ? 'bg-[#2a2d2e]' : 'hover:bg-[#2a2d2e]'}`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${moduleColor(m.number)} text-white shadow`}>
                  <Icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-gray-200">{m.number}. {m.title}</span>
                  <span className="block truncate text-[11px] text-gray-500">{m.subtitle}</span>
                </span>
                {m.tasks.length > 0 ? (
                  <span className={`text-[11px] tabular-nums ${complete ? 'text-emerald-400' : 'text-gray-500'}`}>{doneCount}/{m.tasks.length}</span>
                ) : null}
                {isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
              </button>
              {isOpen && (
                <div className="mb-1 ml-[22px] space-y-0.5 border-l border-[#333] pl-2.5 pt-0.5">
                  <button onClick={() => onSelect({ type: 'module', moduleId: m.id })} className={item(view.type === 'module' && view.moduleId === m.id)}>
                    <BookOpen size={14} className="text-sky-400" /> Materiały
                  </button>
                  {m.tasks.map((t, k) => (
                    <button
                      key={t.id}
                      onClick={() => onSelect({ type: 'task', moduleId: m.id, taskId: t.id })}
                      className={item(view.type === 'task' && view.taskId === t.id)}
                    >
                      {done[t.id] ? <CheckCircle2 size={14} className="shrink-0 text-emerald-400" /> : <Circle size={14} className="shrink-0 text-gray-600" />}
                      <span className={`min-w-0 flex-1 truncate ${m.practice ? '' : 'italic'}`}>{m.practice ? 'Zadanie' : 'Ćwiczenie'} {k + 1}: {t.title}</span>
                      <Dots n={t.difficulty} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="border-t border-[#2b2b2b] p-3">
        <button onClick={onOpenCheatsheet} className={item(false)}>
          <BookMarked size={16} className="text-amber-400" />
          <span className="font-medium">Ściąga (Cheat Sheet)</span>
        </button>
      </div>
    </nav>
  );
}
