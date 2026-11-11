// Parser podzbioru języka C++ – buduje drzewo składniowe (AST).
import { tokenize, CppError } from './lexer.js';

const PRIM_KW = new Set(['int', 'long', 'short', 'double', 'float', 'char', 'bool', 'void', 'unsigned', 'signed', 'auto']);
const QUALIFIERS = new Set(['const', 'static', 'constexpr', 'inline', 'virtual', 'typename']);
const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '&=', '|=', '^=']);
const PREC = {
  '||': 1, '&&': 2, '|': 3, '^': 4, '&': 5, '==': 6, '!=': 6,
  '<': 7, '<=': 7, '>': 7, '>=': 7, '<<': 8, '>>': 8, '+': 9, '-': 9, '*': 10, '/': 10, '%': 10,
};

export function parse(src) {
  const { tokens, includes } = tokenize(src);
  const p = new Parser(tokens);
  const program = p.parseProgram();
  program.includes = includes;
  program.usingStd = p.usingStd;
  program.warnings = p.warnings;
  return program;
}

class Parser {
  constructor(tokens) {
    this.t = tokens;
    this.i = 0;
    this.classNames = new Set();
    this.aliases = new Map();
    this.usingStd = false;
    this.warnings = [];
    this.enumNames = new Set();
    for (let k = 0; k + 1 < tokens.length; k++) {
      if (tokens[k].type === 'kw' && ['class', 'struct', 'union'].includes(tokens[k].value) && tokens[k + 1].type === 'id'
        && !(k > 0 && tokens[k - 1].type === 'kw' && tokens[k - 1].value === 'enum')) {
        this.classNames.add(tokens[k + 1].value);
      }
    }
  }

  // ---------- narzędzia ----------
  peek(o = 0) { return this.t[Math.min(this.i + o, this.t.length - 1)]; }
  next() { const tk = this.t[this.i]; if (this.i < this.t.length - 1) this.i++; return tk; }
  is(v, o = 0) { const tk = this.peek(o); return (tk.type === 'op' || tk.type === 'kw') && tk.value === v; }
  isId(o = 0) { return this.peek(o).type === 'id'; }
  isEof() { return this.peek().type === 'eof'; }
  accept(v) { if (this.is(v)) { this.next(); return true; } return false; }
  line() { return this.peek().line; }

  error(msg, line = this.line()) { throw new CppError(msg, line); }

  expect(v) {
    if (this.accept(v)) return;
    const prev = this.t[this.i - 1];
    const cur = this.peek();
    if (v === ';') {
      throw new CppError(`brakuje średnika ';' na końcu instrukcji (przed '${cur.value}')`, prev ? prev.line : cur.line);
    }
    if (cur.type === 'eof') throw new CppError(`nieoczekiwany koniec programu – oczekiwano '${v}' (może brakuje nawiasu?)`, prev ? prev.line : cur.line);
    throw new CppError(`oczekiwano '${v}', a znaleziono '${cur.value}'`, cur.line);
  }

  expectId(what = 'nazwy') {
    const tk = this.peek();
    if (tk.type !== 'id') {
      if (tk.type === 'kw') this.error(`'${tk.value}' jest słowem kluczowym C++ i nie może być użyte jako nazwa`);
      this.error(`oczekiwano ${what}, a znaleziono '${tk.value}'`);
    }
    return this.next().value;
  }

  // zamyka nawias kątowy szablonu – obsługuje też '>>' w vector<vector<int>>
  expectCloseAngle() {
    const tk = this.peek();
    if (tk.type === 'op' && tk.value === '>>') {
      // rozbij '>>' na dwa tokeny '>' (zmiana trwała – bezpieczna przy ponownym parsowaniu)
      this.t.splice(this.i, 1, { ...tk, value: '>' }, { ...tk, value: '>' });
      this.next();
      return;
    }
    if (tk.type === 'op' && tk.value === '>=') this.error("oczekiwano '>'");
    this.expect('>');
  }

  // ---------- typy ----------
  isTypeStart(o = 0) {
    const tk = this.peek(o);
    if (tk.type === 'kw') return PRIM_KW.has(tk.value) || QUALIFIERS.has(tk.value);
    if (tk.type === 'id') {
      if (tk.value === 'std' && this.is('::', o + 1)) return this.isTypeStart(o + 2);
      if (['string', 'vector', 'size_t', 'streamsize', 'ostream', 'istream'].includes(tk.value)) return true;
      return this.classNames.has(tk.value) || this.aliases.has(tk.value);
    }
    return false;
  }

