// Interpreter drzewa AST podzbioru C# (do nauki w szkole).
// Model: wartości z typem statycznym {t, v}; obiekty klas przez referencję, struktury i krotki kopiowane.
import { LangError } from './lexer.js';
import { parseCs } from './parser.js';
import { NeedInput } from '../interpreter.js';
import {
  isPrim, isNum, isIntT, isFloatT, has, numWidens, netName, csName, sameType,
  EXCEPTIONS, EXCEPTION_NAMES, PRELUDE_SRC, EXCEPTION_HINTS,
} from './types.js';
import { builtinMethods, STATIC_TYPE_NAMES } from './builtins.js';

export class Cell { constructor(t, v) { this.t = t; this.v = v; } }
export class CsThrow { constructor(obj, line) { this.obj = obj; this.line = line; } }
class ExitSignal { constructor(code) { this.code = code; } }
const BREAK = { sig: 'break' };
const CONTINUE = { sig: 'continue' };
export const VOID = Object.freeze({ t: 'void', v: undefined });
const BUILTIN_IFACES = new Set(['IComparable', 'IEquatable', 'IDisposable', 'IEnumerable']);

let PRELUDE = null;

class Env {
  constructor(parent) { this.vars = new Map(); this.parent = parent; }
  lookup(name) {
    for (let e = this; e; e = e.parent) { const v = e.vars.get(name); if (v) return v; }
    return null;
  }
}

export class CsInterpreter {
  constructor(code, opts = {}) {
    this.code = code;
    this.inputs = opts.inputs || [];
    this.interactive = !!opts.interactive;
    this.maxSteps = opts.maxSteps || 40_000_000;
    this.timeLimit = opts.timeLimit || 15000;
    this.maxOutput = opts.maxOutput || 200_000;
    this.onFlush = opts.onFlush || null;
    this.seed = opts.seed || 1731234567;
    this.segments = [];
    this.outLen = 0;
    this.steps = 0;
    this.frames = [];
    this.inLine = 0;
    this.excStack = [];
    this.warnings = [];
    this.lastFlush = 0;
    this.rtCache = new WeakMap();
  }

  // ---------- narzędzia ----------
  err(msg, line, kind = 'compile') { throw new LangError(msg, line ?? this.curLine, kind); }

  write(text, type = 'out') {
    if (!text) return;
    this.outLen += text.length;
    if (this.outLen > this.maxOutput) this.err('program wypisał zbyt dużo danych – przerwano (możliwa nieskończona pętla)', this.curLine, 'limit');
    const last = this.segments[this.segments.length - 1];
    if (last && last.type === type) last.text += text;
    else this.segments.push({ type, text });
  }

  flush() {
    if (this.onFlush && this.segments.length) { this.onFlush(this.segments); this.segments = []; }
  }

  step(line) {
    this.curLine = line;
    if (++this.steps > this.maxSteps) this.err('przekroczono limit kroków wykonania – możliwa nieskończona pętla', line, 'limit');
    if ((this.steps & 0x3fff) === 0) {
      const now = Date.now();
      if (now - this.startTime > this.timeLimit) this.err(`przekroczono limit czasu (${Math.round(this.timeLimit / 1000)} s) – możliwa nieskończona pętla`, line, 'limit');
      if (now - this.lastFlush > 60) { this.lastFlush = now; this.flush(); }
    }
  }

  readLine() {
    if (this.inLine < this.inputs.length) {
      const l = this.inputs[this.inLine++];
      this.write(l + '\n', 'in');
      return l;
    }
    if (this.interactive) throw new NeedInput();
    return null;
  }

  frame() { return this.frames[this.frames.length - 1]; }

  pushFrame(f, line) {
    if (this.frames.length > 1500) this.err('przepełnienie stosu (StackOverflowException) – zbyt głęboka rekurencja; czy metoda rekurencyjna ma warunek zakończenia?', line, 'runtime');
    this.frames.push(f);
  }

  // ---------- uruchomienie ----------
  run() {
    this.startTime = Date.now();
    this.lastFlush = this.startTime;
    if (!PRELUDE) PRELUDE = parseCs(PRELUDE_SRC);
    const prog = parseCs(this.code, EXCEPTION_NAMES);
    this.warnings = prog.warnings;
    this.types = new Map();
    for (const d of PRELUDE.types) {
      const ex = EXCEPTIONS.find((e) => e[0] === d.name);
      this.declareType(d, ex ? ex[3] : 'System', true);
    }
    const all = [];
    const collect = (d) => { all.push(d); (d.nested || []).forEach(collect); };
    prog.types.forEach(collect);
    for (const d of all) this.declareType(d, null, false);
    let synthetic = null;
    if (prog.topStmts.length || prog.topFuncs.length) {
      const decl = {
        kind: 'Type', typeKind: 'class', name: 'Program', bases: [], fields: [], props: [], ctors: [], operators: [], indexers: [], nested: [],
        methods: prog.topFuncs.map((f) => ({ ...f, isStatic: true, access: 'private' })), isStatic: true, line: 1,
      };
      if (this.types.has('Program')) decl.name = 'Program$';
      synthetic = this.declareType(decl, null, false);
    }
    this.linkTypes();
    this.validate(all, prog.topStmts);
    this.globalEnv = new Env(null);
    let exitCode = 0;
    try {
      this.initStatics();
      if (prog.topStmts.length) {
        this.pushFrame({ m: { name: 'Main', ret: 'void' }, cls: synthetic, thisCell: null }, 1);
        let r;
        try { r = this.execBlock(prog.topStmts, new Env(this.globalEnv)); } finally { this.frames.pop(); }
        if (r && r.ret && isIntT(r.ret.t)) exitCode = r.ret.v;
      } else {
        let main = null;
        for (const info of this.types.values()) {
          if (info.prelude || info.kind === 'enum') continue;
          const ms = (info.methods.get('Main') || []).filter((m) => m.isStatic);
          if (ms.length) { main = ms[0]; break; }
        }
        if (!main) {
          const nonStatic = [...this.types.values()].some((i) => !i.prelude && i.methods && i.methods.has('Main'));
          this.err(nonStatic
            ? "metoda Main musi być statyczna: 'static void Main()' (CS5001)"
            : "program nie zawiera punktu wejścia – dodaj 'static void Main()' w klasie Program (CS5001)", 1);
        }
        const args = main.params.length ? [{ tv: { t: { arr: 'string', rank: 1 }, v: this.makeArray('string', []) } }] : [];
        const r = this.callUser(main, null, args, 1);
        if (r && isIntT(r.t)) exitCode = r.v;
      }
    } catch (e) {
      if (e instanceof ExitSignal) exitCode = e.code;
      else if (e instanceof CsThrow) throw this.uncaught(e);
      else throw e;
    }
    return exitCode;
  }

  uncaught(e) {
    const o = e.obj;
    const name = o.cls.name;
    const full = netName({ cls: name }, this.types);
    const msg = this.fieldOf(o, 'Message');
    const hint = EXCEPTION_HINTS[name] || this.hintFor(o.cls);
    return new LangError(`nieobsłużony wyjątek ${full}: ${msg}${hint ? ` – ${hint}` : ''}`, e.line, 'runtime');
  }

  hintFor(cls) {
    for (let c = cls; c; c = c.base) if (EXCEPTION_HINTS[c.name]) return EXCEPTION_HINTS[c.name];
    return '';
  }

  fieldOf(obj, name) {
    const c = obj.fields.get(name);
    return c ? c.v : null;
  }

  // ---------- typy użytkownika ----------
  declareType(d, ns, prelude) {
    if (this.types.has(d.name)) this.err(`typ '${d.name}' został już zdefiniowany (CS0101)`, d.line);
    let info;
    if (d.kind === 'Enum') {
      info = { name: d.name, kind: 'enum', decl: d, items: new Map(), names: new Map() };
    } else {
      info = {
        name: d.name, kind: d.typeKind, decl: d, ns, prelude, base: null, ifaces: [], builtinIfaces: [],
        isAbstract: d.isAbstract, isStatic: d.isStatic,
        instFields: d.fields.filter((f) => !f.isStatic), staticCells: new Map(),
        fieldDecl: new Map(), props: new Map(), methods: new Map(), ctors: d.ctors.filter((c) => !c.isStatic),
        sctor: d.ctors.find((c) => c.isStatic) || null, operators: new Map(), indexer: d.indexers[0] || null,
      };
      const names = new Set();
      const dup = (n, line) => {
        if (names.has(n)) this.err(`składowa '${n}' została już zadeklarowana w typie '${d.name}' (CS0102)`, line);
        names.add(n);
      };
      for (const f of d.fields) { dup(f.name, f.line); info.fieldDecl.set(f.name, f); f.owner = info; }
      for (const p of d.props) { dup(p.name, p.line); info.props.set(p.name, p); p.owner = info; }
      for (const m of d.methods) {
        if (names.has(m.name) && !info.methods.has(m.name)) this.err(`nazwa '${m.name}' jest już użyta w typie '${d.name}'`, m.line);
        m.owner = info;
        if (!info.methods.has(m.name)) info.methods.set(m.name, []);
        info.methods.get(m.name).push(m);
      }
      for (const c of d.ctors) c.owner = info;
      for (const o of d.operators) {
        o.owner = info;
        if (!info.operators.has(o.op)) info.operators.set(o.op, []);
        info.operators.get(o.op).push(o);
      }
      if (info.indexer) info.indexer.owner = info;
      if (info.kind === 'struct' && d.fields.some((f) => !f.isStatic && f.init)) {
        // C# 10+ dopuszcza inicjalizatory pól w strukturach – akceptujemy
      }
    }
    this.types.set(d.name, info);
    return info;
  }

  linkTypes() {
    for (const info of this.types.values()) {
      if (info.kind === 'enum') continue;
      for (const b of info.decl.bases) {
        const bi = this.types.get(b);
        if (!bi) {
          if (BUILTIN_IFACES.has(b)) { info.builtinIfaces.push(b); continue; }
          this.err(`nieznany typ bazowy '${b}'`, info.decl.line);
        }
        if (bi.kind === 'interface') { info.ifaces.push(bi); continue; }
        if (bi.kind === 'enum') this.err(`nie można dziedziczyć po wyliczeniu '${b}'`, info.decl.line);
        if (info.kind === 'interface') this.err(`interfejs może dziedziczyć tylko po interfejsach ('${b}' to klasa)`, info.decl.line);
        if (info.kind === 'struct') this.err(`struktura nie może dziedziczyć po klasie '${b}' (może tylko implementować interfejsy)`, info.decl.line);
        if (bi.kind === 'struct') this.err(`nie można dziedziczyć po strukturze '${b}'`, info.decl.line);
        if (info.base) this.err(`klasa '${info.name}' może mieć tylko jedną klasę bazową (CS1721) – pozostałe typy po ':' muszą być interfejsami`, info.decl.line);
        if (bi.isSealed) this.err(`nie można dziedziczyć po klasie zapieczętowanej (sealed) '${b}' (CS0509)`, info.decl.line);
        if (bi.isStatic) this.err(`nie można dziedziczyć po klasie statycznej '${b}'`, info.decl.line);
        info.base = bi;
      }
    }
    // wartości wyliczeń
    for (const info of this.types.values()) {
      if (info.kind !== 'enum') continue;
      let v = 0;
      const env = new Env(null);
      for (const it of info.decl.items) {
        if (it.init) {
          const tv = this.eval(it.init, env);
          if (!isIntT(tv.t) && !has(tv.t, 'enum')) this.err('wartość wyliczenia musi być liczbą całkowitą', info.decl.line);
          v = tv.v;
        }
        info.items.set(it.name, v);
        if (!info.names.has(v)) info.names.set(v, it.name);
        env.vars.set(it.name, new Cell('int', v));
        v++;
      }
    }
  }

  allIfaces(info) {
    const out = new Set();
    const add = (i) => { if (!out.has(i)) { out.add(i); i.ifaces.forEach(add); } };
    for (let c = info; c; c = c.base) c.ifaces.forEach(add);
    return [...out];
  }

  isAssignable(fromName, toName) {
    if (fromName === toName) return true;
    const from = this.types.get(fromName);
    if (!from || from.kind === 'enum') return false;
    for (let c = from; c; c = c.base) {
      if (c.name === toName) return true;
      if (c.builtinIfaces.includes(toName)) return true;
    }
    return this.allIfaces(from).some((i) => i.name === toName);
  }

  sameSig(a, b) {
    return a.params.length === b.params.length && a.params.every((p, k) => sameType(this.rt(p.type), this.rt(b.params[k].type)));
  }

  findBaseVirtual(info, m) {
    for (let c = info.base; c; c = c.base) {
      const ms = (c.methods.get(m.name) || []).find((x) => this.sameSig(x, m));
      if (ms) return ms;
    }
    return null;
  }

