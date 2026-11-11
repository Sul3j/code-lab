// Interpreter drzewa AST dla podzbioru C++ używanego w szkole.
// Działa synchronicznie (w Web Workerze). Wczytywanie danych (cin) działa w trybie
// "powtórki": gdy zabraknie danych, rzucamy NeedInput, a program jest uruchamiany
// ponownie od początku z dopisaną linią wejścia (program jest deterministyczny).
import { CppError } from './lexer.js';
import { parse } from './parser.js';

export class NeedInput extends Error {}
class ExitSignal { constructor(code) { this.code = code; } }

const BREAK = { sig: 'break' };
const CONTINUE = { sig: 'continue' };
const VOID = Object.freeze({ t: 'void', v: undefined });
const NULLPTR = Object.freeze({ kind: 'ptr', cell: null, arr: null, idx: 0 });

const INTEGRAL = new Set(['int', 'long', 'short', 'char', 'bool', 'unsigned']);
const isPrim = (t) => typeof t === 'string';
const isIntegral = (t) => INTEGRAL.has(t);
const isFloatT = (t) => t === 'double' || t === 'float';
const isNumeric = (t) => isIntegral(t) || isFloatT(t);
const isPtrT = (t) => t !== null && typeof t === 'object' && 'ptr' in t;
const isArrT = (t) => t !== null && typeof t === 'object' && 'arr' in t;
const isClsT = (t) => t !== null && typeof t === 'object' && 'cls' in t;
const isVecT = (t) => t !== null && typeof t === 'object' && 'vec' in t;
const BOOL = (b) => ({ t: 'bool', v: b ? 1 : 0 });

const STD_NAMES = new Set(['cout', 'cin', 'cerr', 'endl', 'fixed', 'scientific', 'left', 'right', 'boolalpha', 'noboolalpha', 'hex', 'oct', 'dec', 'showpos', 'noshowpos']);
const STD_FUNCS = new Set(['max', 'min', 'swap', 'sort', 'reverse', 'to_string', 'stoi', 'stol', 'stoll', 'stod', 'stof',
  'getline', 'setw', 'setprecision', 'setfill', 'max_element', 'min_element', 'count', 'find', 'accumulate', 'fill']);

export function typeName(t) {
  if (t === undefined || t === null) return '?';
  if (isPrim(t)) return t === 'long' ? 'long long' : t;
  if (isPtrT(t)) return typeName(t.ptr) + '*';
  if (isArrT(t)) return typeName(t.arr) + `[${t.n ?? ''}]`;
  if (isClsT(t)) return t.cls;
  if (isVecT(t)) return `vector<${typeName(t.vec)}>`;
  return '?';
}

function sameType(a, b) {
  if (isPrim(a) || isPrim(b)) return a === b;
  if (isPtrT(a) && isPtrT(b)) return sameType(a.ptr, b.ptr) || a.ptr === 'void' || b.ptr === 'void';
  if (isClsT(a) && isClsT(b)) return a.cls === b.cls;
  if (isVecT(a) && isVecT(b)) return sameType(a.vec, b.vec);
  if (isArrT(a) && isArrT(b)) return sameType(a.arr, b.arr);
  return false;
}

class Cell {
  constructor(t, v, addr) { this.t = t; this.v = v; this.addr = addr; }
}

// referencja do pojedynczego znaku w napisie (s[i])
class CharRef {
  constructor(cell, idx) { this.cell = cell; this.idx = idx; }
  get t() { return 'char'; }
  get v() { return this.cell.v.charCodeAt(this.idx); }
  set v(c) {
    const s = this.cell.v;
    this.cell.v = s.slice(0, this.idx) + String.fromCharCode(c) + s.slice(this.idx + 1);
  }
  get addr() { return (this.cell.addr || 0x5581a3f30000) + 0x40 + this.idx; }
}

// widok obiektu przez wskaźnik/referencję typu bazowego (typ statyczny ≠ dynamiczny)
class StaticView {
  constructor(cell, t) { this.cell = cell; this.st = t; }
  get t() { return this.st; }
  get v() { return this.cell.v; }
  set v(x) { this.cell.v = x; }
  get addr() { return this.cell.addr; }
  get arr() { return this.cell.arr; }
  get idx() { return this.cell.idx; }
  get isConst() { return this.cell.isConst; }
  get temp() { return this.cell.temp; }
  get freed() { return this.cell.freed; }
  get heap() { return this.cell.heap; }
}

// pole unii – wszystkie pola dzielą te same bajty pamięci
function readBytes(dv, t) {
  switch (t) {
    case 'int': return dv.getInt32(0, true);
    case 'unsigned': return dv.getUint32(0, true);
    case 'short': return dv.getInt16(0, true);
    case 'char': return dv.getUint8(0);
    case 'bool': return dv.getUint8(0) ? 1 : 0;
    case 'long': return Number(dv.getBigInt64(0, true));
    case 'float': return dv.getFloat32(0, true);
    case 'double': return dv.getFloat64(0, true);
    default: return 0;
  }
}
function writeBytes(dv, t, v) {
  switch (t) {
    case 'int': dv.setInt32(0, v | 0, true); break;
    case 'unsigned': dv.setUint32(0, v >>> 0, true); break;
    case 'short': dv.setInt16(0, v, true); break;
    case 'char': dv.setUint8(0, v & 0xff); break;
    case 'bool': dv.setUint8(0, v ? 1 : 0); break;
    case 'long': dv.setBigInt64(0, BigInt(Math.trunc(v)), true); break;
    case 'float': dv.setFloat32(0, v, true); break;
    case 'double': dv.setFloat64(0, v, true); break;
    default: break;
  }
}
class UnionField {
  constructor(u, t, addr) { this.u = u; this.ft = t; this.addr = addr; }
  get t() { return this.ft; }
  get v() { return readBytes(this.u.view, this.ft); }
  set v(x) { writeBytes(this.u.view, this.ft, x); }
}

class Env {
  constructor(parent) { this.vars = new Map(); this.parent = parent; this.obj = null; this.objs = null; }
  lookup(name) {
    let e = this;
    while (e) {
      const v = e.vars.get(name);
      if (v) return v;
      if (e.obj) { const f = e.obj.fields.get(name); if (f) return f; }
      e = e.parent;
    }
    return null;
  }
}

function formatG(v, prec) {
  const p = prec === 0 ? 1 : prec;
  if (v === 0) return Object.is(v, -0) ? '-0' : '0';
  const ex = v.toExponential(p - 1);
  const exp = parseInt(ex.split('e')[1], 10);
  if (exp < -4 || exp >= p) {
    let [m, e] = ex.split('e');
    if (m.includes('.')) m = m.replace(/\.?0+$/, '');
    const sign = e[0] === '-' ? '-' : '+';
    let d = e.replace(/^[+-]/, '');
    if (d.length < 2) d = '0' + d;
    return `${m}e${sign}${d}`;
  }
  let s = v.toFixed(Math.max(0, p - 1 - exp));
  if (s.includes('.')) s = s.replace(/\.?0+$/, '');
  return s;
}

export class Interpreter {
  constructor(code, opts = {}) {
    this.code = code;
    this.inputs = opts.inputs || [];
    this.interactive = !!opts.interactive;
    this.maxSteps = opts.maxSteps || 40_000_000;
    this.timeLimit = opts.timeLimit || 15000;
    this.maxOutput = opts.maxOutput || 200_000;
    this.onFlush = opts.onFlush || null;
    this.seed = opts.seed || 1731234567;
    this.randState = 1;
    this.segments = [];
    this.outLen = 0;
    this.steps = 0;
    this.frames = [];
    this.stackAddr = 0x7ffd5e8a1a40;
    this.heapAddr = 0x55c1a3f2eb20;
    this.heapAllocs = [];
    this.out = { fixed: false, sci: false, prec: 6, width: 0, fill: ' ', left: false, boolalpha: false, base: 10, showpos: false };
    this.warnKeys = new Set();
    this.inLine = 0;
    this.buf = '';
    this.pos = 0;
    this.inFail = false;
    this.inEof = false;
    this.lastFlush = 0;
  }

  // ---------- wyjście ----------
  write(text, type = 'out') {
    if (!text) return;
    this.outLen += text.length;
    if (this.outLen > this.maxOutput) {
      throw new CppError('program wypisał zbyt dużo danych – przerwano (możliwa nieskończona pętla z cout)', this.curLine, 'limit');
    }
    const last = this.segments[this.segments.length - 1];
    if (last && last.type === type) last.text += text;
    else this.segments.push({ type, text });
  }

  flush() {
    if (this.onFlush && this.segments.length) {
      this.onFlush(this.segments);
      this.segments = [];
    }
  }

  tick() {
    const now = Date.now();
    if (now - this.startTime > this.timeLimit) {
      throw new CppError(`przekroczono limit czasu (${Math.round(this.timeLimit / 1000)} s) – możliwa nieskończona pętla`, this.curLine, 'limit');
    }
    if (now - this.lastFlush > 60) { this.lastFlush = now; this.flush(); }
  }

  // ---------- pamięć ----------
  alloc(size, heap = false) {
    const align = Math.min(8, Math.max(1, size));
    if (heap) {
      this.heapAddr = Math.ceil(this.heapAddr / 16) * 16;
      const a = this.heapAddr;
      this.heapAddr += Math.max(size, 16) + 16;
      return a;
    }
    this.stackAddr = Math.ceil(this.stackAddr / align) * align;
    const a = this.stackAddr;
    this.stackAddr += Math.max(size, 1);
    return a;
  }

  sizeOf(t) {
    if (isPrim(t)) {
      return { int: 4, unsigned: 4, short: 2, long: 8, double: 8, float: 4, char: 1, bool: 1, string: 32, void: 1 }[t] || 4;
    }
    if (isPtrT(t)) return 8;
    if (isVecT(t)) return 24;
    if (isArrT(t)) return (t.n || 0) * this.sizeOf(t.arr);
    if (isClsT(t)) {
      const info = this.classes.get(t.cls);
      if (info.isUnion) return Math.max(1, ...info.decl.fields.map((f) => this.sizeOf(f.type)));
      let s = 0;
      for (let c = info; c; c = c.base) for (const f of c.decl.fields) s += this.sizeOf(f.type);
      return s || 1;
    }
    return 8;
  }

  newCell(t, v, heap = false) {
    return new Cell(t, v, this.alloc(this.sizeOf(t), heap));
  }

  tempCell(tv) {
    const c = new Cell(tv.t, tv.v, 0);
    c.temp = true;
    return c;
  }

  defaultValue(t, line, heap = false) {
    if (isPrim(t)) return t === 'string' ? '' : 0;
    if (isPtrT(t)) return NULLPTR;
    if (isVecT(t)) return this.makeVec(t.vec);
    if (isClsT(t)) return this.constructObject(this.classInfo(t.cls, line), [], line, heap);
    if (isArrT(t)) return this.createArray(t.arr, [t.n], heap, line);
    return 0;
  }

  createArray(et, dims, heap = false, line) {
    const [n, ...rest] = dims;
    const innerT = rest.length ? this.arrType(et, rest) : et;
    const arr = { kind: 'arr', et: innerT, cells: new Array(n), base: 0, heap };
    for (let k = 0; k < n; k++) {
      let c;
      if (rest.length) {
        const sub = this.createArray(et, rest, heap, line);
        c = new Cell(innerT, sub, sub.base);
      } else {
        const size = this.sizeOf(et);
        const addr = heap ? (k === 0 ? this.alloc(size * n, true) : arr.cells[0].addr + k * size) : this.alloc(size);
        c = new Cell(et, this.defaultValue(et, line, heap), addr);
      }
      c.arr = arr;
      c.idx = k;
      arr.cells[k] = c;
    }
    arr.base = n ? arr.cells[0].addr : this.alloc(0, heap);
    return arr;
  }

  arrType(et, dims) {
    let t = et;
    for (let k = dims.length - 1; k >= 0; k--) t = { arr: t, n: dims[k] };
    return t;
  }

  makeVec(et) {
    return { kind: 'vec', et, cells: [], base: this.alloc(4096, true) };
  }

  vecPush(vec, tv, line) {
    const c = new Cell(vec.et, this.convert(tv, vec.et, line), vec.base + vec.cells.length * this.sizeOf(vec.et));
    c.arr = vec;
    c.idx = vec.cells.length;
    vec.cells.push(c);
  }

  reindex(vec) {
    const s = this.sizeOf(vec.et);
    vec.cells.forEach((c, k) => { c.idx = k; c.addr = vec.base + k * s; });
  }

  copyValue(t, v) {
    if (v && typeof v === 'object') {
      if (v.kind === 'obj') return this.copyObj(v);
      if (v.kind === 'vec') {
        const nv = this.makeVec(v.et);
        for (const c of v.cells) this.vecPush(nv, { t: c.t, v: c.v });
        return nv;
      }
      if (v.kind === 'arr') {
        const arr = { kind: 'arr', et: v.et, cells: [], base: 0 };
        v.cells.forEach((c, k) => {
          const nc = this.newCell(c.t, this.copyValue(c.t, c.v));
          nc.arr = arr;
          nc.idx = k;
          arr.cells.push(nc);
        });
        arr.base = arr.cells.length ? arr.cells[0].addr : 0;
        return arr;
      }
    }
    return v;
  }

  copyObj(o, asCls = null) {
    if (o.union) {
      const nu = this.makeUnionObj(o.cls, false);
      new Uint8Array(nu.union.view.buffer).set(new Uint8Array(o.union.view.buffer));
      return nu;
    }
    const cls = asCls || o.cls;
    const no = { kind: 'obj', cls, fields: new Map() };
    for (let c = cls; c; c = c.base) {
      for (const f of c.decl.fields) {
        const src = o.fields.get(f.name);
        no.fields.set(f.name, this.newCell(src.t, this.copyValue(src.t, src.v)));
      }
    }
    return no;
  }

  mkPtr(cell) {
    if (cell.arr) return { kind: 'ptr', cell: null, arr: cell.arr, idx: cell.idx };
    return { kind: 'ptr', cell, arr: null, idx: 0 };
  }

  deref(p, line) {
    if (!p || p.kind !== 'ptr') throw new CppError('dereferencja czegoś, co nie jest wskaźnikiem', line, 'runtime');
    if (p.arr) {
      if (p.arr.freed) throw new CppError('użycie pamięci, która została już zwolniona (delete)', line, 'runtime');
      if (p.idx < 0 || p.idx >= p.arr.cells.length) {
        throw new CppError(`wskaźnik wskazuje poza tablicę (indeks ${p.idx}, rozmiar ${p.arr.cells.length}) – w prawdziwym C++ to niezdefiniowane zachowanie`, line, 'runtime');
      }
      return p.arr.cells[p.idx];
    }
    if (!p.cell) throw new CppError('dereferencja pustego wskaźnika (nullptr) – wskaźnik nie wskazuje na żadną zmienną', line, 'runtime');
    if (p.cell.freed) throw new CppError('użycie pamięci, która została już zwolniona (delete)', line, 'runtime');
    return p.cell;
  }

  ptrAddr(p) {
    if (!p) return 0;
    if (p.arr) {
      const s = this.sizeOf(p.arr.et);
      return p.arr.base + p.idx * s;
    }
    return p.cell ? p.cell.addr : 0;
  }

  isNull(p) { return !p.arr && !p.cell; }

  // ---------- klasy ----------
  classInfo(name, line) {
    const c = this.classes.get(name);
    if (!c) throw new CppError(`nieznana klasa '${name}'`, line);
    return c;
  }

  isDerived(cls, baseName) {
    for (let c = cls; c; c = c.base) if (c.name === baseName) return true;
    return false;
  }

  findField(cls, name) {
    for (let c = cls; c; c = c.base) {
      const f = c.fieldMap.get(name);
      if (f) return { f, owner: c };
    }
    return null;
  }

  findMethods(cls, name) {
    for (let c = cls; c; c = c.base) {
      const m = c.methods.get(name);
      if (m) return m;
    }
    return null;
  }

  canAccess(owner, access) {
    if (access === 'public') return true;
    const fr = this.frames[this.frames.length - 1];
    if (fr && fr.fn && !fr.cls && owner.friends && owner.friends.has(fr.fn.name)) return true;
    const cur = fr && fr.cls;
    if (!cur) return false;
    if (owner.friendClasses && owner.friendClasses.has(cur.name)) return true;
    if (access === 'private') return cur === owner;
    return this.isDerived(cur, owner.name);
  }

  abstractMethodOf(cls) {
    const seen = new Set();
    for (let c = cls; c; c = c.base) {
      for (const [name, ms] of c.methods) {
        if (seen.has(name)) continue;
        seen.add(name);
        if (ms.some((m) => m.isPure) && !ms.some((m) => m.body)) return name;
      }
    }
    return null;
  }

  makeUnionObj(cls, heap) {
    const size = this.sizeOf({ cls: cls.name });
    const base = this.alloc(size, heap);
    const u = { view: new DataView(new ArrayBuffer(8)) };
    const obj = { kind: 'obj', cls, fields: new Map(), union: u };
    for (const f of cls.decl.fields) obj.fields.set(f.name, new UnionField(u, f.type, base));
    return obj;
  }

