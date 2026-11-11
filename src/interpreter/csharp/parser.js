// Parser podzbioru języka C# – buduje AST.
import { tokenizeCs, LangError } from './lexer.js';

const PRIM = new Set(['int', 'long', 'short', 'byte', 'sbyte', 'uint', 'ulong', 'ushort', 'double', 'float', 'decimal', 'char', 'bool', 'string', 'object', 'void']);
const PRIM_MAP = { short: 'int', byte: 'int', sbyte: 'int', ushort: 'int', uint: 'long', ulong: 'long' };
const MODIFIERS = new Set(['public', 'private', 'protected', 'internal', 'static', 'abstract', 'virtual', 'override', 'sealed', 'readonly', 'const', 'new', 'partial', 'async', 'extern', 'volatile', 'unsafe']);
const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '??=']);
const BIN_PREC = {
  '??': 1, '||': 2, '&&': 3, '|': 4, '^': 5, '&': 6, '==': 7, '!=': 7,
  '<': 8, '>': 8, '<=': 8, '>=': 8, '<<': 9, '>>': 9, '+': 10, '-': 10, '*': 11, '/': 11, '%': 11,
};
export const BUILTIN_TYPES = new Set([
  'List', 'Dictionary', 'KeyValuePair', 'Func', 'Action', 'Predicate', 'StringBuilder', 'Random',
  'String', 'Int32', 'Int64', 'Double', 'Boolean', 'Char', 'Object', 'Decimal', 'Single', 'IEnumerable', 'IList', 'HashSet',
  'IComparable', 'IEquatable', 'IDisposable',
]);

export function parseCs(src, preludeNames = []) {
  const tokens = tokenizeCs(src);
  const p = new CsParser(tokens, preludeNames);
  return p.parseProgram();
}

export class CsParser {
  constructor(tokens, preludeNames = [], shared = null) {
    this.t = tokens;
    this.i = 0;
    this.warnings = shared ? shared.warnings : [];
    this.typeNames = shared ? shared.typeNames : new Set([...BUILTIN_TYPES, ...preludeNames]);
    if (!shared) {
      for (let k = 0; k + 1 < tokens.length; k++) {
        const tk = tokens[k];
        if (tk.type === 'kw' && ['class', 'struct', 'interface', 'enum'].includes(tk.value) && tokens[k + 1].type === 'id') {
          this.typeNames.add(tokens[k + 1].value);
        }
        if (tk.type === 'id' && tk.value === 'record' && tokens[k + 1].type === 'id') this.typeNames.add(tokens[k + 1].value);
      }
    }
  }

  // ---------- narzędzia ----------
  peek(o = 0) { return this.t[Math.min(this.i + o, this.t.length - 1)]; }
  next() { const tk = this.t[this.i]; if (this.i < this.t.length - 1) this.i++; return tk; }
  is(v, o = 0) { const tk = this.peek(o); return (tk.type === 'op' || tk.type === 'kw') && tk.value === v; }
  isId(o = 0) { return this.peek(o).type === 'id'; }
  isWord(w, o = 0) { const tk = this.peek(o); return tk.type === 'id' && tk.value === w; }
  isEof() { return this.peek().type === 'eof'; }
  accept(v) { if (this.is(v)) { this.next(); return true; } return false; }
  line() { return this.peek().line; }
  error(msg, line = this.line()) { throw new LangError(msg, line); }

  expect(v) {
    if (this.accept(v)) return;
    const prev = this.t[this.i - 1];
    const cur = this.peek();
    if (v === ';') throw new LangError(`brakuje średnika ';' na końcu instrukcji (przed '${cur.value}')`, prev ? prev.line : cur.line);
    if (cur.type === 'eof') throw new LangError(`nieoczekiwany koniec programu – oczekiwano '${v}' (może brakuje nawiasu?)`, prev ? prev.line : cur.line);
    throw new LangError(`oczekiwano '${v}', a znaleziono '${cur.value}'`, cur.line);
  }

  expectId(what = 'nazwy') {
    const tk = this.peek();
    if (tk.type !== 'id') {
      if (tk.type === 'kw') this.error(`'${tk.value}' jest słowem kluczowym C# i nie może być nazwą`);
      this.error(`oczekiwano ${what}, a znaleziono '${tk.value}'`);
    }
    return this.next().value;
  }

  closeAngle() {
    const tk = this.peek();
    if (tk.type === 'op' && tk.value === '>>') {
      this.t.splice(this.i, 1, { ...tk, value: '>' }, { ...tk, value: '>' });
      this.next();
      return;
    }
    this.expect('>');
  }

  // ---------- typy ----------
  isTypeStartAt(o = 0) {
    const tk = this.peek(o);
    if (tk.type === 'kw') return PRIM.has(tk.value);
    if (tk.type === 'id') {
      // pełna nazwa z przestrzenią nazw: System.Text.StringBuilder
      let k = o;
      while (this.peek(k + 1).type === 'op' && this.peek(k + 1).value === '.' && this.peek(k + 2).type === 'id') k += 2;
      return this.typeNames.has(this.peek(k).value) || (k === o && tk.value === 'var');
    }
    if (tk.type === 'op' && tk.value === '(') return true; // krotka
    return false;
  }

  tryParseType() {
    const save = this.i;
    try {
      return this.parseType();
    } catch {
      this.i = save;
      return null;
    }
  }