  validate(allDecls, topStmts) {
    for (const info of this.types.values()) {
      if (info.kind === 'enum' || info.prelude) continue;
      for (const ms of info.methods.values()) {
        for (const m of ms) {
          if (m.isAbstract && info.kind !== 'interface' && !info.isAbstract) {
            this.err(`metoda abstrakcyjna '${m.name}' może być tylko w klasie abstrakcyjnej – dodaj 'abstract class ${info.name}' (CS0513)`, m.line);
          }
          if (m.isVirtual && m.isAbstract === false && info.isSealed) { /* dozwolone */ }
          const bv = this.findBaseVirtual(info, m);
          if (m.isOverride && !bv && ['ToString', 'Equals', 'GetHashCode'].includes(m.name)) {
            // nadpisanie metod klasy object
          } else if (m.isOverride) {
            if (!bv || !(bv.isVirtual || bv.isAbstract || bv.isOverride)) {
              this.err(`'${info.name}.${m.name}()': nie można nadpisać metody – w klasie bazowej nie ma metody virtual, abstract ani override o tej nazwie i parametrach (CS0506/CS0115)`, m.line);
            }
          } else if (bv && !m.isNew && info.kind !== 'interface') {
            this.warnings.push({ line: m.line, message: `metoda '${m.name}' ukrywa metodę z klasy bazowej '${bv.owner.name}'${bv.isVirtual || bv.isAbstract ? " – jeśli chcesz ją nadpisać, dodaj 'override'" : " – dodaj 'new', jeśli to zamierzone"} (CS0108/CS0114)` });
          }
        }
      }
      for (const p of info.props.values()) {
        if (p.isOverride) {
          let found = null;
          for (let c = info.base; c && !found; c = c.base) found = c.props.get(p.name) || null;
          if (!found || !(found.isVirtual || found.isAbstract || found.isOverride)) {
            this.err(`'${info.name}.${p.name}': nie można nadpisać właściwości – w klasie bazowej nie ma właściwości virtual/abstract o tej nazwie`, p.line);
          }
        }
      }
      if (info.kind === 'class' && !info.isAbstract) {
        // niezaimplementowane metody abstrakcyjne
        const chain = [];
        for (let c = info; c; c = c.base) chain.push(c);
        for (const c of chain.slice(1)) {
          for (const ms of c.methods.values()) {
            for (const m of ms) {
              if (!m.isAbstract) continue;
              const impl = chain.slice(0, chain.indexOf(c)).some((cc) => (cc.methods.get(m.name) || []).some((x) => x.isOverride && x.body && this.sameSig(x, m)));
              if (!impl) this.err(`klasa '${info.name}' nie implementuje odziedziczonej metody abstrakcyjnej '${c.name}.${m.name}()' – dodaj w niej 'public override ...' (CS0534)`, info.decl.line);
            }
          }
          for (const p of c.props.values()) {
            if (!p.isAbstract) continue;
            const impl = chain.slice(0, chain.indexOf(c)).some((cc) => cc.props.get(p.name)?.isOverride);
            if (!impl) this.err(`klasa '${info.name}' nie implementuje odziedziczonej abstrakcyjnej właściwości '${c.name}.${p.name}' (CS0534)`, info.decl.line);
          }
        }
      }
      if (info.kind !== 'interface') {
        for (const iface of this.allIfaces(info)) {
          for (const ms of iface.methods.values()) {
            for (const m of ms) {
              if (m.body) continue; // metoda domyślna interfejsu
              let ok = false;
              for (let c = info; c && !ok; c = c.base) ok = (c.methods.get(m.name) || []).some((x) => !x.isStatic && x.params.length === m.params.length);
              if (!ok) this.err(`klasa '${info.name}' nie implementuje składowej interfejsu '${iface.name}.${m.name}()' (CS0535)`, info.decl.line);
              for (let c = info; c; c = c.base) {
                const impl = (c.methods.get(m.name) || []).find((x) => x.params.length === m.params.length);
                if (impl) {
                  if (impl.access !== 'public') this.err(`metoda '${info.name}.${m.name}' implementuje interfejs '${iface.name}', więc musi być public (CS0737)`, impl.line);
                  break;
                }
              }
            }
          }
          for (const p of iface.props.values()) {
            let ok = false;
            for (let c = info; c && !ok; c = c.base) ok = c.props.has(p.name);
            if (!ok) this.err(`klasa '${info.name}' nie implementuje właściwości interfejsu '${iface.name}.${p.name}' (CS0535)`, info.decl.line);
          }
        }
      }
    }
    // switch bez przejść między etykietami (CS0163)
    const endsJump = (s) => {
      if (!s) return false;
      if (['Break', 'Return', 'Throw', 'Continue'].includes(s.kind)) return true;
      if (s.kind === 'Block') return s.stmts.length > 0 && endsJump(s.stmts[s.stmts.length - 1]);
      if (s.kind === 'If') return !!s.else && endsJump(s.then) && endsJump(s.else);
      if (s.kind === 'While') return s.cond.kind === 'Bool' && s.cond.v === true;
      return false;
    };
    const walk = (s) => {
      if (!s || typeof s !== 'object') return;
      if (Array.isArray(s)) { s.forEach(walk); return; }
      if (s.kind === 'Switch') {
        for (const sec of s.sections) {
          if (sec.body.length && !endsJump(sec.body[sec.body.length - 1])) {
            this.err("sterowanie nie może przejść z jednej sekcji 'case' do następnej – zakończ ją instrukcją break; (CS0163)", sec.line);
          }
          walk(sec.body);
        }
        return;
      }
      for (const k of ['stmts', 'then', 'else', 'body', 'fin', 'init']) if (s[k]) walk(s[k]);
      if (s.catches) s.catches.forEach((c) => walk(c.body));
      if (s.kind === 'LocalFunc') walk(s.fn.body);
    };
    walk(topStmts);
    for (const d of allDecls) {
      if (d.kind === 'Enum') continue;
      d.methods.forEach((m) => walk(m.body));
      d.ctors.forEach((c) => walk(c.body));
      d.props.forEach((p) => { walk(p.getter && p.getter.body); walk(p.setter && p.setter.body); });
      d.operators.forEach((o) => walk(o.body));
    }
  }

  initStatics() {
    for (const info of this.types.values()) {
      if (info.kind === 'enum' || info.kind === 'interface') continue;
      for (const f of info.decl.fields.filter((x) => x.isStatic)) {
        const t = this.rt(f.type, f.line);
        const c = new Cell(t, this.defaultOf(t));
        c.isConst = f.isConst;
        c.isReadonly = f.isReadonly;
        c.owner = info;
        c.decl = f;
        info.staticCells.set(f.name, c);
      }
      for (const p of info.decl.props.filter((x) => x.isStatic && x.auto)) {
        const t = this.rt(p.type, p.line);
        const c = new Cell(t, this.defaultOf(t));
        c.prop = p;
        info.staticCells.set(p.name, c);
      }
    }
    for (const info of this.types.values()) {
      if (info.kind === 'enum' || info.kind === 'interface') continue;
      const inits = [...info.decl.fields.filter((x) => x.isStatic && x.init), ...info.decl.props.filter((x) => x.isStatic && x.auto && x.init)];
      if (!inits.length && !info.sctor) continue;
      this.pushFrame({ m: { name: '.cctor' }, cls: info, thisCell: null, isCtor: true }, info.decl.line);
      try {
        for (const f of inits) {
          const c = info.staticCells.get(f.name);
          c.v = this.storeValue(this.evalWithTarget(f.init, this.globalEnv, c.t), c.t, f.line);
        }
        if (info.sctor) this.execBlock(info.sctor.body.stmts, new Env(this.globalEnv));
      } finally { this.frames.pop(); }
    }
  }

  // ---------- typy ----------
  rt(pt, line) {
    if (pt === null || pt === undefined) return null;
    if (isPrim(pt)) return pt;
    const cached = this.rtCache.get(pt);
    if (cached) return cached;
    let r;
    if (pt.nullable) { const inner = this.rt(pt.nullable, line); r = this.isValueType(inner) ? { nullable: inner } : inner; }
    else if (pt.arr) r = { arr: this.rt(pt.arr, line), rank: pt.rank };
    else if (pt.tuple) r = { tuple: pt.tuple.map((x) => ({ t: this.rt(x.t, line), name: x.name })) };
    else if (pt.generic) {
      const a = pt.args.map((x) => this.rt(x, line));
      switch (pt.generic) {
        case 'List': case 'IList': case 'IEnumerable': r = { list: a[0] }; break;
        case 'Dictionary': r = { dict: [a[0], a[1]] }; break;
        case 'KeyValuePair': r = { kvp: [a[0], a[1]] }; break;
        case 'Func': r = { fn: { params: a.slice(0, -1), ret: a[a.length - 1] } }; break;
        case 'Action': r = { fn: { params: a, ret: 'void' } }; break;
        case 'Predicate': r = { fn: { params: [a[0]], ret: 'bool' } }; break;
        case 'IComparable': case 'IEquatable': r = 'object'; break;
        default: this.err(`typ '${pt.generic}<...>' nie jest obsługiwany w tym środowisku`, line);
      }
    } else if (pt.named) {
      const n = pt.named;
      const map = { String: 'string', Int32: 'int', Int64: 'long', Double: 'double', Boolean: 'bool', Char: 'char', Object: 'object', Decimal: 'decimal', Single: 'float', StringBuilder: 'sb', Random: 'random' };
      if (map[n]) r = map[n];
      else if (n === 'Action') r = { fn: { params: [], ret: 'void' } };
      else if (['List', 'Dictionary', 'KeyValuePair', 'Func', 'Predicate', 'IEnumerable', 'IList'].includes(n)) this.err(`typ '${n}' wymaga parametru typu, np. ${n}<int>`, line);
      else if (BUILTIN_IFACES.has(n)) r = 'object';
      else {
        const info = this.types.get(n);
        if (!info) this.err(`nieznany typ '${n}'`, line);
        r = info.kind === 'enum' ? { enum: n } : { cls: n };
      }
    } else r = pt;
    this.rtCache.set(pt, r);
    return r;
  }

  infoOf(t) { return has(t, 'cls') ? this.types.get(t.cls) : null; }

  isValueType(t) {
    if (isPrim(t)) return !['string', 'object', 'null', 'void', 'sb', 'random', 'type'].includes(t);
    if (has(t, 'enum') || has(t, 'tuple') || has(t, 'kvp') || has(t, 'nullable')) return true;
    if (has(t, 'cls')) { const i = this.types.get(t.cls); return !!i && i.kind === 'struct'; }
    return false;
  }

  defaultOf(t) {
    if (isPrim(t)) {
      if (isNum(t)) return 0;
      if (t === 'bool') return false;
      return null;
    }
    if (has(t, 'enum')) return 0;
    if (has(t, 'tuple')) return { kind: 'tuple', cells: t.tuple.map((x) => new Cell(x.t, this.defaultOf(x.t))), names: t.tuple.map((x) => x.name) };
    if (has(t, 'cls')) {
      const info = this.types.get(t.cls);
      if (info && info.kind === 'struct') return this.newObject(info, false);
    }
    return null;
  }

  copyVal(v) {
    if (v && typeof v === 'object') {
      if (v.kind === 'obj' && v.cls.kind === 'struct') {
        const o = { kind: 'obj', cls: v.cls, fields: new Map() };
        for (const [k, c] of v.fields) o.fields.set(k, new Cell(c.t, this.copyVal(c.v)));
        return o;
      }
      if (v.kind === 'tuple') return { kind: 'tuple', cells: v.cells.map((c) => new Cell(c.t, this.copyVal(c.v))), names: v.names };
    }
    return v;
  }

  fit(v, t) {
    switch (t) {
      case 'int': return Number.isFinite(v) ? (Math.trunc(v) | 0) : -2147483648;
      case 'long': return Number.isFinite(v) ? Math.trunc(v) : -9223372036854775808;
      case 'char': return Math.trunc(v) & 0xffff;
      case 'float': return Math.fround(v);
      default: return v;
    }
  }

  unbox(tv) {
    if (tv.v && typeof tv.v === 'object' && tv.v.kind === 'box') return { t: tv.v.t, v: tv.v.v };
    return tv;
  }

  // konwersja niejawna – zwraca surową wartość
  implicitConv(tv, t, line) {
    const s = tv.t;
    if (t === 'var' || t === null) return tv.v;
    if (s === 'default') return this.defaultOf(t);
    if (has(t, 'nullable')) {
      if (tv.v === null) return null;
      if (has(s, 'nullable')) { if (sameType(s, t)) return tv.v; }
      return this.implicitConv(tv, t.nullable, line);
    }
    if (has(s, 'nullable')) {
      if (t === 'object') return tv.v === null ? null : { kind: 'box', t: s.nullable, v: tv.v };
      this.err(`nie można niejawnie przekonwertować typu '${csName(s)}' na '${csName(t)}' – użyj .Value albo operatora ?? (CS0266)`, line);
    }
    if (s === 'null') {
      if (this.isValueType(t)) this.err(`null nie może być przypisany do typu wartościowego '${csName(t)}' (użyj typu ${csName(t)}?) (CS0037)`, line);
      return null;
    }
    if (isPrim(t)) {
      if (t === 'object') return this.isValueType(s) ? { kind: 'box', t: s, v: this.copyVal(tv.v) } : tv.v;
      if (t === s) return tv.v;
      if (isNum(t) && isNum(s)) {
        if (numWidens(s, t)) return this.fit(tv.v, t);
        if (tv.lit && isIntT(s) && isIntT(t) && t !== 'char') return this.fit(tv.v, t);
        this.err(`nie można niejawnie przekonwertować typu '${s}' na '${t}' – jeśli to zamierzone, użyj rzutowania: (${t}) (CS0266)`, line);
      }
      if (t === 'string' && s === 'char') this.err("znak (char) to nie napis – użyj cudzysłowu \"a\" albo metody c.ToString() (CS0029)", line);
      if (t === 'string' && isNum(s)) this.err('nie można przypisać liczby do zmiennej typu string – użyj x.ToString() albo $"{x}" (CS0029)', line);
      if (t === 'char' && s === 'string') this.err("napis (string) to nie znak – znak zapisujemy w apostrofach: 'a' (CS0029)", line);
      if (isNum(t) && s === 'string') this.err(`nie można przekonwertować typu string na ${t} – użyj ${t}.Parse(...) albo Convert.To${t === 'int' ? 'Int32' : 'Double'}(...) (CS0029)`, line);
      if (t === 'bool' && isNum(s)) this.err('w C# liczba nie zamienia się sama na bool – użyj porównania, np. x != 0 (CS0029)', line);
      if (isNum(t) && s === 'bool') this.err(`nie można przekonwertować typu bool na ${t} (CS0029)`, line);
      if (s === 'object') this.err(`z typu object trzeba rzutować jawnie, np. (${t})obj (CS0266)`, line);
      if (has(s, 'enum') && isNum(t)) this.err(`wartość wyliczenia zamień na liczbę jawnie: (${t})wartosc (CS0266)`, line);
      if (has(s, 'cls') && t === 'string') this.err(`nie można przypisać obiektu '${s.cls}' do zmiennej string – użyj .ToString() (CS0029)`, line);
      this.err(`nie można niejawnie przekonwertować typu '${csName(s)}' na '${csName(t)}' (CS0029)`, line);
    }
    if (has(t, 'enum')) {
      if (has(s, 'enum') && s.enum === t.enum) return tv.v;
      if (tv.lit && isIntT(s) && tv.v === 0) return 0;
      this.err(`nie można niejawnie przekonwertować typu '${csName(s)}' na wyliczenie '${t.enum}' – użyj rzutowania (${t.enum})n (CS0266)`, line);
    }
    if (has(t, 'cls')) {
      if (has(s, 'cls')) {
        if (this.isAssignable(s.cls, t.cls)) return tv.v;
        if (this.isAssignable(t.cls, s.cls)) this.err(`nie można niejawnie przekonwertować '${s.cls}' na '${t.cls}' – rzutowanie w dół wymaga jawnego zapisu (${t.cls})obj (CS0266)`, line);
      }
      if (s === 'object') this.err(`z typu object trzeba rzutować jawnie: (${t.cls})obj (CS0266)`, line);
      this.err(`nie można niejawnie przekonwertować typu '${csName(s)}' na '${t.cls}' (CS0029)`, line);
    }
    if (has(t, 'arr')) { if (has(s, 'arr') && sameType(s, t)) return tv.v; }
    else if (has(t, 'list')) { if (has(s, 'list') && sameType(s.list, t.list)) return tv.v; if (has(s, 'list') && s.list === null) return tv.v; }
    else if (has(t, 'dict')) { if (has(s, 'dict') && sameType(s, t)) return tv.v; }
    else if (has(t, 'fn')) { if (has(s, 'fn')) return tv.v; }
    else if (has(t, 'kvp')) { if (has(s, 'kvp')) return tv.v; }
    else if (has(t, 'tuple')) {
      if (has(s, 'tuple') && s.tuple.length === t.tuple.length) {
        return { kind: 'tuple', cells: t.tuple.map((x, k) => new Cell(x.t, this.storeValue({ t: tv.v.cells[k].t, v: tv.v.cells[k].v }, x.t, line))), names: t.tuple.map((x) => x.name) };
      }
    } else if (t === s) return tv.v;
    this.err(`nie można niejawnie przekonwertować typu '${csName(s)}' na '${csName(t)}' (CS0029)`, line);
    return null;
  }

