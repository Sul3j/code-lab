// Lekki podświetlacz składni (C++, C#, Python) w stylu VS Code Dark+.
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const span = (cls, s) => `<span class="${cls}">${esc(s)}</span>`;

const LANG_DEFS = {
  cpp: {
    control: new Set(['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'new', 'delete', 'using', 'namespace', 'try', 'catch', 'throw']),
    keywords: new Set(['int', 'long', 'short', 'double', 'float', 'char', 'bool', 'void', 'unsigned', 'signed', 'auto', 'const', 'static', 'class', 'struct', 'public', 'private', 'protected', 'virtual', 'override', 'true', 'false', 'nullptr', 'this', 'sizeof', 'enum', 'template', 'typename', 'constexpr', 'inline', 'friend', 'operator', 'static_cast']),
    types: new Set(['std', 'cout', 'cin', 'cerr', 'endl', 'string', 'vector', 'size_t', 'getline', 'fixed', 'setprecision', 'setw', 'setfill', 'left', 'right', 'boolalpha', 'NULL', 'INT_MAX', 'INT_MIN']),
    // komentarz liniowy | blokowy | string | char | preprocesor | liczba | identyfikator
    re: /(\/\/[^\n]*)|(\/\*[\s\S]*?(?:\*\/|(?![\s\S])))|("(?:\\.|[^"\\\n])*"?)|('(?:\\.|[^'\\\n])*'?)|(^[ \t]*#[^\n]*)|(\b\d[\d']*(?:\.\d+)?(?:[eE][+-]?\d+)?[fFlLuU]*\b|\b0[xX][0-9a-fA-F]+\b)|([A-Za-z_]\w*)/gm,
    classRe: /\b(?:class|struct)\s+([A-Za-z_]\w*)/g,
  },
  csharp: {
    control: new Set(['if', 'else', 'for', 'foreach', 'in', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'new', 'using', 'namespace', 'try', 'catch', 'finally', 'throw', 'when', 'yield', 'goto']),
    keywords: new Set(['int', 'long', 'short', 'byte', 'double', 'float', 'decimal', 'char', 'bool', 'string', 'object', 'void', 'var', 'uint', 'ulong', 'const', 'static', 'readonly', 'class', 'struct', 'interface', 'enum', 'record', 'public', 'private', 'protected', 'internal', 'virtual', 'override', 'abstract', 'sealed', 'true', 'false', 'null', 'this', 'base', 'ref', 'out', 'params', 'is', 'as', 'typeof', 'nameof', 'get', 'set', 'init', 'operator', 'implicit', 'explicit', 'and', 'or', 'not', 'checked', 'unchecked', 'sizeof']),
    types: new Set(['Console', 'Math', 'Convert', 'String', 'List', 'Dictionary', 'HashSet', 'Queue', 'Stack', 'StringBuilder', 'Random', 'Array', 'Exception', 'Environment', 'Func', 'Action', 'Int32', 'Double', 'Char', 'DateTime', 'Enumerable', 'IComparable', 'IEquatable', 'IDisposable', 'FormatException', 'DivideByZeroException', 'IndexOutOfRangeException', 'ArgumentException', 'ArgumentOutOfRangeException', 'InvalidOperationException', 'NullReferenceException', 'OverflowException', 'KeyNotFoundException', 'System', 'Linq', 'Collections', 'Generic', 'Text']),
    // komentarz liniowy | blokowy | string ($ @ "…") | char | dyrektywa | liczba | identyfikator
    re: /(\/\/[^\n]*)|(\/\*[\s\S]*?(?:\*\/|(?![\s\S])))|((?:\$@|@\$|@)"(?:""|[^"])*"?|\$?"(?:\\.|\{[^}\n]*\}|[^"\\\n])*"?)|('(?:\\.|[^'\\\n])*'?)|(^[ \t]*#[^\n]*)|(\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?[fFdDmMlLuU]*\b|\b0[xX][0-9a-fA-F]+\b)|(@?[A-Za-z_]\w*)/gm,
    classRe: /\b(?:class|struct|interface|enum|record)\s+([A-Za-z_]\w*)/g,
  },
  python: {
    control: new Set(['if', 'elif', 'else', 'for', 'while', 'in', 'break', 'continue', 'return', 'pass', 'try', 'except', 'finally', 'raise', 'with', 'as', 'import', 'from', 'match', 'case', 'yield', 'assert', 'del', 'global', 'nonlocal']),
    keywords: new Set(['def', 'class', 'lambda', 'and', 'or', 'not', 'is', 'True', 'False', 'None', 'self', 'cls', 'async', 'await']),
    types: new Set(['int', 'float', 'str', 'bool', 'list', 'dict', 'tuple', 'set', 'frozenset', 'object', 'range', 'type', 'print', 'input', 'len', 'sum', 'min', 'max', 'abs', 'round', 'sorted', 'reversed', 'enumerate', 'zip', 'map', 'filter', 'any', 'all', 'isinstance', 'super', 'chr', 'ord', 'open', 'math', 'random', 'Exception', 'ValueError', 'TypeError', 'ZeroDivisionError', 'IndexError', 'KeyError', 'NameError', 'AttributeError', 'RuntimeError', 'ABC', 'abstractmethod', 'property', 'staticmethod', 'classmethod']),
    // komentarz | string potrójny | string zwykły | dekorator | liczba | identyfikator
    re: /(#[^\n]*)|((?:\b[rRbBfFuU]{1,2})?(?:"""[\s\S]*?(?:"""|(?![\s\S]))|'''[\s\S]*?(?:'''|(?![\s\S]))))|((?:\b[rRbBfFuU]{1,2})?(?:"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?))|(^[ \t]*@[\w.]+)|(\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?j?\b|\b0[xXbBoO][0-9a-fA-F_]+\b)|([A-Za-z_]\w*)/gm,
    classRe: /\bclass\s+([A-Za-z_]\w*)/g,
  },
};