  parseType(allowVar = true) {
    const tk = this.peek();
    let t;
    if (tk.type === 'kw' && PRIM.has(tk.value)) {
      this.next();
      t = PRIM_MAP[tk.value] || tk.value;
    } else if (tk.type === 'op' && tk.value === '(') {
      // krotka: (int, string) albo (int x, string y)
      this.next();
      const items = [];
      do {
        const it = this.parseType(false);
        const name = this.isId() ? this.next().value : null;
        items.push({ t: it, name });
      } while (this.accept(','));
      this.expect(')');
      if (items.length < 2) this.error('krotka musi mieć co najmniej dwa elementy');
      t = { tuple: items };
    } else if (tk.type === 'id') {
      if (tk.value === 'var' && allowVar) { this.next(); return 'var'; }
      let name = this.next().value;
      while (this.is('.') && this.isId(1)) { this.next(); name = this.next().value; } // System.Text.StringBuilder
      if (!this.typeNames.has(name)) throw new LangError(`nieznany typ '${name}'`, tk.line);
      if (this.is('<')) {
        this.next();
        const args = [];
        do { args.push(this.parseType(false)); } while (this.accept(','));
        this.closeAngle();
        t = { generic: name, args };
      } else t = { named: name };
    } else {
      throw new LangError(`oczekiwano nazwy typu, a znaleziono '${tk.value}'`, tk.line);
    }
    for (;;) {
      if (this.is('?') && !this.isExprAfterQuestion()) { this.next(); t = { nullable: t }; continue; }
      if (this.is('[') && (this.is(']', 1) || this.is(',', 1))) {
        this.next();
        let rank = 1;
        while (this.accept(',')) rank++;
        this.expect(']');
        t = { arr: t, rank };
        continue;
      }
      break;
    }
    return t;
  }

  // odróżnia "int? x" od "a ? b : c"
  isExprAfterQuestion() {
    const n = this.peek(1);
    return !(n.type === 'id' || (n.type === 'op' && (n.value === '[' || n.value === ')' || n.value === ',' || n.value === '>')));
  }

  isDeclStart() {
    if (!this.isTypeStartAt()) return false;
    const save = this.i;
    try {
      if (this.is('(')) {
        // (int a, int b) = ...  albo  (int, string) t = ...
        const t = this.parseType();
        if (this.isId()) return true;
        return false;
      }
      this.parseType();
      if (!this.isId()) return false;
      const after = this.peek(1);
      return after.type === 'op' ? ['=', ';', ',', ')'].includes(after.value) : (after.type === 'kw' && after.value === 'in');
    } catch {
      return false;
    } finally {
      this.i = save;
    }
  }

  // ---------- program ----------
  parseProgram() {
    const types = [];
    const topStmts = [];
    const usings = new Set();
    const topFuncs = [];
    while (!this.isEof()) {
      if (this.accept(';')) continue;
      if (this.is('using') && !this.is('(', 1) && !this.isWord('var', 1)) {
        this.next();
        this.accept('static');
        let name = this.expectId('nazwy przestrzeni nazw');
        while (this.accept('.')) name += '.' + this.expectId();
        usings.add(name);
        this.expect(';');
        continue;
      }
      if (this.is('namespace')) {
        this.next();
        let name = this.expectId();
        while (this.accept('.')) name += '.' + this.expectId();
        if (this.accept(';')) continue; // przestrzeń plikowa
        this.expect('{');
        while (!this.accept('}')) {
          if (this.isEof()) this.error("brak '}' zamykającego namespace");
          if (this.accept(';')) continue;
          types.push(this.parseTypeDecl(this.parseModifiers()));
        }
        continue;
      }
      const save = this.i;
      const mods = this.parseModifiers();
      if (this.is('class') || this.is('struct') || this.is('interface') || this.is('enum') || this.isWord('record')) {
        types.push(this.parseTypeDecl(mods));
        continue;
      }
      // funkcja lokalna na najwyższym poziomie: static int F(int x) { ... }
      if (this.isTypeStartAt() || this.is('void')) {
        const s2 = this.i;
        const rt = this.tryParseType();
        if (rt && this.isId() && this.is('(', 1)) {
          const fline = this.line();
          const name = this.next().value;
          if (this.isFuncDefAhead()) {
            topFuncs.push(this.parseMethodRest(name, rt, { static: true }, fline));
            continue;
          }
        }
        this.i = s2;
      }
      if (mods.length) this.i = save;
      topStmts.push(this.parseStatement());
    }
    return { kind: 'Program', types, topStmts, topFuncs, usings, warnings: this.warnings };
  }

  isFuncDefAhead() {
    let depth = 0;
    for (let k = this.i; k < this.t.length; k++) {
      const tk = this.t[k];
      if (tk.type === 'op' && tk.value === '(') depth++;
      if (tk.type === 'op' && tk.value === ')') {
        depth--;
        if (depth === 0) {
          const n = this.t[k + 1];
          return !!n && n.type === 'op' && (n.value === '{' || n.value === '=>');
        }
      }
    }
    return false;
  }

  parseModifiers() {
    const mods = [];
    while (this.peek().type === 'kw' && MODIFIERS.has(this.peek().value)) {
      if (this.peek().value === 'new' && (this.isTypeStartAt(1) === false || this.is('(', 1) || this.is('[', 1))) break;
      mods.push(this.next().value);
    }
    return mods;
  }

  modObj(mods) {
    const o = {};
    for (const m of mods) o[m] = true;
    o.access = mods.includes('public') || mods.includes('internal') ? 'public' : mods.includes('protected') ? 'protected' : mods.includes('private') ? 'private' : null;
    return o;
  }

