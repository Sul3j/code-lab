// Lekser (analizator leksykalny) podzbioru języka C++.
// Zamienia tekst programu na listę tokenów.

export class CppError extends Error {
  constructor(message, line, kind = 'compile') {
    super(message);
    this.line = line;
    this.kind = kind; // 'compile' | 'runtime' | 'limit'
  }
}

export const KEYWORDS = new Set([
  'int', 'long', 'short', 'double', 'float', 'char', 'bool', 'void', 'unsigned', 'signed',
  'auto', 'const', 'static', 'constexpr', 'inline', 'virtual', 'override', 'friend',
  'if', 'else', 'switch', 'case', 'default', 'for', 'while', 'do', 'break', 'continue', 'return',
  'class', 'struct', 'public', 'private', 'protected', 'new', 'delete', 'this',
  'true', 'false', 'nullptr', 'using', 'namespace', 'typedef', 'sizeof', 'template', 'typename',
  'static_cast', 'operator', 'enum', 'union',
]);

const PUNCT = [
  '<<=', '>>=', '...',
  '::', '->', '++', '--', '<<', '>>', '<=', '>=', '==', '!=', '&&', '||',
  '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=',
  '+', '-', '*', '/', '%', '<', '>', '=', '!', '&', '|', '^', '~', '?', ':', ';', ',', '.',
  '(', ')', '[', ']', '{', '}',
];

const ESCAPES = { n: '\n', t: '\t', r: '\r', '0': '\0', '\\': '\\', '"': '"', "'": "'", a: '\x07', b: '\b', v: '\v', f: '\f' };