export function highlight(code, classNames = new Set(), lang = 'cpp') {
  const def = LANG_DEFS[lang] || LANG_DEFS.cpp;
  const RE = def.re;
  let out = '';
  let last = 0;
  RE.lastIndex = 0;
  let m;
  while ((m = RE.exec(code))) {
    if (m.index > last) out += esc(code.slice(last, m.index));
    const tok = m[0];
    if (lang === 'python') {
      const [, com, tri, str, deco, num, id] = m;
      if (com) out += span('tk-comment', tok);
      else if (tri || str) out += span('tk-string', tok);
      else if (deco) out += span('tk-func', tok);
      else if (num) out += span('tk-number', tok);
      else if (id) out += ident(id, code, m.index, def, classNames);
      else out += esc(tok);
    } else {
      const [, lineC, blockC, str, chr, pre, num, id] = m;
      if (lineC || blockC) out += span('tk-comment', tok);
      else if (str || chr) out += span('tk-string', tok);
      else if (pre) {
        const mm = tok.match(/^([ \t]*#\s*\w+)(.*)$/);
        out += mm ? span('tk-pre', mm[1]) + span(lang === 'cpp' ? 'tk-string' : 'tk-var', mm[2]) : span('tk-pre', tok);
      } else if (num) out += span('tk-number', tok);
      else if (id) out += ident(id, code, m.index, def, classNames);
      else out += esc(tok);
    }
    last = m.index + tok.length;
    if (tok.length === 0) RE.lastIndex++;
  }
  out += esc(code.slice(last));
  return out;
}

function ident(id, code, index, def, classNames) {
  const after = code.slice(index + id.length).match(/^\s*\(/);
  if (def.control.has(id)) return span('tk-control', id);
  if (def.keywords.has(id)) return span('tk-keyword', id);
  if (def.types.has(id) || classNames.has(id)) return span('tk-type', id);
  if (after) return span('tk-func', id);
  return span('tk-var', id);
}

export function findClassNames(code, lang = 'cpp') {
  const def = LANG_DEFS[lang] || LANG_DEFS.cpp;
  const set = new Set();
  const re = new RegExp(def.classRe.source, 'g');
  let m;
  while ((m = re.exec(code))) set.add(m[1]);
  return set;
}