  parseTypeDecl(mods) {
    const line = this.line();
    const m = this.modObj(mods);
    if (this.is('enum')) {
      this.next();
      const name = this.expectId('nazwy wyliczenia');
      if (this.accept(':')) this.parseType();
      this.expect('{');
      const items = [];
      while (!this.accept('}')) {
        const n = this.expectId('nazwy wartości wyliczenia');
        const init = this.accept('=') ? this.parseTernary() : null;
        items.push({ name: n, init });
        if (!this.accept(',')) { this.expect('}'); break; }
      }
      this.accept(';');
      return { kind: 'Enum', name, items, line };
    }
    let kind;
    if (this.isWord('record')) { this.next(); kind = this.accept('struct') ? 'struct' : 'class'; this.accept('class'); }
    else kind = this.next().value; // class | struct | interface
    const name = this.expectId('nazwy typu');
    if (this.is('<')) this.error('klasy generyczne (szablony) nie są obsługiwane w tym środowisku');
    const bases = [];
    if (this.accept(':')) {
      do {
        bases.push(this.expectId('nazwy klasy bazowej lub interfejsu'));
        if (this.is('<')) { // np. IComparable<Uczen>
          this.next();
          do { this.parseType(false); } while (this.accept(','));
          this.closeAngle();
        }
      } while (this.accept(','));
    }
    const decl = {
      kind: 'Type', typeKind: kind, name, bases, line,
      isStatic: !!m.static, isAbstract: !!m.abstract || kind === 'interface', isSealed: !!m.sealed,
      fields: [], props: [], methods: [], ctors: [], operators: [], indexers: [], nested: [],
    };
    this.expect('{');
    while (!this.accept('}')) {
      if (this.isEof()) this.error(`brak '}' zamykającego ${kind === 'interface' ? 'interfejs' : 'klasę'} '${name}'`, line);
      if (this.accept(';')) continue;
      this.parseMember(decl);
    }
    this.accept(';');
    return decl;
  }

  parseMember(decl) {
    const line = this.line();
    const mods = this.parseModifiers();
    const m = this.modObj(mods);
    const isIface = decl.typeKind === 'interface';
    const access = m.access || (isIface ? 'public' : 'private');
    if (this.is('class') || this.is('struct') || this.is('interface') || this.is('enum')) {
      decl.nested.push(this.parseTypeDecl(mods));
      return;
    }
    if (this.is('~')) {
      this.next();
      this.expectId();
      this.expect('(');
      this.expect(')');
      this.parseBlock();
      return; // finalizator – nie jest wywoływany (decyduje GC)
    }
    // konstruktor
    if (this.isId() && this.peek().value === decl.name && this.is('(', 1)) {
      this.next();
      this.expect('(');
      const params = this.parseParams();
      let init = null;
      if (this.accept(':')) {
        const which = this.next().value;
        if (which !== 'base' && which !== 'this') this.error("po ':' w konstruktorze oczekiwano base(...) lub this(...)");
        init = { which, args: this.parseArgs() };
      }
      let body;
      if (this.accept('=>')) { const e = this.parseExpr(); this.expect(';'); body = { kind: 'Block', stmts: [{ kind: 'ExprStmt', expr: e, line }], line }; }
      else body = this.parseBlock();
      decl.ctors.push({ kind: 'Ctor', name: decl.name, params, init, body, access: m.access || 'private', isStatic: !!m.static, line });
      return;
    }
    let type;
    if (this.accept('void')) type = 'void';
    else {
      if (!this.isTypeStartAt()) {
        const tk = this.peek();
        if (tk.type === 'id' && this.is('(', 1)) this.error(`brak typu zwracanego metody '${tk.value}' (konstruktor musi nazywać się tak jak klasa: ${decl.name})`);
        this.error(`nieoczekiwany element '${tk.value}' w definicji typu '${decl.name}'`);
      }
      type = this.parseType(false);
    }
    if (this.accept('operator')) {
      const tk = this.next();
      let op = tk.value;
      if (op === 'true' || op === 'false') this.error('operatory true/false nie są obsługiwane');
      this.expect('(');
      const params = this.parseParams();
      const body = this.parseBodyOrArrow(line);
      decl.operators.push({ kind: 'Method', name: `op_${op}`, op, ret: type, params, body, access: 'public', isStatic: true, line });
      return;
    }
    if (this.accept('this')) {
      this.expect('[');
      const params = this.parseParamsUntil(']');
      const acc = this.parseAccessors(line);
      decl.indexers.push({ kind: 'Indexer', type, params, ...acc, access, line });
      return;
    }
    const nameLine = this.line();
    const name = this.expectId('nazwy pola, właściwości lub metody');
    if (this.is('<')) this.error('metody generyczne nie są obsługiwane w tym środowisku');
    if (this.is('(')) {
      const meth = this.parseMethodRest(name, type, m, nameLine);
      meth.access = access;
      if (isIface) { meth.isAbstract = !meth.body; meth.isVirtual = true; }
      if (meth.isAbstract && meth.body) this.error(`metoda abstrakcyjna '${name}' nie może mieć ciała`, nameLine);
      if (!meth.body && !meth.isAbstract && !isIface && !m.extern) this.error(`metoda '${name}' musi mieć ciało { ... } (albo być abstract)`, nameLine);
      decl.methods.push(meth);
      return;
    }
    if (this.is('{')) {
      const acc = this.parseAccessors(nameLine);
      let init = null;
      if (this.accept('=')) { init = this.parseVarInit(); this.expect(';'); }
      decl.props.push({ kind: 'Prop', name, type, ...acc, init, access, isStatic: !!m.static, isVirtual: !!m.virtual || !!m.abstract || isIface, isAbstract: !!m.abstract || isIface, isOverride: !!m.override, line: nameLine });
      return;
    }
    if (this.accept('=>')) {
      const e = this.parseExpr();
      this.expect(';');
      decl.props.push({ kind: 'Prop', name, type, getter: { body: { kind: 'Block', stmts: [{ kind: 'Return', expr: e, line: nameLine }], line: nameLine } }, setter: null, auto: false, access, isStatic: !!m.static, isVirtual: !!m.virtual, isOverride: !!m.override, line: nameLine });
      return;
    }
    // pola
    let fname = name;
    for (;;) {
      let init = null;
      if (this.accept('=')) init = this.parseVarInit();
      if (isIface) this.error('interfejs nie może zawierać pól – tylko metody i właściwości', nameLine);
      decl.fields.push({ name: fname, type, init, access, isStatic: !!m.static || !!m.const, isConst: !!m.const, isReadonly: !!m.readonly, line: nameLine });
      if (this.accept(',')) { fname = this.expectId(); continue; }
      this.expect(';');
      break;
    }
  }