  constructObject(cls, args, line, heap = false) {
    const ab = this.abstractMethodOf(cls);
    if (ab) {
      throw new CppError(`nie można utworzyć obiektu klasy abstrakcyjnej '${cls.name}' – metoda '${ab}' jest czysto wirtualna (= 0). Utwórz obiekt klasy pochodnej, która ją implementuje.`, line);
    }
    if (cls.isUnion) {
      const uo = this.makeUnionObj(cls, heap);
      if (args.length > 1) throw new CppError(`unię '${cls.name}' inicjalizujemy tylko jedną wartością (pierwszego pola)`, line);
      if (args.length) {
        const first = uo.fields.get(cls.decl.fields[0].name);
        first.v = this.convert(args[0], first.t, line);
      }
      return uo;
    }
    const obj = { kind: 'obj', cls, fields: new Map() };
    const chain = [];
    for (let c = cls; c; c = c.base) chain.unshift(c);
    for (const c of chain) {
      for (const f of c.decl.fields) {
        let cell;
        if (f.dims.length) {
          const dims = f.dims.map((d) => this.intOf(this.eval(d, this.classEnv(cls, null)), line));
          const arr = this.createArray(f.type, dims, heap, line);
          cell = new Cell(this.arrType(f.type, dims), arr, arr.base);
        } else if (isClsT(f.type)) {
          cell = new Cell(f.type, null, this.alloc(this.sizeOf(f.type), heap));
        } else {
          cell = new Cell(f.type, this.defaultValue(f.type, line, heap), this.alloc(this.sizeOf(f.type), heap));
        }
        obj.fields.set(f.name, cell);
      }
    }
    const first = obj.fields.values().next().value;
    const objCell = new Cell({ cls: cls.name }, obj, first ? first.addr : this.alloc(1, heap));
    this.runCtor(objCell, cls, args, line);
    return obj;
  }

  runCtor(objCell, cls, args, line) {
    const obj = objCell.v;
    // niejawny konstruktor kopiujący
    if (args.length === 1 && isClsT(args[0].t) && this.isDerived(this.classes.get(args[0].t.cls), cls.name)
      && !cls.ctors.some((c) => c.params.length === 1 && isClsT(c.params[0].type) && c.params[0].type.cls === cls.name)) {
      const src = args[0].v;
      for (let c = cls; c; c = c.base) {
        for (const f of c.decl.fields) {
          const sc = src.fields.get(f.name);
          const dc = obj.fields.get(f.name);
          dc.v = this.copyValue(sc.t, sc.v);
        }
      }
      return;
    }
    if (!cls.ctors.length) {
      if (cls.base) this.runCtor(objCell, cls.base, [], line);
      if (args.length) {
        // inicjalizacja agregatowa struktury: Punkt p = {1, 2};
        const fs = cls.decl.fields;
        if (args.length > fs.length) throw new CppError(`za dużo wartości w inicjalizacji '${cls.name}' (pól: ${fs.length})`, line);
        args.forEach((a, k) => {
          const fc = obj.fields.get(fs[k].name);
          if (a.t === 'initlist') this.initCellFrom(fc, a.v, this.globalEnv, line);
          else this.assignInto(fc, a, line, true);
        });
        this.initFields(obj, cls, null, this.globalEnv, line, new Set(fs.slice(0, args.length).map((f) => f.name)));
        return;
      }
      this.initFields(obj, cls, null, this.objEnv(obj), line);
      return;
    }
    const ctor = this.chooseOverload(cls.ctors, args, line, cls.name, true);
    if (!this.canAccess(cls, ctor.access || 'public') && ctor.access !== 'public') {
      throw new CppError(`konstruktor klasy '${cls.name}' jest prywatny`, line);
    }
    if (!ctor.body) throw new CppError(`konstruktor ${cls.name}(...) został zadeklarowany, ale nie ma definicji`, line);
    const fenv = new Env(this.objEnv(obj));
    this.bindParams(ctor, args, fenv, line);
    this.pushFrame(ctor, cls, objCell, line);
    try {
      const inits = ctor.inits || [];
      for (const ii of inits) {
        if (ii.name !== (cls.base && cls.base.name) && !cls.fieldMap.has(ii.name)) {
          throw new CppError(`'${ii.name}' nie jest polem klasy '${cls.name}' (lista inicjalizacyjna)`, ctor.line);
        }
      }
      if (cls.base) {
        const bi = inits.find((x) => x.name === cls.base.name);
        this.runCtor(objCell, cls.base, bi ? bi.args.map((a) => this.evalArg(a, fenv)) : [], line);
      }
      this.initFields(obj, cls, inits, fenv, line);
      this.execBlock(ctor.body.stmts, new Env(fenv));
    } finally {
      this.frames.pop();
    }
  }

  initFields(obj, cls, inits, env, line, skip = null) {
    for (const f of cls.decl.fields) {
      if (skip && skip.has(f.name)) continue;
      const fc = obj.fields.get(f.name);
      const ii = inits && inits.find((x) => x.name === f.name);
      if (ii) {
        if (isClsT(f.type)) fc.v = this.constructObject(this.classInfo(f.type.cls, line), ii.args.map((a) => this.evalArg(a, env)), line);
        else if (isVecT(f.type)) fc.v = this.vecFromArgs(f.type, ii.args, env, line);
        else if (ii.args.length) this.assignInto(fc, this.eval(ii.args[0], env), line, true);
        else fc.v = this.defaultValue(f.type, line);
      } else if (f.init) {
        this.initCellFrom(fc, f.init, env, line);
      } else if (isClsT(f.type) && fc.v === null) {
        fc.v = this.constructObject(this.classInfo(f.type.cls, line), [], line);
      }
    }
  }

  initCellFrom(cell, init, env, line) {
    if (init.kind === 'InitList') {
      if (isArrT(cell.t)) return this.fillArray(cell.v, init, env, line);
      if (isClsT(cell.t)) { cell.v = this.constructObject(this.classInfo(cell.t.cls, line), init.items.map((a) => this.evalArg(a, env)), line); return; }
      if (isVecT(cell.t)) { cell.v = this.vecFromList(cell.t.vec, init, env, line); return; }
      if (init.items.length) this.assignInto(cell, this.eval(init.items[0], env), line, true);
      return;
    }
    if (isClsT(cell.t)) { cell.v = this.convert(this.eval(init, env), cell.t, line); return; }
    this.assignInto(cell, this.eval(init, env), line, true);
  }

  objEnv(obj) {
    return this.classEnv(obj.cls, obj);
  }

  classEnv(cls, obj) {
    const e = new Env(this.globalEnv);
    e.obj = obj;
    for (let c = cls; c; c = c.base) {
      if (!c.statics) continue;
      for (const [k, cell] of c.statics) if (!e.vars.has(k)) e.vars.set(k, cell);
    }
    return e;
  }

  findStatic(cls, name) {
    for (let c = cls; c; c = c.base) {
      if (c.statics && c.statics.has(name)) return { cell: c.statics.get(name), decl: c.staticDecls.get(name), owner: c };
    }
    return null;
  }

  createStatics() {
    for (const info of this.classes.values()) {
      for (const d of info.decl.staticFields || []) {
        let cell;
        if (d.dims.length) {
          const dims = d.dims.map((x) => this.intOf(this.eval(x, this.classEnv(info, null)), d.line));
          const arr = this.createArray(d.type, dims, false, d.line);
          cell = new Cell(this.arrType(d.type, dims), arr, arr.base);
        } else cell = this.newCell(d.type, isClsT(d.type) ? null : this.defaultValue(d.type, d.line));
        info.statics.set(d.name, cell);
      }
    }
    for (const info of this.classes.values()) {
      for (const d of info.decl.staticFields || []) {
        const cell = info.statics.get(d.name);
        if (d.init) this.initCellFrom(cell, d.init, this.classEnv(info, null), d.line);
        else if (isClsT(d.type)) cell.v = this.constructObject(this.classInfo(d.type.cls, d.line), [], d.line);
        if (d.isConst) cell.isConst = true;
      }
    }
  }

  execStaticDef(node) {
    const info = this.classInfo(node.cls, node.line);
    const cell = info.statics.get(node.name);
    if (!cell) throw new CppError(`klasa '${node.cls}' nie deklaruje pola statycznego '${node.name}' (dodaj w klasie: static ${typeName(node.type)} ${node.name};)`, node.line);
    if (node.init) {
      const wasConst = cell.isConst;
      cell.isConst = false;
      this.initCellFrom(cell, node.init, this.classEnv(info, null), node.line);
      cell.isConst = wasConst;
    }
  }

  staticRefLV(node) {
    const info = this.classInfo(node.cls, node.line);
    const st = this.findStatic(info, node.name);
    if (!st) {
      if (this.findMethods(info, node.name)) throw new CppError(`'${node.name}' to metoda – wywołaj ją z nawiasami: ${node.cls}::${node.name}()`, node.line);
      if (this.findField(info, node.name)) throw new CppError(`pole '${node.name}' nie jest statyczne – należy do konkretnego obiektu (użyj obiekt.${node.name})`, node.line);
      throw new CppError(`klasa '${node.cls}' nie ma składowej statycznej '${node.name}'`, node.line);
    }
    if (!this.canAccess(st.owner, st.decl.access)) {
      throw new CppError(`pole statyczne '${node.name}' jest ${st.decl.access === 'private' ? 'prywatne' : 'chronione'} w klasie '${st.owner.name}'`, node.line);
    }
    return st.cell;
  }

  userCopyCtor(info) {
    return info.ctors.find((c) => c.params.length === 1 && isClsT(c.params[0].type) && c.params[0].type.cls === info.name);
  }

  copyConstruct(src, t, line) {
    const info = this.classes.get(t.cls);
    if (info && isClsT(src.t) && this.userCopyCtor(info) && this.isDerived(this.classes.get(src.t.cls), t.cls)) {
      return this.constructObject(info, [src], line);
    }
    return this.convert(src, t, line);
  }

  // wywołanie przeciążonego operatora: metoda klasy lub funkcja globalna
  callOperator(op, L, R, line, cells = null) {
    const name = `operator${op}`;
    const lc = (cells && cells[0]) || L.ref || this.tempCell(L);
    const rc = R ? ((cells && cells[1]) || R.ref || this.tempCell(R)) : null;
    if (isClsT(L.t)) {
      const info = this.classes.get(L.t.cls);
      const ms = (this.findMethods(info, name) || []).filter((m) => m.params.length === (R ? 1 : 0));
      if (ms.length) {
        const args = R ? [rc] : [];
        const fn = this.chooseOverload(ms, args, line, name);
        if (!this.canAccess(fn.ownerCls, fn.access || 'public')) throw new CppError(`operator ${op} jest prywatny w klasie '${fn.ownerCls.name}'`, line);
        return this.callFuncWithCells(fn, args, line, lc);
      }
    }
    const fns = (this.functions.get(name) || []).filter((f) => f.params.length === (R ? 2 : 1));
    if (fns.length) {
      const args = R ? [lc, rc] : [lc];
      const fn = this.chooseOverload(fns, args, line, name);
      return this.callFuncWithCells(fn, args, line, null);
    }
    return null;
  }

  hasVirtualDtor(cls) {
    for (let c = cls; c; c = c.base) if (c.dtor && c.dtor.isVirtual) return true;
    return false;
  }

  destroyObject(cell, line, staticCls = null) {
    const o = cell.v;
    if (!o) return;
    if (o.kind === 'arr') {
      for (let k = o.cells.length - 1; k >= 0; k--) this.destroyObject(o.cells[k], line);
      return;
    }
    if (o.kind !== 'obj' || o.destroyed) return;
    o.destroyed = true;
    let start = o.cls;
    if (staticCls && staticCls !== o.cls && !this.hasVirtualDtor(staticCls)) {
      start = staticCls;
      if (o.cls.dtor && o.cls.dtor.body) {
        this.warn(line, `usunięto obiekt klasy '${o.cls.name}' przez wskaźnik na '${staticCls.name}', a destruktor klasy bazowej nie jest wirtualny – destruktor ~${o.cls.name}() nie został wywołany (dodaj 'virtual ~${staticCls.name}()')`);
      }
    }
    for (let c = start; c; c = c.base) {
      if (c.dtor && c.dtor.body) this.callFuncWithCells(c.dtor, [], line, cell);
      // po destruktorze niszczone są pola-obiekty (w odwrotnej kolejności deklaracji)
      const fs = c.decl.fields;
      for (let k = fs.length - 1; k >= 0; k--) {
        const f = fs[k];
        if (isClsT(f.type) || (f.dims.length && isClsT(f.type))) {
          const fc = o.fields.get(f.name);
          if (fc && !fc.union) this.destroyObject(fc, line);
        }
      }
    }
  }

  destroyScope(env, line) {
    if (!env.objs) return;
    for (let k = env.objs.length - 1; k >= 0; k--) this.destroyObject(env.objs[k], line);
    env.objs = null;
  }

  // ---------- uruchomienie ----------
  run() {
    this.startTime = Date.now();
    this.lastFlush = this.startTime;
    const program = parse(this.code);
    this.usingStd = program.usingStd;
    this.hasIostream = program.includes.some((i) => i === 'iostream' || i === 'bits/stdc++.h');
    this.warnings = program.warnings;
    this.classes = new Map();
    this.functions = new Map();
    this.globalEnv = new Env(null);
    const globals = [];

    for (const node of program.body) {
      if (node.kind === 'Class') this.registerClass(node);
    }
    for (const node of program.body) {
      if (node.kind === 'Func') this.registerFunc(node);
      else if (node.kind === 'Class') for (const f of node.friendFuncs || []) this.registerFunc(f);
      else if (node.kind === 'VarDecl' || node.kind === 'Enum' || node.kind === 'StaticDef') globals.push(node);
    }
    const mains = this.functions.get('main');
    if (!mains || !mains.some((f) => f.body)) {
      throw new CppError('brak funkcji main() – każdy program w C++ musi mieć funkcję int main() { ... }', 1);
    }
    const main = mains.find((f) => f.body);
    if (main.ret !== 'int') throw new CppError("funkcja main musi zwracać typ int: 'int main()'", main.line);

    let exitCode = 0;
    try {
      for (const g of globals) if (g.kind === 'Enum') this.execEnum(g, this.globalEnv);
      this.createStatics();
      for (const g of globals) {
        if (g.kind === 'StaticDef') this.execStaticDef(g);
        else if (g.kind === 'VarDecl') this.execVarDecl(g, this.globalEnv);
      }
      this.curLine = main.line;
      const args = main.params.map((p, k) => this.tempCell(k === 0 ? { t: 'int', v: 1 } : { t: p.type, v: NULLPTR }));
      const r = this.callFuncWithCells(main, args, main.line, null);
      exitCode = r.v | 0;
      this.destroyScope(this.globalEnv, main.line);
    } catch (e) {
      if (e instanceof ExitSignal) exitCode = e.code;
      else throw e;
    }
    const leaks = this.heapAllocs.filter((h) => !h.freed).length;
    if (leaks) {
      this.warnings.push({ line: 0, message: `wyciek pamięci: ${leaks} blok(ów) zaalokowanych przez 'new' nie zostało zwolnionych przez 'delete'` });
    }
    return exitCode;
  }

  registerClass(node) {
    const info = {
      name: node.name,
      decl: node,
      base: node.base ? this.classes.get(node.base) : null,
      fieldMap: new Map(),
      methods: new Map(),
      ctors: [],
      dtor: null,
      isStruct: node.isStruct,
      isUnion: node.isUnion,
      statics: new Map(),
      staticDecls: new Map(),
      friends: new Set(node.friends || []),
      friendClasses: new Set(node.friendClasses || []),
    };
    for (const f of node.staticFields || []) {
      if (info.staticDecls.has(f.name) || node.fields.some((x) => x.name === f.name)) {
        throw new CppError(`pole '${f.name}' zostało już zadeklarowane w klasie '${node.name}'`, f.line);
      }
      info.staticDecls.set(f.name, f);
    }
    if (node.isUnion) {
      for (const f of node.fields) {
        if (!isPrim(f.type) || !isNumeric(f.type) || f.dims.length) {
          throw new CppError(`pole '${f.name}' unii musi być prostym typem liczbowym/znakowym (int, double, char, bool…) – ${typeName(f.type)}${f.dims.length ? '[]' : ''} nie jest tu obsługiwany`, f.line);
        }
      }
      if (node.methods.length || node.ctors.length) throw new CppError('w tym środowisku unie mogą zawierać tylko pola', node.line);
    }
    for (const f of node.fields) {
      if (info.fieldMap.has(f.name)) throw new CppError(`pole '${f.name}' zostało już zadeklarowane w klasie '${node.name}'`, f.line);
      info.fieldMap.set(f.name, f);
    }
    for (const m of node.methods) {
      m.ownerCls = info;
      if (!info.methods.has(m.name)) info.methods.set(m.name, []);
      info.methods.get(m.name).push(m);
    }
    for (const c of node.ctors) { c.ownerCls = info; info.ctors.push(c); }
    for (const m of node.methods) {
      if (m.isOverride && !(info.base && this.isVirtualName(info.base, m.name))) {
        throw new CppError(`metoda '${m.name}' jest oznaczona 'override', ale nie nadpisuje żadnej metody wirtualnej klasy bazowej`, m.line);
      }
    }
    if (node.dtor) { node.dtor.ownerCls = info; info.dtor = node.dtor; }
    this.classes.set(node.name, info);
  }