export function tokenize(src) {
  const tokens = [];
  const includes = [];
  const defines = new Map();
  const fmacros = new Map();
  let i = 0;
  let line = 1;
  const n = src.length;

  const push = (type, value, extra) => tokens.push({ type, value, line, ...extra });

  const readEscape = () => {
    // zakłada, że src[i] === '\\'
    const c = src[i + 1];
    i += 2;
    if (c in ESCAPES) return ESCAPES[c];
    throw new CppError(`nieznana sekwencja ucieczki '\\${c}'`, line);
  };

  let atLineStart = true;
  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; atLineStart = true; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }

    // dyrektywy preprocesora
    if (c === '#' && atLineStart) {
      let end = src.indexOf('\n', i);
      if (end === -1) end = n;
      const directive = src.slice(i, end).trim();
      const inc = directive.match(/^#\s*include\s*[<"]([^>"]+)[>"]/);
      const def = directive.match(/^#\s*define\s+([A-Za-z_]\w*)\s*(.*)$/);
      const fdef = directive.match(/^#\s*define\s+([A-Za-z_]\w*)\(([^)]*)\)\s*(.*)$/);
      if (inc) includes.push(inc[1].trim());
      else if (fdef) {
        // makro z parametrami: #define KW(x) x * x
        const params = fdef[2].split(',').map((p) => p.trim()).filter(Boolean);
        const body = fdef[3].replace(/\/\/.*$/, '').trim();
        const bodyTokens = body ? tokenize(body).tokens.filter((t) => t.type !== 'eof') : [];
        fmacros.set(fdef[1], { params, body: bodyTokens });
      } else if (def) {
        const body = def[2].replace(/\/\/.*$/, '').trim();
        const bodyTokens = body ? tokenize(body).tokens.filter((t) => t.type !== 'eof') : [];
        defines.set(def[1], bodyTokens);
      } else if (!/^#\s*(pragma|ifndef|ifdef|endif|if|else|undef)\b/.test(directive)) {
        throw new CppError(`nieznana dyrektywa preprocesora: ${directive}`, line);
      }
      i = end;
      continue;
    }
    atLineStart = false;

    // komentarze
    if (c === '/' && src[i + 1] === '/') {
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const start = line;
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') line++;
        i++;
      }
      if (i >= n) throw new CppError('niezamknięty komentarz /* ... */', start);
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
        while (j < n && /[0-9a-fA-F]/.test(src[j])) j++;
        value = parseInt(src.slice(i + 2, j), 16);
      } else {
        while (j < n && /[0-9']/.test(src[j])) j++;
        if (src[j] === '.') { isFloat = true; j++; while (j < n && /[0-9]/.test(src[j])) j++; }
        if (src[j] === 'e' || src[j] === 'E') {
          let k = j + 1;
          if (src[k] === '+' || src[k] === '-') k++;
          if (/[0-9]/.test(src[k] || '')) {
            isFloat = true;
            j = k;
            while (j < n && /[0-9]/.test(src[j])) j++;
          }
        }
        value = Number(src.slice(i, j).replace(/'/g, ''));
      }
      let isLong = false;
      while (j < n && /[uUlLfF]/.test(src[j])) {
        if (src[j] === 'f' || src[j] === 'F') isFloat = true;
        if (src[j] === 'l' || src[j] === 'L') isLong = true;
        j++;
      }
      if (/[A-Za-z_]/.test(src[j] || '')) throw new CppError(`niepoprawny literał liczbowy '${src.slice(i, j + 1)}'`, line);
      push('num', value, { isFloat, isLong: isLong || (!isFloat && Math.abs(value) > 2147483647) });
      i = j;
      continue;
    }

    // identyfikatory i słowa kluczowe
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      i = j;
      if (defines.has(word)) {
        for (const t of defines.get(word)) tokens.push({ ...t, line });
        continue;
      }
      push(KEYWORDS.has(word) ? 'kw' : 'id', word);
      continue;
    }

    // napisy
    if (c === '"') {
      let s = '';
      i++;
      while (i < n && src[i] !== '"') {
        if (src[i] === '\n') throw new CppError('niezamknięty cudzysłów w napisie', line);
        if (src[i] === '\\') s += readEscape();
        else s += src[i++];
      }
      if (i >= n) throw new CppError('niezamknięty cudzysłów w napisie', line);
      i++;
      push('str', s);
      continue;
    }

    // znaki
    if (c === "'") {
      i++;
      let ch;
      if (src[i] === '\\') ch = readEscape();
      else ch = src[i++];
      if (src[i] !== "'") {
        throw new CppError("literał znakowy w apostrofach może zawierać tylko jeden znak (napisy zapisujemy w cudzysłowie \"...\")", line);
      }
      i++;
      push('char', ch.charCodeAt(0));
      continue;
    }

    // operatory i znaki interpunkcyjne
    let matched = null;
    for (const p of PUNCT) {
      if (src.startsWith(p, i)) { matched = p; break; }
    }
    if (!matched) throw new CppError(`nieoczekiwany znak '${c}'`, line);
    push('op', matched);
    i += matched.length;
  }
  if (fmacros.size) expandMacros(tokens, fmacros);
  tokens.push({ type: 'eof', value: '<koniec pliku>', line });
  return { tokens, includes };
}

// Rozwinięcie makr z parametrami – czysta podmiana tokenów (jak w prawdziwym preprocesorze).
function expandMacros(tokens, fmacros) {
  for (let i = 0; i < tokens.length; i++) {
    const tk = tokens[i];
    if (tk.type !== 'id' || !fmacros.has(tk.value)) continue;
    const next = tokens[i + 1];
    if (!next || next.type !== 'op' || next.value !== '(') continue;
    const { params, body } = fmacros.get(tk.value);
    const args = [[]];
    let depth = 0;
    let j = i + 1;
    for (; j < tokens.length; j++) {
      const t = tokens[j];
      if (t.type === 'op' && t.value === '(') { depth++; if (depth === 1) continue; }
      if (t.type === 'op' && t.value === ')') { depth--; if (depth === 0) break; }
      if (depth === 1 && t.type === 'op' && t.value === ',') { args.push([]); continue; }
      args[args.length - 1].push(t);
    }
    if (j >= tokens.length) throw new CppError(`niezamknięty nawias w wywołaniu makra ${tk.value}`, tk.line);
    if (params.length !== (args.length === 1 && !args[0].length ? 0 : args.length)) {
      throw new CppError(`makro ${tk.value} oczekuje ${params.length} argumentów`, tk.line);
    }
    const out = [];
    for (const bt of body) {
      const k = bt.type === 'id' ? params.indexOf(bt.value) : -1;
      if (k >= 0) out.push(...args[k].map((a) => ({ ...a, line: tk.line })));
      else out.push({ ...bt, line: tk.line });
    }
    tokens.splice(i, j - i + 1, ...out);
    i += out.length - 1;
  }
}