  parseAccessors(line) {
    this.expect('{');
    let getter = null, setter = null, auto = true;
    while (!this.accept('}')) {
      const mods = this.parseModifiers();
      const am = this.modObj(mods);
      const which = this.expectId("'get' lub 'set'");
      if (which !== 'get' && which !== 'set' && which !== 'init') this.error(`w akcesorach właściwości oczekiwano get/set, a znaleziono '${which}'`);
      let body = null;
      if (this.accept(';')) body = null;
      else if (this.accept('=>')) {
        auto = false;
        const e = this.parseExpr();
        this.expect(';');
        body = which === 'get'
          ? { kind: 'Block', stmts: [{ kind: 'Return', expr: e, line }], line }
          : { kind: 'Block', stmts: [{ kind: 'ExprStmt', expr: e, line }], line };
      } else { auto = false; body = this.parseBlock(); }
      const acc = { body, access: am.access };
      if (which === 'get') getter = acc; else setter = acc;
    }
    if (getter && getter.body === null && setter && setter.body !== null) this.error('w tym środowisku obie części właściwości (get i set) muszą być automatyczne albo obie mieć ciało', line);
    return { getter, setter, auto: auto && !!getter };
  }

  parseBodyOrArrow(line) {
    if (this.accept('=>')) {
      const e = this.parseExpr();
      this.expect(';');
      return { kind: 'Block', stmts: [{ kind: 'Return', expr: e, line, arrow: true }], line, arrow: true };
    }
    if (this.accept(';')) return null;
    return this.parseBlock();
  }

  parseMethodRest(name, ret, m, line) {
    this.expect('(');
    const params = this.parseParams();
    const body = this.parseBodyOrArrow(line);
    return {
      kind: 'Method', name, ret, params, body, line,
      isStatic: !!m.static, isVirtual: !!m.virtual || !!m.abstract, isAbstract: !!m.abstract,
      isOverride: !!m.override, isNew: !!m.new, isSealed: !!m.sealed,
    };
  }

  parseParams() { return this.parseParamsUntil(')'); }

  parseParamsUntil(close) {
    const params = [];
    if (this.accept(close)) return params;
    do {
      let mode = null;
      if (this.accept('ref')) mode = 'ref';
      else if (this.accept('out')) mode = 'out';
      else if (this.accept('in')) mode = 'in';
      else if (this.accept('params')) mode = 'params';
      else if (this.accept('this')) mode = null;
      if (!this.isTypeStartAt()) {
        const tk = this.peek();
        this.error(tk.type === 'id' ? `brak typu parametru '${tk.value}' (np. int ${tk.value})` : `oczekiwano typu parametru, a znaleziono '${tk.value}'`);
      }
      const type = this.parseType(false);
      const name = this.expectId('nazwy parametru');
      const def = this.accept('=') ? this.parseTernary() : null;
      params.push({ name, type, mode, def });
    } while (this.accept(','));
    this.expect(close);
    return params;
  }

  // ---------- instrukcje ----------
  parseBlock() {
    const line = this.line();
    this.expect('{');
    const stmts = [];
    while (!this.is('}')) {
      if (this.isEof()) throw new LangError("brakuje zamykającego nawiasu klamrowego '}' dla bloku otwartego w tej linii", line);
      stmts.push(this.parseStatement());
    }
    this.next();
    return { kind: 'Block', stmts, line };
  }