  registerFunc(fn) {
    if (fn.cls) {
      const info = this.classes.get(fn.cls);
      if (!info) throw new CppError(`nieznana klasa '${fn.cls}'`, fn.line);
      if (fn.isDtor) {
        if (!info.dtor) throw new CppError(`klasa '${fn.cls}' nie deklaruje destruktora`, fn.line);
        info.dtor.body = fn.body;
        return;
      }
      const list = fn.isCtor ? info.ctors : info.methods.get(fn.name);
      const decl = list && list.find((d) => !d.body && d.params.length === fn.params.length);
      if (!decl) {
        throw new CppError(`klasa '${fn.cls}' nie deklaruje ${fn.isCtor ? 'takiego konstruktora' : `metody '${fn.name}'`} – dodaj jej deklarację w klasie`, fn.line);
      }
      decl.body = fn.body;
      decl.params = fn.params.map((p, k) => ({ ...p, def: p.def || decl.params[k].def }));
      if (fn.isCtor) decl.inits = fn.inits;
      return;
    }
    if (!this.functions.has(fn.name)) this.functions.set(fn.name, []);
    const list = this.functions.get(fn.name);
    const same = list.find((d) => d.params.length === fn.params.length && d.params.every((p, k) => sameType(p.type, fn.params[k].type)));
    if (same) {
      if (same.body && fn.body) throw new CppError(`funkcja '${fn.name}' została zdefiniowana dwa razy`, fn.line);
      if (fn.body) {
        same.body = fn.body;
        same.params = fn.params.map((p, k) => ({ ...p, def: p.def || same.params[k].def }));
      }
      return;
    }
    list.push(fn);
  }

  execEnum(node, env) {
    let v = 0;
    for (const it of node.items) {
      if (it.init) v = this.intOf(this.eval(it.init, env), node.line);
      const c = this.newCell('int', v);
      c.isConst = true;
      if (!node.scoped) env.vars.set(it.name, c);
      if (node.name) env.vars.set(`${node.name}::${it.name}`, c);
      v++;
    }
  }

  warn(line, message) {
    const k = `${line}:${message}`;
    if (this.warnKeys.has(k)) return;
    this.warnKeys.add(k);
    this.warnings.push({ line, message });
  }

  isVirtualName(cls, name) {
    for (let c = cls; c; c = c.base) {
      const ms = c.methods.get(name);
      if (ms && ms.some((m) => m.isVirtual || m.isPure)) return true;
    }
    return false;
  }

  resolveMethods(staticCls, dynCls, name) {
    const sm = this.findMethods(staticCls, name);
    if (!sm) return null;
    if (staticCls !== dynCls && this.isVirtualName(staticCls, name)) return this.findMethods(dynCls, name) || sm;
    return sm;
  }

  // ---------- instrukcje ----------
  step(line) {
    this.curLine = line;
    if (++this.steps > this.maxSteps) {
      throw new CppError('przekroczono limit kroków wykonania – możliwa nieskończona pętla', line, 'limit');
    }
    if ((this.steps & 0x3fff) === 0) this.tick();
  }

  execBlock(stmts, env) {
    for (let k = 0; k < stmts.length; k++) {
      const r = this.execStmt(stmts[k], env);
      if (r) { this.destroyScope(env); return r; }
    }
    this.destroyScope(env);
    return undefined;
  }