  isDeclStart() {
    if (!this.isTypeStart()) return false;
    const tk = this.peek();
    if (tk.type === 'kw' && PRIM_KW.has(tk.value) && this.is('(', 1)) return false; // int(x)
    const save = this.i;
    try {
      this.parseBaseType();
      while (this.is('*') || this.is('&') || this.is('&&')) this.next();
      return this.isId();
    } catch {
      return false;
    } finally {
      this.i = save;
    }
  }

  parseBaseType() {
    let isConst = false;
    let isStatic = false;
    while (this.peek().type === 'kw' && QUALIFIERS.has(this.peek().value)) {
      const q = this.next().value;
      if (q === 'const' || q === 'constexpr') isConst = true;
      if (q === 'static') isStatic = true;
    }
    let std = false;
    if (this.isId() && this.peek().value === 'std' && this.is('::', 1)) { this.next(); this.next(); std = true; }
    const tk = this.next();
    let t;
    if (tk.type === 'kw') {
      switch (tk.value) {
        case 'unsigned':
          if (this.accept('long')) { this.accept('long'); this.accept('int'); t = 'long'; }
          else if (this.accept('char')) t = 'char';
          else if (this.accept('short')) { this.accept('int'); t = 'short'; }
          else { this.accept('int'); t = 'unsigned'; }
          break;
        case 'signed':
          if (this.accept('long')) { this.accept('long'); this.accept('int'); t = 'long'; }
          else if (this.accept('char')) t = 'char';
          else { this.accept('int'); t = 'int'; }
          break;
        case 'long':
          if (this.accept('double')) t = 'double';
          else { this.accept('long'); this.accept('int'); t = 'long'; }
          break;
        case 'short': this.accept('int'); t = 'short'; break;
        case 'int': case 'double': case 'float': case 'char': case 'bool': case 'void': case 'auto':
          t = tk.value; break;
        default:
          throw new CppError(`oczekiwano nazwy typu, a znaleziono '${tk.value}'`, tk.line);
      }
    } else if (tk.type === 'id') {
      const v = tk.value;
      if (v === 'string' || v === 'vector') {
        if (!this.usingStd && !std) {
          throw new CppError(`nieznany typ '${v}' – dodaj 'using namespace std;' pod dyrektywami #include (lub pisz std::${v})`, tk.line);
        }
        if (v === 'string') t = 'string';
        else {
          this.expect('<');
          const el = this.parseFullType();
          this.expectCloseAngle();
          t = { vec: el };
        }
      } else if (v === 'size_t' || v === 'streamsize') t = 'long';
      else if (v === 'ostream' || v === 'istream') {
        if (!this.usingStd && !std) {
          throw new CppError(`nieznany typ '${v}' – dodaj 'using namespace std;' (lub pisz std::${v})`, tk.line);
        }
        t = v;
      }
      else if (this.classNames.has(v)) t = { cls: v };
      else if (this.aliases.has(v)) t = this.aliases.get(v);
      else throw new CppError(`nieznany typ '${v}'`, tk.line);
    } else {
      throw new CppError(`oczekiwano nazwy typu, a znaleziono '${tk.value}'`, tk.line);
    }
    while (this.accept('const'));
    return { type: t, isConst, isStatic };
  }

  // po słowie 'operator': operator+, operator==, operator<<, operator[], operator() ...
  parseOperatorName() {
    const tk = this.next();
    if (tk.type === 'op') {
      if (tk.value === '(') { this.expect(')'); return 'operator()'; }
      if (tk.value === '[') { this.expect(']'); return 'operator[]'; }
      return `operator${tk.value}`;
    }
    throw new CppError(`nieobsługiwany operator '${tk.value}' (operatory konwersji typu nie są obsługiwane)`, tk.line);
  }

  parseFullType() {
    let { type } = this.parseBaseType();
    while (this.accept('*')) { type = { ptr: type }; this.accept('const'); }
    return type;
  }

