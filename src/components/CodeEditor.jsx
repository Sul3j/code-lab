import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { highlight, findClassNames } from '../lib/highlight.js';

const INDENT = '    ';
const PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
const CLOSERS = new Set([')', ']', '}', '"', "'"]);
const PAD = 12; // padding w px (góra/lewo)

// Wstawia tekst z zachowaniem historii cofania (Ctrl+Z).
function replaceRange(ta, start, end, text, selStart, selEnd) {
  ta.focus();
  ta.setSelectionRange(start, end);
  let ok = false;
  try {
    ok = text === '' ? document.execCommand('delete') : document.execCommand('insertText', false, text);
  } catch { ok = false; }
  if (!ok) {
    ta.setRangeText(text, start, end, 'end');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const s = selStart ?? start + text.length;
  ta.setSelectionRange(s, selEnd ?? s);
}

const CodeEditor = forwardRef(function CodeEditor(
  { value, onChange, errorLine, fontSize = 14, onRun, onCursor, readOnly = false, lang = 'cpp' },
  ref,
) {
  const taRef = useRef(null);
  const preRef = useRef(null);
  const gutterRef = useRef(null);
  const [scroll, setScroll] = useState({ top: 0, left: 0 });
  const [curLine, setCurLine] = useState(1);
  const lineHeight = Math.round(fontSize * 1.6);

  const isPy = lang === 'python';
  const cmt = isPy ? '#' : '//';
  const classNames = useMemo(() => findClassNames(value, lang), [value, lang]);
  const html = useMemo(() => highlight(value, classNames, lang), [value, classNames, lang]);
  const lineCount = useMemo(() => value.split('\n').length, [value]);

  const reportCursor = () => {
    const ta = taRef.current;
    if (!ta) return;
    const before = ta.value.slice(0, ta.selectionStart);
    const line = before.split('\n').length;
    const col = ta.selectionStart - before.lastIndexOf('\n');
    setCurLine(line);
    onCursor?.({ line, col });
  };

  useImperativeHandle(ref, () => ({
    focus: () => taRef.current?.focus(),
    insertAtCursor(text) {
      const ta = taRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf('\n', start - 1) + 1;
      const indent = ta.value.slice(lineStart, start).match(/^\s*/)[0];
      const body = text.split('\n').map((l, k) => (k === 0 ? l : indent + l)).join('\n');
      replaceRange(ta, start, ta.selectionEnd, body);
      reportCursor();
    },
    focusLine(n) {
      const ta = taRef.current;
      if (!ta) return;
      const lines = ta.value.split('\n');
      let pos = 0;
      for (let k = 0; k < Math.min(n - 1, lines.length); k++) pos += lines[k].length + 1;
      const lineEnd = pos + (lines[n - 1] || '').length;
      ta.focus();
      ta.setSelectionRange(pos + ((lines[n - 1] || '').match(/^\s*/)[0].length), lineEnd);
      const targetTop = (n - 1) * lineHeight - ta.clientHeight / 2;
      ta.scrollTop = Math.max(0, targetTop);
      reportCursor();
    },
  }));

  // synchronizacja przewijania nakładki z polem tekstowym
  useLayoutEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = scroll.top;
      preRef.current.scrollLeft = scroll.left;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = scroll.top;
  }, [scroll, html]);

  const onScroll = (e) => setScroll({ top: e.target.scrollTop, left: e.target.scrollLeft });

  const selectedLines = (ta) => {
    const v = ta.value;
    const s = ta.selectionStart;
    let e = ta.selectionEnd;
    if (e > s && v[e - 1] === '\n') e--;
    const start = v.lastIndexOf('\n', s - 1) + 1;
    let end = v.indexOf('\n', e);
    if (end === -1) end = v.length;
    return { start, end, text: v.slice(start, end) };
  };

  const onKeyDown = (e) => {
    const ta = e.currentTarget;
    const v = ta.value;
    const s = ta.selectionStart;
    const en = ta.selectionEnd;

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); onRun?.(); return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); return; }
    if (readOnly) return;

    // Ctrl + / – przełącz komentarz
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const { start, end, text } = selectedLines(ta);
      const lines = text.split('\n');
      const cre = isPy ? /^(\s*)# ?/ : /^(\s*)\/\/ ?/;
      const allCommented = lines.filter((l) => l.trim()).every((l) => cre.test(l));
      const out = lines.map((l) => {
        if (!l.trim()) return l;
        if (allCommented) return l.replace(cre, '$1');
        const ind = l.match(/^\s*/)[0];
        return `${ind}${cmt} ${l.slice(ind.length)}`;
      }).join('\n');
      replaceRange(ta, start, end, out, start, start + out.length);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const multi = v.slice(s, en).includes('\n');
      if (e.shiftKey || multi) {
        const { start, end, text } = selectedLines(ta);
        const out = text.split('\n').map((l) => (e.shiftKey ? l.replace(/^( {1,4}|\t)/, '') : INDENT + l)).join('\n');
        replaceRange(ta, start, end, out, start, start + out.length);
      } else {
        replaceRange(ta, s, en, INDENT);
      }
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      const indent = v.slice(lineStart, s).match(/^[ \t]*/)[0];
      const prev = v.slice(lineStart, s).trimEnd();
      const next = v[en];
      if (prev.endsWith('{') && next === '}') {
        const ins = `\n${indent}${INDENT}\n${indent}`;
        const caret = s + 1 + indent.length + INDENT.length;
        replaceRange(ta, s, en, ins, caret, caret);
      } else {
        let extra = '';
        let ind = indent;
        if (isPy) {
          const codePart = prev.replace(/#.*$/, '').trimEnd();
          if (/[:([{]$/.test(codePart)) extra = INDENT;
          else if (/^\s*(return|pass|break|continue|raise)\b/.test(prev)) ind = indent.replace(/( {1,4}|\t)$/, '');
        } else if (/[{(]$/.test(prev) || /^\s*(case\b.*|default\s*|public|private|protected)\s*:$/.test(prev)) {
          extra = INDENT;
        }
        replaceRange(ta, s, en, `\n${ind}${extra}`);
      }
      reportCursor();
      return;
    }

    if (e.key === '}' && s === en && !isPy) {
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      const before = v.slice(lineStart, s);
      if (/^\s+$/.test(before) && v[s] !== '}') {
        e.preventDefault();
        const ded = before.replace(/( {1,4}|\t)$/, '');
        replaceRange(ta, lineStart, s, `${ded}}`);
        return;
      }
    }

    // pomijanie zamykającego znaku, jeśli już stoi za kursorem
    if (CLOSERS.has(e.key) && s === en && v[s] === e.key) {
      if (e.key !== '"' && e.key !== "'" || v[s - 1] !== '\\') {
        e.preventDefault();
        ta.setSelectionRange(s + 1, s + 1);
        return;
      }
    }

    // automatyczne zamykanie nawiasów i cudzysłowów
    if (PAIRS[e.key] && !e.ctrlKey && !e.metaKey) {
      const next = v[en] ?? '';
      const prevCh = v[s - 1] ?? '';
      const isQuote = e.key === '"' || e.key === "'";
      if (s !== en) {
        e.preventDefault();
        const sel = v.slice(s, en);
        replaceRange(ta, s, en, e.key + sel + PAIRS[e.key], s + 1, en + 1);
        return;
      }
      if ((/^[\s)\]};,]?$/.test(next)) && !(isQuote && /[\w\\]/.test(prevCh))) {
        e.preventDefault();
        replaceRange(ta, s, en, e.key + PAIRS[e.key], s + 1, s + 1);
        return;
      }
    }

    if (e.key === 'Backspace' && s === en && s > 0) {
      const pair = v[s - 1] + (v[s] ?? '');
      if (['()', '[]', '{}', '""', "''"].includes(pair)) {
        e.preventDefault();
        replaceRange(ta, s - 1, s + 1, '');
        return;
      }
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      const before = v.slice(lineStart, s);
      if (before.length >= 4 && /^ +$/.test(before) && before.length % 4 === 0) {
        e.preventDefault();
        replaceRange(ta, s - 4, s, '');
      }
    }
  };

  const lineTop = (n) => PAD + (n - 1) * lineHeight - scroll.top;
  const style = { fontSize: `${fontSize}px`, lineHeight: `${lineHeight}px` };

  return (
    <div className="relative flex min-h-0 flex-1 bg-vsc-bg font-mono" style={style}>
      <div
        ref={gutterRef}
        className="select-none overflow-hidden border-r border-[#2b2b2b] bg-vsc-bg text-right text-vsc-gutter"
        style={{ paddingTop: PAD, paddingBottom: PAD, minWidth: `${Math.max(3, String(lineCount).length + 1.5)}ch` }}
        aria-hidden
      >
        {Array.from({ length: lineCount }, (_, k) => (
          <div
            key={k}
            className={`pl-3 pr-3 ${k + 1 === errorLine ? 'text-red-400 font-bold' : (k + 1 === curLine ? 'text-[#c6c6c6]' : '')}`}
            style={{ height: lineHeight }}
          >
            {k + 1 === errorLine ? '●' : k + 1}
          </div>
        ))}
      </div>
      <div className="relative min-w-0 flex-1 overflow-hidden">
        {/* podświetlenie bieżącej linii i linii z błędem */}
        <div className="pointer-events-none absolute left-0 right-0 border-y border-[#282828] bg-[#ffffff07]" style={{ top: lineTop(curLine), height: lineHeight }} />
        {errorLine ? (
          <div className="pointer-events-none absolute left-0 right-0 bg-red-500/15 border-l-2 border-red-500" style={{ top: lineTop(errorLine), height: lineHeight }} />
        ) : null}
        <pre
          ref={preRef}
          aria-hidden
          className="code-area pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre text-[#d4d4d4]"
          style={{ padding: PAD, paddingBottom: PAD + 200 }}
          dangerouslySetInnerHTML={{ __html: `${html}\n` }}
        />
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => { onChange(e.target.value); }}
          onKeyDown={onKeyDown}
          onScroll={onScroll}
          onSelect={reportCursor}
          onClick={reportCursor}
          onKeyUp={reportCursor}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          wrap="off"
          aria-label="Edytor kodu"
          className="code-area code-input absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent outline-none"
          style={{ padding: PAD, paddingBottom: PAD + 200 }}
        />
      </div>
    </div>
  );
});

export default CodeEditor;
