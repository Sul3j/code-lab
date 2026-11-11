// Lekser podzbioru języka C#.
import { CppError as LangError } from '../lexer.js';

export { LangError };

export const CS_KEYWORDS = new Set([
  'abstract', 'as', 'base', 'bool', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue',
  'decimal', 'default', 'do', 'double', 'else', 'enum', 'false', 'finally', 'float', 'for', 'foreach', 'if',
  'in', 'int', 'interface', 'internal', 'is', 'long', 'namespace', 'new', 'null', 'object', 'out', 'override',
  'params', 'private', 'protected', 'public', 'readonly', 'ref', 'return', 'sealed', 'short', 'static', 'string',
  'struct', 'switch', 'this', 'throw', 'true', 'try', 'uint', 'ulong', 'using', 'virtual', 'void', 'while',
  'sbyte', 'ushort', 'operator', 'typeof', 'nameof', 'checked', 'unchecked', 'goto', 'lock', 'fixed', 'unsafe',
]);

const PUNCT = [
  '<<=', '>>=', '??=', '=>', '??', '?.', '::', '++', '--', '<<', '>>', '<=', '>=', '==', '!=', '&&', '||',
  '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=',
  '+', '-', '*', '/', '%', '<', '>', '=', '!', '&', '|', '^', '~', '?', ':', ';', ',', '.',
  '(', ')', '[', ']', '{', '}',
];

const ESC = { n: '\n', t: '\t', r: '\r', '0': '\0', '\\': '\\', '"': '"', "'": "'", a: '\x07', b: '\b', f: '\f', v: '\v' };