  // wartość do zapisania w zmiennej (z kopiowaniem typów wartościowych)
  storeValue(tv, t, line) {
    return this.copyVal(this.implicitConv(tv, t, line));
  }

  cast(tv0, t, line) {
    const tv = tv0.t === 'object' || (tv0.v && tv0.v.kind === 'box') ? this.unbox(tv0) : tv0;
    if (isNum(t)) {
      if (tv.v === null) this.throwEx('NullReferenceException', null, line);
      if (isNum(tv.t)) {
        let v = tv.v;
        if (isIntT(t) && isFloatT(tv.t)) v = Number.isNaN(v) ? -2147483648 : Math.trunc(v);
        return { t, v: this.fit(v, t) };
      }
      if (has(tv.t, 'enum')) return { t, v: this.fit(tv.v, t) };
      if (tv0.t === 'object') this.throwEx('InvalidCastException', `Unable to cast object of type '${netName(tv.t, this.types)}' to type '${netName(t)}'.`, line);
      if (tv.t === 'string') this.err(`nie można rzutować typu string na ${t} – do zamiany napisu na liczbę służy ${t}.Parse(...) (CS0030)`, line);
      this.err(`nie można przekonwertować typu '${csName(tv.t)}' na '${t}' (CS0030)`, line);
    }
    if (has(t, 'enum')) {
      if (isNum(tv.t) || has(tv.t, 'enum')) return { t, v: Math.trunc(tv.v) };
      this.err(`nie można przekonwertować typu '${csName(tv.t)}' na '${t.enum}' (CS0030)`, line);
    }
    if (has(t, 'cls')) {
      if (tv0.v === null) return { t, v: null };
      const o = tv.v;
      if (o && o.kind === 'obj') {
        if (this.isAssignable(o.cls.name, t.cls)) return { t, v: o };
        this.throwEx('InvalidCastException', `Unable to cast object of type '${netName({ cls: o.cls.name }, this.types)}' to type '${t.cls}'.`, line);
      }
      this.err(`nie można przekonwertować typu '${csName(tv.t)}' na '${t.cls}' (CS0030)`, line);
    }
    if (t === 'string') {
      if (tv.v === null || tv.t === 'string') return { t, v: tv.v };
      if (tv0.t === 'object') this.throwEx('InvalidCastException', `Unable to cast object of type '${netName(tv.t, this.types)}' to type 'System.String'.`, line);
      this.err(`nie można rzutować typu '${csName(tv.t)}' na string – użyj .ToString() (CS0030)`, line);
    }
    if (t === 'bool' && tv0.t === 'object') {
      if (tv.t !== 'bool') this.throwEx('InvalidCastException', 'Specified cast is not valid.', line);
      return { t, v: tv.v };
    }
    if (has(t, 'nullable')) {
      if (tv.v === null) return { t, v: null };
      return { t, v: this.cast(tv, t.nullable, line).v };
    }
    return { t, v: this.implicitConv(tv0, t, line) };
  }

  // ---------- obiekty ----------
  newObject(info, runInit = true) {
    const o = { kind: 'obj', cls: info, fields: new Map() };
    const chain = [];
    for (let c = info; c; c = c.base) chain.unshift(c);
    for (const c of chain) {
      for (const f of c.instFields) {
        const t = this.rt(f.type, f.line);
        const cell = new Cell(t, this.defaultOf(t));
        cell.decl = f;
        cell.owner = c;
        cell.isReadonly = f.isReadonly;
        o.fields.set(f.name, cell);
      }
      for (const p of c.props.values()) {
        if (p.isStatic || !p.auto || c.kind === 'interface') continue;
        if (o.fields.has(p.name)) continue;
        const t = this.rt(p.type, p.line);
        const cell = new Cell(t, this.defaultOf(t));
        cell.prop = p;
        cell.owner = c;
        o.fields.set(p.name, cell);
      }
    }
    if (runInit) {
      const objCell = new Cell({ cls: info.name }, o);
      for (const c of chain) {
        const inits = [...c.instFields.filter((f) => f.init), ...[...c.props.values()].filter((p) => !p.isStatic && p.auto && p.init)];
        if (!inits.length) continue;
        this.pushFrame({ m: { name: '.ctor' }, cls: c, thisCell: objCell, isCtor: true }, c.decl.line);
        try {
          for (const f of inits) {
            const cell = o.fields.get(f.name);
            cell.v = this.storeValue(this.evalWithTarget(f.init, this.globalEnv, cell.t), cell.t, f.line);
          }
        } finally { this.frames.pop(); }
      }
    }
    return o;
  }

  instantiate(info, args, line, env) {
    if (info.kind === 'interface') this.err(`nie można utworzyć instancji interfejsu '${info.name}' – utwórz obiekt klasy, która go implementuje (CS0144)`, line);
    if (info.isAbstract) this.err(`nie można utworzyć instancji klasy abstrakcyjnej '${info.name}' – utwórz obiekt klasy pochodnej (CS0144)`, line);
    if (info.isStatic) this.err(`nie można utworzyć instancji klasy statycznej '${info.name}' (CS0712)`, line);
    if (info.kind === 'struct' && args.length === 0) {
      const o = this.newObject(info, true);
      return o;
    }
    const o = this.newObject(info, true);
    const objCell = new Cell({ cls: info.name }, o);
    this.runCtor(info, objCell, args, line, env);
    return o;
  }

  runCtor(info, objCell, args, line) {
    const ctors = info.ctors;
    if (!ctors.length) {
      if (args.length) this.err(`typ '${info.name}' nie zawiera konstruktora przyjmującego ${args.length} argument(ów) – dodaj konstruktor (CS1729)`, line);
      if (info.base) this.runCtor(info.base, objCell, [], line);
      return;
    }
    const ctor = this.chooseOverload(ctors, args, line, info.name, true);
    if (!this.canAccess(info, ctor.access)) this.err(`konstruktor '${info.name}' jest niedostępny (${ctor.access}) (CS0122)`, line);
    const menv = new Env(this.globalEnv);
    this.bindArgs(ctor, args, menv, line);
    ctor._order = null;
    this.pushFrame({ m: ctor, cls: info, thisCell: objCell, isCtor: true }, line);
    try {
      if (ctor.init && ctor.init.which === 'this') {
        const a = this.evalArgs(ctor.init.args, menv);
        this.runCtor(info, objCell, a, line);
      } else if (info.base) {
        const a = ctor.init ? this.evalArgs(ctor.init.args, menv) : [];
        if (!ctor.init && info.base.ctors.length && !info.base.ctors.some((c) => c.params.every((p) => p.def))) {
          this.err(`klasa bazowa '${info.base.name}' nie ma konstruktora bezparametrowego – wywołaj go jawnie: : base(...) (CS7036)`, ctor.line);
        }
        this.runCtor(info.base, objCell, a, line);
      }
      this.execBlock(ctor.body.stmts, menv);
    } finally { this.frames.pop(); }
  }

  canAccess(owner, access) {
    if (!access || access === 'public') return true;
    const fr = this.frame();
    const cur = fr && fr.cls;
    if (!cur) return false;
    if (access === 'private') return cur === owner;
    for (let c = cur; c; c = c.base) if (c === owner) return true;
    return false;
  }

  accessError(kind, owner, name, access, line) {
    this.err(`'${owner.name}.${name}' jest niedostępne ze względu na poziom ochrony (${access})${access === 'private' ? ' – dostęp mają tylko metody tej klasy; użyj publicznej metody lub właściwości' : ''} (CS0122)`, line);
  }

  // ---------- składowe klas ----------
  findProp(info, name) {
    for (let c = info; c; c = c.base) { const p = c.props.get(name); if (p) return p; }
    for (const i of info.kind === 'interface' ? [info, ...this.allIfaces(info)] : []) { const p = i.props.get(name); if (p) return p; }
    return null;
  }

  findField(info, name) {
    for (let c = info; c; c = c.base) { const f = c.fieldDecl.get(name); if (f) return f; }
    return null;
  }

  findStaticCell(info, name) {
    for (let c = info; c; c = c.base) { const s = c.staticCells.get(name); if (s) return s; }
    return null;
  }

  methodCands(info, name) {
    const out = [];
    const seen = [];
    for (let c = info; c; c = c.base) {
      for (const m of c.methods.get(name) || []) {
        if (seen.some((x) => this.sameSig(x, m))) continue;
        seen.push(m);
        out.push(m);
      }
    }
    if (info.kind === 'interface' || info.isAbstract) {
      for (const i of [info, ...this.allIfaces(info)]) for (const m of i.methods.get(name) || []) if (!out.some((x) => this.sameSig(x, m))) out.push(m);
    }
    return out;
  }

  // wiązanie dynamiczne (virtual/override/interfejs)
  dispatch(m, dynInfo) {
    const owner = m.owner;
    if (!(m.isVirtual || m.isAbstract || m.isOverride || owner.kind === 'interface')) return m;
    if (owner.kind === 'interface') {
      for (let c = dynInfo; c; c = c.base) {
        const impl = (c.methods.get(m.name) || []).find((x) => !x.isStatic && x.params.length === m.params.length && x.body);
        if (impl) return impl;
      }
      return m;
    }
    for (let c = dynInfo; c && c !== owner; c = c.base) {
      const ov = (c.methods.get(m.name) || []).find((x) => x.isOverride && this.sameSig(x, m));
      if (ov) return ov;
    }
    return m;
  }

  dispatchProp(p, dynInfo) {
    if (!(p.isVirtual || p.isAbstract || p.isOverride || p.owner.kind === 'interface')) return p;
    for (let c = dynInfo; c; c = c.base) {
      const q = c.props.get(p.name);
      if (q && (q.isOverride || p.owner.kind === 'interface') && (q.getter || q.setter)) return q;
      if (c === p.owner) break;
    }
    return p;
  }

  propLV(p, owner, objCell, line) {
    const self = this;
    const isStatic = !!p.isStatic;
    return {
      t: this.rt(p.type, line),
      get() {
        const dyn = objCell && objCell.v ? objCell.v.cls : owner;
        const q = objCell ? self.dispatchProp(p, dyn) : p;
        if (!q.getter) self.err(`właściwość '${q.name}' nie ma akcesora get – nie można jej odczytać (CS0154)`, line);
        if (q.getter.access && !self.canAccess(q.owner, q.getter.access)) self.accessError('prop', q.owner, q.name, q.getter.access, line);
        if (q.auto) {
          const cell = isStatic ? q.owner.staticCells.get(q.name) : objCell.v.fields.get(q.name);
          return { t: cell.t, v: cell.v };
        }
        return self.runAccessor(q, q.getter.body, objCell, null, line);
      },
      set(tv) {
        const dyn = objCell && objCell.v ? objCell.v.cls : owner;
        const q = objCell ? self.dispatchProp(p, dyn) : p;
        const fr = self.frame();
        if (!q.setter) {
          const inCtor = fr && fr.isCtor && fr.cls === q.owner;
          if (!(q.auto && inCtor)) self.err(`właściwość '${q.name}' jest tylko do odczytu – nie ma akcesora set (CS0200)`, line);
        } else if (q.setter.access && !self.canAccess(q.owner, q.setter.access)) {
          self.err(`akcesor set właściwości '${q.name}' jest ${q.setter.access} – nie można jej zmienić spoza klasy (CS0272)`, line);
        }
        const t = self.rt(q.type, line);
        if (q.auto) {
          const cell = isStatic ? q.owner.staticCells.get(q.name) : objCell.v.fields.get(q.name);
          cell.v = self.storeValue(tv, t, line);
          return;
        }
        self.runAccessor(q, q.setter.body, objCell, { t, v: self.storeValue(tv, t, line) }, line);
      },
    };
  }

  runAccessor(p, body, objCell, value, line) {
    const env = new Env(this.globalEnv);
    if (value) env.vars.set('value', new Cell(value.t, value.v));
    this.pushFrame({ m: { name: p.name, ret: value ? 'void' : p.type }, cls: p.owner, thisCell: objCell || null }, line);
    let r;
    try { r = this.execBlock(body.stmts, env); } finally { this.frames.pop(); }
    if (value) return VOID;
    if (!r || !r.ret) this.err(`akcesor get właściwości '${p.name}' musi zwrócić wartość (return)`, p.line);
    const t = this.rt(p.type, line);
    return { t, v: this.storeValue(r.ret, t, line) };
  }

  // składowa obiektu (pole / właściwość) jako l-wartość
  memberLV(objTV, name, line, objCellOverride = null) {
    const o = objTV.v;
    const st = objTV.t;
    const staticInfo = this.infoOf(st) || (o && o.cls);
    const info = staticInfo || o.cls;
    const objCell = objCellOverride || new Cell(st, o);
    const p = this.findProp(info, name);
    if (p) {
      if (p.isStatic) this.err(`do składowej statycznej '${info.name}.${name}' odwołuj się przez nazwę typu, a nie obiekt (CS0176)`, line);
      if (!this.canAccess(p.owner, p.access)) this.accessError('prop', p.owner, name, p.access, line);
      return this.propLV(p, p.owner, objCell, line);
    }
    const f = this.findField(info, name);
    if (f) {
      if (f.isStatic) this.err(`do pola statycznego '${info.name}.${name}' odwołuj się przez nazwę typu: ${info.name}.${name} (CS0176)`, line);
      if (!this.canAccess(f.owner, f.access)) this.accessError('field', f.owner, name, f.access, line);
      const cell = o.fields.get(name);
      return this.cellLV(cell, name, line);
    }
    return null;
  }

  cellLV(cell, name, line) {
    const self = this;
    return {
      t: cell.t,
      cell,
      get() {
        if (cell.unassigned) self.err(`użycie nieprzypisanej zmiennej lokalnej '${name}' – nadaj jej wartość przed odczytem (CS0165)`, line);
        return { t: cell.t, v: cell.v };
      },
      set(tv) {
        if (cell.isConst) self.err(`'${name}' jest stałą (const) – nie można zmienić jej wartości (CS0131)`, line);
        if (cell.iterVar) self.err(`nie można przypisać wartości do zmiennej iteracyjnej '${name}' pętli foreach (CS1656)`, line);
        if (cell.isReadonly) {
          const fr = self.frame();
          if (!(fr && fr.isCtor && fr.cls === cell.owner)) self.err(`pole tylko do odczytu (readonly) '${name}' można ustawić tylko w konstruktorze (CS0191)`, line);
        }
        cell.v = self.storeValue(tv, cell.t, line);
        cell.unassigned = false;
      },
    };
  }

