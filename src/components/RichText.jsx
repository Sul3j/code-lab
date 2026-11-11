import { useMemo, useState } from 'react';
import { AlertTriangle, Lightbulb, Copy, Check } from 'lucide-react';
import { highlight, findClassNames } from '../lib/highlight.js';
import { useLang } from '../lib/lang-context.js';

// Prosty renderer: `kod` → <code>, **pogrubienie**, *kursywa*
export function Inline({ text }) {
  const parts = useMemo(() => {
    const out = [];
    const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)/g;
    let last = 0;
    let m;
    let k = 0;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push(text.slice(last, m.index));
      if (m[1]) out.push(<code key={k++} className="inline">{m[1].slice(1, -1)}</code>);
      else if (m[2]) out.push(<strong key={k++} className="text-white font-semibold">{m[2].slice(2, -2)}</strong>);
      else out.push(<em key={k++} className="text-gray-200">{m[3].slice(1, -1)}</em>);
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }, [text]);
  return <>{parts}</>;
}

export function CodeBlock({ code, actions, compact = false }) {
  const [copied, setCopied] = useState(false);
  const { id: langId } = useLang();
  const html = useMemo(() => highlight(code, findClassNames(code, langId), langId), [code, langId]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* brak dostępu do schowka */ }
  };
  return (
    <div className="group relative rounded-lg border border-[#333] bg-[#1a1a1a] overflow-hidden">
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {actions}
        <button
          onClick={copy}
          className="rounded-md bg-[#2d2d30] px-2 py-1 text-xs text-gray-300 hover:bg-[#3a3a3d] flex items-center gap-1"
          title="Kopiuj kod"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        </button>
      </div>
      <pre
        className={`code-area font-mono text-[13px] leading-[1.55] overflow-x-auto ${compact ? 'p-3' : 'p-4'} text-[#d4d4d4]`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function Blocks({ blocks, onOpenCode }) {
  const { lang } = useLang();
  return (
    <div className="prose-lab space-y-3.5 text-[14.5px] leading-relaxed text-gray-300">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'p':
            return <p key={i}><Inline text={b.text} /></p>;
          case 'h':
            return <h3 key={i} className="pt-2 text-base font-semibold text-white">{b.text}</h3>;
          case 'code':
            return (
              <CodeBlock
                key={i}
                code={b.code}
                compact
                actions={onOpenCode && lang.isProgram(b) ? (
                  <button
                    onClick={() => onOpenCode(b.code)}
                    className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white hover:bg-emerald-600"
                    title="Wczytaj ten program do edytora"
                  >
                    Otwórz w edytorze
                  </button>
                ) : null}
              />
            );
          case 'list':
            return (
              <ul key={i} className="space-y-1.5 pl-1">
                {b.items.map((it, k) => (
                  <li key={k} className="flex gap-2">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                    <span><Inline text={it} /></span>
                  </li>
                ))}
              </ul>
            );
          case 'table':
            return (
              <div key={i} className="overflow-x-auto rounded-lg border border-[#333]">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#2a2a2d] text-gray-200">
                    <tr>{b.head.map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, k) => (
                      <tr key={k} className="border-t border-[#333] odd:bg-[#1f1f22]">
                        {r.map((c, j) => (
                          <td key={j} className={`px-3 py-1.5 ${j === 0 ? 'font-mono text-[#d7ba7d] whitespace-nowrap' : ''} ${j === 2 ? 'font-mono text-[12.5px] text-gray-400' : ''}`}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'tip':
            return (
              <div key={i} className="flex gap-3 rounded-lg border border-sky-800/60 bg-sky-950/40 p-3 text-sky-100">
                <Lightbulb size={18} className="mt-0.5 shrink-0 text-sky-400" />
                <div><Inline text={b.text} /></div>
              </div>
            );
          case 'warn':
            return (
              <div key={i} className="flex gap-3 rounded-lg border border-amber-800/60 bg-amber-950/30 p-3 text-amber-100">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-400" />
                <div><Inline text={b.text} /></div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