  parseStatement() {
    const tk = this.peek();
    const line = tk.line;
    if (tk.type === 'op' && tk.value === '{') return this.parseBlock();
    if (tk.type === 'op' && tk.value === ';') { this.next(); return { kind: 'Empty', line }; }
    if (tk.type === 'kw') {
      switch (tk.value) {
        case 'if': {
          this.next();
          this.expect('(');
          const cond = this.parseExpr();
          this.expect(')');
          if (cond.kind === 'Assign' && cond.op === '=') this.warnings.push({ line, message: "w warunku użyto '=' (przypisanie) – czy chodziło o '==' (porównanie)?" });
          const then = this.parseStatement();
          const els = this.accept('else') ? this.parseStatement() : null;
          return { kind: 'If', cond, then, else: els, line };
        }
        case 'while': {
          this.next();
          this.expect('(');
          const cond = this.parseExpr();
          this.expect(')');
          return { kind: 'While', cond, body: this.parseStatement(), line };
        }
        case 'do': {
          this.next();
          const body = this.parseStatement();
          if (!this.accept('while')) this.error("oczekiwano 'while (...)' po bloku 'do'");
          this.expect('(');
          const cond = this.parseExpr();
          this.expect(')');
          this.expect(';');
          return { kind: 'DoWhile', cond, body, line };
        }
        case 'for': return this.parseFor();
        case 'foreach': {
          this.next();
          this.expect('(');
          const type = this.parseType();
          const name = this.expectId('nazwy zmiennej pętli');
          if (!this.accept('in')) this.error("w pętli foreach oczekiwano słowa 'in', np. foreach (int x in tablica)");
          const expr = this.parseExpr();
          this.expect(')');
          return { kind: 'Foreach', type, name, expr, body: this.parseStatement(), line };
        }
        case 'switch': return this.parseSwitch();
        case 'return': {
          this.next();
          const expr = this.is(';') ? null : this.parseExpr();
          this.expect(';');
          return { kind: 'Return', expr, line };
        }
        case 'break': this.next(); this.expect(';'); return { kind: 'Break', line };
        case 'continue': this.next(); this.expect(';'); return { kind: 'Continue', line };
        case 'throw': {
          this.next();
          const expr = this.is(';') ? null : this.parseExpr();
          this.expect(';');
          return { kind: 'Throw', expr, line };
        }
        case 'try': return this.parseTry();
        case 'else': this.error("'else' bez pasującego 'if'"); break;
        case 'case': case 'default':
          if (!(tk.value === 'default' && this.is('(', 1))) this.error(`'${tk.value}' może wystąpić tylko wewnątrz instrukcji switch`);
          break;
        case 'const': {
          this.next();
          const d = this.parseLocalDecl(true);
          d.isConst = true;
          return d;
        }
        case 'class': case 'struct': case 'interface': case 'enum':
          this.error('definicje typów umieszczaj poza metodami (np. przed klasą Program albo w niej, ale nie w Main)');
          break;
        case 'using':
          if (this.is('(', 1)) this.error("instrukcja using (...) nie jest obsługiwana w tym środowisku");
          break;
        default: break;
      }
    }
    // funkcja lokalna
    if ((this.isTypeStartAt() || this.is('void') || this.is('static')) ) {
      const save = this.i;
      this.accept('static');
      const rt = this.is('void') ? (this.next(), 'void') : this.tryParseType();
      if (rt && this.isId() && this.is('(', 1)) {
        const fline = this.line();
        const name = this.next().value;
        if (this.isFuncDefAhead()) {
          const fn = this.parseMethodRest(name, rt, {}, fline);
          return { kind: 'LocalFunc', fn, line: fline };
        }
      }
      this.i = save;
    }
    // dekonstrukcja: var (a, b) = ...
    if (this.isWord('var') && this.is('(', 1)) {
      this.next();
      const target = this.parsePrimary();
      this.expect('=');
      const value = this.parseExpr();
      this.expect(';');
      return { kind: 'Deconstruct', names: target.items.map((x) => x.expr.name), value, declare: true, line };
    }
    if (this.isDeclStart()) return this.parseLocalDecl(true);
    const expr = this.parseExpr();
    this.expect(';');
    if (!['Assign', 'Call', 'PreInc', 'PostInc', 'New', 'Await'].includes(expr.kind)) {
      this.error('tylko przypisanie, wywołanie metody, ++/-- lub new mogą być osobną instrukcją (CS0201)', line);
    }
    return { kind: 'ExprStmt', expr, line };
  }

  parseVarInit() {
    if (this.is('{')) return this.parseArrayInit();
    return this.parseExpr();
  }

  parseArrayInit() {
    const line = this.line();
    this.expect('{');
    const items = [];
    if (!this.accept('}')) {
      do {
        if (this.is('}')) break;
        items.push(this.is('{') ? this.parseArrayInit() : this.parseExpr());
      } while (this.accept(','));
      this.expect('}');
    }
    return { kind: 'ArrayInit', items, line };
  }

  parseLocalDecl(requireSemi) {
    const line = this.line();
    const type = this.parseType();
    const decls = [];
    do {
      const dline = this.line();
      const name = this.expectId('nazwy zmiennej');
      if (this.is('[')) this.error(`w C# nawiasy tablicy piszemy przy typie: ${'int[] ' + name}, a nie przy nazwie`);
      let init = null;
      if (this.accept('=')) init = this.parseVarInit();
      decls.push({ name, init, line: dline });
    } while (this.accept(','));
    if (type === 'var' && decls.some((d) => !d.init)) this.error("zmienna zadeklarowana jako 'var' musi mieć wartość początkową", line);
    if (requireSemi) this.expect(';');
    return { kind: 'VarDecl', type, decls, line };
  }

  parseFor() {
    const line = this.line();
    this.next();
    this.expect('(');
    let init = [];
    if (!this.is(';')) {
      if (this.isDeclStart()) init = [this.parseLocalDecl(false)];
      else {
        do { init.push({ kind: 'ExprStmt', expr: this.parseExpr(), line }); } while (this.accept(','));
      }
    }
    this.expect(';');
    const cond = this.is(';') ? null : this.parseExpr();
    this.expect(';');
    const step = [];
    if (!this.is(')')) { do { step.push(this.parseExpr()); } while (this.accept(',')); }
    this.expect(')');
    return { kind: 'For', init, cond, step, body: this.parseStatement(), line };
  }

  parseSwitch() {
    const line = this.line();
    this.next();
    this.expect('(');
    const expr = this.parseExpr();
    this.expect(')');
    this.expect('{');
    const sections = [];
    while (!this.accept('}')) {
      if (this.isEof()) this.error("brakuje '}' zamykającego switch", line);
      const sec = { labels: [], body: [], line: this.line() };
      while (this.is('case') || (this.is('default') && this.is(':', 1))) {
        if (this.accept('default')) { this.expect(':'); sec.labels.push({ isDefault: true }); continue; }
        this.next();
        const pat = this.parsePattern();
        let when = null;
        if (this.isWord('when')) { this.next(); when = this.parseExpr(); }
        this.expect(':');
        sec.labels.push({ pat, when });
      }
      if (!sec.labels.length) this.error("instrukcja w switch przed pierwszym 'case'");
      while (!this.is('case') && !(this.is('default') && this.is(':', 1)) && !this.is('}')) {
        if (this.isEof()) this.error("brakuje '}' zamykającego switch", line);
        sec.body.push(this.parseStatement());
      }
      sections.push(sec);
    }
    return { kind: 'Switch', expr, sections, line };
  }