  // nazwa w kontekście klasy (pole/właściwość/stała bez "this.")
  ctxMemberLV(name, line) {
    const fr = this.frame();
    if (!fr || !fr.cls) return null;
    const info = fr.cls;
    const p = this.findProp(info, name);
    if (p) {
      if (p.isStatic) return this.propLV(p, p.owner, null, line);
      if (!fr.thisCell) this.err(`w metodzie statycznej nie można użyć właściwości instancji '${name}' – brak obiektu (this) (CS0120)`, line);
      return this.propLV(p, p.owner, fr.thisCell, line);
    }
    const sc = this.findStaticCell(info, name);
    if (sc) return this.cellLV(sc, name, line);
    const f = this.findField(info, name);
    if (f) {
      if (!fr.thisCell) {
        this.err(`w metodzie statycznej nie można użyć pola '${name}' – pole należy do obiektu (brak this). Oznacz pole jako static albo utwórz obiekt (CS0120)`, line);
      }
      return this.cellLV(fr.thisCell.v.fields.get(name), name, line);
    }
    return null;
  }

  // ---------- instrukcje ----------
  execBlock(stmts, env) {
    // funkcje lokalne są widoczne w całym bloku
    for (const s of stmts) {
      if (s.kind === 'LocalFunc') env.vars.set(s.fn.name, new Cell({ fn: null }, { kind: 'fn', local: s.fn, env, frame: this.frame() }));
    }
    for (const s of stmts) {
      const r = this.execStmt(s, env);
      if (r) return r;
    }
    return undefined;
  }

  execScoped(s, env) {
    if (s.kind === 'Block') return this.execBlock(s.stmts, new Env(env));
    if (s.kind === 'VarDecl') this.err('deklaracja zmiennej nie może być jedyną instrukcją w if/pętli – użyj nawiasów { } (CS1023)', s.line);
    return this.execStmt(s, env);
  }

  truthy(tv, line) {
    if (tv.t === 'bool') return tv.v;
    if (has(tv.t, 'nullable') && tv.t.nullable === 'bool') return tv.v === true;
    if (isNum(tv.t)) this.err('warunek musi być typu bool – w C# liczba nie jest warunkiem (napisz np. x != 0) (CS0029)', line);
    if (tv.t === 'string') this.err('warunek musi być typu bool – napisu nie można użyć jako warunku (np. s != "" albo s.Length > 0) (CS0029)', line);
    this.err(`warunek musi być typu bool, a jest typu '${csName(tv.t)}' (CS0029)`, line);
    return false;
  }

  execStmt(s, env) {
    this.step(s.line);
    switch (s.kind) {
      case 'Block': return this.execBlock(s.stmts, new Env(env));
      case 'Empty': case 'LocalFunc': return undefined;
      case 'ExprStmt': this.eval(s.expr, env); return undefined;
      case 'VarDecl': this.execVarDecl(s, env); return undefined;
      case 'Deconstruct': {
        const v = this.eval(s.value, env);
        if (!has(v.t, 'tuple')) this.err('dekonstrukcja wymaga krotki po prawej stronie', s.line);
        if (v.t.tuple.length !== s.names.length) this.err(`krotka ma ${v.t.tuple.length} elementy, a podano ${s.names.length} zmiennych`, s.line);
        s.names.forEach((n, k) => {
          if (env.vars.has(n)) this.err(`zmienna '${n}' została już zadeklarowana w tym zakresie (CS0128)`, s.line);
          const c = v.v.cells[k];
          env.vars.set(n, new Cell(c.t, this.copyVal(c.v)));
        });
        return undefined;
      }
      case 'If':
        if (this.truthy(this.eval(s.cond, env), s.line)) return this.execScoped(s.then, env);
        if (s.else) return this.execScoped(s.else, env);
        return undefined;
      case 'While':
        while (this.truthy(this.eval(s.cond, env), s.line)) {
          const r = this.execScoped(s.body, env);
          if (r === BREAK) break;
          if (r && r !== CONTINUE) return r;
          this.step(s.line);
        }
        return undefined;
      case 'DoWhile':
        do {
          const r = this.execScoped(s.body, env);
          if (r === BREAK) break;
          if (r && r !== CONTINUE) return r;
          this.step(s.line);
        } while (this.truthy(this.eval(s.cond, env), s.line));
        return undefined;
      case 'For': {
        const fe = new Env(env);
        for (const i of s.init) this.execStmt(i, fe);
        for (;;) {
          if (s.cond && !this.truthy(this.eval(s.cond, fe), s.line)) break;
          const r = this.execScoped(s.body, new Env(fe));
          if (r === BREAK) break;
          if (r && r !== CONTINUE) return r;
          for (const st of s.step) this.eval(st, fe);
          this.step(s.line);
        }
        return undefined;
      }
      case 'Foreach': return this.execForeach(s, env);
      case 'Switch': return this.execSwitch(s, env);
      case 'Return': {
        const fr = this.frame();
        if (s.arrow && fr && fr.m && fr.m.ret === 'void') { this.eval(s.expr, env); return { ret: null }; }
        if (!s.expr) {
          if (fr && fr.m && fr.m.ret && fr.m.ret !== 'void' && !fr.lambda) this.err(`metoda '${fr.m.name}' musi zwrócić wartość typu ${csName(this.rt(fr.m.ret))} (CS0126)`, s.line);
          return { ret: null };
        }
        if (fr && fr.m && fr.m.ret === 'void' && !fr.lambda) this.err(`metoda '${fr.m.name}' jest typu void – nie może zwracać wartości (CS0127)`, s.line);
        const retT = fr && fr.retT;
        const tv = retT ? this.evalWithTarget(s.expr, env, retT) : this.eval(s.expr, env);
        return { ret: { t: tv.t, v: this.copyVal(tv.v), lit: tv.lit }, line: s.line };
      }
      case 'Break': return BREAK;
      case 'Continue': return CONTINUE;
      case 'Throw': {
        if (!s.expr) {
          const cur = this.excStack[this.excStack.length - 1];
          if (!cur) this.err("'throw;' bez wyrażenia można użyć tylko wewnątrz bloku catch (CS0156)", s.line);
          throw cur;
        }
        const tv = this.eval(s.expr, env);
        if (tv.v === null) this.throwEx('NullReferenceException', null, s.line);
        if (!(tv.v && tv.v.kind === 'obj' && this.isAssignable(tv.v.cls.name, 'Exception'))) {
          this.err('throw wymaga obiektu wyjątku, np. throw new ArgumentException("opis"); (CS0155)', s.line);
        }
        throw new CsThrow(tv.v, s.line);
      }
      case 'Try': return this.execTry(s, env);
      default: this.err(`nieobsługiwana instrukcja (${s.kind})`, s.line);
    }
    return undefined;
  }

  execVarDecl(s, env) {
    const declT = s.type === 'var' ? 'var' : this.rt(s.type, s.line);
    for (const d of s.decls) {
      if (env.lookup(d.name) && this.isLocalName(env, d.name)) this.err(`zmienna lokalna '${d.name}' jest już zadeklarowana w tym lub nadrzędnym zakresie (CS0128/CS0136)`, d.line);
      let cell;
      if (declT === 'var') {
        if (d.init.kind === 'Null') this.err("nie można przypisać null do zmiennej 'var' – typ jest nieznany (CS0815)", d.line);
        if (d.init.kind === 'ArrayInit') this.err("tablicę z 'var' utwórz przez new: var t = new int[] { ... } (CS0820)", d.line);
        if (d.init.kind === 'Lambda') this.err("nie można przypisać lambdy do zmiennej 'var' – podaj typ, np. Func<int, int> (CS8917)", d.line);
        const tv = this.eval(d.init, env);
        if (tv.t === 'void') this.err('nie można przypisać wyniku metody void do zmiennej (CS0815)', d.line);
        const t = tv.t === 'null' ? 'object' : tv.t;
        cell = new Cell(t, this.copyVal(tv.v));
      } else {
        cell = new Cell(declT, this.defaultOf(declT));
        if (d.init) {
          const tv = d.init.kind === 'ArrayInit' ? this.arrayFromInit(d.init, declT, env) : this.evalWithTarget(d.init, env, declT);
          cell.v = this.storeValue(tv, declT, d.line);
        } else cell.unassigned = true;
      }
      if (s.isConst) {
        if (!d.init) this.err(`stała '${d.name}' musi mieć wartość (CS0145)`, d.line);
        cell.isConst = true;
      }
      env.vars.set(d.name, cell);
    }
  }

  isLocalName(env, name) {
    for (let e = env; e && e !== this.globalEnv; e = e.parent) if (e.vars.has(name)) return true;
    return false;
  }

  iterate(tv, line) {
    const v = tv.v;
    if (v === null) this.throwEx('NullReferenceException', null, line);
    if (tv.t === 'string') return { et: 'char', items: Array.from(v, (ch) => ({ t: 'char', v: ch.charCodeAt(0) })) };
    if (v.kind === 'arr') return { et: v.et, items: v.cells.map((c) => ({ t: c.t, v: c.v })) };
    if (v.kind === 'list') return { et: v.et, items: v.cells.map((c) => ({ t: c.t, v: c.v })), list: v };
    if (v.kind === 'dict') {
      const kt = { kvp: [v.kt, v.vt] };
      return { et: kt, items: [...v.map.entries()].map(([, e]) => ({ t: kt, v: { kind: 'kvp', key: e.key, val: { t: v.vt, v: e.cell.v } } })), list: v };
    }
    this.err(`instrukcja foreach nie może przechodzić po wartości typu '${csName(tv.t)}' (CS1579)`, line);
    return null;
  }

  execForeach(s, env) {
    const src = this.eval(s.expr, env);
    const it = this.iterate(src, s.line);
    const t = s.type === 'var' ? it.et : this.rt(s.type, s.line);
    const version = it.list ? it.list.version || 0 : 0;
    for (const el of it.items) {
      if (it.list && (it.list.version || 0) !== version) {
        this.throwEx('InvalidOperationException', 'Collection was modified; enumeration operation may not execute.', s.line);
      }
      const le = new Env(env);
      const cell = new Cell(t, this.storeValue(s.type === 'var' ? el : el, t, s.line));
      cell.iterVar = true;
      le.vars.set(s.name, cell);
      const r = this.execScoped(s.body, le);
      if (r === BREAK) break;
      if (r && r !== CONTINUE) return r;
      this.step(s.line);
    }
    if (it.list && (it.list.version || 0) !== version) {
      this.throwEx('InvalidOperationException', 'Collection was modified; enumeration operation may not execute.', s.line);
    }
    return undefined;
  }

  execSwitch(s, env) {
    const v = this.eval(s.expr, env);
    const senv = new Env(env);
    let found = null;
    let def = null;
    outer: for (const sec of s.sections) {
      for (const lab of sec.labels) {
        if (lab.isDefault) { def = sec; continue; }
        if (this.matchPat(lab.pat, v, senv, s.line) && (!lab.when || this.truthy(this.eval(lab.when, senv), s.line))) { found = sec; break outer; }
      }
    }
    const sec = found || def;
    if (!sec) return undefined;
    for (const st of sec.body) {
      const r = this.execStmt(st, senv);
      if (r === BREAK) return undefined;
      if (r) return r;
    }
    return undefined;
  }

  execTry(s, env) {
    let r;
    let pending = null;
    try {
      r = this.execBlock(s.body.stmts, new Env(env));
    } catch (e) {
      if (!(e instanceof CsThrow)) throw e;
      const c = s.catches.find((cc) => {
        if (!cc.type) return true;
        const ct = this.rt(cc.type, cc.line);
        return has(ct, 'cls') && this.isAssignable(e.obj.cls.name, ct.cls);
      });
      if (!c) pending = e;
      else {
        const cenv = new Env(env);
        if (c.name) cenv.vars.set(c.name, new Cell(this.rt(c.type, c.line), e.obj));
        if (c.when && !this.truthy(this.eval(c.when, cenv), c.line)) pending = e;
        else {
          this.excStack.push(e);
          try { r = this.execBlock(c.body.stmts, cenv); } catch (e2) {
            if (e2 instanceof CsThrow) pending = e2; else throw e2;
          } finally { this.excStack.pop(); }
        }
      }
    }
    if (s.fin) {
      const fr = this.execBlock(s.fin.stmts, new Env(env));
      if (fr) this.err('w bloku finally nie można używać return/break/continue (CS0157)', s.fin.line);
    }
    if (pending) throw pending;
    return r;
  }

  throwEx(name, msg, line) {
    const info = this.types.get(name);
    const args = msg === null || msg === undefined ? [] : [{ tv: { t: 'string', v: msg } }];
    const o = this.instantiate(info, args, line);
    throw new CsThrow(o, line);
  }

  // ---------- wzorce ----------
  matchPat(pat, tv, env, line) {
    switch (pat.pk) {
      case 'any': return true;
      case 'not': return !this.matchPat(pat.a, tv, env, line);
      case 'and': return this.matchPat(pat.a, tv, env, line) && this.matchPat(pat.b, tv, env, line);
      case 'or': return this.matchPat(pat.a, tv, env, line) || this.matchPat(pat.b, tv, env, line);
      case 'rel': {
        const c = this.eval(pat.e, env);
        const a = this.unbox(tv);
        if (a.v === null || !(isNum(a.t) || has(a.t, 'enum'))) return false;
        return { '<': a.v < c.v, '>': a.v > c.v, '<=': a.v <= c.v, '>=': a.v >= c.v }[pat.op];
      }
      case 'typeOrConst': {
        let t = null;
        try { t = this.rt(pat.t, line); } catch { t = null; }
        if (t && !has(t, 'enum')) return this.matchType(t, null, tv, env);
        return this.valuesEqual(tv, this.eval(pat.e, env));
      }
      case 'type': return this.matchType(this.rt(pat.t, line), pat.name, tv, env);
      case 'const': default: return this.valuesEqual(tv, this.eval(pat.e, env));
    }
  }

  matchType(t, name, tv, env) {
    const a = this.unbox(tv);
    if (a.v === null) return false;
    let ok = false;
    if (has(t, 'cls')) ok = a.v && a.v.kind === 'obj' && this.isAssignable(a.v.cls.name, t.cls);
    else if (t === 'object') ok = true;
    else ok = sameType(a.t, t);
    if (ok && name) env.vars.set(name, new Cell(t, has(t, 'cls') ? a.v : this.copyVal(a.v)));
    return ok;
  }