  // ---------- program ----------
  parseProgram() {
    const body = [];
    while (!this.isEof()) {
      if (this.accept(';')) continue;
      const line = this.line();
      if (this.is('using')) { this.parseUsing(); continue; }
      if (this.is('typedef')) {
        this.next();
        const t = this.parseFullType();
        const name = this.expectId('nazwy typu');
        this.aliases.set(name, t);
        this.expect(';');
        continue;
      }
      if (this.is('class') || this.is('struct') || this.is('union')) { body.push(this.parseClass()); continue; }
      if (this.is('enum')) { body.push(this.parseEnum()); continue; }
      if (this.is('template')) this.error('szablony (template) nie są obsługiwane w tym środowisku');
      if (this.isId() && this.classNames.has(this.peek().value) && this.is('::', 1)) {
        body.push(this.parseOutOfClassCtor());
        continue;
      }
      if (!this.isTypeStart()) {
        const tk = this.peek();
        if (tk.type === 'id' && this.is('(', 1)) {
          this.error(`brak typu zwracanego przed nazwą funkcji '${tk.value}' (np. int ${tk.value}(...) lub void ${tk.value}(...))`);
        }
        this.error(`nieoczekiwany element '${tk.value}' poza funkcją – instrukcje muszą być wewnątrz funkcji (np. main)`);
      }
      // funkcja czy zmienna globalna?
      const save = this.i;
      const { type: base } = this.parseBaseType();
      let t = base;
      while (this.accept('*')) t = { ptr: t };
      const retRef = this.accept('&');
      let clsName = null;
      if (this.isId() && this.is('::', 1) && this.classNames.has(this.peek().value)) {
        clsName = this.next().value;
        this.next();
      }
      let name;
      if (this.accept('operator')) name = this.parseOperatorName();
      else {
        if (!this.isId()) this.expectId('nazwy funkcji lub zmiennej');
        name = this.next().value;
      }
      if (clsName && !this.is('(')) {
        // definicja pola statycznego: int Klasa::licznik = 0;
        let init = null;
        if (this.accept('=')) init = this.is('{') ? this.parseInitList() : this.parseAssign();
        else if (this.is('{')) init = this.parseInitList();
        this.expect(';');
        body.push({ kind: 'StaticDef', cls: clsName, name, type: t, init, line });
        continue;
      }
      if (this.is('(') && (clsName || name.startsWith('operator') || this.is(')', 1) || this.isTypeStart(1))) {
        body.push(this.parseFunctionRest(name, t, retRef, line, clsName));
        continue;
      }
      this.i = save;
      body.push(this.parseVarDecl(true));
    }
    return { kind: 'Program', body };
  }

  parseUsing() {
    const line = this.line();
    this.next();
    if (this.accept('namespace')) {
      const ns = this.expectId('nazwy przestrzeni nazw');
      if (ns !== 'std') this.error(`nieznana przestrzeń nazw '${ns}'`, line);
      this.usingStd = true;
      this.expect(';');
      return { kind: 'Empty', line };
    }
    const name = this.expectId();
    this.expect('=');
    this.aliases.set(name, this.parseFullType());
    this.expect(';');
    return { kind: 'Empty', line };
  }

  parseEnum() {
    const line = this.line();
    this.next();
    const scoped = this.accept('class') || this.accept('struct');
    let name = null;
    if (this.isId()) { name = this.next().value; this.aliases.set(name, 'int'); this.enumNames.add(name); }
    if (scoped && !name) this.error('enum class musi mieć nazwę');
    if (this.accept(':')) this.parseBaseType(); // typ bazowy, np. enum class Kolor : int
    this.expect('{');
    const items = [];
    while (!this.accept('}')) {
      const n = this.expectId('nazwy wartości wyliczenia');
      const init = this.accept('=') ? this.parseTernary() : null;
      items.push({ name: n, init });
      if (!this.accept(',')) { this.expect('}'); break; }
    }
    if (!this.accept(';')) {
      const prev = this.t[this.i - 1];
      throw new CppError("brakuje średnika ';' po definicji typu wyliczeniowego (po '}')", prev.line);
    }
    return { kind: 'Enum', name, items, scoped, line };
  }

  parseFunctionRest(name, ret, retRef, line, cls) {
    this.expect('(');
    const params = this.parseParams();
    let isOverride = false;
    for (;;) {
      if (this.accept('const')) continue;
      if (this.accept('override')) { isOverride = true; continue; }
      if (this.isId() && (this.peek().value === 'noexcept' || this.peek().value === 'final')) { this.next(); continue; }
      break;
    }
    let body = null;
    let isPure = false;
    if (this.accept('=')) {
      const tk = this.next();
      if (tk.type === 'num' && tk.value === 0) isPure = true;
      this.expect(';');
    } else if (this.accept(';')) body = null;
    else {
      if (!this.is('{')) {
        if (this.is(';')) this.expect(';');
        this.error(`oczekiwano '{' rozpoczynającego ciało funkcji '${name}'`);
      }
      body = this.parseBlock();
    }
    return { kind: 'Func', name, ret, retRef, params, body, line, cls, isPure, isOverride };
  }