  execStmt(s, env) {
    this.step(s.line);
    switch (s.kind) {
      case 'Block': return this.execBlock(s.stmts, new Env(env));
      case 'ExprStmt': this.eval(s.expr, env); return undefined;
      case 'VarDecl': this.execVarDecl(s, env); return undefined;
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
        if (s.init) this.execStmt(s.init, fe);
        for (;;) {
          if (s.cond && !this.truthy(this.eval(s.cond, fe), s.line)) break;
          const r = this.execScoped(s.body, fe);
          if (r === BREAK) break;
          if (r && r !== CONTINUE) { this.destroyScope(fe); return r; }
          if (s.step) this.eval(s.step, fe);
          this.step(s.line);
        }
        this.destroyScope(fe);
        return undefined;
      }
      case 'ForRange': return this.execForRange(s, env);
      case 'Return': {
        if (!s.expr) return { ret: null };
        const fr = this.frames[this.frames.length - 1];
        if (fr && fr.fn && fr.fn.retRef && this.isLvalueNode(s.expr, env)) {
          const lv = this.evalLV(s.expr, env);
          return { ret: { t: lv.t, v: lv.v, ref: lv }, line: s.line };
        }
        const tv = this.eval(s.expr, env);
        return { ret: { t: tv.t, v: this.copyValue(tv.t, tv.v) }, line: s.line };
      }
      case 'Break': return BREAK;
      case 'Continue': return CONTINUE;
      case 'Switch': return this.execSwitch(s, env);
      case 'Empty': return undefined;
      case 'Enum': this.execEnum(s, env); return undefined;
      default:
        throw new CppError(`nieobsługiwana instrukcja (${s.kind})`, s.line);
    }
  }

  execScoped(s, env) {
    if (s.kind === 'Block') return this.execBlock(s.stmts, new Env(env));
    if (s.kind === 'VarDecl') return this.execStmt(s, new Env(env));
    return this.execStmt(s, env);
  }

  execSwitch(s, env) {
    const v = this.eval(s.expr, env);
    if (!isIntegral(v.t)) {
      throw new CppError(`switch działa tylko dla liczb całkowitych i znaków (char), a otrzymano ${typeName(v.t)}`, s.line);
    }
    let start = -1;
    for (let k = 0; k < s.cases.length; k++) {
      const c = s.cases[k];
      if (c.test && this.eval(c.test, env).v === v.v) { start = k; break; }
    }
    if (start === -1) start = s.cases.findIndex((c) => c.isDefault);
    if (start === -1) return undefined;
    const senv = new Env(env);
    for (let k = start; k < s.cases.length; k++) {
      for (const st of s.cases[k].body) {
        const r = this.execStmt(st, senv);
        if (r === BREAK) { this.destroyScope(senv); return undefined; }
        if (r) { this.destroyScope(senv); return r; }
      }
    }
    this.destroyScope(senv);
    return undefined;
  }

  execForRange(s, env) {
    let elems;
    if (s.expr.kind === 'InitList') {
      elems = s.expr.items.map((it) => this.tempCell(this.eval(it, env)));
    } else {
      const c = this.isLvalueNode(s.expr, env) ? this.evalLV(s.expr, env) : this.tempCell(this.eval(s.expr, env));
      if (isArrT(c.t) || isVecT(c.t)) elems = c.v.cells.slice();
      else if (c.t === 'string') elems = Array.from({ length: c.v.length }, (_, k) => new CharRef(c, k));
      else throw new CppError(`pętla for (... : ...) wymaga tablicy, wektora lub napisu, a otrzymano ${typeName(c.t)}`, s.line);
    }
    for (const el of elems) {
      const le = new Env(env);
      if (s.isRef) le.vars.set(s.name, el);
      else {
        const t = s.type === 'auto' ? el.t : s.type;
        le.vars.set(s.name, this.newCell(t, this.convert({ t: el.t, v: el.v }, t, s.line)));
      }
      const r = this.execScoped(s.body, le);
      if (r === BREAK) break;
      if (r && r !== CONTINUE) return r;
      this.step(s.line);
    }
    return undefined;
  }

  intOf(tv, line) {
    if (!isIntegral(tv.t)) throw new CppError(`oczekiwano liczby całkowitej, a otrzymano ${typeName(tv.t)}`, line);
    return tv.v;
  }

  execVarDecl(node, env) {
    for (const d of node.decls) {
      const line = d.line;
      this.curLine = line;
      if (env.vars.has(d.name)) throw new CppError(`ponowna deklaracja zmiennej '${d.name}' w tym samym zakresie`, line);
      const t = d.type;
      if (d.isRef) {
        if (!d.init) throw new CppError(`referencja '${d.name}' musi być od razu powiązana ze zmienną (np. int& ${d.name} = x;)`, line);
        let lv;
        if (this.isLvalueNode(d.init, env)) lv = this.evalLV(d.init, env);
        else if (node.isConst) lv = this.tempCell(this.eval(d.init, env));
        else throw new CppError('referencję można powiązać tylko ze zmienną (nie z wartością tymczasową)', line);
        if (t !== 'auto' && !sameType(t, lv.t)) {
          if (isClsT(t) && isClsT(lv.t) && this.isDerived(this.classes.get(lv.t.cls), t.cls)) {
            env.vars.set(d.name, new StaticView(lv, t));
            continue;
          }
          throw new CppError(`nie można powiązać referencji typu ${typeName(t)}& ze zmienną typu ${typeName(lv.t)}`, line);
        }
        env.vars.set(d.name, lv);
        continue;
      }
      let cell;
      if (d.dims.length) {
        const dims = d.dims.map((e) => (e === null ? null : this.intOf(this.eval(e, env), line)));
        if (dims[0] === null) {
          if (d.init && d.init.kind === 'InitList') dims[0] = d.init.items.length;
          else if (d.init && d.init.kind === 'Str') dims[0] = d.init.v.length + 1;
          else throw new CppError(`nie podano rozmiaru tablicy '${d.name}'`, line);
        }
        if (dims.some((x) => x === null)) throw new CppError('w tablicy wielowymiarowej trzeba podać rozmiar każdego wymiaru (poza pierwszym)', line);
        if (dims.some((x) => x <= 0)) throw new CppError(`rozmiar tablicy '${d.name}' musi być dodatni (podano ${dims.join('×')})`, line);
        if (dims.reduce((a, b) => a * b, 1) > 5_000_000) throw new CppError(`tablica '${d.name}' jest zbyt duża`, line);
        const arr = this.createArray(t, dims, false, line);
        cell = new Cell(this.arrType(t, dims), arr, arr.base);
        if (d.init) {
          if (d.init.kind === 'InitList') this.fillArray(arr, d.init, env, line);
          else if (d.init.kind === 'Str' && t === 'char') this.fillCharArray(arr, d.init.v, line);
          else throw new CppError('tablicę inicjalizujemy listą wartości w nawiasach klamrowych, np. {1, 2, 3}', line);
        }
        if (isClsT(t)) (env.objs ||= []).push(cell);
      } else if (t === 'auto') {
        if (!d.init) throw new CppError(`zmienna 'auto ${d.name}' musi mieć wartość początkową`, line);
        const tv = this.eval(d.init.kind === 'InitList' ? d.init.items[0] : d.init, env);
        let at = tv.t;
        if (isArrT(at)) at = { ptr: at.arr };
        if (at === 'void') throw new CppError('nie można przypisać wyniku funkcji void', line);
        cell = this.newCell(at, this.convert(tv, at, line));
      } else if (isClsT(t)) {
        const info = this.classInfo(t.cls, line);
        let obj;
        if (d.ctorArgs) obj = this.constructObject(info, d.ctorArgs.map((a) => this.evalArg(a, env)), line);
        else if (d.init && d.init.kind === 'InitList') obj = this.constructObject(info, d.init.items.map((a) => this.evalArg(a, env)), line);
        else if (d.init) {
          obj = ['Construct', 'Call', 'New'].includes(d.init.kind)
            ? this.convert(this.eval(d.init, env), t, line)
            : this.copyConstruct(this.evalArg(d.init, env), t, line);
        }
        else obj = this.constructObject(info, [], line);
        cell = this.newCell(t, obj);
        (env.objs ||= []).push(cell);
      } else if (isVecT(t)) {
        let v;
        if (d.ctorArgs) v = this.vecFromArgs(t, d.ctorArgs, env, line);
        else if (d.init && d.init.kind === 'InitList') v = this.vecFromList(t.vec, d.init, env, line);
        else if (d.init) v = this.convert(this.eval(d.init, env), t, line);
        else v = this.makeVec(t.vec);
        cell = this.newCell(t, v);
      } else {
        let v;
        if (d.ctorArgs) {
          if (t === 'string' && d.ctorArgs.length === 2) v = this.stringRepeat(d.ctorArgs, env, line);
          else v = d.ctorArgs.length ? this.convert(this.eval(d.ctorArgs[0], env), t, line) : this.defaultValue(t, line);
        } else if (d.init) {
          const init = d.init.kind === 'InitList' ? d.init.items[0] : d.init;
          if (init) {
            const tv = this.eval(init, env);
            if (d.init.kind === 'InitList' && isFloatT(tv.t) && isIntegral(t)) {
              throw new CppError(`zawężająca konwersja double → ${t} w inicjalizacji klamrowej { }`, line);
            }
            if (isFloatT(tv.t) && isIntegral(t) && t !== 'bool' && init.kind !== 'Cast') {
              this.warn(line, `niejawna konwersja ${typeName(tv.t)} → ${typeName(t)} – część ułamkowa zostanie obcięta (użyj jawnego rzutowania, jeśli to zamierzone)`);
            }
            v = this.convert(tv, t, line);
          } else v = this.defaultValue(t, line);
        } else v = this.defaultValue(t, line);
        cell = this.newCell(t, v);
      }
      if (node.isConst) {
        if (!d.init && !d.ctorArgs) throw new CppError(`stała '${d.name}' musi mieć wartość początkową`, line);
        cell.isConst = true;
      }
      env.vars.set(d.name, cell);
    }
  }

  stringRepeat(args, env, line) {
    const n = this.intOf(this.eval(args[0], env), line);
    const c = this.eval(args[1], env);
    if (c.t !== 'char') throw new CppError('string(n, znak) – drugi argument musi być znakiem, np. \'*\'', line);
    return String.fromCharCode(c.v).repeat(Math.max(0, n));
  }

  fillArray(arr, list, env, line) {
    const items = list.items;
    if (isArrT(arr.et)) {
      if (items.length && items[0].kind === 'InitList') {
        if (items.length > arr.cells.length) throw new CppError('za dużo wierszy w inicjalizacji tablicy', line);
        items.forEach((it, k) => this.fillArray(arr.cells[k].v, it, env, line));
      } else {
        // płaska lista dla tablicy wielowymiarowej
        const leaves = [];
        const collect = (a) => a.cells.forEach((c) => (isArrT(c.t) ? collect(c.v) : leaves.push(c)));
        collect(arr);
        if (items.length > leaves.length) throw new CppError('za dużo elementów w inicjalizacji tablicy', line);
        items.forEach((it, k) => this.assignInto(leaves[k], this.eval(it, env), line, true));
      }
      return;
    }
    if (items.length > arr.cells.length) {
      throw new CppError(`za dużo elementów w inicjalizacji tablicy (rozmiar ${arr.cells.length}, podano ${items.length})`, line);
    }
    items.forEach((it, k) => {
      const c = arr.cells[k];
      if (isClsT(c.t)) {
        const args = it.kind === 'InitList' ? it.items.map((a) => this.evalArg(a, env)) : [this.evalArg(it, env)];
        c.v = this.constructObject(this.classInfo(c.t.cls, line), args, line);
      } else this.assignInto(c, this.eval(it, env), line, true);
    });
  }

  fillCharArray(arr, s, line) {
    if (s.length + 1 > arr.cells.length) throw new CppError('napis jest za długi dla tej tablicy znaków (pamiętaj o miejscu na \\0)', line);
    for (let k = 0; k < arr.cells.length; k++) arr.cells[k].v = k < s.length ? s.charCodeAt(k) : 0;
  }

  vecFromArgs(t, args, env, line) {
    const vec = this.makeVec(t.vec);
    if (!args.length) return vec;
    if (args.length === 1 && args[0].kind !== 'InitList') {
      const a = this.eval(args[0], env);
      if (isVecT(a.t)) return this.copyValue(a.t, a.v);
      const n = this.intOf(a, line);
      if (n < 0) throw new CppError('rozmiar wektora nie może być ujemny', line);
      for (let k = 0; k < n; k++) this.vecPush(vec, { t: t.vec, v: this.defaultValue(t.vec, line) }, line);
      return vec;
    }
    if (args.length === 2) {
      const n = this.intOf(this.eval(args[0], env), line);
      const val = this.eval(args[1], env);
      for (let k = 0; k < n; k++) this.vecPush(vec, val, line);
      return vec;
    }
    if (args.length === 1) return this.vecFromList(t.vec, args[0], env, line);
    throw new CppError('nieobsługiwany sposób tworzenia wektora', line);
  }

  vecFromList(et, list, env, line) {
    const vec = this.makeVec(et);
    for (const it of list.items) {
      if (it.kind === 'InitList') {
        if (isVecT(et)) this.vecPush(vec, { t: et, v: this.vecFromList(et.vec, it, env, line) }, line);
        else if (isClsT(et)) this.vecPush(vec, { t: et, v: this.constructObject(this.classInfo(et.cls, line), it.items.map((a) => this.evalArg(a, env)), line) }, line);
        else throw new CppError('niepoprawna lista inicjalizacyjna wektora', line);
      } else this.vecPush(vec, this.eval(it, env), line);
    }
    return vec;
  }

  // ---------- konwersje ----------
  fitNumber(v, t) {
    switch (t) {
      case 'int': return Number.isFinite(v) ? Math.trunc(v) | 0 : -2147483648;
      case 'short': return (Math.trunc(v) << 16) >> 16;
      case 'long': return Number.isFinite(v) ? Math.trunc(v) : -9223372036854775808;
      case 'unsigned': return Math.trunc(v) >>> 0;
      case 'char': return Math.trunc(v) & 0xffff;
      case 'bool': return v ? 1 : 0;
      case 'float': return Math.fround(v);
      default: return v;
    }
  }

  convert(tv, t, line) {
    const s = tv.t;
    if (isPrim(t)) {
      if (t === 'string') {
        if (s === 'string') return tv.v;
        if (s === 'char') return String.fromCharCode(tv.v);
        if (isArrT(s) && s.arr === 'char') return this.cString(tv.v);
        if (isPtrT(s) && s.ptr === 'char') return this.cStringPtr(tv.v, line);
        if (isNumeric(s)) throw new CppError(`nie można zamienić liczby (${typeName(s)}) na string – użyj to_string(...)`, line);
        throw new CppError(`nie można zamienić ${typeName(s)} na string`, line);
      }
      if (isNumeric(t)) {
        if (isNumeric(s)) return this.fitNumber(tv.v, t);
        if (isPtrT(s) && t === 'bool') return this.isNull(tv.v) ? 0 : 1;
        if (s === 'istream') return this.inFail ? 0 : 1;
        if (s === 'void') throw new CppError('funkcja typu void nie zwraca wartości – nie można użyć jej wyniku', line);
        if (s === 'string') throw new CppError(`nie można zamienić string na ${t} – użyj ${isFloatT(t) ? 'stod' : 'stoi'}(...)`, line);
        throw new CppError(`nie można zamienić ${typeName(s)} na ${typeName(t)}`, line);
      }
      if (t === 'void') return undefined;
      return tv.v;
    }
    if (isPtrT(t)) {
      if (isPtrT(s)) {
        if (!sameType(s, t) && !this.isNull(tv.v)) {
          if (isClsT(s.ptr) && isClsT(t.ptr) && this.isDerived(this.classes.get(s.ptr.cls), t.ptr.cls)) return tv.v;
          if (isClsT(s.ptr) && isClsT(t.ptr) && this.isDerived(this.classes.get(t.ptr.cls), s.ptr.cls)) {
            throw new CppError(`nie można niejawnie zamienić wskaźnika na klasę bazową (${typeName(s)}) na wskaźnik klasy pochodnej (${typeName(t)})`, line);
          }
          throw new CppError(`nie można przypisać wskaźnika ${typeName(s)} do wskaźnika ${typeName(t)}`, line);
        }
        return tv.v;
      }
      if (isArrT(s)) return { kind: 'ptr', cell: null, arr: tv.v, idx: 0 };
      if (isIntegral(s) && tv.v === 0) return NULLPTR;
      if (s === 'string' && t.ptr === 'char') {
        const arr = this.createArray('char', [tv.v.length + 1], false, line);
        this.fillCharArray(arr, tv.v, line);
        return { kind: 'ptr', cell: null, arr, idx: 0 };
      }
      if (isNumeric(s)) throw new CppError(`nie można przypisać liczby do wskaźnika – wskaźnik przechowuje adres (użyj &zmienna)`, line);
      throw new CppError(`nie można przypisać ${typeName(s)} do wskaźnika ${typeName(t)}`, line);
    }
    if (isClsT(t)) {
      if (isClsT(s) && this.isDerived(this.classes.get(s.cls), t.cls)) {
        return this.copyObj(tv.v, s.cls === t.cls ? null : this.classes.get(t.cls));
      }
      if (!isClsT(s)) {
        const info = this.classInfo(t.cls, line);
        const conv = info.ctors.find((c) => c.params.length === 1);
        if (conv) return this.constructObject(info, [this.tempCell(tv)], line);
      }
      throw new CppError(`nie można zamienić ${typeName(s)} na obiekt klasy ${t.cls}`, line);
    }
    if (isVecT(t)) {
      if (isVecT(s)) return this.copyValue(s, tv.v);
      throw new CppError(`nie można zamienić ${typeName(s)} na ${typeName(t)}`, line);
    }
    if (isArrT(t)) {
      if (isArrT(s)) return this.copyValue(s, tv.v);
      throw new CppError(`nie można zamienić ${typeName(s)} na tablicę`, line);
    }
    return tv.v;
  }

  cString(arr) {
    let s = '';
    for (const c of arr.cells) { if (c.v === 0) break; s += String.fromCharCode(c.v); }
    return s;
  }

  cStringPtr(p, line) {
    if (this.isNull(p)) throw new CppError('wypisywanie pustego wskaźnika char*', line, 'runtime');
    if (!p.arr) return String.fromCharCode(p.cell.v);
    let s = '';
    for (let k = p.idx; k < p.arr.cells.length; k++) { const v = p.arr.cells[k].v; if (v === 0) break; s += String.fromCharCode(v); }
    return s;
  }

  assignInto(lv, R, line, init = false) {
    if (lv.isConst && !init) throw new CppError('nie można zmienić wartości stałej (const)', line, 'compile');
    const t = lv.t;
    if (isArrT(t)) {
      if (!init) throw new CppError('nie można przypisać całej tablicy naraz – kopiuj elementy w pętli', line);
      lv.v = this.convert(R, t, line);
      return;
    }
    if (isClsT(t)) {
      if (!isClsT(R.t)) { lv.v = this.convert(R, t, line); return; }
      if (!this.isDerived(this.classes.get(R.t.cls), t.cls)) throw new CppError(`nie można przypisać obiektu ${R.t.cls} do zmiennej typu ${t.cls}`, line);
      if (R.v === lv.v) return;
      if (!lv.v) { lv.v = this.copyObj(R.v); return; }
      if (lv.v.union) { new Uint8Array(lv.v.union.view.buffer).set(new Uint8Array(R.v.union.view.buffer)); return; }
      for (const [k, c] of lv.v.fields) {
        const sc = R.v.fields.get(k);
        if (sc) c.v = this.copyValue(sc.t, sc.v);
      }
      return;
    }
    lv.v = this.convert(R, t, line);
  }

  truthy(tv, line) {
    const t = tv.t;
    if (isNumeric(t)) return tv.v !== 0;
    if (isPtrT(t)) return !this.isNull(tv.v);
    if (t === 'istream') return !this.inFail;
    if (t === 'string') throw new CppError('napis (string) nie może być warunkiem – porównaj go, np. s == "tak" lub s.empty()', line);
    if (t === 'void') throw new CppError('funkcja void nie zwraca wartości – nie może być warunkiem', line);
    throw new CppError(`wartość typu ${typeName(t)} nie może być użyta jako warunek`, line);
  }

  // ---------- wyrażenia ----------
  isLvalueNode(node, env) {
    switch (node.kind) {
      case 'Ident': return !!env.lookup(node.name);
      case 'Index': case 'PreInc': case 'Assign': return true;
      case 'Member': case 'StaticRef': return true;
      case 'Unary': return node.op === '*';
      case 'Ternary': return this.isLvalueNode(node.a, env) && this.isLvalueNode(node.b, env);
      default: return false;
    }
  }

  evalArg(node, env) {
    if (node.kind === 'InitList') return this.tempCell({ t: 'initlist', v: node });
    if (this.isLvalueNode(node, env)) return this.evalLV(node, env);
    const tv = this.eval(node, env);
    return tv.ref || this.tempCell(tv);
  }

  evalLV(node, env) {
    switch (node.kind) {
      case 'Ident': {
        const c = env.lookup(node.name);
        if (c) return c;
        if (STD_NAMES.has(node.name)) throw new CppError(`'${node.name}' nie jest zmienną`, node.line);
        throw this.undeclared(node);
      }
      case 'Index': return this.evalIndexLV(node, env);
      case 'Member': return this.evalMemberLV(node, env);
      case 'StaticRef': return this.staticRefLV(node);
      case 'Unary':
        if (node.op === '*') {
          const p = this.eval(node.e, env);
          if (isArrT(p.t)) return this.deref({ kind: 'ptr', arr: p.v, idx: 0 }, node.line);
          if (!isPtrT(p.t)) throw new CppError(`operator * (dereferencja) wymaga wskaźnika, a otrzymano ${typeName(p.t)}`, node.line);
          return this.deref(p.v, node.line);
        }
        break;
      case 'PreInc': {
        const lv = this.evalLV(node.e, env);
        this.incr(lv, node.op === '++' ? 1 : -1, node.line);
        return lv;
      }
      case 'Assign': return this.evalAssignLV(node, env);
      case 'Ternary':
        return this.truthy(this.eval(node.c, env), node.line) ? this.evalLV(node.a, env) : this.evalLV(node.b, env);
      case 'Call':
        if (node.callee.kind === 'Member' && ['at', 'back', 'front'].includes(node.callee.name)) return this.callMethod(node, env, true);
        {
          const tv = this.eval(node, env);
          if (tv.ref) return tv.ref;
        }
        break;
      default: break;
    }
    throw new CppError('to wyrażenie nie jest zmienną (l-wartością) – nie można mu przypisać wartości ani wczytać do niego danych', node.line);
  }

  undeclared(node) {
    const n = node.name;
    const hints = {
      cout: "– dodaj 'using namespace std;'", cin: "– dodaj 'using namespace std;'", endl: "– dodaj 'using namespace std;'",
      Cout: '– w C++ wielkość liter ma znaczenie, pisz: cout', Cin: '– pisz małymi literami: cin', print: '– w C++ wypisujemy przez cout << ...',
      string: "– dodaj 'using namespace std;'",
    };
    return new CppError(`'${n}' nie zostało zadeklarowane w tym zakresie ${hints[n] || '(sprawdź pisownię i czy zmienna została zadeklarowana wcześniej)'}`, node.line);
  }

  eval(node, env) {
    switch (node.kind) {
      case 'Num': return { t: node.t, v: node.v };
      case 'Str': return { t: 'string', v: node.v, lit: true };
      case 'Char': return { t: 'char', v: node.v };
      case 'Null': return { t: { ptr: 'void' }, v: NULLPTR };
      case 'Ident': {
        const c = env.lookup(node.name);
        if (c) return { t: c.t, v: c.v };
        return this.special(node);
      }
      case 'Assign': { const lv = this.evalAssignLV(node, env); return { t: lv.t, v: lv.v }; }
      case 'Binary': return this.evalBinary(node, env);
      case 'Unary': return this.evalUnary(node, env);
      case 'PreInc': { const lv = this.evalLV(node, env); return { t: lv.t, v: lv.v }; }
      case 'PostInc': {
        const lv = this.evalLV(node.e, env);
        const old = { t: lv.t, v: isClsT(lv.t) ? this.copyObj(lv.v) : lv.v };
        this.incr(lv, node.op === '++' ? 1 : -1, node.line);
        return old;
      }
      case 'Ternary': {
        const r = this.truthy(this.eval(node.c, env), node.line) ? this.eval(node.a, env) : this.eval(node.b, env);
        return r;
      }
      case 'Comma': this.eval(node.l, env); return this.eval(node.r, env);
      case 'Call': return this.evalCall(node, env);
      case 'Index': { const c = this.evalIndexLV(node, env); return { t: c.t, v: c.v }; }
      case 'Member': { const c = this.evalMemberLV(node, env); return { t: c.t, v: c.v }; }
      case 'StaticRef': { const c = this.staticRefLV(node); return { t: c.t, v: c.v }; }
      case 'Cast': {
        const tv = this.eval(node.e, env);
        if (isPrim(node.type) && isNumeric(node.type) && !isNumeric(tv.t) && !isPtrT(tv.t)) {
          throw new CppError(`nie można rzutować ${typeName(tv.t)} na ${typeName(node.type)}`, node.line);
        }
        return { t: node.type, v: this.convert(tv, node.type, node.line) };
      }
      case 'Construct': return this.evalConstruct(node, env);
      case 'New': return this.evalNew(node, env);
      case 'Delete': this.evalDelete(node, env); return VOID;
      case 'This': {
        const fr = this.frames[this.frames.length - 1];
        if (!fr || !fr.thisCell) throw new CppError("'this' można użyć tylko wewnątrz metody klasy", node.line);
        return { t: { ptr: fr.thisCell.t }, v: { kind: 'ptr', cell: fr.thisCell, arr: null, idx: 0 } };
      }
      case 'Sizeof': {
        if (node.type) return { t: 'long', v: this.sizeOf(node.type) };
        const tv = node.e.kind === 'Ident' && env.lookup(node.e.name) ? env.lookup(node.e.name) : this.eval(node.e, env);
        return { t: 'long', v: this.sizeOf(tv.t) };
      }
      case 'Limits': {
        const t = node.type;
        const lim = { int: [2147483647, -2147483648], long: [9223372036854775807, -9223372036854775808], short: [32767, -32768], char: [127, -128], unsigned: [4294967295, 0], double: [1.7976931348623157e308, 2.2250738585072014e-308], float: [3.4028234663852886e38, 1.1754943508222875e-38], bool: [1, 0] };
        const pair = lim[t] || lim.int;
        return { t: isPrim(t) ? t : 'int', v: node.fn === 'max' ? pair[0] : (node.fn === 'lowest' ? -pair[0] : pair[1]) };
      }
      case 'Comparator': return { t: 'comparator', v: node.name };
      case 'InitList': throw new CppError('lista w nawiasach { } nie jest tutaj dozwolona', node.line);
      default: throw new CppError(`nieobsługiwane wyrażenie (${node.kind})`, node.line);
    }
  }

  special(node) {
    const name = node.name;
    if (STD_NAMES.has(name)) {
      if (!this.usingStd && !node.std) {
        throw new CppError(`'${name}' nie zostało zadeklarowane – dodaj linijkę 'using namespace std;' (albo pisz std::${name})`, node.line);
      }
      if ((name === 'cout' || name === 'cin' || name === 'cerr') && !this.hasIostream) {
        throw new CppError(`'${name}' wymaga biblioteki – dodaj na początku programu: #include <iostream>`, node.line);
      }
    }
    switch (name) {
      case 'cout': return { t: 'ostream', v: 'out' };
      case 'cerr': return { t: 'ostream', v: 'err' };
      case 'cin': return { t: 'istream', v: 'in' };
      case 'endl': return { t: 'manip', v: { kind: 'endl' } };
      case 'fixed': case 'scientific': case 'left': case 'right': case 'boolalpha': case 'noboolalpha':
      case 'hex': case 'oct': case 'dec': case 'showpos': case 'noshowpos':
        return { t: 'manip', v: { kind: name } };
      case 'INT_MAX': return { t: 'int', v: 2147483647 };
      case 'INT_MIN': return { t: 'int', v: -2147483648 };
      case 'LLONG_MAX': return { t: 'long', v: 9223372036854775807 };
      case 'LLONG_MIN': return { t: 'long', v: -9223372036854775808 };
      case 'RAND_MAX': return { t: 'int', v: 2147483647 };
      case 'M_PI': return { t: 'double', v: Math.PI };
      case 'EOF': return { t: 'int', v: -1 };
      default: break;
    }
    const frs = this.frames[this.frames.length - 1];
    if (frs && frs.cls && !frs.thisCell && this.findField(frs.cls, name)) {
      throw new CppError(`metoda statyczna nie ma dostępu do pola '${name}' – pola należą do konkretnych obiektów, a metoda statyczna nie ma wskaźnika this`, node.line);
    }
    if (this.functions.has(name) || this.builtinNames.has(name)) {
      throw new CppError(`'${name}' to funkcja – aby ją wywołać, dopisz nawiasy: ${name}(...)`, node.line);
    }
    throw this.undeclared(node);
  }

  incr(lv, d, line) {
    if (lv.isConst) throw new CppError('nie można zmienić wartości stałej (const)', line);
    const t = lv.t;
    if (isNumeric(t)) { lv.v = this.fitNumber(lv.v + d, t === 'bool' ? 'int' : t); return; }
    if (isPtrT(t)) { lv.v = this.ptrAdd(lv.v, d, line); return; }
    if (isClsT(t)) {
      const op = d > 0 ? '++' : '--';
      const self = { t, v: lv.v };
      if (this.callOperator(op, self, null, line, [lv]) || this.callOperator(op, self, { t: 'int', v: 0 }, line, [lv])) return;
      throw new CppError(`klasa '${t.cls}' nie ma operatora ${op} – zdefiniuj metodę operator${op}()`, line);
    }
    throw new CppError(`operator ${d > 0 ? '++' : '--'} nie działa dla typu ${typeName(t)}`, line);
  }

  ptrAdd(p, n, line) {
    if (p.arr) return { kind: 'ptr', cell: null, arr: p.arr, idx: p.idx + n };
    if (n === 0) return p;
    if (!p.cell) throw new CppError('arytmetyka na pustym wskaźniku (nullptr)', line, 'runtime');
    return { kind: 'ptr', cell: null, arr: { kind: 'arr', et: p.cell.t, cells: [p.cell], base: p.cell.addr }, idx: n };
  }

  evalAssignLV(node, env) {
    const lv = this.evalLV(node.l, env);
    if (lv.isConst) throw new CppError('nie można zmienić wartości stałej (const)', node.line);
    if (node.r.kind === 'InitList') {
      if (node.op !== '=') throw new CppError('niepoprawne użycie listy { }', node.line);
      if (isVecT(lv.t)) lv.v = this.vecFromList(lv.t.vec, node.r, env, node.line);
      else if (isClsT(lv.t)) lv.v = this.constructObject(this.classInfo(lv.t.cls, node.line), node.r.items.map((a) => this.evalArg(a, env)), node.line);
      else if (node.r.items.length === 1) this.assignInto(lv, this.eval(node.r.items[0], env), node.line);
      else throw new CppError('niepoprawne przypisanie listy { }', node.line);
      return lv;
    }
    const R = this.eval(node.r, env);
    if (node.op === '=') {
      if (isFloatT(R.t) && isIntegral(lv.t) && lv.t !== 'bool' && node.r.kind !== 'Cast') {
        this.warn(node.line, `niejawna konwersja ${typeName(R.t)} → ${typeName(lv.t)} – część ułamkowa zostanie obcięta`);
      }
      this.assignInto(lv, R, node.line);
      return lv;
    }
    const bop = node.op.slice(0, -1);
    if (isClsT(lv.t)) {
      const self = { t: lv.t, v: lv.v };
      if (this.callOperator(node.op, self, R, node.line, [lv, null])) return lv;
      const r = this.callOperator(bop, self, R, node.line, [lv, null]);
      if (!r) throw new CppError(`klasa '${lv.t.cls}' nie ma operatora ${node.op} ani ${bop} – zdefiniuj operator${node.op}(...)`, node.line);
      this.assignInto(lv, r, node.line);
      return lv;
    }
    if (lv.t === 'string' && bop === '+') {
      lv.v += this.strOperand(R, node.line);
      return lv;
    }
    const res = this.binop(bop, { t: lv.t, v: lv.v }, R, node.line);
    if (isPtrT(lv.t)) lv.v = res.v;
    else this.assignInto(lv, res, node.line);
    return lv;
  }

  strOperand(tv, line) {
    if (tv.t === 'string') return tv.v;
    if (tv.t === 'char') return String.fromCharCode(tv.v);
    if (isArrT(tv.t) && tv.t.arr === 'char') return this.cString(tv.v);
    if (isNumeric(tv.t)) throw new CppError('nie można dodać liczby do napisu – zamień ją najpierw: to_string(liczba)', line);
    throw new CppError(`nie można dodać ${typeName(tv.t)} do napisu`, line);
  }

  evalBinary(node, env) {
    const op = node.op;
    if (op === '&&') {
      if (!this.truthy(this.eval(node.l, env), node.line)) return BOOL(false);
      return BOOL(this.truthy(this.eval(node.r, env), node.line));
    }
    if (op === '||') {
      if (this.truthy(this.eval(node.l, env), node.line)) return BOOL(true);
      return BOOL(this.truthy(this.eval(node.r, env), node.line));
    }
    const L = this.eval(node.l, env);
    if (L.t === 'ostream') {
      if (op !== '<<') throw new CppError("cout używa operatora '<<' (strzałki w stronę cout), nie '" + op + "'", node.line);
      const R = this.eval(node.r, env);
      if (isClsT(R.t)) {
        const r = this.callOperator('<<', L, R, node.line);
        if (!r) {
          throw new CppError(`cout nie potrafi wypisać obiektu klasy ${R.t.cls} – zdefiniuj operator<<, np. friend ostream& operator<<(ostream& os, const ${R.t.cls}& x)`, node.line);
        }
        return r.t === 'ostream' ? r : L;
      }
      this.print(R, node.line, L.v);
      return L;
    }
    if (L.t === 'istream') {
      if (op !== '>>') throw new CppError("cin używa operatora '>>' (strzałki w stronę zmiennej), nie '" + op + "'", node.line);
      if (!this.isLvalueNode(node.r, env)) {
        if (node.r.kind === 'Ident') throw this.undeclared(node.r);
        throw new CppError('cin >> wymaga zmiennej, do której zostaną wczytane dane', node.line);
      }
      const target = this.evalLV(node.r, env);
      if (isClsT(target.t)) {
        const r = this.callOperator('>>', L, target, node.line, [null, target]);
        if (!r) throw new CppError(`cin nie potrafi wczytać obiektu klasy ${target.t.cls} – zdefiniuj operator>>, np. friend istream& operator>>(istream& is, ${target.t.cls}& x)`, node.line);
        return L;
      }
      this.read(target, node.line);
      return L;
    }
    const R = this.eval(node.r, env);
    return this.binop(op, L, R, node.line);
  }

  binop(op, L, R, line) {
    const lt = L.t, rt = R.t;
    if (lt === 'void' || rt === 'void') throw new CppError('funkcja typu void nie zwraca wartości – nie można użyć jej w wyrażeniu', line);
    if (isClsT(lt) || isClsT(rt)) {
      const r = this.callOperator(op, L, R, line);
      if (r) return r;
      throw new CppError(`brak operatora '${op}' dla typów ${typeName(lt)} i ${typeName(rt)} – zdefiniuj funkcję operator${op}(...)`, line);
    }
    if (lt === 'string' || rt === 'string') {
      if (op === '+') {
        if (L.lit && R.lit) throw new CppError('nie można dodać do siebie dwóch literałów "..." – zamień jeden na string, np. string("abc") + "def"', line);
        return { t: 'string', v: this.strOperand(L, line) + this.strOperand(R, line) };
      }
      if (['==', '!=', '<', '>', '<=', '>='].includes(op)) {
        if (lt !== 'string' || rt !== 'string') {
          if (lt === 'char' || rt === 'char') throw new CppError("nie można porównać string ze znakiem char – użyj cudzysłowu \"a\" zamiast apostrofów 'a' (lub porównaj s[i] == 'a')", line);
          throw new CppError(`nie można porównać ${typeName(lt)} z ${typeName(rt)}`, line);
        }
        const a = L.v, b = R.v;
        const r = { '==': a === b, '!=': a !== b, '<': a < b, '>': a > b, '<=': a <= b, '>=': a >= b }[op];
        return BOOL(r);
      }
      throw new CppError(`operator '${op}' nie działa dla napisów (string)`, line);
    }
    if (isPtrT(lt) || isArrT(lt) || isPtrT(rt) || isArrT(rt)) return this.ptrBinop(op, L, R, line);
    if (!isNumeric(lt) || !isNumeric(rt)) {
      throw new CppError(`operator '${op}' nie działa dla typów ${typeName(lt)} i ${typeName(rt)}`, line);
    }
    const a = L.v, b = R.v;
    const isF = isFloatT(lt) || isFloatT(rt);
    const rtype = isF ? 'double' : ((lt === 'long' || rt === 'long' || lt === 'unsigned' || rt === 'unsigned') ? 'long' : 'int');
    switch (op) {
      case '+': return { t: rtype, v: this.fitNumber(a + b, rtype) };
      case '-': return { t: rtype, v: this.fitNumber(a - b, rtype) };
      case '*': return { t: rtype, v: rtype === 'int' ? Math.imul(a, b) : this.fitNumber(a * b, rtype) };
      case '/':
        if (isF) return { t: 'double', v: a / b };
        if (b === 0) throw new CppError('dzielenie przez zero!', line, 'runtime');
        return { t: rtype, v: this.fitNumber(Math.trunc(a / b), rtype) };
      case '%':
        if (isF) throw new CppError('operator % działa tylko dla liczb całkowitych (dla double użyj funkcji fmod)', line);
        if (b === 0) throw new CppError('dzielenie modulo przez zero!', line, 'runtime');
        return { t: rtype, v: a % b };
      case '<': return BOOL(a < b);
      case '>': return BOOL(a > b);
      case '<=': return BOOL(a <= b);
      case '>=': return BOOL(a >= b);
      case '==': return BOOL(a === b);
      case '!=': return BOOL(a !== b);
      case '&': case '|': case '^': case '<<': case '>>': {
        if (isF) throw new CppError(`operator '${op}' działa tylko dla liczb całkowitych`, line);
        let v;
        if (op === '&') v = a & b;
        else if (op === '|') v = a | b;
        else if (op === '^') v = a ^ b;
        else if (op === '<<') v = rtype === 'long' ? a * 2 ** b : a << b;
        else v = rtype === 'long' ? Math.floor(a / 2 ** b) : a >> b;
        return { t: rtype, v: this.fitNumber(v, rtype) };
      }
      default: throw new CppError(`nieznany operator '${op}'`, line);
    }
  }

  ptrBinop(op, L, R, line) {
    const toP = (tv) => (isArrT(tv.t) ? { kind: 'ptr', arr: tv.v, idx: 0, cell: null } : tv.v);
    const pt = (tv) => (isArrT(tv.t) ? { ptr: tv.t.arr } : tv.t);
    const lp = isPtrT(L.t) || isArrT(L.t);
    const rp = isPtrT(R.t) || isArrT(R.t);
    if ((op === '+' || op === '-') && lp && !rp && isIntegral(R.t)) {
      return { t: pt(L), v: this.ptrAdd(toP(L), op === '+' ? R.v : -R.v, line) };
    }
    if (op === '+' && rp && !lp && isIntegral(L.t)) return { t: pt(R), v: this.ptrAdd(toP(R), L.v, line) };
    if (op === '-' && lp && rp) {
      const a = toP(L), b = toP(R);
      if (a.arr !== b.arr) throw new CppError('odejmować można tylko wskaźniki do tej samej tablicy', line, 'runtime');
      return { t: 'long', v: a.idx - b.idx };
    }
    if (['==', '!=', '<', '>', '<=', '>='].includes(op)) {
      const addr = (tv, isP) => (isP ? this.ptrAddr(toP(tv)) : (tv.v === 0 ? 0 : NaN));
      const a = addr(L, lp), b = addr(R, rp);
      if (Number.isNaN(a) || Number.isNaN(b)) throw new CppError('wskaźnik można porównać tylko z innym wskaźnikiem lub nullptr', line);
      return BOOL({ '==': a === b, '!=': a !== b, '<': a < b, '>': a > b, '<=': a <= b, '>=': a >= b }[op]);
    }
    throw new CppError(`operator '${op}' nie działa dla wskaźników/tablic (${typeName(L.t)}, ${typeName(R.t)})`, line);
  }

  evalUnary(node, env) {
    const op = node.op;
    if (op === '&') {
      const lv = this.evalLV(node.e, env);
      return { t: { ptr: lv.t }, v: this.mkPtr(lv) };
    }
    if (op === '*') {
      const c = this.evalLV(node, env);
      return { t: c.t, v: c.v };
    }
    const v = this.eval(node.e, env);
    if (isClsT(v.t)) {
      const r = this.callOperator(op, v, null, node.line);
      if (r) return r;
      throw new CppError(`klasa '${v.t.cls}' nie ma operatora jednoargumentowego '${op}' – zdefiniuj operator${op}()`, node.line);
    }
    if (op === '!') return BOOL(!this.truthy(v, node.line));
    if (!isNumeric(v.t)) throw new CppError(`operator '${op}' nie działa dla typu ${typeName(v.t)}`, node.line);
    const rt = isFloatT(v.t) ? 'double' : (v.t === 'long' ? 'long' : 'int');
    if (op === '-') return { t: rt, v: this.fitNumber(-v.v, rt) };
    if (op === '+') return { t: rt, v: v.v };
    if (op === '~') {
      if (isFloatT(v.t)) throw new CppError("operator '~' działa tylko dla liczb całkowitych", node.line);
      return { t: rt, v: ~v.v };
    }
    throw new CppError(`nieznany operator '${op}'`, node.line);
  }

  evalIndexLV(node, env) {
    let cell;
    if (this.isLvalueNode(node.obj, env)) cell = this.evalLV(node.obj, env);
    else cell = this.tempCell(this.eval(node.obj, env));
    if (isClsT(cell.t)) {
      const iv = this.eval(node.idx, env);
      const r = this.callOperator('[]', { t: cell.t, v: cell.v }, iv, node.line, [cell, null]);
      if (!r) throw new CppError(`klasa '${cell.t.cls}' nie ma operatora [] – zdefiniuj operator[](int)`, node.line);
      return r.ref || this.tempCell(r);
    }
    const it = this.eval(node.idx, env);
    if (!isIntegral(it.t)) throw new CppError(`indeks musi być liczbą całkowitą, a otrzymano ${typeName(it.t)}`, node.line);
    const i = it.v;
    const t = cell.t;
    if (isArrT(t) || isVecT(t)) {
      const cells = cell.v.cells;
      if (i < 0 || i >= cells.length) {
        const what = isArrT(t) ? 'tablicy' : 'wektora';
        const range = cells.length ? `poprawne indeksy: 0..${cells.length - 1}` : 'jest pusty';
        throw new CppError(`indeks ${i} jest poza zakresem ${what} (rozmiar ${cells.length}, ${range}) – w prawdziwym C++ to błąd, który może zepsuć program`, node.line, 'runtime');
      }
      return cells[i];
    }
    if (t === 'string') {
      if (i === cell.v.length) { const z = this.tempCell({ t: 'char', v: 0 }); return z; }
      if (i < 0 || i > cell.v.length) {
        throw new CppError(`indeks ${i} jest poza zakresem napisu (długość ${cell.v.length}, poprawne indeksy: 0..${cell.v.length - 1})`, node.line, 'runtime');
      }
      return new CharRef(cell, i);
    }
    if (isPtrT(t)) return this.deref(this.ptrAdd(cell.v, i, node.line), node.line);
    throw new CppError(`operator [] nie działa dla typu ${typeName(t)}`, node.line);
  }

  evalObjCell(objNode, arrow, env, line) {
    if (arrow) {
      const tv = this.eval(objNode, env);
      if (!isPtrT(tv.t)) throw new CppError("operator '->' wymaga wskaźnika – dla zwykłego obiektu użyj kropki '.'", line);
      const target = this.deref(tv.v, line);
      if (isClsT(tv.t.ptr) && isClsT(target.t) && target.t.cls !== tv.t.ptr.cls) return new StaticView(target, tv.t.ptr);
      return target;
    }
    let c;
    if (this.isLvalueNode(objNode, env)) c = this.evalLV(objNode, env);
    else {
      const tv = this.eval(objNode, env);
      c = tv.ref || this.tempCell(tv);
    }
    if (isPtrT(c.t)) throw new CppError("to jest wskaźnik – do pól i metod obiektu przez wskaźnik używaj '->' (np. p->pole)", line);
    return c;
  }

  evalMemberLV(node, env) {
    const cell = this.evalObjCell(node.obj, node.arrow, env, node.line);
    const o = cell.v;
    if (!o || o.kind !== 'obj') {
      if (cell.t === 'string' || isVecT(cell.t)) throw new CppError(`'${node.name}' to metoda – dopisz nawiasy: .${node.name}()`, node.line);
      throw new CppError(`operator '${node.arrow ? '->' : '.'}' wymaga obiektu klasy lub struktury, a otrzymano ${typeName(cell.t)}`, node.line);
    }
    const staticCls = (isClsT(cell.t) && this.classes.get(cell.t.cls)) || o.cls;
    const fd = this.findField(staticCls, node.name);
    if (!fd) {
      const st = this.findStatic(staticCls, node.name);
      if (st) {
        if (!this.canAccess(st.owner, st.decl.access)) throw new CppError(`pole statyczne '${node.name}' jest niedostępne (${st.decl.access})`, node.line);
        return st.cell;
      }
      if (this.findMethods(o.cls, node.name)) throw new CppError(`'${node.name}' to metoda – wywołaj ją z nawiasami: ${node.name}()`, node.line);
      if (staticCls !== o.cls && this.findField(o.cls, node.name)) {
        throw new CppError(`pole '${node.name}' należy do klasy '${o.cls.name}', ale obiekt jest widziany jako '${staticCls.name}' (wskaźnik/referencja typu bazowego)`, node.line);
      }
      throw new CppError(`klasa '${o.cls.name}' nie ma pola '${node.name}'`, node.line);
    }
    if (!this.canAccess(fd.owner, fd.f.access)) {
      throw new CppError(`pole '${node.name}' jest ${fd.f.access === 'private' ? 'prywatne (private)' : 'chronione (protected)'} w klasie '${fd.owner.name}' – dostęp do niego mają tylko metody klasy (użyj metody publicznej, np. gettera)`, node.line);
    }
    return o.fields.get(node.name);
  }

  evalConstruct(node, env) {
    const t = node.type;
    const line = node.line;
    if (isClsT(t)) {
      const obj = this.constructObject(this.classInfo(t.cls, line), node.args.map((a) => this.evalArg(a, env)), line);
      return { t, v: obj };
    }
    if (isVecT(t)) return { t, v: this.vecFromArgs(t, node.args, env, line) };
    if (t === 'string') {
      if (node.args.length === 2) return { t, v: this.stringRepeat(node.args, env, line) };
      if (!node.args.length) return { t, v: '' };
      return { t, v: this.convert(this.eval(node.args[0], env), 'string', line) };
    }
    if (!node.args.length) return { t, v: this.defaultValue(t, line) };
    return { t, v: this.convert(this.eval(node.args[0], env), t, line) };
  }

  evalNew(node, env) {
    const t = node.type;
    const line = node.line;
    if (node.size) {
      const n = this.intOf(this.eval(node.size, env), line);
      if (n < 0) throw new CppError('rozmiar tablicy w new[] nie może być ujemny', line, 'runtime');
      if (n > 5_000_000) throw new CppError('tablica jest zbyt duża', line, 'runtime');
      const arr = this.createArray(t, [n], true, line);
      arr.heap = true;
      arr.isArrayNew = true;
      this.heapAllocs.push(arr);
      return { t: { ptr: t }, v: { kind: 'ptr', cell: null, arr, idx: 0 } };
    }
    let v;
    if (isClsT(t)) v = this.constructObject(this.classInfo(t.cls, line), node.args.map((a) => this.evalArg(a, env)), line, true);
    else v = node.args.length ? this.convert(this.eval(node.args[0], env), t, line) : this.defaultValue(t, line, true);
    const cell = this.newCell(t, v, true);
    cell.heap = true;
    this.heapAllocs.push(cell);
    return { t: { ptr: t }, v: { kind: 'ptr', cell, arr: null, idx: 0 } };
  }

  evalDelete(node, env) {
    const tv = this.eval(node.e, env);
    const line = node.line;
    if (!isPtrT(tv.t)) throw new CppError('delete można użyć tylko na wskaźniku', line);
    const p = tv.v;
    if (this.isNull(p)) return;
    if (p.arr) {
      if (!p.arr.heap) throw new CppError("delete można użyć tylko na pamięci zaalokowanej przez 'new'", line, 'runtime');
      if (p.arr.freed) throw new CppError('podwójne zwolnienie tej samej pamięci (double free)', line, 'runtime');
      if (p.idx !== 0) throw new CppError('delete[] wymaga wskaźnika na początek tablicy', line, 'runtime');
      if (p.arr.isArrayNew && !node.arr) this.warnings.push({ line, message: "tablicę utworzoną przez new[] zwalniamy przez delete[] (z nawiasami)" });
      for (let k = p.arr.cells.length - 1; k >= 0; k--) this.destroyObject(p.arr.cells[k], line);
      p.arr.freed = true;
      return;
    }
    if (!(p.cell.cell || p.cell).heap) throw new CppError("delete można użyć tylko na pamięci zaalokowanej przez 'new' (nie na zwykłej zmiennej)", line, 'runtime');
    if ((p.cell.cell || p.cell).freed) throw new CppError('podwójne zwolnienie tej samej pamięci (double free)', line, 'runtime');
    this.destroyObject(p.cell, line, isClsT(tv.t.ptr) ? this.classes.get(tv.t.ptr.cls) : null);
    (p.cell.cell || p.cell).freed = true;
  }

  // ---------- funkcje ----------
  chooseOverload(cands, args, line, name, isCtor = false) {
    const fits = cands.filter((f) => {
      const req = f.params.filter((p) => !p.def).length;
      return args.length >= req && args.length <= f.params.length;
    });
    if (!fits.length) {
      if (cands.length === 1) {
        const f = cands[0];
        const req = f.params.filter((p) => !p.def).length;
        const exp = req === f.params.length ? `${req}` : `od ${req} do ${f.params.length}`;
        throw new CppError(`${isCtor ? `konstruktor klasy '${name}'` : `funkcja '${name}'`} oczekuje ${exp} argumentów, a podano ${args.length}`, line);
      }
      throw new CppError(`brak ${isCtor ? `konstruktora klasy '${name}'` : `wersji funkcji '${name}'`} przyjmującej ${args.length} argument(ów)`, line);
    }
    if (fits.length === 1) return fits[0];
    let best = null, bestScore = -Infinity;
    for (const f of fits) {
      let score = 0;
      args.forEach((a, k) => { score += this.matchScore(f.params[k], a.t); });
      if (score > bestScore) { bestScore = score; best = f; }
    }
    return best;
  }

  matchScore(p, t) {
    const pt = p.isArray ? { arr: p.type } : p.type;
    if (sameType(pt, t)) return 4;
    if (isNumeric(pt) && isNumeric(t)) return p.isRef && !p.isConst ? -50 : (isFloatT(pt) === isFloatT(t) ? 2 : 1);
    if (isPtrT(pt) && isArrT(t) && sameType(pt.ptr, t.arr)) return 3;
    if (isPtrT(pt) && isPtrT(t) && isClsT(pt.ptr) && isClsT(t.ptr) && this.isDerived(this.classes.get(t.ptr.cls), pt.ptr.cls)) return 2;
    if (isClsT(pt) && isClsT(t) && this.isDerived(this.classes.get(t.cls), pt.cls)) return 2;
    if (isPtrT(pt) && pt.ptr === 'char' && t === 'string') return 2;
    if (pt === 'string' && (t === 'char' || (isArrT(t) && t.arr === 'char'))) return 1;
    return -100;
  }

  bindParams(fn, args, fenv, line) {
    const params = fn.params;
    if (args.length > params.length) throw new CppError(`za dużo argumentów w wywołaniu '${fn.name}' (oczekiwano ${params.length})`, line);
    params.forEach((p, k) => {
      let a = args[k];
      if (a === undefined) {
        if (!p.def) throw new CppError(`za mało argumentów w wywołaniu '${fn.name}'`, line);
        a = this.tempCell(this.eval(p.def, this.globalEnv));
      }
      if (!p.name) return;
      if (a.t === 'initlist') {
        const list = a.v;
        let v;
        if (isVecT(p.type)) v = this.vecFromList(p.type.vec, list, fenv, line);
        else if (isClsT(p.type)) v = this.constructObject(this.classInfo(p.type.cls, line), list.items.map((x) => this.evalArg(x, fenv)), line);
        else throw new CppError('lista { } nie pasuje do typu parametru', line);
        fenv.vars.set(p.name, this.newCell(p.type, v));
        return;
      }
      if (p.isArray) {
        if (isArrT(a.t)) { fenv.vars.set(p.name, a); return; }
        if (isPtrT(a.t) && a.v.arr && a.v.idx === 0) {
          fenv.vars.set(p.name, new Cell({ arr: a.v.arr.et, n: a.v.arr.cells.length }, a.v.arr, a.v.arr.base));
          return;
        }
        throw new CppError(`parametr '${p.name}' oczekuje tablicy, a przekazano ${typeName(a.t)}`, line);
      }
      if (p.isRef) {
        if (a.temp && !p.isConst && a.t !== 'ostream' && a.t !== 'istream') {
          throw new CppError(`do parametru referencyjnego '${p.name}' (${typeName(p.type)}&) trzeba przekazać zmienną, a nie wartość`, line);
        }
        if (!sameType(p.type, a.t)) {
          if (isClsT(p.type) && isClsT(a.t) && this.isDerived(this.classes.get(a.t.cls), p.type.cls)) {
            fenv.vars.set(p.name, new StaticView(a, p.type));
            return;
          }
          if (p.isConst) { fenv.vars.set(p.name, this.newCell(p.type, this.convert(a, p.type, line))); return; }
          throw new CppError(`parametr referencyjny '${p.name}' ma typ ${typeName(p.type)}&, a przekazano zmienną typu ${typeName(a.t)}`, line);
        }
        fenv.vars.set(p.name, a);
        return;
      }
      const c = this.newCell(p.type, isClsT(p.type) ? this.copyConstruct(a, p.type, line) : this.convert(a, p.type, line));
      fenv.vars.set(p.name, c);
      if (isClsT(p.type)) (fenv.objs ||= []).push(c);
    });
  }

  pushFrame(fn, cls, thisCell, line) {
    if (this.frames.length > 2000) {
      throw new CppError('przepełnienie stosu – zbyt głęboka rekurencja (czy funkcja rekurencyjna ma warunek zakończenia?)', line, 'runtime');
    }
    this.frames.push({ fn, cls, thisCell });
  }

  callFuncWithCells(fn, args, line, thisCell) {
    if (!fn.body) {
      throw new CppError(`funkcja '${fn.name}' została zadeklarowana, ale brakuje jej definicji (ciała { ... })`, line);
    }
    const base = thisCell ? this.objEnv(thisCell.v) : (fn.ownerCls ? this.classEnv(fn.ownerCls, null) : this.globalEnv);
    const fenv = new Env(base);
    this.bindParams(fn, args, fenv, line);
    this.pushFrame(fn, fn.ownerCls || null, thisCell, line);
    let r;
    const savedLine = this.curLine;
    try {
      r = this.execBlock(fn.body.stmts, fenv);
    } finally {
      this.frames.pop();
    }
    this.curLine = savedLine;
    if (fn.isCtor || fn.isDtor) return VOID;
    if (r && r.ret) {
      if (fn.ret === 'void') throw new CppError(`funkcja '${fn.name}' jest typu void – nie może zwracać wartości (usuń wartość po return)`, r.line || line);
      if (fn.ret === 'auto') return r.ret;
      if (fn.retRef && r.ret.ref) return { t: r.ret.ref.t, v: r.ret.ref.v, ref: r.ret.ref };
      return { t: fn.ret, v: this.convert(r.ret, fn.ret, r.line || line) };
    }
    if (r && r.ret === null && fn.ret !== 'void') {
      throw new CppError(`funkcja '${fn.name}' musi zwrócić wartość typu ${typeName(fn.ret)} (return bez wartości)`, line);
    }
    if (fn.ret === 'void') return VOID;
    if (fn.name === 'main' && !thisCell) return { t: 'int', v: 0 };
    throw new CppError(`funkcja '${fn.name}' zakończyła się bez instrukcji return – powinna zwrócić wartość typu ${typeName(fn.ret)}`, fn.body.line, 'runtime');
  }

  evalCall(node, env) {
    const c = node.callee;
    if (c.kind === 'Member') return this.callMethod(node, env, false);
    if (c.kind === 'StaticRef') return this.callScoped(node, env);
    if (c.kind !== 'Ident') throw new CppError('to wyrażenie nie jest funkcją i nie można go wywołać', node.line);
    const name = c.name;
    const line = node.line;
    const fr = this.frames[this.frames.length - 1];
    if (fr && fr.thisCell && !env.lookup(name)) {
      const ms = this.resolveMethods(fr.cls || fr.thisCell.v.cls, fr.thisCell.v.cls, name);
      if (ms) return this.invokeMethod(ms, fr.thisCell, node.args, env, line, name);
    }
    if (fr && fr.cls && !fr.thisCell && !env.lookup(name)) {
      const ms = this.findMethods(fr.cls, name);
      if (ms) {
        const args = node.args.map((a) => this.evalArg(a, env));
        const fn = this.chooseOverload(ms, args, line, name);
        if (!fn.isStatic) throw new CppError(`w metodzie statycznej nie można wywołać zwykłej metody '${name}' – brak obiektu (this)`, line);
        return this.callFuncWithCells(fn, args, line, null);
      }
    }
    const local = env.lookup(name);
    if (local) throw new CppError(`'${name}' jest zmienną, a nie funkcją – nie można jej wywołać`, line);
    const fns = this.functions.get(name);
    if (fns) {
      const args = node.args.map((a) => this.evalArg(a, env));
      const fn = this.chooseOverload(fns, args, line, name);
      return this.callFuncWithCells(fn, args, line, null);
    }
    if (this.builtinNames.has(name)) {
      if (STD_FUNCS.has(name) && !this.usingStd && !c.std) {
        throw new CppError(`'${name}' nie zostało zadeklarowane – dodaj 'using namespace std;' (albo pisz std::${name})`, line);
      }
      return this.callBuiltin(name, node.args, env, line);
    }
    const hints = { Main: ' – funkcja główna to main (małe litery)', Printf: ' – pisz małymi literami: printf' };
    throw new CppError(`funkcja '${name}' nie została zadeklarowana${hints[name] || ' (sprawdź pisownię; funkcję trzeba zdefiniować lub zadeklarować przed jej użyciem)'}`, line);
  }

  invokeMethod(ms, cell, argNodes, env, line, name) {
    const args = argNodes.map((a) => this.evalArg(a, env));
    const fn = this.chooseOverload(ms, args, line, name);
    if (!this.canAccess(fn.ownerCls, fn.access || 'public')) {
      throw new CppError(`metoda '${name}' jest ${fn.access === 'protected' ? 'chroniona (protected)' : 'prywatna'} w klasie '${fn.ownerCls.name}' – można ją wywołać tylko z wnętrza klasy`, line);
    }
    return this.callFuncWithCells(fn, args, line, fn.isStatic ? null : cell);
  }

  // Klasa::metoda(...) – metoda statyczna albo jawne wywołanie wersji z klasy bazowej
  callScoped(node, env) {
    const c = node.callee;
    const line = node.line;
    const info = this.classInfo(c.cls, line);
    const ms = this.findMethods(info, c.name);
    if (!ms) {
      if (this.findStatic(info, c.name) || this.findField(info, c.name)) throw new CppError(`'${c.cls}::${c.name}' to pole, a nie metoda`, line);
      throw new CppError(`klasa '${c.cls}' nie ma metody '${c.name}'`, line);
    }
    const args = node.args.map((a) => this.evalArg(a, env));
    const fn = this.chooseOverload(ms, args, line, c.name);
    if (!this.canAccess(fn.ownerCls, fn.access || 'public')) {
      throw new CppError(`metoda '${c.name}' jest niedostępna (${fn.access}) w klasie '${fn.ownerCls.name}'`, line);
    }
    if (fn.isStatic) return this.callFuncWithCells(fn, args, line, null);
    const fr = this.frames[this.frames.length - 1];
    if (fr && fr.thisCell && this.isDerived(fr.thisCell.v.cls, info.name)) return this.callFuncWithCells(fn, args, line, fr.thisCell);
    throw new CppError(`metoda '${c.name}' nie jest statyczna – wywołaj ją na obiekcie (obiekt.${c.name}()) albo oznacz jako static`, line);
  }

  callMethod(node, env, wantLV) {
    const m = node.callee;
    const name = m.name;
    const line = node.line;
    if (m.obj.kind === 'Ident' && !env.lookup(m.obj.name) && (m.obj.name === 'cin' || m.obj.name === 'cout')) {
      const s = this.special(m.obj);
      if (s.t === 'istream') return this.cinMethod(name, node.args, env, line);
      if (name === 'precision') { this.out.prec = this.intOf(this.eval(node.args[0], env), line); return VOID; }
      if (name === 'width') { this.out.width = this.intOf(this.eval(node.args[0], env), line); return VOID; }
      if (name === 'fill') { this.out.fill = String.fromCharCode(this.eval(node.args[0], env).v); return VOID; }
      if (name === 'put') { this.write(String.fromCharCode(this.eval(node.args[0], env).v)); return s; }
      if (name === 'flush') return s;
      throw new CppError(`nieobsługiwana metoda cout.${name}()`, line);
    }
    const cell = this.evalObjCell(m.obj, m.arrow, env, line);
    const t = cell.t;
    if (t === 'string') return this.stringMethod(cell, name, node.args, env, line, wantLV);
    if (isVecT(t)) return this.vecMethod(cell, name, node.args, env, line, wantLV);
    if (t === 'istream') return this.cinMethod(name, node.args, env, line);
    if (!cell.v || cell.v.kind !== 'obj') {
      throw new CppError(`metodę '${name}()' można wywołać tylko na obiekcie klasy, a nie na ${typeName(t)}`, line);
    }
    const o = cell.v;
    const staticCls = (isClsT(t) && this.classes.get(t.cls)) || o.cls;
    const ms = this.resolveMethods(staticCls, o.cls, name);
    if (!ms) {
      if (this.findField(o.cls, name)) throw new CppError(`'${name}' to pole klasy, a nie metoda – usuń nawiasy ()`, line);
      if (staticCls !== o.cls && this.findMethods(o.cls, name)) {
        throw new CppError(`klasa '${staticCls.name}' nie ma metody '${name}' – obiekt klasy '${o.cls.name}' jest tu widziany przez wskaźnik/referencję typu '${staticCls.name}'`, line);
      }
      throw new CppError(`klasa '${o.cls.name}' nie ma metody '${name}'`, line);
    }
    return this.invokeMethod(ms, cell, node.args, env, line, name);
  }

  argVals(args, env) { return args.map((a) => this.eval(a, env)); }

  stringMethod(cell, name, args, env, line, wantLV) {
    const s = cell.v;
    const A = (k) => this.eval(args[k], env);
    const I = (k) => this.intOf(A(k), line);
    const npos = (v) => (v === -1 || v > 1e15 ? Infinity : v);
    const strArg = (k) => this.strOperand(A(k), line);
    const checkPos = (p, what) => {
      if (p < 0 || p > s.length) throw new CppError(`${what}: pozycja ${p} jest poza napisem o długości ${s.length} (out_of_range)`, line, 'runtime');
    };
    switch (name) {
      case 'length': case 'size': return { t: 'int', v: s.length };
      case 'empty': return BOOL(s.length === 0);
      case 'substr': {
        const p = args.length ? I(0) : 0;
        checkPos(p, 'substr');
        const n = args.length > 1 ? npos(I(1)) : Infinity;
        return { t: 'string', v: s.substr(p, n === Infinity ? undefined : Math.max(0, n)) };
      }
      case 'find': case 'rfind': {
        const what = strArg(0);
        const from = args.length > 1 ? I(1) : undefined;
        const r = name === 'find' ? s.indexOf(what, from) : s.lastIndexOf(what, from);
        return { t: 'long', v: r };
      }
      case 'push_back': cell.v = s + this.strOperand(A(0), line); return VOID;
      case 'pop_back':
        if (!s.length) throw new CppError('pop_back() na pustym napisie', line, 'runtime');
        cell.v = s.slice(0, -1); return VOID;
      case 'append': cell.v = s + strArg(0); return VOID;
      case 'insert': { const p = I(0); checkPos(p, 'insert'); cell.v = s.slice(0, p) + strArg(1) + s.slice(p); return VOID; }
      case 'erase': {
        const p = args.length ? I(0) : 0;
        checkPos(p, 'erase');
        const n = args.length > 1 ? npos(I(1)) : Infinity;
        cell.v = s.slice(0, p) + (n === Infinity ? '' : s.slice(p + n));
        return VOID;
      }
      case 'replace': {
        const p = I(0); checkPos(p, 'replace');
        const n = I(1);
        cell.v = s.slice(0, p) + strArg(2) + s.slice(p + n);
        return VOID;
      }
      case 'clear': cell.v = ''; return VOID;
      case 'at': case 'back': case 'front': {
        const i = name === 'at' ? I(0) : (name === 'back' ? s.length - 1 : 0);
        if (i < 0 || i >= s.length) throw new CppError(`${name}(): indeks ${i} poza napisem o długości ${s.length} (out_of_range)`, line, 'runtime');
        const ref = new CharRef(cell, i);
        return wantLV ? ref : { t: 'char', v: ref.v };
      }
      case 'c_str': case 'data': return { t: 'string', v: s, cstr: true };
      case 'compare': { const o = strArg(0); return { t: 'int', v: s < o ? -1 : (s > o ? 1 : 0) }; }
      case 'begin': return { t: 'iter', v: { str: cell, idx: 0 } };
      case 'end': return { t: 'iter', v: { str: cell, idx: s.length } };
      default: throw new CppError(`string nie ma metody '${name}' (dostępne m.in.: length, size, substr, find, empty, push_back, erase, insert)`, line);
    }
  }

  vecMethod(cell, name, args, env, line, wantLV) {
    const vec = cell.v;
    const A = (k) => this.eval(args[k], env);
    switch (name) {
      case 'push_back': case 'emplace_back':
        if (args[0].kind === 'InitList' && isClsT(vec.et)) {
          this.vecPush(vec, { t: vec.et, v: this.constructObject(this.classInfo(vec.et.cls, line), args[0].items.map((a) => this.evalArg(a, env)), line) }, line);
        } else if (name === 'emplace_back' && isClsT(vec.et)) {
          this.vecPush(vec, { t: vec.et, v: this.constructObject(this.classInfo(vec.et.cls, line), args.map((a) => this.evalArg(a, env)), line) }, line);
        } else this.vecPush(vec, A(0), line);
        return VOID;
      case 'pop_back':
        if (!vec.cells.length) throw new CppError('pop_back() na pustym wektorze', line, 'runtime');
        vec.cells.pop(); return VOID;
      case 'size': return { t: 'int', v: vec.cells.length };
      case 'empty': return BOOL(vec.cells.length === 0);
      case 'clear': vec.cells = []; return VOID;
      case 'at': case 'back': case 'front': {
        const i = name === 'at' ? this.intOf(A(0), line) : (name === 'back' ? vec.cells.length - 1 : 0);
        if (i < 0 || i >= vec.cells.length) throw new CppError(`${name}(): indeks ${i} poza wektorem o rozmiarze ${vec.cells.length}`, line, 'runtime');
        const c = vec.cells[i];
        return wantLV ? c : { t: c.t, v: c.v };
      }
      case 'resize': {
        const n = this.intOf(A(0), line);
        const val = args.length > 1 ? A(1) : null;
        if (n < vec.cells.length) vec.cells.length = n;
        while (vec.cells.length < n) this.vecPush(vec, val || { t: vec.et, v: this.defaultValue(vec.et, line) }, line);
        return VOID;
      }
      case 'begin': return { t: { ptr: vec.et }, v: { kind: 'ptr', cell: null, arr: vec, idx: 0 } };
      case 'end': return { t: { ptr: vec.et }, v: { kind: 'ptr', cell: null, arr: vec, idx: vec.cells.length } };
      case 'insert': {
        const it = A(0);
        if (!isPtrT(it.t) || it.v.arr !== vec) throw new CppError('insert wymaga iteratora tego wektora, np. v.begin() + 2', line);
        const val = A(1);
        const c = new Cell(vec.et, this.convert(val, vec.et, line), 0);
        c.arr = vec;
        vec.cells.splice(it.v.idx, 0, c);
        this.reindex(vec);
        return VOID;
      }
      case 'erase': {
        const it = A(0);
        if (!isPtrT(it.t) || it.v.arr !== vec) throw new CppError('erase wymaga iteratora tego wektora, np. v.begin() + 2', line);
        const end = args.length > 1 ? A(1).v.idx : it.v.idx + 1;
        if (it.v.idx < 0 || it.v.idx >= vec.cells.length) throw new CppError('erase: iterator poza wektorem', line, 'runtime');
        vec.cells.splice(it.v.idx, end - it.v.idx);
        this.reindex(vec);
        return VOID;
      }
      default: throw new CppError(`vector nie ma metody '${name}' (dostępne m.in.: push_back, pop_back, size, empty, clear, back, front)`, line);
    }
  }

  cinMethod(name, args, env, line) {
    switch (name) {
      case 'ignore': {
        let n = args.length ? this.eval(args[0], env).v : 1;
        const delim = args.length > 1 ? String.fromCharCode(this.eval(args[1], env).v) : null;
        if (this.inFail) return { t: 'istream', v: 'in' };
        while (n > 0) {
          if (this.pos >= this.buf.length && !this.loadLine()) break;
          const ch = this.buf[this.pos++];
          n--;
          if (delim !== null && ch === delim) break;
        }
        return { t: 'istream', v: 'in' };
      }
      case 'get': {
        if (this.pos >= this.buf.length && !this.loadLine()) { this.inFail = true; return { t: 'int', v: -1 }; }
        const ch = this.buf.charCodeAt(this.pos++);
        if (args.length) { this.evalLV(args[0], env).v = ch; return { t: 'istream', v: 'in' }; }
        return { t: 'int', v: ch };
      }
      case 'getline': {
        const target = this.cstrTarget(this.eval(args[0], env), line, 'cin.getline');
        const n = args.length > 1 ? this.intOf(this.eval(args[1], env), line) : target.arr.cells.length - target.idx;
        const delim = args.length > 2 ? String.fromCharCode(this.eval(args[2], env).v) : '\n';
        if (this.inFail) return { t: 'istream', v: 'in' };
        const s = this.readLine(delim);
        if (s === null) { this.inFail = true; return { t: 'istream', v: 'in' }; }
        this.writeCStr(target, s.slice(0, Math.max(0, n - 1)), line, 'cin.getline');
        if (s.length > n - 1) this.inFail = true;
        return { t: 'istream', v: 'in' };
      }
      case 'fail': return BOOL(this.inFail);
      case 'eof': return BOOL(this.inEof);
      case 'good': return BOOL(!this.inFail);
      case 'clear': this.inFail = false; this.inEof = false; return VOID;
      default: throw new CppError(`nieobsługiwana metoda cin.${name}()`, line);
    }
  }

  // ---------- wejście ----------
  loadLine() {
    if (this.inLine < this.inputs.length) {
      const l = this.inputs[this.inLine++];
      this.buf = this.buf.slice(this.pos) + l + '\n';
      this.pos = 0;
      this.write(l + '\n', 'in');
      return true;
    }
    if (this.interactive) throw new NeedInput();
    this.inEof = true;
    return false;
  }

  skipWs() {
    for (;;) {
      while (this.pos < this.buf.length && /\s/.test(this.buf[this.pos])) this.pos++;
      if (this.pos < this.buf.length) return true;
      if (!this.loadLine()) return false;
    }
  }

  match(re) {
    re.lastIndex = this.pos;
    const m = re.exec(this.buf);
    if (!m) return null;
    this.pos += m[0].length;
    return m[0];
  }

  readLine(delim = '\n') {
    if (this.pos >= this.buf.length && !this.loadLine()) return null;
    let idx = this.buf.indexOf(delim, this.pos);
    while (idx === -1) {
      if (!this.loadLine()) { idx = this.buf.length; break; }
      idx = this.buf.indexOf(delim, this.pos);
    }
    const s = this.buf.slice(this.pos, idx);
    this.pos = idx + 1;
    return s;
  }

  cstrRead(tv, line, fname) {
    if (tv.t === 'string') return tv.v;
    if (isArrT(tv.t) && tv.t.arr === 'char') return this.cString(tv.v);
    if (isPtrT(tv.t) && tv.t.ptr === 'char') return this.cStringPtr(tv.v, line);
    throw new CppError(`${fname}(): oczekiwano napisu (tablicy znaków char[]), a podano ${typeName(tv.t)}`, line);
  }

  cstrTarget(tv, line, fname) {
    if (isArrT(tv.t) && tv.t.arr === 'char') return { arr: tv.v, idx: 0 };
    if (isPtrT(tv.t) && tv.t.ptr === 'char' && tv.v.arr) return { arr: tv.v.arr, idx: tv.v.idx };
    if (tv.t === 'string') throw new CppError(`${fname}() działa na tablicach znaków (char[]) – dla zmiennej typu string użyj operatorów = i +=`, line);
    throw new CppError(`${fname}(): pierwszy argument musi być tablicą znaków (char[])`, line);
  }

  writeCStr(target, s, line, fname, terminate = true) {
    const cap = target.arr.cells.length - target.idx;
    const need = s.length + (terminate ? 1 : 0);
    if (need > cap) {
      throw new CppError(`${fname}: przepełnienie bufora – potrzeba ${need} znaków (razem z '\\0'), a w tablicy jest miejsce tylko na ${cap}`, line, 'runtime');
    }
    for (let k = 0; k < s.length; k++) target.arr.cells[target.idx + k].v = s.charCodeAt(k);
    if (terminate) target.arr.cells[target.idx + s.length].v = 0;
  }

  read(lv, line) {
    if (lv.isConst) throw new CppError('nie można wczytać danych do stałej (const)', line);
    if (this.inFail) return;
    const t = lv.t;
    if (!(isNumeric(t) || t === 'string' || (isArrT(t) && t.arr === 'char'))) {
      throw new CppError(`nie można wczytać (cin >>) wartości typu ${typeName(t)}${isArrT(t) ? ' – wczytuj tablicę element po elemencie w pętli' : ''}`, line);
    }
    if (!this.skipWs()) { this.inFail = true; return; }
    if (t === 'char') { lv.v = this.buf.charCodeAt(this.pos++); return; }
    if (t === 'string') { lv.v = this.match(/\S+/y); return; }
    if (isArrT(t)) { this.fillCharArray(lv.v, this.match(/\S+/y), line); return; }
    const m = isFloatT(t) ? this.match(/[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/y) : this.match(/[+-]?\d+/y);
    if (m === null) { this.inFail = true; lv.v = 0; return; }
    lv.v = this.fitNumber(Number(m), t);
  }

  // ---------- wypisywanie ----------
  print(R, line, stream) {
    const type = stream === 'err' ? 'err' : 'out';
    if (R.t === 'manip') {
      const m = R.v;
      switch (m.kind) {
        case 'endl': this.write('\n', type); break;
        case 'fixed': this.out.fixed = true; this.out.sci = false; break;
        case 'scientific': this.out.sci = true; this.out.fixed = false; break;
        case 'left': this.out.left = true; break;
        case 'right': this.out.left = false; break;
        case 'boolalpha': this.out.boolalpha = true; break;
        case 'noboolalpha': this.out.boolalpha = false; break;
        case 'hex': this.out.base = 16; break;
        case 'oct': this.out.base = 8; break;
        case 'dec': this.out.base = 10; break;
        case 'showpos': this.out.showpos = true; break;
        case 'noshowpos': this.out.showpos = false; break;
        case 'setw': this.out.width = m.n; break;
        case 'setprecision': this.out.prec = m.n; break;
        case 'setfill': this.out.fill = String.fromCharCode(m.c); break;
        default: break;
      }
      return;
    }
    let s = this.formatValue(R, line);
    if (this.out.width > s.length) {
      const pad = this.out.fill.repeat(this.out.width - s.length);
      s = this.out.left ? s + pad : pad + s;
    }
    this.out.width = 0;
    this.write(s, type);
  }

  formatValue(R, line) {
    const t = R.t;
    const v = R.v;
    if (t === 'char') return String.fromCharCode(v);
    if (t === 'bool') return this.out.boolalpha ? (v ? 'true' : 'false') : (v ? '1' : '0');
    if (isIntegral(t)) {
      if (this.out.base !== 10) {
        const u = v < 0 ? (t === 'long' ? BigInt.asUintN(64, BigInt(v)) : (v >>> 0)) : v;
        return u.toString(this.out.base);
      }
      return (this.out.showpos && v > 0 ? '+' : '') + String(v);
    }
    if (isFloatT(t)) return (this.out.showpos && v > 0 ? '+' : '') + this.formatDouble(v);
    if (t === 'string') return v;
    if (isPtrT(t)) {
      if (t.ptr === 'char' && !this.isNull(v)) return this.cStringPtr(v, line);
      if (this.isNull(v)) return '0';
      return '0x' + this.ptrAddr(v).toString(16);
    }
    if (isArrT(t)) {
      if (t.arr === 'char') return this.cString(v);
      return '0x' + v.base.toString(16);
    }
    if (t === 'void') throw new CppError('nie można wypisać wyniku funkcji typu void (ona nic nie zwraca)', line);
    if (isClsT(t)) throw new CppError(`cout nie potrafi wypisać całego obiektu klasy ${t.cls} – wypisz jego pola, napisz metodę wypisz() albo zdefiniuj operator<<`, line);
    if (isVecT(t)) throw new CppError('cout nie potrafi wypisać całego wektora – wypisz elementy w pętli', line);
    if (t === 'ostream' || t === 'istream') throw new CppError('niepoprawne użycie cout/cin – sprawdź operatory << i >>', line);
    throw new CppError(`nie można wypisać wartości typu ${typeName(t)}`, line);
  }

  formatDouble(v) {
    if (Number.isNaN(v)) return 'nan';
    if (!Number.isFinite(v)) return v > 0 ? 'inf' : '-inf';
    const p = Math.min(this.out.prec, 100);
    if (this.out.fixed) return v.toFixed(p);
    if (this.out.sci) {
      const [m, e] = v.toExponential(p).split('e');
      const sign = e[0] === '-' ? '-' : '+';
      let d = e.replace(/^[+-]/, '');
      if (d.length < 2) d = '0' + d;
      return `${m}e${sign}${d}`;
    }
    return formatG(v, p);
  }

  // ---------- funkcje wbudowane ----------
  get builtinNames() {
    return BUILTINS;
  }

  callBuiltin(name, argNodes, env, line) {
    const A = (k) => {
      if (argNodes[k] === undefined) throw new CppError(`funkcja ${name}() – za mało argumentów`, line);
      return this.eval(argNodes[k], env);
    };
    const num = (k) => {
      const a = A(k);
      if (!isNumeric(a.t)) throw new CppError(`funkcja ${name}() oczekuje liczby, a otrzymała ${typeName(a.t)}`, line);
      return a.v;
    };
    const D = (v) => ({ t: 'double', v });
    const need = (n) => { if (argNodes.length !== n) throw new CppError(`funkcja ${name}() przyjmuje ${n} argument(y), a podano ${argNodes.length}`, line); };
    switch (name) {
      case 'sqrt': need(1); return D(Math.sqrt(num(0)));
      case 'cbrt': return D(Math.cbrt(num(0)));
      case 'pow': need(2); return D(Math.pow(num(0), num(1)));
      case 'abs': {
        need(1);
        const a = A(0);
        if (!isNumeric(a.t)) throw new CppError('abs() oczekuje liczby', line);
        return isFloatT(a.t) ? D(Math.abs(a.v)) : { t: a.t === 'long' ? 'long' : 'int', v: Math.abs(a.v) };
      }
      case 'fabs': return D(Math.abs(num(0)));
      case 'floor': return D(Math.floor(num(0)));
      case 'ceil': return D(Math.ceil(num(0)));
      case 'round': { const x = num(0); return D(Math.sign(x) * Math.round(Math.abs(x))); }
      case 'trunc': return D(Math.trunc(num(0)));
      case 'sin': return D(Math.sin(num(0)));
      case 'cos': return D(Math.cos(num(0)));
      case 'tan': return D(Math.tan(num(0)));
      case 'atan': return D(Math.atan(num(0)));
      case 'atan2': return D(Math.atan2(num(0), num(1)));
      case 'asin': return D(Math.asin(num(0)));
      case 'acos': return D(Math.acos(num(0)));
      case 'log': return D(Math.log(num(0)));
      case 'log10': return D(Math.log10(num(0)));
      case 'log2': return D(Math.log2(num(0)));
      case 'exp': return D(Math.exp(num(0)));
      case 'hypot': return D(Math.hypot(num(0), num(1)));
      case 'fmod': { const a = num(0), b = num(1); return D(a % b); }
      case 'max': case 'min': {
        if (argNodes.length === 1 && argNodes[0].kind === 'InitList') {
          const vals = argNodes[0].items.map((it) => this.eval(it, env));
          return vals.reduce((acc, x) => ((name === 'max' ? x.v > acc.v : x.v < acc.v) ? x : acc));
        }
        need(2);
        const a = A(0), b = A(1);
        if (a.t === 'string' && b.t === 'string') return (name === 'max' ? a.v >= b.v : a.v <= b.v) ? a : b;
        if (!isNumeric(a.t) || !isNumeric(b.t)) throw new CppError(`${name}() oczekuje dwóch liczb`, line);
        if (isFloatT(a.t) !== isFloatT(b.t)) throw new CppError(`${name}(): oba argumenty muszą mieć ten sam typ (otrzymano ${typeName(a.t)} i ${typeName(b.t)})`, line);
        const t = isFloatT(a.t) ? 'double' : (a.t === b.t ? a.t : 'int');
        return { t, v: name === 'max' ? Math.max(a.v, b.v) : Math.min(a.v, b.v) };
      }
      case 'swap': {
        need(2);
        const a = this.evalLV(argNodes[0], env), b = this.evalLV(argNodes[1], env);
        if (!sameType(a.t, b.t)) throw new CppError(`swap(): zmienne muszą mieć ten sam typ (${typeName(a.t)} i ${typeName(b.t)})`, line);
        const tmp = a.v;
        a.v = b.v;
        b.v = tmp;
        return VOID;
      }
      case 'rand':
        this.randState = (Math.imul(this.randState, 1103515245) + 12345) & 0x7fffffff;
        return { t: 'int', v: this.randState };
      case 'srand': this.randState = (num(0) | 0) || 1; return VOID;
      case 'time': return { t: 'long', v: this.seed };
      case 'to_string': {
        const a = A(0);
        if (isIntegral(a.t)) return { t: 'string', v: a.t === 'char' ? String(a.v) : String(a.v) };
        if (isFloatT(a.t)) return { t: 'string', v: a.v.toFixed(6) };
        throw new CppError(`to_string() oczekuje liczby, a otrzymała ${typeName(a.t)}`, line);
      }
      case 'stoi': case 'stol': case 'stoll': case 'stod': case 'stof': {
        const a = A(0);
        if (a.t !== 'string') throw new CppError(`${name}() oczekuje napisu (string)`, line);
        const isF = name === 'stod' || name === 'stof';
        const m = a.v.match(isF ? /^\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/ : /^\s*[+-]?\d+/);
        if (!m) throw new CppError(`${name}("${a.v}"): napis nie zawiera liczby (invalid_argument)`, line, 'runtime');
        return isF ? D(Number(m[0])) : { t: name === 'stoi' ? 'int' : 'long', v: Math.trunc(Number(m[0])) };
      }
      case 'getline': {
        if (argNodes.length < 2) throw new CppError('getline(cin, napis) – podaj strumień i zmienną', line);
        const s = A(0);
        if (s.t !== 'istream') throw new CppError('pierwszym argumentem getline musi być cin', line);
        const lv = this.evalLV(argNodes[1], env);
        if (lv.t !== 'string') throw new CppError('getline wczytuje tekst do zmiennej typu string', line);
        const delim = argNodes.length > 2 ? String.fromCharCode(A(2).v) : '\n';
        if (this.inFail) return s;
        const got = this.readLine(delim);
        if (got === null) { this.inFail = true; return s; }
        lv.v = got;
        return s;
      }
      case 'setw': return { t: 'manip', v: { kind: 'setw', n: num(0) } };
      case 'setprecision': return { t: 'manip', v: { kind: 'setprecision', n: num(0) } };
      case 'setfill': { const c = A(0); return { t: 'manip', v: { kind: 'setfill', c: c.v } }; }
      case 'isdigit': return BOOL(/[0-9]/.test(String.fromCharCode(num(0))));
      case 'isalpha': return BOOL(/\p{L}/u.test(String.fromCharCode(num(0))));
      case 'isalnum': return BOOL(/[\p{L}0-9]/u.test(String.fromCharCode(num(0))));
      case 'isupper': { const c = String.fromCharCode(num(0)); return BOOL(c !== c.toLowerCase()); }
      case 'islower': { const c = String.fromCharCode(num(0)); return BOOL(c !== c.toUpperCase()); }
      case 'isspace': return BOOL(/\s/.test(String.fromCharCode(num(0))));
      case 'ispunct': return BOOL(/[!-/:-@[-`{-~]/.test(String.fromCharCode(num(0))));
      case 'toupper': return { t: 'int', v: String.fromCharCode(num(0)).toUpperCase().charCodeAt(0) };
      case 'tolower': return { t: 'int', v: String.fromCharCode(num(0)).toLowerCase().charCodeAt(0) };
      case 'strlen': need(1); return { t: 'int', v: this.cstrRead(A(0), line, name).length };
      case 'strcpy': case 'strcat': {
        need(2);
        const d = A(0);
        const target = this.cstrTarget(d, line, name);
        const src = this.cstrRead(A(1), line, name);
        const cur = name === 'strcat' ? this.cstrRead(d, line, name) : '';
        this.writeCStr(target, cur + src, line, name);
        return d;
      }
      case 'strncpy': case 'strncat': {
        need(3);
        const d = A(0);
        const target = this.cstrTarget(d, line, name);
        const src = this.cstrRead(A(1), line, name);
        const n = num(2);
        if (name === 'strncat') {
          this.writeCStr(target, this.cstrRead(d, line, name) + src.slice(0, n), line, name);
        } else {
          const part = src.slice(0, n);
          this.writeCStr(target, part + '\0'.repeat(Math.max(0, n - part.length)), line, name, false);
        }
        return d;
      }
      case 'strcmp': case 'strncmp': {
        let a = this.cstrRead(A(0), line, name);
        let b = this.cstrRead(A(1), line, name);
        if (name === 'strncmp') { const n = num(2); a = a.slice(0, n); b = b.slice(0, n); }
        return { t: 'int', v: a < b ? -1 : (a > b ? 1 : 0) };
      }
      case 'strchr': {
        need(2);
        const s = A(0);
        const target = this.cstrTarget(s, line, name);
        const k = this.cstrRead(s, line, name).indexOf(String.fromCharCode(num(1)));
        return { t: { ptr: 'char' }, v: k === -1 ? NULLPTR : { kind: 'ptr', cell: null, arr: target.arr, idx: target.idx + k } };
      }
      case 'atoi': case 'atol': case 'atof': {
        const s = this.cstrRead(A(0), line, name);
        const isF = name === 'atof';
        const m = s.match(isF ? /^\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/ : /^\s*[+-]?\d+/);
        const v = m ? Number(m[0]) : 0;
        return isF ? D(v) : { t: name === 'atoi' ? 'int' : 'long', v: Math.trunc(v) };
      }
      case 'printf': return this.printf(argNodes, env, line);
      case 'scanf': return this.scanf(argNodes, env, line);
      case 'puts': { const s = this.cstrRead(A(0), line, name); this.write(s + '\n'); return { t: 'int', v: s.length + 1 }; }
      case 'putchar': { const c = num(0); this.write(String.fromCharCode(c)); return { t: 'int', v: c }; }
      case 'getchar': {
        if (this.pos >= this.buf.length && !this.loadLine()) return { t: 'int', v: -1 };
        return { t: 'int', v: this.buf.charCodeAt(this.pos++) };
      }
      case 'exit': throw new ExitSignal(num(0) | 0);
      case 'system': return { t: 'int', v: 0 };
      case 'sort': case 'reverse': case 'max_element': case 'min_element': case 'count': case 'find': case 'accumulate': case 'fill':
        return this.algo(name, argNodes, env, line);
      default: throw new CppError(`nieobsługiwana funkcja '${name}'`, line);
    }
  }

  printf(argNodes, env, line) {
    if (!argNodes.length) throw new CppError('printf() wymaga napisu formatującego', line);
    const fmt = this.cstrRead(this.eval(argNodes[0], env), line, 'printf');
    let ai = 1;
    const nextArg = (spec) => {
      if (ai >= argNodes.length) throw new CppError(`printf: brakuje argumentu dla '${spec}'`, line);
      return this.eval(argNodes[ai++], env);
    };
    const re = /%([-+ 0#]*)(\d+|\*)?(?:\.(\d+|\*))?(hh|h|ll|l|L|z)?([diufFeEgGxXocsp%])/g;
    const out = fmt.replace(re, (spec, flags, width, prec, len, conv) => {
      if (conv === '%') return '%';
      if (width === '*') width = nextArg(spec).v;
      if (prec === '*') prec = nextArg(spec).v;
      const p = prec === undefined ? undefined : Number(prec);
      const a = nextArg(spec);
      let s;
      let numeric = true;
      switch (conv) {
        case 'd': case 'i': case 'u': case 'x': case 'X': case 'o': {
          if (!isIntegral(a.t)) throw new CppError(`printf: '${spec}' wymaga liczby całkowitej, a podano ${typeName(a.t)}${isFloatT(a.t) ? ' (dla double użyj %f)' : ''}`, line);
          const v = a.v;
          if (conv === 'd' || conv === 'i') s = String(Math.abs(v));
          else {
            const u = v < 0 ? (v >>> 0) : v;
            s = conv === 'u' ? String(u) : u.toString(conv === 'o' ? 8 : 16);
            if (conv === 'X') s = s.toUpperCase();
          }
          if (p !== undefined) s = s.padStart(p, '0');
          if ((conv === 'd' || conv === 'i') && (v < 0 || flags.includes('+'))) s = (v < 0 ? '-' : '+') + s;
          break;
        }
        case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
          if (!isFloatT(a.t)) throw new CppError(`printf: '${spec}' wymaga liczby rzeczywistej (double), a podano ${typeName(a.t)}${isIntegral(a.t) ? ' (dla int użyj %d)' : ''}`, line);
          const v = a.v;
          const pr = p === undefined ? 6 : p;
          if (conv === 'f' || conv === 'F') s = Math.abs(v).toFixed(pr);
          else if (conv === 'e' || conv === 'E') {
            const [m, e] = Math.abs(v).toExponential(pr).split('e');
            const d = e.replace(/^[+-]/, '').padStart(2, '0');
            s = `${m}e${e[0] === '-' ? '-' : '+'}${d}`;
          } else s = formatG(Math.abs(v), pr);
          if (conv === 'E' || conv === 'G') s = s.toUpperCase();
          if (v < 0) s = '-' + s;
          else if (flags.includes('+')) s = '+' + s;
          break;
        }
        case 'c':
          if (!isIntegral(a.t)) throw new CppError(`printf: '%c' wymaga znaku (char), a podano ${typeName(a.t)}`, line);
          s = String.fromCharCode(a.v);
          numeric = false;
          break;
        case 's':
          if (a.t === 'string' && !a.lit && !a.cstr) throw new CppError('printf: %s wymaga C-napisu – dla zmiennej typu string napisz s.c_str()', line);
          s = this.cstrRead(a, line, 'printf');
          if (p !== undefined) s = s.slice(0, p);
          numeric = false;
          break;
        case 'p':
          if (!isPtrT(a.t) && !isArrT(a.t)) throw new CppError("printf: '%p' wymaga wskaźnika (adresu)", line);
          s = '0x' + (isArrT(a.t) ? a.v.base : this.ptrAddr(a.v)).toString(16);
          numeric = false;
          break;
        default: s = spec;
      }
      const w = width === undefined ? 0 : Number(width);
      if (s.length < w) {
        if (flags.includes('-')) s = s.padEnd(w, ' ');
        else if (flags.includes('0') && numeric) {
          const sign = /^[+-]/.test(s) ? s[0] : '';
          s = sign + s.slice(sign.length).padStart(w - sign.length, '0');
        } else s = s.padStart(w, ' ');
      }
      return s;
    });
    if (ai < argNodes.length) this.warn(line, 'printf: podano więcej argumentów niż znaczników % w napisie formatującym');
    this.write(out);
    return { t: 'int', v: out.length };
  }

  scanf(argNodes, env, line) {
    if (!argNodes.length) throw new CppError('scanf() wymaga napisu formatującego', line);
    const fmt = this.cstrRead(this.eval(argNodes[0], env), line, 'scanf');
    const specs = fmt.match(/%(\d+)?(hh|h|ll|l|L)?([dicsfeEgGxu])/g) || [];
    let ai = 1;
    let count = 0;
    for (const spec of specs) {
      const conv = spec[spec.length - 1];
      const lenMod = (spec.match(/(hh|h|ll|l|L)/) || [''])[0];
      if (ai >= argNodes.length) throw new CppError(`scanf: brakuje argumentu dla '${spec}'`, line);
      const argNode = argNodes[ai++];
      const tv = this.eval(argNode, env);
      const varName = argNode.kind === 'Ident' ? argNode.name : 'zmienna';
      if (conv === 's') {
        if (tv.t === 'string') throw new CppError('scanf("%s") nie wczytuje do zmiennej typu string – użyj cin >> s', line);
        const target = this.cstrTarget(tv, line, 'scanf');
        if (this.inFail || !this.skipWs()) { this.inFail = true; break; }
        this.writeCStr(target, this.match(/\S+/y), line, 'scanf');
        count++;
        continue;
      }
      if (!isPtrT(tv.t)) {
        throw new CppError(`scanf wymaga ADRESU zmiennej – napisz &${varName} (zapomniany operator & to częsty błąd)`, line);
      }
      const cell = this.deref(tv.v, line);
      const ct = cell.t;
      if ('diux'.includes(conv) && !isIntegral(ct)) throw new CppError(`scanf: '${spec}' wczytuje liczbę całkowitą, a zmienna ma typ ${typeName(ct)}`, line);
      if ('feEgG'.includes(conv)) {
        if (!isFloatT(ct)) throw new CppError(`scanf: '${spec}' wczytuje liczbę rzeczywistą, a zmienna ma typ ${typeName(ct)}`, line);
        if (ct === 'double' && lenMod !== 'l') throw new CppError(`scanf: do zmiennej typu double wczytujemy przez %lf (a nie ${spec})`, line);
      }
      if (conv === 'c') {
        if (ct !== 'char') throw new CppError(`scanf: '%c' wczytuje znak, a zmienna ma typ ${typeName(ct)}`, line);
        if (this.pos >= this.buf.length && !this.loadLine()) { this.inFail = true; break; }
        cell.v = this.buf.charCodeAt(this.pos++);
        count++;
        continue;
      }
      this.read(cell, line);
      if (this.inFail) break;
      count++;
    }
    return { t: 'int', v: count === 0 && this.inEof ? -1 : count };
  }

  range(argNodes, env, line, fname) {
    const a = this.eval(argNodes[0], env), b = this.eval(argNodes[1], env);
    const toP = (tv) => (isArrT(tv.t) ? { arr: tv.v, idx: 0 } : (isPtrT(tv.t) ? tv.v : null));
    const pa = toP(a), pb = toP(b);
    if (!pa || !pb || !pa.arr || pa.arr !== pb.arr) {
      throw new CppError(`${fname}() oczekuje zakresu, np. ${fname}(t, t + n) dla tablicy lub ${fname}(v.begin(), v.end()) dla wektora`, line);
    }
    if (pa.idx < 0 || pb.idx > pa.arr.cells.length || pa.idx > pb.idx) throw new CppError(`${fname}(): zakres wychodzi poza tablicę`, line, 'runtime');
    return { arr: pa.arr, from: pa.idx, to: pb.idx, t: isArrT(a.t) ? { ptr: a.t.arr } : a.t };
  }

  algo(name, argNodes, env, line) {
    const r = this.range(argNodes, env, line, name);
    const cells = r.arr.cells.slice(r.from, r.to);
    const cmpVal = (x, y) => (x < y ? -1 : (x > y ? 1 : 0));
    switch (name) {
      case 'sort': {
        if (cells.length && isClsT(cells[0].t)) throw new CppError('sort() nie potrafi porównać obiektów klasy w tym środowisku', line);
        const desc = argNodes[2] && this.eval(argNodes[2], env).v === 'greater';
        const vals = cells.map((c) => c.v).sort((x, y) => (desc ? cmpVal(y, x) : cmpVal(x, y)));
        cells.forEach((c, k) => { c.v = vals[k]; });
        this.steps += cells.length * 5;
        return VOID;
      }
      case 'reverse': {
        const vals = cells.map((c) => c.v).reverse();
        cells.forEach((c, k) => { c.v = vals[k]; });
        return VOID;
      }
      case 'max_element': case 'min_element': {
        if (!cells.length) return { t: r.t, v: { kind: 'ptr', arr: r.arr, idx: r.to, cell: null } };
        let best = 0;
        cells.forEach((c, k) => { if (name === 'max_element' ? c.v > cells[best].v : c.v < cells[best].v) best = k; });
        return { t: r.t, v: { kind: 'ptr', arr: r.arr, idx: r.from + best, cell: null } };
      }
      case 'count': {
        const val = this.eval(argNodes[2], env).v;
        return { t: 'int', v: cells.filter((c) => c.v === val).length };
      }
      case 'find': {
        const val = this.eval(argNodes[2], env).v;
        const k = cells.findIndex((c) => c.v === val);
        return { t: r.t, v: { kind: 'ptr', arr: r.arr, idx: k === -1 ? r.to : r.from + k, cell: null } };
      }
      case 'accumulate': {
        const init = this.eval(argNodes[2], env);
        let acc = init;
        for (const c of cells) acc = this.binop('+', acc, { t: c.t, v: c.v }, line);
        return acc;
      }
      case 'fill': {
        const val = this.eval(argNodes[2], env);
        cells.forEach((c) => this.assignInto(c, val, line));
        return VOID;
      }
      default: return VOID;
    }
  }
}

const BUILTINS = new Set([
  'sqrt', 'cbrt', 'pow', 'abs', 'fabs', 'floor', 'ceil', 'round', 'trunc', 'sin', 'cos', 'tan', 'atan', 'atan2', 'asin', 'acos',
  'log', 'log10', 'log2', 'exp', 'hypot', 'fmod', 'max', 'min', 'swap', 'rand', 'srand', 'time', 'to_string',
  'stoi', 'stol', 'stoll', 'stod', 'stof', 'getline', 'setw', 'setprecision', 'setfill',
  'isdigit', 'isalpha', 'isalnum', 'isupper', 'islower', 'isspace', 'ispunct', 'toupper', 'tolower',
  'exit', 'system', 'sort', 'reverse', 'max_element', 'min_element', 'count', 'find', 'accumulate', 'fill',
  'strlen', 'strcpy', 'strcat', 'strncpy', 'strncat', 'strcmp', 'strncmp', 'strchr', 'atoi', 'atol', 'atof',
  'printf', 'scanf', 'puts', 'putchar', 'getchar',
]);

// Główny punkt wejścia: uruchamia program i zwraca wynik.
export function runProgram(code, opts = {}) {
  const it = new Interpreter(code, opts);
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
      if (e instanceof CppError) error = { kind: e.kind, line: e.line ?? null, message: e.message };
      else if (e instanceof RangeError) error = { kind: 'runtime', line: it.curLine ?? null, message: 'przepełnienie stosu – zbyt głęboka rekurencja (czy funkcja rekurencyjna ma warunek zakończenia?)' };
      else error = { kind: 'internal', line: it.curLine ?? null, message: `wewnętrzny błąd interpretera: ${e && e.message}` };
    }
  }
  return {
    status,
    error,
    exitCode,
    segments: it.segments,
    warnings: it.warnings || [],
    steps: it.steps,
    ms: Date.now() - started,
  };
}