  valuesEqual(a0, b0) {
    const a = this.unbox(a0);
    const b = this.unbox(b0);
    if (a.v === null || b.v === null) return a.v === b.v;
    if ((isNum(a.t) || has(a.t, 'enum')) && (isNum(b.t) || has(b.t, 'enum'))) return a.v === b.v;
    if (typeof a.v !== 'object') return a.v === b.v;
    if (a.v.kind === 'obj' && b.v.kind === 'obj') {
      if (a.v.cls.kind === 'struct' && a.v.cls === b.v.cls) {
        for (const [k, c] of a.v.fields) if (!this.valuesEqual({ t: c.t, v: c.v }, { t: c.t, v: b.v.fields.get(k).v })) return false;
        return true;
      }
      const eqm = (this.methodCands(a.v.cls, 'Equals') || []).find((m) => m.params.length === 1 && !m.owner.prelude);
      if (eqm) return this.callUser(this.dispatch(eqm, a.v.cls), new Cell({ cls: a.v.cls.name }, a.v), [{ tv: { t: 'object', v: b.v } }], this.curLine).v;
      return a.v === b.v;
    }
    if (a.v.kind === 'tuple' && b.v.kind === 'tuple') {
      return a.v.cells.length === b.v.cells.length && a.v.cells.every((c, k) => this.valuesEqual({ t: c.t, v: c.v }, { t: b.v.cells[k].t, v: b.v.cells[k].v }));
    }
    return a.v === b.v;
  }

  // ---------- wyrażenia ----------
  evalWithTarget(node, env, t) {
    if (!t) return this.eval(node, env);
    switch (node.kind) {
      case 'Lambda': return { t, v: this.makeLambda(node, env, has(t, 'fn') ? t.fn : null) };
      case 'New': if (!node.type) return this.evalNew(node, env, t); break;
      case 'NewArray': if (!node.type) return this.evalNewArray(node, env, t); break;
      case 'ArrayInit': return this.arrayFromInit(node, t, env);
      case 'Default': if (!node.type) return { t, v: this.defaultOf(t) }; break;
      case 'Num':
        if (isIntT(node.t) && isIntT(t) && t !== 'char') return { t: node.t, v: node.v, lit: true };
        if (isIntT(node.t) && has(t, 'enum') && node.v === 0) return { t: node.t, v: 0, lit: true };
        break;
      case 'Ident': case 'Member': {
        if (has(t, 'fn')) {
          const g = this.tryMethodGroup(node, env);
          if (g) return { t, v: g };
        }
        break;
      }
      case 'Ternary': {
        const c = this.truthy(this.eval(node.c, env), node.line);
        return this.evalWithTarget(c ? node.a : node.b, env, t);
      }
      default: break;
    }
    return this.eval(node, env);
  }

  eval(node, env) {
    switch (node.kind) {
      case 'Num': return { t: node.t, v: node.t === 'float' ? Math.fround(node.v) : node.v, lit: true };
      case 'Str': return { t: 'string', v: node.v };
      case 'Char': return { t: 'char', v: node.v };
      case 'Bool': return { t: 'bool', v: node.v };
      case 'Null': return { t: 'null', v: null };
      case 'Interp': return { t: 'string', v: this.interp(node, env) };
      case 'Ident': return this.evalIdent(node, env);
      case 'TypeRef': return { t: 'type', v: { name: node.name } };
      case 'This': {
        const fr = this.frame();
        if (!fr || !fr.thisCell) this.err("słowa 'this' nie można użyć w metodzie statycznej (CS0026)", node.line);
        return { t: fr.thisCell.t, v: fr.thisCell.v };
      }
      case 'Base': this.err("'base' można użyć tylko do odwołania do składowej klasy bazowej, np. base.Metoda()", node.line); break;
      case 'Member': return this.evalMember(node, env);
      case 'Index': return this.indexLV(node, env).get();
      case 'Call': return this.evalCall(node, env);
      case 'New': return this.evalNew(node, env, null);
      case 'NewArray': return this.evalNewArray(node, env, null);
      case 'Assign': return this.evalAssign(node, env);
      case 'Binary': return this.evalBinary(node, env);
      case 'Unary': return this.evalUnary(node, env);
      case 'PreInc': case 'PostInc': {
        const lv = this.lv(node.e, env);
        const old = lv.get();
        let nv;
        if (has(old.t, 'cls')) {
          const r = this.userOperator(node.op, [old], node.line);
          if (!r) this.err(`typ '${old.t.cls}' nie definiuje operatora ${node.op} (CS0023)`, node.line);
          nv = r;
        } else {
          if (!(isNum(old.t) || has(old.t, 'enum'))) this.err(`operator ${node.op} nie działa dla typu '${csName(old.t)}' (CS0023)`, node.line);
          nv = { t: old.t, v: this.fit(old.v + (node.op === '++' ? 1 : -1), has(old.t, 'enum') ? 'int' : old.t) };
        }
        lv.set(nv);
        return node.kind === 'PreInc' ? lv.get() : old;
      }
      case 'Ternary': {
        const c = this.truthy(this.eval(node.c, env), node.line);
        const r = this.eval(c ? node.a : node.b, env);
        return r;
      }
      case 'Cast': return this.cast(this.eval(node.e, env), this.rt(node.type, node.line), node.line);
      case 'Is': {
        const v = this.eval(node.e, env);
        return { t: 'bool', v: this.matchPat(node.pat, v, env, node.line) };
      }
      case 'As': {
        const v = this.eval(node.e, env);
        const t = this.rt(node.type, node.line);
        if (this.isValueType(t) && !has(t, 'nullable')) this.err(`operator 'as' działa tylko z typami referencyjnymi lub dopuszczającymi null (CS0077)`, node.line);
        const a = this.unbox(v);
        if (a.v === null) return { t, v: null };
        if (has(t, 'cls')) return { t, v: a.v.kind === 'obj' && this.isAssignable(a.v.cls.name, t.cls) ? a.v : null };
        return { t, v: sameType(a.t, t) ? a.v : null };
      }
      case 'Lambda': return { t: { fn: null }, v: this.makeLambda(node, env, null) };
      case 'TupleLit': {
        const items = node.items.map((it) => this.eval(it.expr, env));
        const names = node.items.map((it, k) => it.name || (it.expr.kind === 'Ident' ? it.expr.name : null) || null);
        const t = { tuple: items.map((x, k) => ({ t: x.t === 'null' ? 'object' : x.t, name: names[k] })) };
        return { t, v: { kind: 'tuple', cells: items.map((x) => new Cell(x.t, this.copyVal(x.v))), names } };
      }
      case 'SwitchExpr': {
        const v = this.eval(node.subject, env);
        for (const arm of node.arms) {
          const aenv = new Env(env);
          if (this.matchPat(arm.pat, v, aenv, node.line) && (!arm.when || this.truthy(this.eval(arm.when, aenv), node.line))) return this.eval(arm.value, aenv);
        }
        this.throwEx('InvalidOperationException', 'The switch expression does not handle all possible values of its input type (it is not exhaustive).', node.line);
        break;
      }
      case 'Default': return { t: node.type ? this.rt(node.type) : 'default', v: node.type ? this.defaultOf(this.rt(node.type)) : null };
      case 'ArrayInit': this.err('lista { ... } może wystąpić tylko przy deklaracji tablicy lub po new', node.line); break;
      case 'TypeOf': return { t: 'type', v: { name: csName(this.rt(node.type)) } };
      case 'OutDecl': this.err("deklaracja 'out' może wystąpić tylko jako argument metody", node.line); break;
      default: this.err(`nieobsługiwane wyrażenie (${node.kind})`, node.line);
    }
    return VOID;
  }

  interp(node, env) {
    let s = node.parts[0];
    node.holes.forEach((h, k) => {
      const tv = this.eval(h.expr, env);
      let txt = h.fmt ? this.formatValue(tv, h.fmt, node.line) : this.toStr(tv, node.line);
      if (h.align !== null && !Number.isNaN(h.align)) txt = h.align < 0 ? txt.padEnd(-h.align) : txt.padStart(h.align);
      s += txt + node.parts[k + 1];
    });
    return s;
  }

  evalIdent(node, env) {
    const name = node.name;
    const c = env.lookup(name);
    if (c) {
      if (c.unassigned) this.err(`użycie nieprzypisanej zmiennej lokalnej '${name}' – nadaj jej wartość przed odczytem (CS0165)`, node.line);
      return { t: c.t, v: c.v };
    }
    const m = this.ctxMemberLV(name, node.line);
    if (m) return m.get();
    if (this.types.has(name) || STATIC_TYPE_NAMES.has(name)) return { t: 'type', v: { name } };
    const g = this.tryMethodGroup(node, env);
    if (g) return { t: { fn: null }, v: g };
    const hints = {
      console: " – w C# wielkość liter ma znaczenie: Console", print: ' – w C# wypisujemy przez Console.WriteLine(...)',
      writeln: ' – użyj Console.WriteLine(...)', cout: ' – w C# wypisujemy przez Console.WriteLine(...)', String: '',
    };
    this.err(`nazwa '${name}' nie istnieje w bieżącym kontekście${hints[name] || ' (sprawdź pisownię i czy zmienna została zadeklarowana)'} (CS0103)`, node.line);
    return VOID;
  }

  tryMethodGroup(node, env) {
    const fr = this.frame();
    if (node.kind === 'Ident' && fr && fr.cls) {
      const ms = this.methodCands(fr.cls, node.name);
      if (ms.length) return { kind: 'fn', group: ms, thisCell: fr.thisCell, name: node.name };
    }
    if (node.kind === 'Member' && node.obj.kind === 'Ident' && !env.lookup(node.obj.name)) {
      const tn = node.obj.name;
      const info = this.types.get(tn);
      if (info && info.methods) {
        const ms = this.methodCands(info, node.name).filter((m) => m.isStatic);
        if (ms.length) return { kind: 'fn', group: ms, thisCell: null, name: node.name };
      }
      if (STATIC_TYPE_NAMES.has(tn)) return { kind: 'fn', native: (args, line) => this.callStatic(tn, node.name, args.map((tv) => ({ tv })), env, line, node), name: node.name };
    }
    return null;
  }

  // l-wartość: zmienna, pole, właściwość, element tablicy/listy/słownika
  lv(node, env) {
    switch (node.kind) {
      case 'Ident': {
        const c = env.lookup(node.name);
        if (c) return this.cellLV(c, node.name, node.line);
        const m = this.ctxMemberLV(node.name, node.line);
        if (m) return m;
        this.err(`nazwa '${node.name}' nie istnieje w bieżącym kontekście (CS0103)`, node.line);
        break;
      }
      case 'Member': {
        const target = this.evalTarget(node.obj, env);
        if (target.type) {
          const r = this.staticMemberLV(target.type, node.name, node.line);
          if (r) return r;
          this.err(`nie można przypisać wartości do '${target.type}.${node.name}'`, node.line);
        }
        const o = target.tv;
        if (o.v === null) this.throwEx('NullReferenceException', null, node.line);
        if (o.v && o.v.kind === 'obj') {
          const r = this.memberLV(o, node.name, node.line, target.cell);
          if (r) return r;
          this.err(`typ '${o.v.cls.name}' nie zawiera definicji '${node.name}' (CS1061)`, node.line);
        }
        if (o.v && o.v.kind === 'tuple') {
          const k = this.tupleIndex(o, node.name, node.line);
          return this.cellLV(o.v.cells[k], node.name, node.line);
        }
        if (o.v && o.v.kind === 'sb' && node.name === 'Length') {
          const self = this;
          return { t: 'int', get: () => ({ t: 'int', v: o.v.s.length }), set(tv) { const n = tv.v; o.v.s = n < o.v.s.length ? o.v.s.slice(0, n) : o.v.s + '\0'.repeat(n - o.v.s.length); self.curLine = node.line; } };
        }
        if (o.t === 'string' && node.name === 'Length') this.err('właściwość Length napisu jest tylko do odczytu (CS0200)', node.line);
        if (has(o.t, 'arr') && node.name === 'Length') this.err('właściwość Length tablicy jest tylko do odczytu – rozmiaru tablicy nie można zmienić (użyj List<T>) (CS0200)', node.line);
        if (has(o.t, 'list') && node.name === 'Count') this.err('właściwość Count jest tylko do odczytu – elementy dodawaj metodą Add (CS0200)', node.line);
        this.err(`nie można przypisać wartości do '${node.name}'`, node.line);
        break;
      }
      case 'Index': return this.indexLV(node, env);
      case 'Ternary': this.err('wyrażenie warunkowe nie jest zmienną', node.line); break;
      default: break;
    }
    this.err('lewa strona przypisania musi być zmienną, polem, właściwością lub indeksatorem (CS0131)', node.line);
    return null;
  }

  // obiekt, na którym wołamy składową: typ (składowe statyczne) albo wartość
  evalTarget(objNode, env) {
    if (objNode.kind === 'Ident') {
      const c = env.lookup(objNode.name);
      if (c) {
        if (c.unassigned) this.err(`użycie nieprzypisanej zmiennej lokalnej '${objNode.name}' (CS0165)`, objNode.line);
        return { tv: { t: c.t, v: c.v }, cell: c };
      }
      const m = this.ctxMemberLV(objNode.name, objNode.line);
      if (m) return { tv: m.get(), cell: m.cell || null };
      if (this.types.has(objNode.name) || STATIC_TYPE_NAMES.has(objNode.name)) return { type: objNode.name };
      this.evalIdent(objNode, env);
    }
    if (objNode.kind === 'TypeRef') return { type: objNode.name };
    if (objNode.kind === 'Member' && objNode.obj.kind === 'Ident' && objNode.obj.name === 'Console' && objNode.name === 'Error' && !env.lookup('Console')) return { type: 'Console.Error' };
    if (objNode.kind === 'This') {
      const fr = this.frame();
      if (!fr || !fr.thisCell) this.err("słowa 'this' nie można użyć w metodzie statycznej (CS0026)", objNode.line);
      return { tv: { t: fr.thisCell.t, v: fr.thisCell.v }, cell: fr.thisCell };
    }
    if (objNode.kind === 'Base') {
      const fr = this.frame();
      if (!fr || !fr.thisCell || !fr.cls.base) this.err("'base' wymaga klasy bazowej i metody instancji", objNode.line);
      return { tv: { t: { cls: fr.cls.base.name }, v: fr.thisCell.v }, cell: fr.thisCell, base: fr.cls.base };
    }
    if (objNode.kind === 'Member' || objNode.kind === 'Index') {
      const l = objNode.kind === 'Index' || objNode.obj.kind !== 'Ident' || env.lookup(objNode.obj.name) || !this.types.has(objNode.obj.name) ? this.tryLV(objNode, env) : null;
      if (l) return { tv: l.get(), cell: l.cell || null };
    }
    const tv = this.eval(objNode, env);
    if (tv.t === 'type') return { type: tv.v.name };
    return { tv, cell: null };
  }

  tryLV(node, env) {
    if (node.kind === 'Member') {
      const target = this.evalTarget(node.obj, env);
      if (target.type) return this.staticMemberLV(target.type, node.name, node.line);
      const o = target.tv;
      if (o.v && o.v.kind === 'obj') return this.memberLV(o, node.name, node.line, target.cell) || { get: () => this.memberValue(o, node.name, node.line, target), cell: null };
      return { get: () => this.memberValue(o, node.name, node.line, target), cell: null };
    }
    return this.indexLV(node, env);
  }