  // wzorce: stała, typ z nazwą, relacyjne (< 5), and/or, _
  parsePattern() {
    let left = this.parsePatternPrimary();
    for (;;) {
      if (this.isWord('and')) { this.next(); left = { pk: 'and', a: left, b: this.parsePatternPrimary() }; continue; }
      if (this.isWord('or')) { this.next(); left = { pk: 'or', a: left, b: this.parsePatternPrimary() }; continue; }
      return left;
    }
  }

  parsePatternPrimary() {
    if (this.isWord('not')) { this.next(); return { pk: 'not', a: this.parsePatternPrimary() }; }
    if (this.isWord('_')) { this.next(); return { pk: 'any' }; }
    if (this.is('null')) { this.next(); return { pk: 'const', e: { kind: 'Null', line: this.line() } }; }
    for (const op of ['<=', '>=', '<', '>']) {
      if (this.is(op)) { this.next(); return { pk: 'rel', op, e: this.parseBinary(9) }; }
    }
    // wzorzec typu: "x is Kolo k", "case int n:", "x is string"
    if (this.isTypeStartAt() && !this.is('(')) {
      const save = this.i;
      const t = this.tryParseType();
      if (t && t !== 'var') {
        if (this.isId() && !['when', 'and', 'or'].includes(this.peek().value)) return { pk: 'type', t, name: this.next().value };
        if (!this.is('.')) {
          // sam typ bez nazwy – w czasie wykonania okaże się, czy to typ, czy stała
          const end = this.i;
          this.i = save;
          const e = this.parseBinary(9);
          if (this.i === end) return { pk: 'typeOrConst', t, e };
          return { pk: 'const', e };
        }
      }
      this.i = save;
    }
    return { pk: 'const', e: this.parseBinary(9) };
  }

  parseTry() {
    const line = this.line();
    this.next();
    const body = this.parseBlock();
    const catches = [];
    while (this.accept('catch')) {
      const c = { type: null, name: null, when: null, line: this.line() };
      if (this.accept('(')) {
        c.type = this.parseType(false);
        if (this.isId()) c.name = this.next().value;
        this.expect(')');
      }
      if (this.isWord('when')) { this.next(); this.expect('('); c.when = this.parseExpr(); this.expect(')'); }
      c.body = this.parseBlock();
      catches.push(c);
    }
    const fin = this.accept('finally') ? this.parseBlock() : null;
    if (!catches.length && !fin) this.error("po bloku try musi wystąpić catch lub finally");
    return { kind: 'Try', body, catches, fin, line };
  }

  // ---------- wyrażenia ----------
  parseExpr() { return this.parseAssign(); }

  parseAssign() {
    if (this.isLambdaAhead()) return this.parseLambda();
    const left = this.parseTernary();
    const tk = this.peek();
    if (tk.type === 'op' && ASSIGN_OPS.has(tk.value)) {
      this.next();
      const right = (tk.value === '=' && this.is('{')) ? this.parseArrayInit() : this.parseAssign();
      return { kind: 'Assign', op: tk.value, l: left, r: right, line: tk.line };
    }
    return left;
  }

  isLambdaAhead() {
    if (this.isId() && this.is('=>', 1)) return true;
    if (!this.is('(')) return false;
    let depth = 0;
    for (let k = this.i; k < this.t.length; k++) {
      const tk = this.t[k];
      if (tk.type === 'op' && tk.value === '(') depth++;
      else if (tk.type === 'op' && tk.value === ')') {
        depth--;
        if (depth === 0) { const n = this.t[k + 1]; return !!n && n.type === 'op' && n.value === '=>'; }
      } else if (depth === 1 && tk.type === 'op' && !['(', ')', ',', '[', ']', '<', '>', '?'].includes(tk.value)) return false;
    }
    return false;
  }

  parseLambda() {
    const line = this.line();
    const params = [];
    if (this.isId()) params.push({ name: this.next().value, type: null });
    else {
      this.expect('(');
      if (!this.accept(')')) {
        do {
          if (this.isId() && (this.is(',', 1) || this.is(')', 1))) params.push({ name: this.next().value, type: null });
          else { const t = this.parseType(false); params.push({ name: this.expectId(), type: t }); }
        } while (this.accept(','));
        this.expect(')');
      }
    }
    this.expect('=>');
    if (this.is('{')) return { kind: 'Lambda', params, body: this.parseBlock(), line };
    return { kind: 'Lambda', params, expr: this.parseExpr(), line };
  }

  parseTernary() {
    const c = this.parseBinary(1);
    if (this.is('?')) {
      const line = this.next().line;
      const a = this.parseExpr();
      this.expect(':');
      const b = this.parseExpr();
      return { kind: 'Ternary', c, a, b, line };
    }
    return c;
  }

  parseBinary(minPrec) {
    let left = this.parseUnary();
    for (;;) {
      const tk = this.peek();
      if (tk.type === 'kw' && (tk.value === 'is' || tk.value === 'as') && minPrec <= 8) {
        this.next();
        if (tk.value === 'as') { left = { kind: 'As', e: left, type: this.parseType(false), line: tk.line }; continue; }
        const pat = this.parsePattern();
        left = { kind: 'Is', e: left, pat, line: tk.line };
        continue;
      }
      if (tk.type === 'kw' && tk.value === 'switch' && this.is('{', 1)) {
        left = this.parseSwitchExpr(left);
        continue;
      }
      if (tk.type !== 'op') break;
      const p = BIN_PREC[tk.value];
      if (!p || p < minPrec) break;
      this.next();
      // ?? jest prawostronnie łączny
      const right = tk.value === '??' ? this.parseBinary(p) : this.parseBinary(p + 1);
      left = { kind: 'Binary', op: tk.value, l: left, r: right, line: tk.line };
    }
    return left;
  }