  parseParams() {
    const params = [];
    if (this.accept(')')) return params;
    if (this.is('void') && this.is(')', 1)) { this.next(); this.next(); return params; }
    do {
      if (!this.isTypeStart()) {
        const tk = this.peek();
        this.error(tk.type === 'id' ? `brak typu parametru '${tk.value}' (np. int ${tk.value})` : `oczekiwano typu parametru, a znaleziono '${tk.value}'`);
      }
      const { type: base, isConst } = this.parseBaseType();
      let t = base;
      while (this.accept('*')) { t = { ptr: t }; this.accept('const'); }
      let isRef = this.accept('&');
      if (this.accept('&&')) isRef = true;
      const name = this.isId() ? this.next().value : null;
      let isArray = false;
      let dimCount = 0;
      while (this.accept('[')) {
        isArray = true;
        dimCount++;
        if (!this.is(']')) this.parseExpr();
        this.expect(']');
      }
      const def = this.accept('=') ? this.parseAssign() : null;
      params.push({ name, type: t, isRef, isConst, isArray, dimCount, def });
    } while (this.accept(','));
    this.expect(')');
    return params;
  }

  parseClass() {
    const line = this.line();
    const kindKw = this.next().value;
    const isStruct = kindKw !== 'class';
    const isUnion = kindKw === 'union';
    const name = this.expectId(isUnion ? 'nazwy unii' : 'nazwy klasy');
    this.classNames.add(name);
    if (this.accept(';')) return { kind: 'Empty', line };
    let base = null;
    if (this.accept(':')) {
      if (this.is('public') || this.is('private') || this.is('protected')) this.next();
      base = this.expectId('nazwy klasy bazowej');
      if (!this.classNames.has(base)) this.error(`nieznana klasa bazowa '${base}'`);
    }
    if (isUnion && base) this.error('unia nie może dziedziczyć po innej klasie');
    this.expect('{');
    let access = isStruct ? 'public' : 'private';
    const fields = [], methods = [], ctors = [], staticFields = [], friends = [], friendFuncs = [], friendClasses = [];
    let dtor = null;
    while (!this.accept('}')) {
      if (this.isEof()) this.error(`brak zamykającego nawiasu '}' klasy '${name}'`, line);
      const mline = this.line();
      if (this.is('public') || this.is('private') || this.is('protected')) {
        access = this.next().value;
        this.expect(':');
        continue;
      }
      if (this.accept(';')) continue;
      if (this.accept('friend')) {
        if (this.accept('class') || this.accept('struct')) {
          friendClasses.push(this.expectId('nazwy klasy'));
          this.expect(';');
          continue;
        }
        const { type: fb } = this.parseBaseType();
        let ft = fb;
        while (this.accept('*')) ft = { ptr: ft };
        const fref = this.accept('&');
        const fline = this.line();
        const fname = this.accept('operator') ? this.parseOperatorName() : this.expectId('nazwy funkcji zaprzyjaźnionej');
        const fn = this.parseFunctionRest(fname, ft, fref, fline, null);
        friends.push(fname);
        if (fn.body) friendFuncs.push(fn);
        continue;
      }
      if (this.isId() && this.peek().value === 'explicit') this.next();
      if (this.is('template')) this.error('szablony (template) nie są obsługiwane');
      const isVirtual = this.accept('virtual');
      if (this.is('~')) {
        this.next();
        const dn = this.expectId('nazwy destruktora');
        if (dn !== name) this.error(`destruktor musi nazywać się ~${name}`);
        this.expect('(');
        this.expect(')');
        while (this.accept('override'));
        let body = null;
        if (this.accept('=')) { this.next(); this.expect(';'); body = { kind: 'Block', stmts: [], line: mline }; }
        else if (!this.accept(';')) body = this.parseBlock();
        dtor = { kind: 'Func', name: '~' + name, ret: 'void', params: [], body, line: mline, access, isDtor: true, isVirtual };
        continue;
      }
      if (this.isId() && this.peek().value === name && this.is('(', 1)) {
        this.next();
        this.expect('(');
        const params = this.parseParams();
        let inits = null;
        if (this.accept(':')) inits = this.parseCtorInits();
        let body = null;
        if (this.accept('=')) { this.next(); this.expect(';'); body = { kind: 'Block', stmts: [], line: mline }; }
        else if (!this.accept(';')) body = this.parseBlock();
        ctors.push({ kind: 'Func', name, ret: 'void', params, inits, body, line: mline, access, isCtor: true });
        continue;
      }
      if (!this.isTypeStart()) {
        const tk = this.peek();
        if (tk.type === 'id' && this.is('(', 1)) {
          this.error(`brak typu zwracanego metody '${tk.value}' (konstruktor musi nazywać się tak jak klasa: ${name})`);
        }
        this.error(`nieoczekiwany element '${tk.value}' w definicji klasy`);
      }
      const { type: base0, isConst, isStatic } = this.parseBaseType();
      for (;;) {
        let t = base0;
        while (this.accept('*')) t = { ptr: t };
        const isRef = this.accept('&');
        const fline = this.line();
        const mname = this.accept('operator') ? this.parseOperatorName() : this.expectId('nazwy pola lub metody');
        if (this.is('(')) {
          const m = this.parseFunctionRest(mname, t, isRef, fline, null);
          m.access = access;
          m.isVirtual = isVirtual;
          m.isStatic = isStatic;
          methods.push(m);
          break;
        }
        const dims = [];
        while (this.accept('[')) { dims.push(this.is(']') ? null : this.parseExpr()); this.expect(']'); }
        let init = null;
        if (this.accept('=')) init = this.is('{') ? this.parseInitList() : this.parseAssign();
        else if (this.is('{')) init = this.parseInitList();
        (isStatic ? staticFields : fields).push({ name: mname, type: t, dims, init, access, line: fline, isConst, isRef, isStatic });
        if (this.accept(',')) continue;
        this.expect(';');
        break;
      }
    }
    if (!this.accept(';')) {
      const prev = this.t[this.i - 1];
      throw new CppError(`brakuje średnika ';' po definicji ${isUnion ? 'unii' : (isStruct ? 'struktury' : 'klasy')} '${name}' (po zamykającym nawiasie '}')`, prev.line);
    }
    return { kind: 'Class', name, base, isStruct, isUnion, fields, methods, ctors, dtor, staticFields, friends, friendFuncs, friendClasses, line };
  }