  staticMemberLV(typeName, name, line) {
    const info = this.types.get(typeName);
    if (info && info.kind === 'enum') return null;
    if (info) {
      const p = this.findProp(info, name);
      if (p && p.isStatic) {
        if (!this.canAccess(p.owner, p.access)) this.accessError('prop', p.owner, name, p.access, line);
        return this.propLV(p, p.owner, null, line);
      }
      const sc = this.findStaticCell(info, name);
      if (sc) {
        if (sc.decl && !this.canAccess(sc.owner, sc.decl.access)) this.accessError('field', sc.owner, name, sc.decl.access, line);
        return this.cellLV(sc, name, line);
      }
      if (this.findField(info, name) || p) this.err(`'${typeName}.${name}' jest składową instancji – potrzebny jest obiekt (np. obiekt.${name}) (CS0120)`, line);
    }
    return null;
  }

  evalMember(node, env) {
    const target = this.evalTarget(node.obj, env);
    if (target.type) {
      const info = this.types.get(target.type);
      if (info && info.kind === 'enum') {
        if (!info.items.has(node.name)) this.err(`wyliczenie '${info.name}' nie zawiera wartości '${node.name}' (CS0117)`, node.line);
        return { t: { enum: info.name }, v: info.items.get(node.name) };
      }
      const r = this.staticMemberLV(target.type, node.name, node.line);
      if (r) return r.get();
      const b = this.staticMember(target.type, node.name, node.line);
      if (b !== undefined) return b;
      if (info && this.methodCands(info, node.name).length) this.err(`'${node.name}' to metoda – wywołaj ją z nawiasami: ${target.type}.${node.name}()`, node.line);
      this.err(`typ '${target.type}' nie zawiera definicji '${node.name}' (CS0117)`, node.line);
    }
    const o = target.tv;
    if (o.v === null && !has(o.t, 'nullable')) {
      if (node.nullCond) return { t: 'null', v: null };
      this.throwEx('NullReferenceException', null, node.line);
    }
    return this.memberValue(o, node.name, node.line, target);
  }

  memberValue(o, name, line, target = {}) {
    if (o.v && o.v.kind === 'obj' && !o.v.cls.prelude || (o.v && o.v.kind === 'obj' && name === 'Message')) {
      const tv = target.base ? { t: { cls: target.base.name }, v: o.v } : o;
      const r = this.memberLV(tv, name, line, target.cell);
      if (r) {
        if (target.base) {
          const p = this.findProp(target.base, name);
          if (p && !p.auto && p.getter) return this.runAccessor(p, p.getter.body, target.cell, null, line);
        }
        return r.get();
      }
      if (this.methodCands(o.v.cls, name).length) this.err(`'${name}' to metoda – wywołaj ją z nawiasami: ${name}()`, line);
      if (o.v.cls.kind !== 'struct' && this.infoOf(o.t) && this.infoOf(o.t) !== o.v.cls && this.findProp(o.v.cls, name)) {
        this.err(`typ '${csName(o.t)}' nie zawiera definicji '${name}' – obiekt jest widziany jako '${csName(o.t)}' (rzutuj na właściwy typ) (CS1061)`, line);
      }
      this.err(`typ '${o.v.cls.name}' nie zawiera definicji '${name}' (CS1061)`, line);
    }
    const r = this.builtinMember(o, name, line);
    if (r !== undefined) return r;
    this.err(`typ '${csName(o.t)}' nie zawiera definicji '${name}' (CS1061)`, line);
    return VOID;
  }

  tupleIndex(o, name, line) {
    const m = name.match(/^Item(\d+)$/);
    let k = m ? parseInt(m[1], 10) - 1 : -1;
    if (k < 0) k = (o.t.tuple || []).findIndex((x) => x.name === name);
    if (k < 0) k = (o.v.names || []).indexOf(name);
    if (k < 0 || k >= o.v.cells.length) this.err(`krotka nie zawiera elementu '${name}' (CS1061)`, line);
    return k;
  }

  indexLV(node, env) {
    const target = this.evalTarget(node.obj, env);
    if (target.type) this.err(`nie można indeksować typu '${target.type}'`, node.line);
    const o = target.tv;
    const idx = node.idx.map((e) => this.eval(e, env));
    const line = node.line;
    if (o.v === null) this.throwEx('NullReferenceException', null, line);
    const v = o.v;
    const intIdx = (tv) => {
      if (!isIntT(tv.t) || tv.t === 'long') {
        if (isFloatT(tv.t)) this.err(`indeks musi być liczbą całkowitą (int), a jest typu ${tv.t} – rzutuj: (int)x (CS0266)`, line);
        if (tv.t !== 'long') this.err(`indeks musi być typu int, a jest typu '${csName(tv.t)}' (CS0029)`, line);
      }
      return tv.v;
    };
    if (o.t === 'string') {
      const i = intIdx(idx[0]);
      if (i < 0 || i >= v.length) this.throwEx('IndexOutOfRangeException', 'Index was outside the bounds of the array.', line);
      const self = this;
      return { t: 'char', get: () => ({ t: 'char', v: v.charCodeAt(i) }), set() { self.err('napis (string) jest niezmienny – nie można zmienić pojedynczego znaku s[i]; użyj StringBuilder lub tablicy char[] (CS0200)', line); } };
    }
    if (v.kind === 'arr') {
      if (idx.length !== v.dims.length) this.err(`tablica ma ${v.dims.length} wymiar(y), a podano ${idx.length} indeks(y) (CS0022)`, line);
      let flat = 0;
      idx.forEach((tv, k) => {
        const i = intIdx(tv);
        if (i < 0 || i >= v.dims[k]) {
          this.throwEx('IndexOutOfRangeException', 'Index was outside the bounds of the array.', line);
        }
        flat = flat * v.dims[k] + i;
      });
      return this.cellLV(v.cells[flat], `[${idx.map((x) => x.v).join(',')}]`, line);
    }
    if (v.kind === 'list') {
      const i = intIdx(idx[0]);
      const self = this;
      const check = () => {
        if (i < 0 || i >= v.cells.length) self.throwEx('ArgumentOutOfRangeException', `Index was out of range. Must be non-negative and less than the size of the collection. (Parameter 'index')`, line);
      };
      return {
        t: v.et,
        get() { check(); const c = v.cells[i]; return { t: c.t, v: c.v }; },
        set(tv) { check(); v.cells[i].v = self.storeValue(tv, v.et, line); },
      };
    }
    if (v.kind === 'dict') {
      const key = this.dictKey(idx[0], v, line);
      const self = this;
      return {
        t: v.vt,
        get() {
          const e = v.map.get(key);
          if (!e) self.throwEx('KeyNotFoundException', `The given key '${self.toStr(idx[0], line)}' was not present in the dictionary.`, line);
          return { t: v.vt, v: e.cell.v };
        },
        set(tv) {
          const e = v.map.get(key);
          if (e) e.cell.v = self.storeValue(tv, v.vt, line);
          else { v.map.set(key, { key: { t: v.kt, v: self.storeValue(idx[0], v.kt, line) }, cell: new Cell(v.vt, self.storeValue(tv, v.vt, line)) }); v.version = (v.version || 0) + 1; }
        },
      };
    }
    if (v.kind === 'sb') {
      const i = intIdx(idx[0]);
      if (i < 0 || i >= v.s.length) this.throwEx('IndexOutOfRangeException', 'Index was outside the bounds of the array.', line);
      return { t: 'char', get: () => ({ t: 'char', v: v.s.charCodeAt(i) }), set(tv) { v.s = v.s.slice(0, i) + String.fromCharCode(tv.v) + v.s.slice(i + 1); } };
    }
    if (v.kind === 'obj') {
      let ix = null;
      for (let c = v.cls; c && !ix; c = c.base) ix = c.indexer;
      if (!ix) this.err(`nie można indeksować obiektu typu '${v.cls.name}' – klasa nie definiuje indeksatora this[...] (CS0021)`, line);
      const objCell = target.cell || new Cell(o.t, v);
      const self = this;
      const bind = (envX) => ix.params.forEach((p, k) => envX.vars.set(p.name, new Cell(self.rt(p.type), self.storeValue(idx[k], self.rt(p.type), line))));
      return {
        t: this.rt(ix.type),
        get() {
          const e = new Env(self.globalEnv); bind(e);
          self.pushFrame({ m: { name: 'this[]', ret: ix.type }, cls: ix.owner, thisCell: objCell }, line);
          let r; try { r = self.execBlock(ix.getter.body.stmts, e); } finally { self.frames.pop(); }
          return { t: self.rt(ix.type), v: self.storeValue(r.ret, self.rt(ix.type), line) };
        },
        set(tv) {
          const e = new Env(self.globalEnv); bind(e);
          e.vars.set('value', new Cell(self.rt(ix.type), self.storeValue(tv, self.rt(ix.type), line)));
          self.pushFrame({ m: { name: 'this[]', ret: 'void' }, cls: ix.owner, thisCell: objCell }, line);
          try { self.execBlock(ix.setter.body.stmts, e); } finally { self.frames.pop(); }
        },
      };
    }
    this.err(`nie można zastosować indeksowania [] do wartości typu '${csName(o.t)}' (CS0021)`, line);
    return null;
  }

  dictKey(tv, d, line) {
    const k = this.storeValue(tv, d.kt, line);
    if (k === null) this.throwEx('ArgumentNullException', "Value cannot be null. (Parameter 'key')", line);
    return k;
  }

  evalAssign(node, env) {
    const line = node.line;
    if (node.l.kind === 'TupleLit') {
      if (node.op !== '=') this.err('krotkę można tylko przypisać operatorem =', line);
      const r = this.eval(node.r, env);
      if (!has(r.t, 'tuple') || r.v.cells.length !== node.l.items.length) this.err('liczba elementów po obu stronach dekonstrukcji musi być taka sama', line);
      const vals = r.v.cells.map((c) => ({ t: c.t, v: this.copyVal(c.v) }));
      node.l.items.forEach((it, k) => this.lv(it.expr, env).set(vals[k]));
      return r;
    }
    const target = this.lv(node.l, env);
    if (node.op === '=') {
      const tv = node.r.kind === 'ArrayInit' ? this.arrayFromInit(node.r, target.t, env) : this.evalWithTarget(node.r, env, target.t);
      if (tv.t === 'void') this.err('nie można przypisać wyniku metody typu void (CS0029)', line);
      target.set(tv);
      return target.get();
    }
    if (node.op === '??=') {
      const cur = target.get();
      if (cur.v === null) target.set(this.evalWithTarget(node.r, env, target.t));
      return target.get();
    }
    const cur = target.get();
    const R = this.eval(node.r, env);
    const op = node.op.slice(0, -1);
    const res = this.binop(op, cur, R, line);
    const t = target.t;
    let out = res;
    try { this.implicitConv(res, t, line); } catch (e) {
      if (!(e instanceof LangError)) throw e;
      if (isNum(t) && isNum(res.t) && (numWidens(R.t, t) || (R.lit && isIntT(R.t)))) out = this.cast(res, t, line);
      else throw e;
    }
    target.set(out);
    return target.get();
  }

  // ---------- operatory ----------
  userOperator(op, args, line) {
    const infos = [];
    for (const a of args) if (has(a.t, 'cls')) for (let c = this.types.get(a.t.cls); c; c = c.base) if (!infos.includes(c)) infos.push(c);
    const cands = [];
    for (const i of infos) for (const m of i.operators.get(op) || []) if (m.params.length === args.length) cands.push(m);
    if (!cands.length) return null;
    const argInfos = args.map((tv) => ({ tv }));
    const m = this.chooseOverload(cands, argInfos, line, `operator ${op}`);
    return this.callUser(m, null, argInfos, line);
  }

  evalBinary(node, env) {
    const op = node.op;
    const line = node.line;
    if (op === '&&' || op === '||') {
      const L = this.eval(node.l, env);
      if (L.t !== 'bool') this.err(`operator '${op}' działa tylko na wartościach typu bool, a lewa strona jest typu '${csName(L.t)}' (CS0019)`, line);
      if (op === '&&' && !L.v) return { t: 'bool', v: false };
      if (op === '||' && L.v) return { t: 'bool', v: true };
      const R = this.eval(node.r, env);
      if (R.t !== 'bool') this.err(`operator '${op}' działa tylko na wartościach typu bool, a prawa strona jest typu '${csName(R.t)}' (CS0019)`, line);
      return { t: 'bool', v: R.v };
    }
    if (op === '??') {
      const L = this.eval(node.l, env);
      if (L.v !== null) return has(L.t, 'nullable') ? { t: L.t.nullable, v: L.v } : L;
      return this.eval(node.r, env);
    }
    const L = this.eval(node.l, env);
    const R = this.eval(node.r, env);
    return this.binop(op, L, R, line);
  }