  parseSwitchExpr(subject) {
    const line = this.line();
    this.next();
    this.expect('{');
    const arms = [];
    while (!this.accept('}')) {
      const pat = this.parsePattern();
      let when = null;
      if (this.isWord('when')) { this.next(); when = this.parseExpr(); }
      this.expect('=>');
      const value = this.parseExpr();
      arms.push({ pat, when, value });
      if (!this.accept(',')) { this.expect('}'); break; }
    }
    return { kind: 'SwitchExpr', subject, arms, line };
  }

  parseUnary() {
    const tk = this.peek();
    const line = tk.line;
    if (tk.type === 'op') {
      if (['!', '-', '+', '~'].includes(tk.value)) { this.next(); return { kind: 'Unary', op: tk.value, e: this.parseUnary(), line }; }
      if (tk.value === '++' || tk.value === '--') { this.next(); return { kind: 'PreInc', op: tk.value, e: this.parseUnary(), line }; }
      if (tk.value === '(' && this.isCastAhead()) {
        this.next();
        const type = this.parseType(false);
        this.expect(')');
        return { kind: 'Cast', type, e: this.parseUnary(), line };
      }
    }
    return this.parsePostfix(this.parsePrimary());
  }

  isCastAhead() {
    const save = this.i;
    try {
      this.next();
      const n0 = this.peek();
      const prim = n0.type === 'kw' && PRIM.has(n0.value);
      const named = n0.type === 'id' && this.typeNames.has(n0.value);
      if (!prim && !named) return false;
      this.parseType(false);
      if (!this.is(')')) return false;
      this.next();
      const n = this.peek();
      if (prim) return !(n.type === 'op' && [')', ';', ',', '.', '=', ']', '}', '?', ':', '*', '/', '%', '<', '>', '==', '!=', '&&', '||'].includes(n.value));
      return n.type === 'id' || n.type === 'num' || n.type === 'str' || n.type === 'char' || (n.type === 'kw' && ['this', 'new', 'base', 'true', 'false', 'null'].includes(n.value)) || (n.type === 'op' && (n.value === '(' || n.value === '!'));
    } catch {
      return false;
    } finally {
      this.i = save;
    }
  }

  parsePostfix(e) {
    for (;;) {
      const tk = this.peek();
      if (tk.type !== 'op') break;
      if (tk.value === '(') { e = { kind: 'Call', callee: e, args: this.parseArgs(), line: tk.line }; }
      else if (tk.value === '[') {
        this.next();
        const idx = [];
        do { idx.push(this.parseExpr()); } while (this.accept(','));
        this.expect(']');
        e = { kind: 'Index', obj: e, idx, line: tk.line };
      } else if (tk.value === '.' || tk.value === '?.') {
        this.next();
        const nt = this.peek();
        if (nt.type !== 'id' && nt.type !== 'kw') this.error('oczekiwano nazwy składowej po kropce');
        this.next();
        e = { kind: 'Member', obj: e, name: nt.value, nullCond: tk.value === '?.', line: tk.line };
      } else if (tk.value === '++' || tk.value === '--') { this.next(); e = { kind: 'PostInc', op: tk.value, e, line: tk.line }; }
      else if (tk.value === '!' && (this.is('.', 1) || this.is(';', 1) || this.is(')', 1))) { this.next(); }
      else break;
    }
    return e;
  }

  parseArgs() {
    this.expect('(');
    const args = [];
    if (this.accept(')')) return args;
    do {
      let mode = null;
      let name = null;
      if (this.isId() && this.is(':', 1)) { name = this.next().value; this.next(); }
      if (this.accept('ref')) mode = 'ref';
      else if (this.accept('out')) {
        mode = 'out';
        // out int x / out var x – deklaracja w miejscu wywołania
        if ((this.isTypeStartAt() && this.isId(1)) || (this.isTypeStartAt() && this.peek().type === 'kw' && this.isId(1))) {
          const type = this.parseType();
          const vname = this.expectId();
          args.push({ mode, name, expr: { kind: 'OutDecl', type, name: vname, line: this.line() } });
          continue;
        }
      } else if (this.accept('in')) mode = null;
      args.push({ mode, name, expr: this.parseExpr() });
    } while (this.accept(','));
    this.expect(')');
    return args;
  }

  parseInterp(tk) {
    const holes = tk.holes.map((h) => {
      const toks = tokenizeCs(h.src, h.line - 1);
      const sub = new CsParser(toks, [], { typeNames: this.typeNames, warnings: this.warnings });
      const expr = sub.parseExpr();
      if (!sub.isEof()) sub.error(`niepoprawne wyrażenie w nawiasach {} napisu interpolowanego`);
      return { expr, fmt: h.fmt, align: h.align };
    });
    return { kind: 'Interp', parts: tk.parts, holes, line: tk.line };
  }