export function tokenizeCs(src, lineOffset = 0) {
  const tokens = [];
  let i = 0;
  let line = 1 + lineOffset;
  const n = src.length;
  const push = (type, value, extra) => tokens.push({ type, value, line, ...extra });

  const readEscape = () => {
    const c = src[i + 1];
    if (c === 'u') {
      const hex = src.slice(i + 2, i + 6);
      i += 6;
      return String.fromCharCode(parseInt(hex, 16));
    }
    i += 2;
    if (c in ESC) return ESC[c];
    throw new LangError(`nieznana sekwencja ucieczki '\\${c}'`, line);
  };

  // odczyt napisu interpolowanego $"..." – zwraca części tekstu i źródła wyrażeń
  const readInterpolated = (verbatim) => {
    const parts = [];
    const holes = [];
    let cur = '';
    const startLine = line;
    for (;;) {
      if (i >= n) throw new LangError('niezamknięty napis interpolowany $"..."', startLine);
      const c = src[i];
      if (c === '"') {
        if (verbatim && src[i + 1] === '"') { cur += '"'; i += 2; continue; }
        i++;
        break;
      }
      if (c === '\n') {
        if (!verbatim) throw new LangError('niezamknięty napis interpolowany $"..."', startLine);
        line++;
      }
      if (c === '{') {
        if (src[i + 1] === '{') { cur += '{'; i += 2; continue; }
        // wyrażenie aż do pasującego '}'
        let depth = 0;
        let j = i + 1;
        let inStr = null;
        for (; j < n; j++) {
          const d = src[j];
          if (inStr) {
            if (d === '\\') { j++; continue; }
            if (d === inStr) inStr = null;
            continue;
          }
          if (d === '"' || d === "'") { inStr = d; continue; }
          if (d === '{' || d === '(' || d === '[') depth++;
          else if (d === ')' || d === ']') depth--;
          else if (d === '}') { if (depth === 0) break; depth--; }
        }
        if (j >= n) throw new LangError("brak '}' w napisie interpolowanym", line);
        let inner = src.slice(i + 1, j);
        // format: wyrażenie[,wyrównanie][:format] – szukamy ':' / ',' poza nawiasami i napisami
        let fmt = null;
        let align = null;
        let d2 = 0;
        let q = null;
        for (let k = 0; k < inner.length; k++) {
          const ch = inner[k];
          if (q) { if (ch === '\\') { k++; continue; } if (ch === q) q = null; continue; }
          if (ch === '"' || ch === "'") { q = ch; continue; }
          if (ch === '(' || ch === '[' || ch === '{') d2++;
          else if (ch === ')' || ch === ']' || ch === '}') d2--;
          else if (d2 === 0 && ch === '?' ) { // operator warunkowy – ':' należy do niego
            const rest = inner.slice(k + 1);
            const colon = rest.indexOf(':');
            if (colon >= 0) k += colon + 1;
          } else if (d2 === 0 && ch === ':' && fmt === null) {
            fmt = inner.slice(k + 1);
            inner = inner.slice(0, k);
            break;
          }
        }
        const comma = (() => {
          let dd = 0; let qq = null;
          for (let k = 0; k < inner.length; k++) {
            const ch = inner[k];
            if (qq) { if (ch === '\\') { k++; continue; } if (ch === qq) qq = null; continue; }
            if (ch === '"' || ch === "'") { qq = ch; continue; }
            if (ch === '>' && (inner[k - 1] === '=' || inner[k - 1] === '-')) continue; // => i ->
            if (ch === '(' || ch === '[' || ch === '{' || ch === '<') dd++;
            else if (ch === ')' || ch === ']' || ch === '}' || ch === '>') dd--;
            else if (dd === 0 && ch === ',') return k;
          }
          return -1;
        })();
        if (comma >= 0) {
          align = parseInt(inner.slice(comma + 1).trim(), 10);
          inner = inner.slice(0, comma);
        }
        parts.push(cur);
        cur = '';
        holes.push({ src: inner, fmt, align, line });
        i = j + 1;
        continue;
      }
      if (c === '}') {
        if (src[i + 1] === '}') { cur += '}'; i += 2; continue; }
        throw new LangError("pojedynczy '}' w napisie interpolowanym – zapisz go jako '}}'", line);
      }
      if (c === '\\' && !verbatim) { cur += readEscape(); continue; }
      cur += c;
      i++;
    }
    parts.push(cur);
    return { parts, holes };
  };

  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
    if (c === '#') { // #region itp.
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') {
      const start = line;
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
      if (i >= n) throw new LangError('niezamknięty komentarz /* ... */', start);
      i += 2;
      continue;
    }
    // liczby
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      let j = i;
      let isFloat = false;
      let value;
      if (c === '0' && (src[i + 1] === 'x' || src[i + 1] === 'X')) {
        j += 2;
        while (j < n && /[0-9a-fA-F_]/.test(src[j])) j++;
        value = parseInt(src.slice(i + 2, j).replace(/_/g, ''), 16);
      } else {
        while (j < n && /[0-9_]/.test(src[j])) j++;
        if (src[j] === '.' && /[0-9]/.test(src[j + 1] || '')) { isFloat = true; j++; while (j < n && /[0-9_]/.test(src[j])) j++; }
        if (src[j] === 'e' || src[j] === 'E') {
          let k = j + 1;
          if (src[k] === '+' || src[k] === '-') k++;
          if (/[0-9]/.test(src[k] || '')) { isFloat = true; j = k; while (j < n && /[0-9]/.test(src[j])) j++; }
        }
        value = Number(src.slice(i, j).replace(/_/g, ''));
      }
      let suffix = '';
      while (j < n && /[uUlLfFdDmM]/.test(src[j])) suffix += src[j++].toLowerCase();
      let t = isFloat ? 'double' : 'int';
      if (suffix.includes('f')) t = 'float';
      else if (suffix.includes('d')) t = 'double';
      else if (suffix.includes('m')) t = 'decimal';
      else if (suffix.includes('l')) t = 'long';
      else if (!isFloat && Math.abs(value) > 2147483647) t = 'long';
      if (/[A-Za-z_]/.test(src[j] || '')) throw new LangError(`niepoprawny literał liczbowy '${src.slice(i, j + 1)}'`, line);
      push('num', value, { t });
      i = j;
      continue;
    }
    // napisy interpolowane / dosłowne
    if (c === '$' && (src[i + 1] === '"' || (src[i + 1] === '@' && src[i + 2] === '"'))) {
      const verbatim = src[i + 1] === '@';
      const startLine = line;
      i += verbatim ? 3 : 2;
      const r = readInterpolated(verbatim);
      tokens.push({ type: 'interp', value: '$"..."', parts: r.parts, holes: r.holes, line: startLine });
      continue;
    }
    if (c === '@' && src[i + 1] === '$' && src[i + 2] === '"') {
      const startLine = line;
      i += 3;
      const r = readInterpolated(true);
      tokens.push({ type: 'interp', value: '$"..."', parts: r.parts, holes: r.holes, line: startLine });
      continue;
    }
    if (c === '@' && src[i + 1] === '"') {
      i += 2;
      let s = '';
      const startLine = line;
      for (;;) {
        if (i >= n) throw new LangError('niezamknięty napis @"..."', startLine);
        if (src[i] === '"') { if (src[i + 1] === '"') { s += '"'; i += 2; continue; } i++; break; }
        if (src[i] === '\n') line++;
        s += src[i++];
      }
      tokens.push({ type: 'str', value: s, line: startLine });
      continue;
    }
    if (c === '"') {
      let s = '';
      i++;
      while (i < n && src[i] !== '"') {
        if (src[i] === '\n') throw new LangError('niezamknięty cudzysłów w napisie', line);
        if (src[i] === '\\') s += readEscape();
        else s += src[i++];
      }
      if (i >= n) throw new LangError('niezamknięty cudzysłów w napisie', line);
      i++;
      push('str', s);
      continue;
    }
    if (c === "'") {
      i++;
      let ch;
      if (src[i] === '\\') ch = readEscape();
      else ch = src[i++];
      if (src[i] !== "'") throw new LangError("literał znakowy w apostrofach może zawierać tylko jeden znak (napisy zapisujemy w cudzysłowie \"...\")", line);
      i++;
      push('char', ch.charCodeAt(0));
      continue;
    }
    if (/[A-Za-z_@]/.test(c)) {
      let j = i;
      if (c === '@') j++;
      while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(c === '@' ? i + 1 : i, j);
      i = j;
      push(CS_KEYWORDS.has(word) && c !== '@' ? 'kw' : 'id', word);
      continue;
    }
    let matched = null;
    for (const p of PUNCT) if (src.startsWith(p, i)) { matched = p; break; }
    if (!matched) throw new LangError(`nieoczekiwany znak '${c}'`, line);
    push('op', matched);
    i += matched.length;
  }
  tokens.push({ type: 'eof', value: '<koniec pliku>', line });
  return tokens;
}