  binop(op, L0, R0, line) {
    let L = L0, R = R0;
    if (L.t === 'void' || R.t === 'void') this.err('nie można użyć wyniku metody typu void w wyrażeniu', line);
    if (has(L.t, 'cls') || has(R.t, 'cls')) {
      const r = this.userOperator(op, [L, R], line);
      if (r) return r;
      if (op === '==' || op === '!=') {
        const sinfo = this.infoOf(has(L.t, 'cls') ? L.t : R.t);
        if (sinfo && sinfo.kind === 'struct' && L.v !== null && R.v !== null) this.err(`operator '${op}' nie jest zdefiniowany dla struktury '${sinfo.name}' – zdefiniuj operator ${op} lub użyj Equals (CS0019)`, line);
        const eq = L.v === R.v;
        return { t: 'bool', v: op === '==' ? eq : !eq };
      }
      if (op === '+' && (L.t === 'string' || R.t === 'string')) return { t: 'string', v: this.toStr(L, line) + this.toStr(R, line) };
      this.err(`operator '${op}' nie jest zdefiniowany dla typów '${csName(L.t)}' i '${csName(R.t)}' – zdefiniuj 'public static ... operator ${op}(...)' (CS0019)`, line);
    }
    if (op === '+' && (L.t === 'string' || R.t === 'string')) {
      return { t: 'string', v: this.toStr(L, line) + this.toStr(R, line) };
    }
    if (op === '==' || op === '!=') {
      if (L.v === null || R.v === null || L.t === 'null' || R.t === 'null') {
        if ((L.t !== 'null' && this.isValueType(L.t) && !has(L.t, 'nullable')) || (R.t !== 'null' && this.isValueType(R.t) && !has(R.t, 'nullable'))) {
          return { t: 'bool', v: op === '!=' };
        }
        const eq = L.v === R.v;
        return { t: 'bool', v: op === '==' ? eq : !eq };
      }
      if (L.t === 'string' && R.t === 'string') return { t: 'bool', v: op === '==' ? L.v === R.v : L.v !== R.v };
      if (L.t === 'string' || R.t === 'string') {
        if (L.t === 'char' || R.t === 'char') this.err("nie można porównać string z char – użyj \"a\" zamiast 'a' (albo porównaj s[i] == 'a') (CS0019)", line);
        this.err(`nie można porównać typów '${csName(L.t)}' i '${csName(R.t)}' operatorem ${op} (CS0019)`, line);
      }
      if (L.t === 'bool' && R.t === 'bool') return { t: 'bool', v: op === '==' ? L.v === R.v : L.v !== R.v };
      if (has(L.t, 'tuple') && has(R.t, 'tuple')) { const eq = this.valuesEqual(L, R); return { t: 'bool', v: op === '==' ? eq : !eq }; }
    }
    if (has(L.t, 'nullable')) L = L.v === null ? L : { t: L.t.nullable, v: L.v };
    if (has(R.t, 'nullable')) R = R.v === null ? R : { t: R.t.nullable, v: R.v };
    if (L.v === null || R.v === null) {
      if (['<', '>', '<=', '>='].includes(op)) return { t: 'bool', v: false };
      return { t: 'null', v: null };
    }
    const lt = L.t, rt = R.t;
    // wyliczenia
    if (has(lt, 'enum') || has(rt, 'enum')) {
      if (['==', '!=', '<', '>', '<=', '>='].includes(op)) {
        if (has(lt, 'enum') && has(rt, 'enum') && lt.enum !== rt.enum) this.err(`nie można porównać wartości różnych wyliczeń '${lt.enum}' i '${rt.enum}' (CS0019)`, line);
        return { t: 'bool', v: { '==': L.v === R.v, '!=': L.v !== R.v, '<': L.v < R.v, '>': L.v > R.v, '<=': L.v <= R.v, '>=': L.v >= R.v }[op] };
      }
      if ((op === '+' || op === '-') && has(lt, 'enum') && isIntT(rt)) return { t: lt, v: L.v + (op === '+' ? R.v : -R.v) };
      if (op === '-' && has(lt, 'enum') && has(rt, 'enum')) return { t: 'int', v: L.v - R.v };
      if (['|', '&', '^'].includes(op) && has(lt, 'enum') && has(rt, 'enum')) return { t: lt, v: op === '|' ? L.v | R.v : op === '&' ? L.v & R.v : L.v ^ R.v };
      this.err(`operator '${op}' nie działa dla typów '${csName(lt)}' i '${csName(rt)}' – rzutuj wyliczenie na int (CS0019)`, line);
    }
    if (lt === 'bool' && rt === 'bool') {
      if (op === '&') return { t: 'bool', v: L.v && R.v };
      if (op === '|') return { t: 'bool', v: L.v || R.v };
      if (op === '^') return { t: 'bool', v: L.v !== R.v };
    }
    if (!isNum(lt) || !isNum(rt)) {
      if (lt === 'string' && rt === 'string' && ['<', '>', '<=', '>='].includes(op)) this.err("napisów nie porównuje się operatorem '<'/'>' – użyj string.Compare(a, b) albo a.CompareTo(b) (CS0019)", line);
      this.err(`operator '${op}' nie działa dla typów '${csName(lt)}' i '${csName(rt)}' (CS0019)`, line);
    }
    if ((lt === 'decimal' && (rt === 'double' || rt === 'float')) || (rt === 'decimal' && (lt === 'double' || lt === 'float'))) {
      this.err(`operator '${op}' nie działa dla typów '${lt}' i '${rt}' – decimal nie łączy się z double bez rzutowania (CS0019)`, line);
    }
    let t;
    if (lt === 'decimal' || rt === 'decimal') t = 'decimal';
    else if (lt === 'double' || rt === 'double') t = 'double';
    else if (lt === 'float' || rt === 'float') t = 'float';
    else if (lt === 'long' || rt === 'long') t = 'long';
    else t = 'int';
    const a = L.v, b = R.v;
    const isI = t === 'int' || t === 'long';
    switch (op) {
      case '+': return { t, v: this.fit(a + b, t) };
      case '-': return { t, v: this.fit(a - b, t) };
      case '*': return { t, v: t === 'int' ? Math.imul(a, b) : this.fit(a * b, t) };
      case '/':
        if (isI) {
          if (b === 0) this.throwEx('DivideByZeroException', 'Attempted to divide by zero.', line);
          return { t, v: this.fit(Math.trunc(a / b), t) };
        }
        if (t === 'decimal' && b === 0) this.throwEx('DivideByZeroException', 'Attempted to divide by zero.', line);
        return { t, v: this.fit(a / b, t) };
      case '%':
        if (isI && b === 0) this.throwEx('DivideByZeroException', 'Attempted to divide by zero.', line);
        return { t, v: this.fit(a % b, t) };
      case '<': return { t: 'bool', v: a < b };
      case '>': return { t: 'bool', v: a > b };
      case '<=': return { t: 'bool', v: a <= b };
      case '>=': return { t: 'bool', v: a >= b };
      case '==': return { t: 'bool', v: a === b };
      case '!=': return { t: 'bool', v: a !== b };
      case '&': case '|': case '^': case '<<': case '>>': {
        if (!isI) this.err(`operator '${op}' działa tylko na liczbach całkowitych (CS0019)`, line);
        const v = op === '&' ? a & b : op === '|' ? a | b : op === '^' ? a ^ b : op === '<<' ? a << b : a >> b;
        return { t, v: this.fit(v, t) };
      }
      default: this.err(`nieznany operator '${op}'`, line);
    }
    return VOID;
  }

  evalUnary(node, env) {
    const v = this.eval(node.e, env);
    const op = node.op;
    if (has(v.t, 'cls')) {
      const r = this.userOperator(op, [v], node.line);
      if (r) return r;
      this.err(`typ '${v.t.cls}' nie definiuje operatora jednoargumentowego '${op}' (CS0023)`, node.line);
    }
    if (op === '!') {
      if (v.t !== 'bool') this.err(`operator '!' działa tylko na wartościach bool, a wartość jest typu '${csName(v.t)}' (CS0023)`, node.line);
      return { t: 'bool', v: !v.v };
    }
    if (!isNum(v.t)) this.err(`operator '${op}' nie działa dla typu '${csName(v.t)}' (CS0023)`, node.line);
    const t = v.t === 'char' ? 'int' : v.t;
    if (op === '-') return { t, v: this.fit(-v.v, t) };
    if (op === '+') return { t, v: v.v };
    if (op === '~') { if (isFloatT(t)) this.err("operator '~' działa tylko na liczbach całkowitych", node.line); return { t, v: this.fit(~v.v, t) }; }
    return VOID;
  }

  // ---------- tablice i new ----------
  makeArray(et, tvs, dims = null) {
    const arr = { kind: 'arr', et, cells: tvs.map((tv) => new Cell(et, this.storeValue(tv, et))), dims: dims || [tvs.length] };
    return arr;
  }

  arrayFromInit(init, t, env) {
    if (!has(t, 'arr')) this.err(`lista { ... } pasuje tylko do tablicy, a zmienna jest typu '${csName(t)}' – użyj new ${csName(t)} { ... }`, init.line);
    if (t.rank === 1) {
      const vals = init.items.map((it) => (it.kind === 'ArrayInit' ? this.arrayFromInit(it, t.arr, env) : this.evalWithTarget(it, env, t.arr)));
      return { t, v: this.makeArray(t.arr, vals.map((x) => ({ t: x.t, v: x.v, lit: x.lit })).map((x) => x)) };
    }
    const rows = init.items;
    const r = rows.length;
    const c = r ? rows[0].items.length : 0;
    const cells = [];
    rows.forEach((row) => {
      if (row.kind !== 'ArrayInit' || row.items.length !== c) this.err('wszystkie wiersze tablicy dwuwymiarowej muszą mieć tyle samo elementów (CS0847)', init.line);
      row.items.forEach((it) => cells.push(new Cell(t.arr, this.storeValue(this.evalWithTarget(it, env, t.arr), t.arr, init.line))));
    });
    return { t, v: { kind: 'arr', et: t.arr, cells, dims: [r, c] } };
  }

  evalNewArray(node, env, targetT) {
    if (!node.type) {
      if (targetT && has(targetT, 'arr')) return this.arrayFromInit(node.init, targetT, env);
      const vals = node.init.items.map((it) => this.eval(it, env));
      let et = vals.length ? vals[0].t : 'object';
      for (const v of vals) if (isNum(v.t) && isNum(et) && numWidens(et, v.t)) et = v.t;
      const t = { arr: et, rank: 1 };
      return { t, v: this.makeArray(et, vals) };
    }
    const et = this.rt(node.type, node.line);
    const rank = node.sizes.length;
    const t = { arr: et, rank };
    if (node.sizes.every((s) => s === null)) return this.arrayFromInit(node.init, t, env);
    const dims = node.sizes.map((s) => {
      const tv = this.eval(s, env);
      if (!isIntT(tv.t)) this.err(`rozmiar tablicy musi być liczbą całkowitą, a jest typu '${csName(tv.t)}' (CS0029)`, node.line);
      if (tv.v < 0) this.throwEx('OverflowException', 'Arithmetic operation resulted in an overflow.', node.line);
      return tv.v;
    });
    const total = dims.reduce((a, b) => a * b, 1);
    if (total > 5_000_000) this.err('tablica jest zbyt duża', node.line, 'runtime');
    const cells = [];
    for (let k = 0; k < total; k++) cells.push(new Cell(et, this.defaultOf(et)));
    const arr = { kind: 'arr', et, cells, dims };
    if (node.init) {
      const filled = this.arrayFromInit(node.init, t, env).v;
      if (filled.cells.length !== total) this.err(`podano ${filled.cells.length} elementów, a rozmiar tablicy to ${total} (CS0847)`, node.line);
      return { t, v: filled };
    }
    return { t, v: arr };
  }

  evalNew(node, env, targetT) {
    const line = node.line;
    let t = node.type ? this.rt(node.type, line) : targetT;
    if (!t) this.err("'new()' bez nazwy typu wymaga znanego typu docelowego (CS8754)", line);
    if (has(t, 'nullable')) t = t.nullable;
    const args = this.evalArgs(node.args, env);
    let v;
    if (has(t, 'cls')) {
      const info = this.types.get(t.cls);
      v = this.instantiate(info, args, line, env);
      if (node.init) {
        const cell = new Cell(t, v);
        for (const m of node.init.members) {
          const lvx = this.memberLV({ t, v }, m.name, line, cell);
          if (!lvx) this.err(`typ '${t.cls}' nie zawiera pola ani właściwości '${m.name}' (CS0117)`, line);
          lvx.set(m.value.kind === 'ArrayInit' ? this.arrayFromInit(m.value, lvx.t, env) : this.evalWithTarget(m.value, env, lvx.t));
        }
        if (node.init.items.length) this.err('inicjalizator kolekcji { ... } wymaga typu kolekcji (np. List<T>)', line);
      }
      return { t, v };
    }
    if (isPrim(t) && isNum(t)) return { t, v: 0 };
    if (t === 'bool') return { t, v: false };
    const r = this.newBuiltin(t, args, line, env);
    if (node.init) this.applyCollectionInit(r, node.init, env, line);
    return r;
  }

  evalArgs(argNodes, env) {
    return argNodes.map((a) => {
      if (a.expr.kind === 'OutDecl') return { mode: 'out', name: a.name, outDecl: a.expr, node: a.expr };
      if (a.mode === 'ref' || a.mode === 'out') {
        const l = this.lv(a.expr, env);
        if (!l.cell) this.err(`właściwości ani indeksatora nie można przekazać jako ${a.mode} – użyj zmiennej (CS0206)`, a.expr.line);
        return { mode: a.mode, name: a.name, lv: l, node: a.expr };
      }
      if (a.expr.kind === 'Lambda') return { mode: null, name: a.name, lambda: a.expr, env, tv: { t: { fn: null }, v: null }, node: a.expr };
      return { mode: null, name: a.name, tv: this.eval(a.expr, env), node: a.expr };
    });
  }

  // ---------- wywołania ----------
  argScore(p, a) {
    const pt = this.rt(p.type);
    if ((p.mode === 'ref' || p.mode === 'out') !== (a.mode === 'ref' || a.mode === 'out')) return -1000;
    if (a.outDecl) return 2;
    if (a.lambda) return has(pt, 'fn') ? 3 : -1000;
    const at = a.lv ? a.lv.t : a.tv.t;
    if (sameType(pt, at)) return 4;
    if (at === 'null') return this.isValueType(pt) && !has(pt, 'nullable') ? -1000 : 2;
    if (isNum(pt) && isNum(at)) return numWidens(at, pt) ? 2 : (a.tv && a.tv.lit && isIntT(at) && isIntT(pt) && pt !== 'char' ? 1 : -1000);
    if (has(pt, 'cls') && has(at, 'cls')) return this.isAssignable(at.cls, pt.cls) ? 3 : -1000;
    if (pt === 'object') return 1;
    if (has(pt, 'nullable')) return sameType(pt.nullable, at) || (isNum(at) && isNum(pt.nullable) && numWidens(at, pt.nullable)) ? 3 : -1000;
    if (has(pt, 'fn') && has(at, 'fn')) return 3;
    if (has(pt, 'tuple') && has(at, 'tuple')) return pt.tuple.length === at.tuple.length ? 2 : -1000;
    return -1000;
  }

  chooseOverload(cands, args, line, name, isCtor = false) {
    let best = null, bestScore = -Infinity, bestPos = null;
    for (const m of cands) {
      const ps = m.params;
      const hasParams = ps.length && ps[ps.length - 1].mode === 'params';
      const fixed = hasParams ? ps.length - 1 : ps.length;
      const required = ps.filter((p) => !p.def && p.mode !== 'params').length;
      // argumenty nazwane
      const order = [];
      let ok = true;
      args.forEach((a, k) => {
        if (a.name) { const idx = ps.findIndex((p) => p.name === a.name); if (idx < 0) ok = false; order.push(idx); }
        else order.push(k);
      });
      if (!ok) continue;
      const positional = args.filter((a) => !a.name).length;
      if (args.length < required && !args.some((a) => a.name)) continue;
      if (!hasParams && positional > ps.length) continue;
      let score = 0;
      for (let k = 0; k < args.length; k++) {
        const pi = order[k];
        if (pi >= fixed && hasParams) {
          const ept = this.rt(ps[ps.length - 1].type).arr;
          const a = args[k];
          if (k === fixed && args.length === fixed + 1 && a.tv && has(a.tv.t, 'arr')) { score += 3; continue; }
          score += a.tv && (sameType(ept, a.tv.t) || (isNum(ept) && isNum(a.tv.t) && numWidens(a.tv.t, ept)) || ept === 'object') ? 1 : -1000;
          continue;
        }
        if (pi >= ps.length) { score = -Infinity; break; }
        score += this.argScore(ps[pi], args[k]);
      }
      const covered = new Set(order);
      for (let k = 0; k < fixed; k++) if (!covered.has(k) && !ps[k].def) score = -Infinity;
      if (hasParams) score -= 1;
      if (score > bestScore) { bestScore = score; best = m; bestPos = order; }
    }
    if (!best || bestScore < -500) {
      const what = isCtor ? `konstruktora '${name}'` : `metody '${name}'`;
      if (cands.length === 1) {
        const m = cands[0];
        const req = m.params.filter((p) => !p.def && p.mode !== 'params').length;
        if (args.length < req || (args.length > m.params.length && !(m.params.length && m.params[m.params.length - 1].mode === 'params'))) {
          this.err(`${isCtor ? `konstruktor '${name}'` : `metoda '${name}'`} oczekuje ${req === m.params.length ? req : `${req}–${m.params.length}`} argumentów, a podano ${args.length} (CS1501/CS7036)`, line);
        }
        const k = args.findIndex((a, i) => i < m.params.length && this.argScore(m.params[i], a) < -500);
        if (k >= 0) {
          const p = m.params[k];
          const a = args[k];
          if ((p.mode === 'ref' || p.mode === 'out') && a.mode !== p.mode) this.err(`argument ${k + 1} musi być przekazany ze słowem kluczowym '${p.mode}' (CS1620)`, line);
          if (a.mode && p.mode !== a.mode) this.err(`argument ${k + 1} nie może być przekazany ze słowem '${a.mode}' (CS1615)`, line);
          const at = a.lv ? a.lv.t : a.tv.t;
          this.err(`argument ${k + 1}: nie można przekonwertować z '${csName(at)}' na '${csName(this.rt(p.type))}' (CS1503)`, line);
        }
      }
      this.err(`brak przeciążenia ${what} pasującego do ${args.length} argument(ów) podanych typów (CS1501)`, line);
    }
    best._order = bestPos;
    return best;
  }

