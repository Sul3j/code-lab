import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Search, BookMarked } from 'lucide-react';
import { Inline, CodeBlock } from './RichText.jsx';
import { iconFor } from '../lib/icons.js';
import { useLang } from '../lib/lang-context.js';

export default function CheatSheet({ open, onClose }) {
  const { lang } = useLang();
  const CHEATSHEET = lang.cheatsheet;
  const [q, setQ] = useState('');
  const [section, setSection] = useState('basics');
  const searchRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    setTimeout(() => searchRef.current?.focus(), 50);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return null;
    return CHEATSHEET.flatMap((sec) => sec.items
      .filter((it) => `${it.title} ${it.text} ${it.code || ''}`.toLowerCase().includes(s))
      .map((it) => ({ ...it, section: sec.title })));
  }, [q, CHEATSHEET]);

  if (!open) return null;
  const current = CHEATSHEET.find((s) => s.id === section) || CHEATSHEET[0];
  const items = filtered || current.items;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[2px]" onClick={onClose}>
      <aside
        className="slide-in flex h-full w-full max-w-[860px] flex-col border-l border-[#333] bg-[#1f1f22] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Ściąga ${lang.label}`}
      >
        <header className="flex items-center gap-3 border-b border-[#333] px-5 py-3">
          <BookMarked size={20} className="text-amber-400" />
          <div>
            <h2 className="text-[15px] font-semibold text-white">Ściąga {lang.label}</h2>
            <p className="text-[12px] text-gray-500">Najważniejsze pojęcia w pigułce</p>
          </div>
          <div className="relative ml-auto w-64">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={lang.cheatHint}
              className="w-full rounded-md border border-[#3a3a3d] bg-[#2a2a2d] py-1.5 pl-8 pr-2 text-[13px] text-gray-200 outline-none placeholder:text-gray-500 focus:border-sky-600"
            />
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-[#2d2d30] hover:text-white" title="Zamknij (Esc)">
            <X size={18} />
          </button>
        </header>
        <div className="flex min-h-0 flex-1">
          {!filtered && (
            <div className="w-52 shrink-0 space-y-0.5 overflow-y-auto border-r border-[#333] p-2">
              {CHEATSHEET.map((s) => {
                const Icon = iconFor(s.icon);
                return (
                  <button
                    key={s.id}
                    onClick={() => { setSection(s.id); bodyRef.current?.scrollTo(0, 0); }}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] ${section === s.id ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'}`}
                  >
                    <Icon size={15} className="text-amber-400/90" /> {s.title}
                  </button>
                );
              })}
            </div>
          )}
          <div ref={bodyRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            {filtered && <p className="text-[12px] text-gray-500">Wyniki wyszukiwania: {filtered.length}</p>}
            {items.map((it, k) => (
              <article key={k} className="pop-in rounded-xl border border-[#333] bg-[#252528] p-4">
                {it.section && <div className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">{it.section}</div>}
                <h3 className="mb-2 text-[14.5px] font-semibold text-white">{it.title}</h3>
                <p className="prose-lab text-[13.5px] leading-relaxed text-gray-300"><Inline text={it.text} /></p>
                {it.code && <div className="mt-3"><CodeBlock code={it.code} compact /></div>}
              </article>
            ))}
            {filtered && !filtered.length && <p className="text-[13px] text-gray-500">Brak wyników dla „{q}”.</p>}
          </div>
        </div>
      </aside>
    </div>
  );
}