  parseNew(line) {
    // new() z typem docelowym
    if (this.is('(')) return { kind: 'New', type: null, args: this.parseArgs(), init: this.is('{') ? this.parseObjInit() : null, line };
    // new[] { ... }
    if (this.is('[') && this.is(']', 1)) {
      this.next(); this.next();
      return { kind: 'NewArray', type: null, sizes: [], init: this.parseArrayInit(), line };
    }
    if (this.is('{')) this.error('typy anonimowe (new { ... }) nie są obsługiwane');
    // typ bez części tablicowej
    const tk = this.peek();
    let base;
    if (tk.type === 'kw' && PRIM.has(tk.value)) { this.next(); base = PRIM_MAP[tk.value] || tk.value; }
    else {
      let name = this.expectId('nazwy typu');
      while (this.is('.') && this.isId(1)) { this.next(); name = this.next().value; }
      if (!this.typeNames.has(name)) this.error(`nieznany typ '${name}'`);
      if (this.is('<')) {
        this.next();
        const args = [];
        do { args.push(this.parseType(false)); } while (this.accept(','));
        this.closeAngle();
        base = { generic: name, args };
      } else base = { named: name };
    }
    // tablica elementów nullable: new int?[n]
    if (this.is('?') && this.is('[', 1)) { this.next(); base = { nullable: base }; }
    if (this.is('[')) {
      this.next();
      const sizes = [];
      if (!this.is(']') && !this.is(',')) {
        do { sizes.push(this.parseExpr()); } while (this.accept(','));
      } else {
        let rank = 1;
        while (this.accept(',')) rank++;
        for (let k = 0; k < rank; k++) sizes.push(null);
      }
      this.expect(']');
      let elem = base;
      // tablice postrzępione: new int[3][]
      while (this.is('[') && (this.is(']', 1) || this.is(',', 1))) {
        this.next();
        let rank = 1;
        while (this.accept(',')) rank++;
        this.expect(']');
        elem = { arr: elem, rank };
      }
      const init = this.is('{') ? this.parseArrayInit() : null;
      if (sizes.every((s) => s === null) && !init) this.error('tablica musi mieć podany rozmiar albo listę wartości { }');
      return { kind: 'NewArray', type: elem, sizes, init, line };
    }
    if (this.is('?')) { this.next(); base = { nullable: base }; }
    const args = this.is('(') ? this.parseArgs() : [];
    const init = this.is('{') ? this.parseObjInit() : null;
    if (!init && !(this.t[this.i - 1].type === 'op' && this.t[this.i - 1].value === ')')) this.error("po 'new Typ' oczekiwano nawiasów (), np. new Punkt()");
    return { kind: 'New', type: base, args, init, line };
  }

  // inicjalizator obiektu { X = 1 } albo kolekcji { 1, 2 } / { {"a", 1} } / { ["a"] = 1 }
  parseObjInit() {
    const line = this.line();
    this.expect('{');
    const members = [];
    const items = [];
    if (!this.accept('}')) {
      do {
        if (this.is('}')) break;
        if (this.isId() && this.is('=', 1)) {
          const name = this.next().value;
          this.next();
          members.push({ name, value: this.is('{') ? this.parseArrayInit() : this.parseExpr() });
        } else if (this.is('[')) {
          this.next();
          const key = this.parseExpr();
          this.expect(']');
          this.expect('=');
          items.push({ key, value: this.parseExpr() });
        } else if (this.is('{')) {
          const pair = this.parseArrayInit();
          items.push({ key: pair.items[0], value: pair.items[1] });
        } else items.push({ value: this.parseExpr() });
      } while (this.accept(','));
      this.expect('}');
    }
    return { kind: 'ObjInit', members, items, line };
  }

  parsePrimary() {
    const tk = this.peek();
    const line = tk.line;
    switch (tk.type) {
      case 'num': this.next(); return { kind: 'Num', v: tk.value, t: tk.t, line };
      case 'str': this.next(); return { kind: 'Str', v: tk.value, line };
      case 'char': this.next(); return { kind: 'Char', v: tk.value, line };
      case 'interp': this.next(); return this.parseInterp(tk);
      case 'eof': this.error("nieoczekiwany koniec programu – może brakuje '}' lub ')'?"); break;
      case 'kw':
        switch (tk.value) {
          case 'true': this.next(); return { kind: 'Bool', v: true, line };
          case 'false': this.next(); return { kind: 'Bool', v: false, line };
          case 'null': this.next(); return { kind: 'Null', line };
          case 'this': this.next(); return { kind: 'This', line };
          case 'base': this.next(); return { kind: 'Base', line };
          case 'new': this.next(); return this.parseNew(line);
          case 'default':
            this.next();
            if (this.accept('(')) { const t = this.parseType(false); this.expect(')'); return { kind: 'Default', type: t, line }; }
            return { kind: 'Default', type: null, line };
          case 'typeof': {
            this.next(); this.expect('(');
            const t = this.parseType(false);
            this.expect(')');
            return { kind: 'TypeOf', type: t, line };
          }
          case 'nameof': {
            this.next(); this.expect('(');
            const e = this.parseExpr();
            this.expect(')');
            const name = e.kind === 'Member' ? e.name : (e.name || '?');
            return { kind: 'Str', v: name, line };
          }
          default:
            if (PRIM.has(tk.value)) {
              this.next();
              return { kind: 'TypeRef', name: PRIM_MAP[tk.value] || tk.value, line };
            }
            this.error(`nieoczekiwane słowo kluczowe '${tk.value}' w wyrażeniu`);
        }
        break;
      case 'op':
        if (tk.value === '(') {
          this.next();
          const first = this.parseTupleItem();
          if (this.accept(',')) {
            const items = [first];
            do { items.push(this.parseTupleItem()); } while (this.accept(','));
            this.expect(')');
            return { kind: 'TupleLit', items, line };
          }
          this.expect(')');
          if (first.name) this.error('nazwany element wymaga krotki z co najmniej dwoma elementami');
          return first.expr;
        }
        this.error(`nieoczekiwany symbol '${tk.value}' w wyrażeniu`);
        break;
      case 'id': {
        this.next();
        if (this.typeNames.has(tk.value) && this.is('<') && BUILTIN_TYPES.has(tk.value)) {
          this.error(`typ generyczny '${tk.value}<...>' można tu użyć tylko po 'new'`);
        }
        return { kind: 'Ident', name: tk.value, line };
      }
      default: break;
    }
    this.error(`nieoczekiwany element '${tk.value}'`);
    return null;
  }

  parseTupleItem() {
    if (this.isId() && this.is(':', 1)) {
      const name = this.next().value;
      this.next();
      return { name, expr: this.parseExpr() };
    }
    return { name: null, expr: this.parseExpr() };
  }
}