  parseCtorInits() {
    const inits = [];
    do {
      const name = this.expectId('nazwy pola');
      let args;
      if (this.is('{')) args = this.parseInitList().items;
      else args = this.parseArgs();
      inits.push({ name, args });
    } while (this.accept(','));
    return inits;
  }

  parseOutOfClassCtor() {
    const line = this.line();
    const cls = this.next().value;
    this.expect('::');
    if (this.accept('~')) {
      this.expectId();
      this.expect('(');
      this.expect(')');
      const body = this.parseBlock();
      return { kind: 'Func', name: '~' + cls, cls, isDtor: true, ret: 'void', params: [], body, line };
    }
    const name = this.expectId();
    if (name !== cls) this.error(`brak typu zwracanego metody ${cls}::${name}`, line);
    this.expect('(');
    const params = this.parseParams();
    const inits = this.accept(':') ? this.parseCtorInits() : null;
    const body = this.parseBlock();
    return { kind: 'Func', name, cls, isCtor: true, ret: 'void', params, inits, body, line };
  }

  // ---------- instrukcje ----------
  parseBlock() {
    const line = this.line();
    this.expect('{');
    const stmts = [];
    while (!this.is('}')) {
      if (this.isEof()) throw new CppError("brakuje zamykającego nawiasu klamrowego '}' dla bloku otwartego w tej linii", line);
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
          this.checkCondition(cond, line);
          if (this.is(';')) this.warnings.push({ line, message: "średnik zaraz po if(...) – instrukcja warunkowa ma puste ciało" });
          const then = this.parseStatement();
          let els = null;
          if (this.accept('else')) els = this.parseStatement();
          return { kind: 'If', cond, then, else: els, line };
        }
        case 'else':
          this.error("'else' bez pasującego 'if' (sprawdź nawiasy klamrowe i średniki)");
          break;
        case 'while': {
          this.next();
          this.expect('(');
          const cond = this.parseExpr();
          this.expect(')');
          this.checkCondition(cond, line);
          if (this.is(';')) this.warnings.push({ line, message: 'średnik zaraz po while(...) – pętla ma puste ciało (możliwa nieskończona pętla)' });
          const body = this.parseStatement();
          return { kind: 'While', cond, body, line };
        }
        case 'do': {
          this.next();
          const body = this.parseStatement();
          if (!this.is('while')) this.error("oczekiwano 'while (...)' po bloku 'do'");
          this.next();
          this.expect('(');
          const cond = this.parseExpr();
          this.expect(')');
          this.expect(';');
          return { kind: 'DoWhile', cond, body, line };
        }
        case 'for': return this.parseFor();
        case 'switch': return this.parseSwitch();
        case 'return': {
          this.next();
          const expr = this.is(';') ? null : this.parseExpr();
          this.expect(';');
          return { kind: 'Return', expr, line };
        }
        case 'break': this.next(); this.expect(';'); return { kind: 'Break', line };
        case 'continue': this.next(); this.expect(';'); return { kind: 'Continue', line };
        case 'case': case 'default':
          this.error(`'${tk.value}' może wystąpić tylko wewnątrz instrukcji switch`);
          break;
        case 'using': return this.parseUsing();
        case 'class': case 'struct': case 'union':
          this.error('definiuj klasy, struktury i unie poza funkcjami (np. przed main)');
          break;
        case 'enum':
          return this.parseEnum();
        default: break;
      }
    }
    if (tk.type === 'id' && this.is('(', 1) && this.is(')', 2) && this.is('{', 3)) {
      this.error('nie można definiować funkcji wewnątrz innej funkcji – przenieś ją przed main()');
    }
    if (this.isDeclStart()) {
      const save = this.i;
      this.parseBaseType();
      while (this.accept('*') || this.accept('&'));
      this.next();
      if (this.is('(') && (this.is(')', 1) || this.isTypeStart(1)) && this.isFuncDefAhead()) {
        this.error('nie można definiować funkcji wewnątrz innej funkcji – przenieś ją przed main()');
      }
      this.i = save;
      return this.parseVarDecl(true);
    }
    const expr = this.parseExpr();
    this.expect(';');
    return { kind: 'ExprStmt', expr, line };
  }

  isFuncDefAhead() {
    // zakłada, że stoimy na '(' – sprawdza, czy po ')' występuje '{'
    let depth = 0;
    for (let k = this.i; k < this.t.length; k++) {
      const tk = this.t[k];
      if (tk.type === 'op' && tk.value === '(') depth++;
      if (tk.type === 'op' && tk.value === ')') { depth--; if (depth === 0) { const n = this.t[k + 1]; return n && n.type === 'op' && n.value === '{'; } }
    }
    return false;
  }

  checkCondition(cond, line) {
    if (cond.kind === 'Assign' && cond.op === '=') {
      this.warnings.push({ line, message: "w warunku użyto '=' (przypisanie) – czy chodziło o '==' (porównanie)?" });
    }
  }

  parseFor() {
    const line = this.line();
    this.next();
    this.expect('(');
    let init = null;
    if (this.isDeclStart()) {
      const save = this.i;
      const { type } = this.parseBaseType();
      let t = type;
      while (this.accept('*')) t = { ptr: t };
      const isRef = this.accept('&');
      const name = this.expectId();
      if (this.accept(':')) {
        const expr = this.parseExpr();
        this.expect(')');
        const body = this.parseStatement();
        return { kind: 'ForRange', type: t, isRef, name, expr, body, line };
      }
      this.i = save;
      init = this.parseVarDecl(false);
    } else if (!this.is(';')) {
      init = { kind: 'ExprStmt', expr: this.parseExpr(), line };
    }
    if (this.is(',')) this.error("w pętli for części oddzielamy średnikami ';', nie przecinkami");
    this.expect(';');
    const cond = this.is(';') ? null : this.parseExpr();
    if (cond) this.checkCondition(cond, line);
    this.expect(';');
    const step = this.is(')') ? null : this.parseExpr();
    this.expect(')');
    if (this.is(';')) this.warnings.push({ line, message: 'średnik zaraz po for(...) – pętla ma puste ciało' });
    const body = this.parseStatement();
    return { kind: 'For', init, cond, step, body, line };
  }

  parseSwitch() {
    const line = this.line();
    this.next();
    this.expect('(');
    const expr = this.parseExpr();
    this.expect(')');
    this.expect('{');
    const cases = [];
    let cur = null;
    while (!this.accept('}')) {
      if (this.isEof()) throw new CppError("brakuje '}' zamykającego switch", line);
      const cl = this.line();
      if (this.accept('case')) {
        const test = this.parseTernary();
        this.expect(':');
        cur = { test, body: [], line: cl };
        cases.push(cur);
      } else if (this.accept('default')) {
        this.expect(':');
        cur = { test: null, isDefault: true, body: [], line: cl };
        cases.push(cur);
      } else {
        if (!cur) this.error("instrukcja w switch przed pierwszym 'case'");
        cur.body.push(this.parseStatement());
      }
    }
    return { kind: 'Switch', expr, cases, line };
  }

  parseVarDecl(requireSemi) {
    const line = this.line();
    const { type: base, isConst, isStatic } = this.parseBaseType();
    if (base === 'void') this.error("zmienna nie może mieć typu 'void'");
    const decls = [];
    do {
      let t = base;
      while (this.accept('*')) { t = { ptr: t }; this.accept('const'); }
      const isRef = this.accept('&');
      const dline = this.line();
      const name = this.expectId('nazwy zmiennej');
      const dims = [];
      while (this.accept('[')) { dims.push(this.is(']') ? null : this.parseExpr()); this.expect(']'); }
      let init = null, ctorArgs = null;
      if (this.accept('=')) init = this.is('{') ? this.parseInitList() : this.parseAssign();
      else if (this.is('(')) ctorArgs = this.parseArgs();
      else if (this.is('{')) init = this.parseInitList();
      decls.push({ name, type: t, isRef, dims, init, ctorArgs, line: dline });
    } while (this.accept(','));
    if (requireSemi) this.expect(';');
    return { kind: 'VarDecl', decls, isConst, isStatic, line };
  }

  // ---------- wyrażenia ----------
  parseExpr() {
    let e = this.parseAssign();
    while (this.is(',')) {
      const line = this.next().line;
      e = { kind: 'Comma', l: e, r: this.parseAssign(), line };
    }
    return e;
  }

  parseAssign() {
    const left = this.parseTernary();
    const tk = this.peek();
    if (tk.type === 'op' && ASSIGN_OPS.has(tk.value)) {
      this.next();
      const right = this.is('{') ? this.parseInitList() : this.parseAssign();
      return { kind: 'Assign', op: tk.value, l: left, r: right, line: tk.line };
    }
    return left;
  }

  parseTernary() {
    const c = this.parseBinary(1);
    if (this.is('?')) {
      const line = this.next().line;
      const a = this.parseExpr();
      this.expect(':');
      const b = this.parseAssign();
      return { kind: 'Ternary', c, a, b, line };
    }
    return c;
  }

  parseBinary(minPrec) {
    let left = this.parseUnary();
    for (;;) {
      const tk = this.peek();
      if (tk.type !== 'op') break;
      const p = PREC[tk.value];
      if (!p || p < minPrec) break;
      this.next();
      const right = this.parseBinary(p + 1);
      left = { kind: 'Binary', op: tk.value, l: left, r: right, line: tk.line };
    }
    return left;
  }

  parseUnary() {
    const tk = this.peek();
    const line = tk.line;
    if (tk.type === 'op') {
      if (['!', '-', '+', '~', '*', '&'].includes(tk.value)) {
        this.next();
        return { kind: 'Unary', op: tk.value, e: this.parseUnary(), line };
      }
      if (tk.value === '++' || tk.value === '--') {
        this.next();
        return { kind: 'PreInc', op: tk.value, e: this.parseUnary(), line };
      }
      if (tk.value === '(' && this.isTypeStart(1)) {
        const save = this.i;
        this.next();
        try {
          const t = this.parseFullType();
          if (this.accept(')') && !this.is(')') && !this.is(';') && !this.is(',')) {
            return { kind: 'Cast', type: t, e: this.parseUnary(), line };
          }
        } catch { /* to nie rzutowanie */ }
        this.i = save;
      }
    }
    if (tk.type === 'kw') {
      if (tk.value === 'sizeof') {
        this.next();
        if (this.is('(') && this.isTypeStart(1)) {
          this.next();
          const t = this.parseFullType();
          this.expect(')');
          return { kind: 'Sizeof', type: t, line };
        }
        return { kind: 'Sizeof', e: this.parseUnary(), line };
      }
      if (tk.value === 'new') {
        this.next();
        const { type } = this.parseBaseType();
        let t = type;
        while (this.accept('*')) t = { ptr: t };
        if (this.accept('[')) {
          const size = this.parseExpr();
          this.expect(']');
          return { kind: 'New', type: t, size, args: [], line };
        }
        let args = [];
        if (this.is('(')) args = this.parseArgs();
        else if (this.is('{')) args = this.parseInitList().items;
        return { kind: 'New', type: t, args, line };
      }
      if (tk.value === 'delete') {
        this.next();
        let arr = false;
        if (this.is('[') && this.is(']', 1)) { this.next(); this.next(); arr = true; }
        return { kind: 'Delete', e: this.parseUnary(), arr, line };
      }
    }
    return this.parsePostfix(this.parsePrimary());
  }

  parsePostfix(e) {
    for (;;) {
      const tk = this.peek();
      if (tk.type !== 'op') break;
      if (tk.value === '(') {
        const args = this.parseArgs();
        e = { kind: 'Call', callee: e, args, line: tk.line };
      } else if (tk.value === '[') {
        this.next();
        const idx = this.parseExpr();
        this.expect(']');
        e = { kind: 'Index', obj: e, idx, line: tk.line };
      } else if (tk.value === '.' || tk.value === '->') {
        this.next();
        const name = this.expectId('nazwy pola lub metody');
        e = { kind: 'Member', obj: e, name, arrow: tk.value === '->', line: tk.line };
      } else if (tk.value === '++' || tk.value === '--') {
        this.next();
        e = { kind: 'PostInc', op: tk.value, e, line: tk.line };
      } else break;
    }
    return e;
  }

  parseArgs() {
    this.expect('(');
    const args = [];
    if (this.accept(')')) return args;
    do {
      args.push(this.is('{') ? this.parseInitList() : this.parseAssign());
    } while (this.accept(','));
    this.expect(')');
    return args;
  }

  parseInitList() {
    const line = this.line();
    this.expect('{');
    const items = [];
    if (!this.accept('}')) {
      do {
        if (this.is('}')) break;
        items.push(this.is('{') ? this.parseInitList() : this.parseAssign());
      } while (this.accept(','));
      this.expect('}');
    }
    return { kind: 'InitList', items, line };
  }

  parsePrimary() {
    const tk = this.peek();
    const line = tk.line;
    switch (tk.type) {
      case 'num':
        this.next();
        return { kind: 'Num', v: tk.value, t: tk.isFloat ? 'double' : (tk.isLong ? 'long' : 'int'), line };
      case 'str': {
        this.next();
        let v = tk.value;
        while (this.peek().type === 'str') v += this.next().value;
        return { kind: 'Str', v, line };
      }
      case 'char':
        this.next();
        return { kind: 'Char', v: tk.value, line };
      case 'eof':
        this.error("nieoczekiwany koniec programu – może brakuje '}' lub ')'?");
        break;
      case 'kw':
        switch (tk.value) {
          case 'true': this.next(); return { kind: 'Num', v: 1, t: 'bool', line };
          case 'false': this.next(); return { kind: 'Num', v: 0, t: 'bool', line };
          case 'nullptr': this.next(); return { kind: 'Null', line };
          case 'this': this.next(); return { kind: 'This', line };
          case 'static_cast': {
            this.next();
            this.expect('<');
            const t = this.parseFullType();
            this.expectCloseAngle();
            this.expect('(');
            const e = this.parseExpr();
            this.expect(')');
            return { kind: 'Cast', type: t, e, line };
          }
          default:
            if (PRIM_KW.has(tk.value) && this.is('(', 1)) {
              const { type } = this.parseBaseType();
              return { kind: 'Construct', type, args: this.parseArgs(), line };
            }
            this.error(`nieoczekiwane słowo kluczowe '${tk.value}' w wyrażeniu`);
        }
        break;
      case 'op':
        if (tk.value === '(') {
          this.next();
          const e = this.parseExpr();
          this.expect(')');
          return e;
        }
        if (tk.value === '{') return this.parseInitList();
        if (tk.value === '::') { this.next(); return this.parsePrimary(); }
        this.error(`nieoczekiwany symbol '${tk.value}' w wyrażeniu`);
        break;
      case 'id': {
        const start = this.i;
        this.next();
        let name = tk.value;
        let std = false;
        if (name === 'std' && this.is('::')) {
          this.next();
          name = this.expectId();
          std = true;
        }
        if (name === 'string' && this.is('::')) {
          this.next();
          const m = this.expectId();
          if (m !== 'npos') this.error(`nieznany element string::${m}`);
          return { kind: 'Num', v: -1, t: 'long', line };
        }
        if ((name === 'string' || name === 'vector') && (this.is('(') || this.is('<') || this.is('{'))) {
          this.i = start;
          const { type } = this.parseBaseType();
          const args = this.is('{') ? this.parseInitList().items : this.parseArgs();
          return { kind: 'Construct', type, args, line };
        }
        if (name === 'numeric_limits' && this.is('<')) {
          this.next();
          const t = this.parseFullType();
          this.expectCloseAngle();
          this.expect('::');
          const fn = this.expectId();
          this.expect('(');
          this.expect(')');
          return { kind: 'Limits', type: t, fn, line };
        }
        if ((name === 'greater' || name === 'less') && this.is('<')) {
          this.next();
          this.parseFullType();
          this.expectCloseAngle();
          this.expect('(');
          this.expect(')');
          return { kind: 'Comparator', name, line };
        }
        if (this.classNames.has(name) && this.is('::')) {
          this.next();
          const member = this.accept('operator') ? this.parseOperatorName() : this.expectId('nazwy składowej klasy');
          return { kind: 'StaticRef', cls: name, name: member, line };
        }
        if (this.classNames.has(name) && (this.is('(') || this.is('{'))) {
          const args = this.is('{') ? this.parseInitList().items : this.parseArgs();
          return { kind: 'Construct', type: { cls: name }, args, line };
        }
        if (this.enumNames.has(name) && this.is('::')) {
          this.next();
          const item = this.expectId('nazwy wartości wyliczenia');
          return { kind: 'Ident', name: `${name}::${item}`, std, line };
        }
        if (name === 'NULL') return { kind: 'Null', line };
        return { kind: 'Ident', name, std, line };
      }
      default: break;
    }
    this.error(`nieoczekiwany element '${tk.value}'`);
    return null;
  }
}