  bindArgs(m, args, menv, line, callerEnv = null) {
    const ps = m.params;
    const order = m._order || args.map((a, k) => k);
    const hasParams = ps.length && ps[ps.length - 1].mode === 'params';
    const fixed = hasParams ? ps.length - 1 : ps.length;
    const byParam = new Array(ps.length).fill(undefined);
    const extra = [];
    args.forEach((a, k) => {
      const pi = order[k];
      if (hasParams && pi >= fixed) extra.push(a);
      else byParam[pi] = a;
    });
    ps.forEach((p, k) => {
      const pt = this.rt(p.type, line);
      if (hasParams && k === fixed) {
        if (extra.length === 1 && extra[0].tv && has(extra[0].tv.t, 'arr')) { menv.vars.set(p.name, new Cell(pt, extra[0].tv.v)); return; }
        menv.vars.set(p.name, new Cell(pt, this.makeArray(pt.arr, extra.map((a) => a.tv))));
        return;
      }
      const a = byParam[k];
      if (a === undefined) {
        menv.vars.set(p.name, new Cell(pt, this.storeValue(this.evalWithTarget(p.def, this.globalEnv, pt), pt, line)));
        return;
      }
      if (p.mode === 'ref') { menv.vars.set(p.name, a.lv.cell); return; }
      if (p.mode === 'out') {
        let cell;
        if (a.outDecl) {
          const dt = a.outDecl.type === 'var' ? pt : this.rt(a.outDecl.type, line);
          cell = new Cell(dt, this.defaultOf(dt));
          (a.env || callerEnv || this.globalEnv).vars.set(a.outDecl.name, cell);
          a.declaredCell = cell;
        } else cell = a.lv.cell;
        menv.vars.set(p.name, cell);
        return;
      }
      if (a.lambda) { menv.vars.set(p.name, new Cell(pt, this.makeLambda(a.lambda, a.env, has(pt, 'fn') ? pt.fn : null))); return; }
      menv.vars.set(p.name, new Cell(pt, this.storeValue(a.tv, pt, line)));
    });
  }

  // wywołanie metody użytkownika; thisCell === null dla statycznych
  callUser(m, thisCell, args, line, callerEnv = null) {
    if (!m.body) this.err(`metoda '${m.name}' nie ma ciała – jest abstrakcyjna`, line);
    const menv = new Env(m.closureEnv || this.globalEnv);
    if (!m._order || m._order.length !== args.length) m._order = args.map((a, k) => k);
    this.bindArgs(m, args, menv, line, callerEnv);
    m._order = null;
    const retT = m.ret === 'void' ? null : this.rt(m.ret, line);
    this.pushFrame({ m, cls: m.owner || (this.frame() && this.frame().cls), thisCell, retT }, line);
    let r;
    const saved = this.curLine;
    try { r = this.execBlock(m.body.stmts, menv); } finally { this.frames.pop(); }
    this.curLine = saved;
    if (m.ret === 'void') return VOID;
    if (r && r.ret) return { t: retT, v: this.storeValue(r.ret, retT, r.line || line) };
    this.err(`metoda '${m.name}': nie wszystkie ścieżki kodu zwracają wartość – brakuje instrukcji return (CS0161)`, m.line);
    return VOID;
  }

  invokeFn(fv, argTVs, line) {
    if (!fv) this.throwEx('NullReferenceException', null, line);
    if (fv.native) return fv.native(argTVs, line);
    const argInfos = argTVs.map((tv) => ({ tv }));
    if (fv.group) {
      const m = this.chooseOverload(fv.group, argInfos, line, fv.name);
      const disp = fv.thisCell && !m.isStatic ? this.dispatch(m, fv.thisCell.v.cls) : m;
      return this.callUser(disp, m.isStatic ? null : fv.thisCell, argInfos, line);
    }
    if (fv.local) {
      const m = { ...fv.local, closureEnv: fv.env, owner: fv.frame && fv.frame.cls };
      if (argInfos.length !== m.params.length) this.err(`funkcja '${m.name}' oczekuje ${m.params.length} argumentów, a podano ${argInfos.length}`, line);
      const fr = fv.frame;
      const menv = new Env(fv.env);
      m._order = null;
      this.bindArgs(m, argInfos, menv, line);
      const retT = m.ret === 'void' ? null : this.rt(m.ret, line);
      this.pushFrame({ m, cls: fr && fr.cls, thisCell: fr && fr.thisCell, retT }, line);
      let r;
      try { r = this.execBlock(m.body.stmts, menv); } finally { this.frames.pop(); }
      if (m.ret === 'void') return VOID;
      if (r && r.ret) return { t: retT, v: this.storeValue(r.ret, retT, line) };
      this.err(`funkcja '${m.name}': brakuje instrukcji return (CS0161)`, m.line);
    }
    // lambda
    const env = new Env(fv.env);
    fv.params.forEach((p, k) => {
      const tv = argTVs[k] || { t: 'object', v: null };
      const t = p.type ? this.rt(p.type, line) : (fv.sig && fv.sig.params[k]) || tv.t;
      env.vars.set(p.name, new Cell(t, this.storeValue(tv, t, line)));
    });
    const fr = fv.frame;
    const retT = fv.sig && fv.sig.ret !== 'void' ? fv.sig.ret : null;
    this.pushFrame({ m: { name: 'lambda', ret: fv.sig ? fv.sig.ret : null }, cls: fr && fr.cls, thisCell: fr && fr.thisCell, lambda: true, retT }, line);
    try {
      if (fv.expr) {
        const v = retT ? this.evalWithTarget(fv.expr, env, retT) : this.eval(fv.expr, env);
        return retT ? { t: retT, v: this.storeValue(v, retT, line) } : v;
      }
      const r = this.execBlock(fv.body.stmts, env);
      if (r && r.ret) return retT ? { t: retT, v: this.storeValue(r.ret, retT, line) } : r.ret;
      return VOID;
    } finally { this.frames.pop(); }
  }

  makeLambda(node, env, sig) {
    if (sig && sig.params.length !== node.params.length) this.err(`delegat oczekuje ${sig.params.length} parametrów, a lambda ma ${node.params.length} (CS1593)`, node.line);
    return { kind: 'fn', params: node.params, expr: node.expr || null, body: node.body || null, env, frame: this.frame(), sig };
  }

  evalCall(node, env) {
    const c = node.callee;
    const line = node.line;
    if (c.kind === 'Ident') {
      const local = env.lookup(c.name);
      if (local) {
        if (!(local.v && local.v.kind === 'fn') && !has(local.t, 'fn')) this.err(`'${c.name}' jest zmienną typu '${csName(local.t)}', a nie metodą (CS0149)`, line);
        const args = this.evalArgs(node.args, env);
        return this.invokeFn(local.v, args.map((a) => (a.lambda ? { t: { fn: null }, v: this.makeLambda(a.lambda, env, null) } : a.tv)), line);
      }
      const fr = this.frame();
      if (fr && fr.cls) {
        const ms = this.methodCands(fr.cls, c.name);
        if (ms.length) {
          const args = this.evalArgs(node.args, env);
          const m = this.chooseOverload(ms, args, line, c.name);
          if (!m.isStatic && !fr.thisCell) {
            this.err(`metoda '${c.name}' nie jest statyczna, a wywołujesz ją z metody statycznej (np. Main) – dodaj 'static' do jej deklaracji albo wywołaj ją na obiekcie (CS0120)`, line);
          }
          const target = m.isStatic ? null : fr.thisCell;
          const disp = target ? this.dispatch(m, target.v.cls) : m;
          return this.afterOut(args, this.callUser(disp, target, args, line, env), env);
        }
        // delegat w polu
        const mm = this.ctxMemberLV(c.name, line);
        if (mm) {
          const fv = mm.get();
          if (has(fv.t, 'fn')) return this.invokeFn(fv.v, this.evalArgs(node.args, env).map((a) => a.tv), line);
        }
      }
      const hints = {
        print: ' – w C# wypisujemy przez Console.WriteLine(...)', printf: ' – użyj Console.WriteLine(...)',
        WriteLine: ' – pełny zapis to Console.WriteLine(...)', ReadLine: ' – pełny zapis to Console.ReadLine()', input: ' – użyj Console.ReadLine()',
      };
      this.err(`nazwa '${c.name}' nie istnieje w bieżącym kontekście${hints[c.name] || ' (sprawdź pisownię nazwy metody)'} (CS0103)`, line);
    }
    if (c.kind === 'Member') {
      const target = this.evalTarget(c.obj, env);
      if (target.type) {
        const info = this.types.get(target.type);
        if (info && info.methods) {
          const ms = this.methodCands(info, c.name);
          if (ms.length) {
            const args = this.evalArgs(node.args, env);
            const m = this.chooseOverload(ms, args, line, c.name);
            if (!m.isStatic) this.err(`metoda '${target.type}.${c.name}' nie jest statyczna – wywołaj ją na obiekcie (zmienna.${c.name}(...)) (CS0120)`, line);
            if (!this.canAccess(m.owner, m.access)) this.accessError('method', m.owner, c.name, m.access, line);
            return this.afterOut(args, this.callUser(m, null, args, line, env), env);
          }
        }
        const args = this.evalArgs(node.args, env);
        const r = this.callStatic(target.type, c.name, args, env, line, node);
        if (r !== undefined) return this.afterOut(args, r, env);
        this.err(`typ '${target.type}' nie zawiera metody '${c.name}' (CS0117)`, line);
      }
      const o = target.tv;
      if (o.v === null && !has(o.t, 'nullable')) {
        if (c.nullCond) return { t: 'null', v: null };
        this.throwEx('NullReferenceException', null, line);
      }
      if (o.v && o.v.kind === 'obj' && (!o.v.cls.prelude || c.name !== 'ToString')) {
        const sinfo = target.base || this.infoOf(o.t) || o.v.cls;
        const ms = this.methodCands(sinfo, c.name);
        if (ms.length) {
          const args = this.evalArgs(node.args, env);
          const m = this.chooseOverload(ms, args, line, c.name);
          if (m.isStatic) this.err(`do metody statycznej '${m.owner.name}.${c.name}' odwołuj się przez nazwę typu: ${m.owner.name}.${c.name}(...) (CS0176)`, line);
          if (!this.canAccess(m.owner, m.access)) this.accessError('method', m.owner, c.name, m.access, line);
          const objCell = target.cell || new Cell(o.t, o.v);
          const disp = target.base ? m : this.dispatch(m, o.v.cls);
          if (!disp.body) this.err(`metoda '${c.name}' jest abstrakcyjna i nie ma implementacji`, line);
          return this.afterOut(args, this.callUser(disp, objCell, args, line, env), env);
        }
        // pole/właściwość z delegatem
        const lvx = this.memberLV(o, c.name, line, target.cell);
        if (lvx && has(lvx.t, 'fn')) return this.invokeFn(lvx.get().v, this.evalArgs(node.args, env).map((a) => a.tv), line);
        if (this.infoOf(o.t) !== o.v.cls && this.methodCands(o.v.cls, c.name).length) {
          this.err(`typ '${csName(o.t)}' nie zawiera metody '${c.name}' – obiekt jest widziany jako '${csName(o.t)}'; rzutuj go na właściwy typ (CS1061)`, line);
        }
      }
      const args = this.evalArgs(node.args, env);
      const r = this.callInstance(o, c.name, args, env, line, target);
      if (r !== undefined) return this.afterOut(args, r, env);
      if (o.v && o.v.kind === 'obj') this.err(`typ '${o.v.cls.name}' nie zawiera metody '${c.name}' (CS1061)`, line);
      this.err(`typ '${csName(o.t)}' nie zawiera metody '${c.name}' (CS1061)`, line);
    }
    const fv = this.eval(c, env);
    if (!has(fv.t, 'fn') && !(fv.v && fv.v.kind === 'fn')) this.err('to wyrażenie nie jest metodą ani delegatem – nie można go wywołać (CS0149)', line);
    return this.invokeFn(fv.v, this.evalArgs(node.args, env).map((a) => a.tv), line);
  }

  // zmienne z "out int x" trafiają do zakresu wywołującego
  afterOut(args, r, env) {
    for (const a of args) if (a.outDecl && a.declaredCell && !env.vars.has(a.outDecl.name)) env.vars.set(a.outDecl.name, a.declaredCell);
    return r;
  }
}

Object.assign(CsInterpreter.prototype, builtinMethods);
CsInterpreter.prototype.Cell = Cell;
CsInterpreter.prototype.ExitSignal = ExitSignal;

export function runCSharp(code, opts = {}) {
  const it = new CsInterpreter(code, opts);
  const started = Date.now();
  let status = 'done';
  let error = null;
  let exitCode = 0;
  try {
    exitCode = it.run();
  } catch (e) {
    if (e instanceof NeedInput) status = 'need-input';
    else {
      status = 'error';
      if (e instanceof LangError) error = { kind: e.kind, line: e.line ?? null, message: e.message };
      else if (e instanceof CsThrow) { const u = it.uncaught(e); error = { kind: 'runtime', line: u.line, message: u.message }; }
      else if (e instanceof RangeError) error = { kind: 'runtime', line: it.curLine ?? null, message: 'przepełnienie stosu (StackOverflowException) – zbyt głęboka rekurencja' };
      else error = { kind: 'internal', line: it.curLine ?? null, message: `wewnętrzny błąd interpretera C#: ${e && e.message}` };
    }
  }
  return { status, error, exitCode, segments: it.segments, warnings: it.warnings || [], steps: it.steps, ms: Date.now() - started };
}
