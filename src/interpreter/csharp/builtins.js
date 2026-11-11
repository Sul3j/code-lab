// Biblioteka standardowa (podzbiór .NET) dla interpretera C#.
import { has, isNum, isIntT, isFloatT, netName, csName, sameType, numWidens } from './types.js';
import { fmtDouble, fmtFloat, fmtDecimal, formatNumber, mathRound, parseIntStrict, parseDoubleStrict } from './format.js';

export const STATIC_TYPE_NAMES = new Set([
  'Console', 'Math', 'Convert', 'Array', 'Environment', 'String', 'Char', 'Int32', 'Int64', 'Double', 'Decimal', 'Boolean',
  'string', 'char', 'int', 'long', 'double', 'decimal', 'float', 'bool', 'MidpointRounding', 'StringSplitOptions', 'Console.Error', 'Single',
]);

const TYPE_ALIASES = { String: 'string', Char: 'char', Int32: 'int', Int64: 'long', Double: 'double', Decimal: 'decimal', Boolean: 'bool', Single: 'float' };
const collator = new Intl.Collator('en');
const RANGES = { int: [-2147483648, 2147483647, 'Int32'], long: [-9223372036854775808, 9223372036854775807, 'Int64'] };

const VOIDV = Object.freeze({ t: 'void', v: undefined });
const T = (t, v) => ({ t, v });

export const builtinMethods = {
  // ---------- tekstowa postać wartości ----------
  toStr(tv0, line) {
    const tv = this.unbox(tv0);
    const t = tv.t;
    const v = tv.v;
    if (v === null || v === undefined) return '';
    if (t === 'string') return v;
    if (t === 'char') return String.fromCharCode(v);
    if (t === 'bool') return v ? 'True' : 'False';
    if (t === 'int' || t === 'long') return String(v);
    if (t === 'double') return fmtDouble(v);
    if (t === 'float') return fmtFloat(v);
    if (t === 'decimal') return fmtDecimal(v);
    if (has(t, 'enum')) { const info = this.types.get(t.enum); return info.names.has(v) ? info.names.get(v) : String(v); }
    if (has(t, 'nullable')) return this.toStr({ t: t.nullable, v }, line);
    if (typeof v !== 'object') return String(v);
    if (v.kind === 'obj') {
      const ms = this.methodCands(v.cls, 'ToString').filter((m) => m.params.length === 0 && !m.isStatic);
      if (ms.length) {
        const m = this.dispatch(ms[0], v.cls);
        return this.toStr(this.callUser(m, new this.Cell({ cls: v.cls.name }, v), [], line), line);
      }
      const full = netName({ cls: v.cls.name }, this.types);
      if (this.isAssignable(v.cls.name, 'Exception')) return `${full}: ${this.fieldOf(v, 'Message')}`;
      return full;
    }
    if (v.kind === 'tuple') return `(${v.cells.map((c) => this.toStr({ t: c.t, v: c.v }, line)).join(', ')})`;
    if (v.kind === 'kvp') return `[${this.toStr(v.key, line)}, ${this.toStr(v.val, line)}]`;
    if (v.kind === 'sb') return v.s;
    if (v.kind === 'typeobj') return v.full;
    if (v.kind === 'plainobj') return 'System.Object';
    if (v.kind === 'fn') return 'System.Delegate';
    return netName(t, this.types);
  },

  formatValue(tv0, spec, line) {
    const tv = this.unbox(tv0);
    if (tv.v === null) return '';
    if (isNum(tv.t) && tv.t !== 'char') {
      const r = formatNumber(tv.v, spec.trim(), isIntT(tv.t));
      if (r !== null) return r;
      if (/^[A-Za-z]\d*$/.test(spec.trim()) && !/^[Gg]\d*$/.test(spec.trim())) this.throwEx('FormatException', `Format specifier '${spec}' was invalid.`, line);
    }
    if (has(tv.t, 'enum') && /^[Dd]$/.test(spec)) return String(tv.v);
    return this.toStr(tv, line);
  },

  formatComposite(fmt, args, line) {
    return fmt.replace(/\{\{|\}\}|\{(\d+)(?:\s*,\s*(-?\d+))?(?::([^}]*))?\}/g, (m, idx, al, spec) => {
      if (m === '{{') return '{';
      if (m === '}}') return '}';
      const k = parseInt(idx, 10);
      if (k >= args.length) this.throwEx('FormatException', 'Index (zero based) must be greater than or equal to zero and less than the size of the argument list.', line);
      let s = spec ? this.formatValue(args[k], spec, line) : this.toStr(args[k], line);
      if (al !== undefined) { const a = parseInt(al, 10); s = a < 0 ? s.padEnd(-a) : s.padStart(a); }
      return s;
    });
  },

  // ---------- pomocnicze ----------
  argTV(a, sig = null) {
    if (a.lambda) return T(sig ? { fn: sig } : { fn: null }, this.makeLambda(a.lambda, a.env, sig));
    if (a.lv) return a.lv.get();
    return a.tv;
  },

  needArgs(args, n, name, line) {
    const ok = Array.isArray(n) ? n.includes(args.length) : args.length === n;
    if (!ok) this.err(`metoda ${name} nie przyjmuje ${args.length} argument(ów) (CS1501)`, line);
  },

  numArg(tv, name, line) {
    const u = this.unbox(tv);
    if (!isNum(u.t)) this.err(`${name}: oczekiwano liczby, a podano wartość typu '${csName(u.t)}' (CS1503)`, line);
    return u.v;
  },

  strArg(tv, name, line) {
    if (tv.t !== 'string' && tv.t !== 'null') {
      if (tv.t === 'char') return String.fromCharCode(tv.v);
      this.err(`${name}: oczekiwano napisu (string), a podano '${csName(tv.t)}' (CS1503)`, line);
    }
    return tv.v;
  },

  outCell(a, t, env, line) {
    if (a.mode !== 'out') this.err("ten argument musi być przekazany ze słowem kluczowym 'out', np. int.TryParse(s, out int x) (CS1620)", line);
    if (a.outDecl) {
      const dt = a.outDecl.type === 'var' ? t : this.rt(a.outDecl.type, line);
      if (!sameType(dt, t) && !(isNum(dt) && isNum(t))) this.err(`argument out ma typ '${csName(dt)}', a oczekiwano '${csName(t)}' (CS1503)`, line);
      const c = new this.Cell(dt, this.defaultOf(dt));
      a.declaredCell = c;
      env.vars.set(a.outDecl.name, c);
      return c;
    }
    return a.lv.cell;
  },

  elems(tv, line) {
    const v = tv.v;
    if (v === null) this.throwEx('ArgumentNullException', "Value cannot be null. (Parameter 'source')", line);
    if (tv.t === 'string') return { et: 'char', items: Array.from(v, (c) => T('char', c.charCodeAt(0))) };
    if (v.kind === 'arr' || v.kind === 'list') return { et: v.et, items: v.cells.map((c) => T(c.t, c.v)) };
    if (v.kind === 'dict') { const kt = { kvp: [v.kt, v.vt] }; return { et: kt, items: [...v.map.values()].map((e) => T(kt, { kind: 'kvp', key: e.key, val: T(v.vt, e.cell.v) })) }; }
    return null;
  },

  makeList(et, tvs) {
    return { kind: 'list', et, cells: tvs.map((x) => new this.Cell(et, this.storeValue(x, et))), version: 0 };
  },

  compareTV(a0, b0, line) {
    const a = this.unbox(a0);
    const b = this.unbox(b0);
    if (a.v === null || b.v === null) return a.v === b.v ? 0 : (a.v === null ? -1 : 1);
    if ((isNum(a.t) || has(a.t, 'enum')) && (isNum(b.t) || has(b.t, 'enum'))) return a.v < b.v ? -1 : (a.v > b.v ? 1 : 0);
    if (a.t === 'string' && b.t === 'string') return Math.sign(collator.compare(a.v, b.v));
    if (a.t === 'bool' && b.t === 'bool') return a.v === b.v ? 0 : (a.v ? 1 : -1);
    if (a.v.kind === 'obj') {
      const ms = this.methodCands(a.v.cls, 'CompareTo').filter((m) => m.params.length === 1);
      if (ms.length) return this.callUser(this.dispatch(ms[0], a.v.cls), new this.Cell({ cls: a.v.cls.name }, a.v), [{ tv: b }], line).v;
    }
    if (a.v.kind === 'tuple') {
      for (let k = 0; k < a.v.cells.length; k++) {
        const r = this.compareTV(T(a.v.cells[k].t, a.v.cells[k].v), T(b.v.cells[k].t, b.v.cells[k].v), line);
        if (r) return r;
      }
      return 0;
    }
    this.throwEx('InvalidOperationException', 'Failed to compare two elements in the array. (klasa musi implementować IComparable – metodę CompareTo)', line);
    return 0;
  },

  sortCells(cells, cmpFn, line) {
    const vals = cells.map((c) => T(c.t, c.v));
    vals.sort((x, y) => (cmpFn ? this.numArg(this.invokeFn(cmpFn, [x, y], line), 'Comparison', line) : this.compareTV(x, y, line)));
    cells.forEach((c, k) => { c.v = vals[k].v; });
    this.steps += cells.length * 4;
  },

  nextRandom(r) {
    // mulberry32 – deterministyczny generator
    r.state = (r.state + 0x6d2b79f5) | 0;
    let x = r.state;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  },

  // ---------- składowe statyczne ----------
  staticMember(typeName0, name, line) {
    const tn = TYPE_ALIASES[typeName0] || typeName0;
    const key = `${tn}.${name}`;
    switch (key) {
      case 'int.MaxValue': return T('int', 2147483647);
      case 'int.MinValue': return T('int', -2147483648);
      case 'long.MaxValue': return T('long', 9223372036854775807);
      case 'long.MinValue': return T('long', -9223372036854775808);
      case 'double.MaxValue': return T('double', Number.MAX_VALUE);
      case 'double.MinValue': return T('double', -Number.MAX_VALUE);
      case 'double.Epsilon': return T('double', Number.MIN_VALUE);
      case 'double.NaN': return T('double', NaN);
      case 'double.PositiveInfinity': return T('double', Infinity);
      case 'double.NegativeInfinity': return T('double', -Infinity);
      case 'decimal.MaxValue': return T('decimal', 79228162514264337593543950335);
      case 'char.MaxValue': return T('char', 65535);
      case 'char.MinValue': return T('char', 0);
      case 'Math.PI': return T('double', Math.PI);
      case 'Math.E': return T('double', Math.E);
      case 'string.Empty': return T('string', '');
      case 'Environment.NewLine': return T('string', '\n');
      case 'MidpointRounding.AwayFromZero': return T('mid', 'away');
      case 'MidpointRounding.ToEven': return T('mid', 'even');
      case 'StringSplitOptions.RemoveEmptyEntries': return T('splitopt', 1);
      case 'StringSplitOptions.None': return T('splitopt', 0);
      case 'StringSplitOptions.TrimEntries': return T('splitopt', 2);
      default: return undefined;
    }
  },

  parseNumber(s, t, line) {
    if (s === null) this.throwEx('ArgumentNullException', "Value cannot be null. (Parameter 's')", line);
    if (t === 'int' || t === 'long') {
      const v = parseIntStrict(s);
      if (v === null) this.throwEx('FormatException', `The input string '${s}' was not in a correct format.`, line);
      const [lo, hi, nm] = RANGES[t];
      if (v < lo || v > hi) this.throwEx('OverflowException', `Value was either too large or too small for an ${nm}.`, line);
      return v;
    }
    const v = parseDoubleStrict(s);
    if (v === null) this.throwEx('FormatException', `The input string '${s}' was not in a correct format.`, line);
    return t === 'float' ? Math.fround(v) : v;
  },

  tryParseNumber(s, t) {
    if (s === null) return null;
    if (t === 'int' || t === 'long') {
      const v = parseIntStrict(s);
      if (v === null) return null;
      const [lo, hi] = RANGES[t];
      return v < lo || v > hi ? null : v;
    }
    const v = parseDoubleStrict(s);
    return v === null ? null : (t === 'float' ? Math.fround(v) : v);
  },

  toIntConvert(tv, t, line) {
    const u = this.unbox(tv);
    if (u.t === 'string' || u.t === 'null') return u.v === null ? 0 : this.parseNumber(u.v, t, line);
    if (u.t === 'bool') return u.v ? 1 : 0;
    if (u.t === 'char') return u.v;
    if (isNum(u.t)) {
      const r = isFloatT(u.t) ? mathRound(u.v, 0, false) : u.v;
      const [lo, hi, nm] = RANGES[t];
      if (r < lo || r > hi || !Number.isFinite(r)) this.throwEx('OverflowException', `Value was either too large or too small for an ${nm}.`, line);
      return r;
    }
    this.throwEx('InvalidCastException', `Unable to cast object of type '${netName(u.t, this.types)}' to type 'System.IConvertible'.`, line);
    return 0;
  },

  callStatic(typeName0, name, args, env, line, node) {
    const tn = TYPE_ALIASES[typeName0] || typeName0;
    const A = (k) => this.argTV(args[k]);
    const nm = `${typeName0}.${name}`;
    switch (tn) {
      case 'Console': case 'Console.Error': {
        const type = tn === 'Console.Error' ? 'err' : 'out';
        if (name === 'WriteLine' || name === 'Write') {
          const nl = name === 'WriteLine' ? '\n' : '';
          if (!args.length) { this.write(nl, type); return VOIDV; }
          const first = A(0);
          let text;
          if (args.length > 1 && first.t === 'string') text = this.formatComposite(first.v, args.slice(1).map((a) => this.argTV(a)), line);
          else if (args.length > 1) this.err(`Console.${name}: przy kilku argumentach pierwszy musi być napisem formatującym, np. ("{0} {1}", a, b) – albo połącz wartości operatorem + (CS1503)`, line);
          else if (has(first.t, 'arr') && first.t.arr === 'char') text = first.v.cells.map((c) => String.fromCharCode(c.v)).join('');
          else if (first.t === 'void') this.err(`nie można wypisać wyniku metody typu void (CS1503)`, line);
          else text = this.toStr(first, line);
          this.write(text + nl, type);
          return VOIDV;
        }
        if (tn === 'Console.Error') return undefined;
        if (name === 'ReadLine') { this.needArgs(args, 0, nm, line); return T('string', this.readLine()); }
        if (name === 'Clear' || name === 'Beep' || name === 'ResetColor') return VOIDV;
        if (name === 'ReadKey') return T('object', null);
        if (name === 'Read') {
          const l = this.readLine();
          return T('int', l === null || l === '' ? -1 : l.charCodeAt(0));
        }
        return undefined;
      }
      case 'Math': {
        const n = (k) => this.numArg(A(k), nm, line);
        const D = (v) => T('double', v);
        switch (name) {
          case 'Abs': { this.needArgs(args, 1, nm, line); const a = this.unbox(A(0)); n(0); return T(a.t === 'char' ? 'int' : a.t, Math.abs(a.v)); }
          case 'Max': case 'Min': {
            this.needArgs(args, 2, nm, line);
            const a = this.unbox(A(0)), b = this.unbox(A(1));
            n(0); n(1);
            let t = a.t;
            if (a.t !== b.t) t = numWidens(a.t, b.t) ? b.t : a.t;
            if (t === 'char') t = 'int';
            return T(t, name === 'Max' ? Math.max(a.v, b.v) : Math.min(a.v, b.v));
          }
          case 'Pow': this.needArgs(args, 2, nm, line); return D(Math.pow(n(0), n(1)));
          case 'Sqrt': return D(Math.sqrt(n(0)));
          case 'Cbrt': return D(Math.cbrt(n(0)));
          case 'Floor': case 'Ceiling': case 'Truncate': {
            const a = this.unbox(A(0));
            const f = name === 'Floor' ? Math.floor : name === 'Ceiling' ? Math.ceil : Math.trunc;
            return T(a.t === 'decimal' ? 'decimal' : 'double', f(n(0)));
          }
          case 'Round': {
            const a = this.unbox(A(0));
            let digits = 0;
            let away = false;
            for (let k = 1; k < args.length; k++) {
              const x = A(k);
              if (x.t === 'mid') away = x.v === 'away';
              else digits = this.numArg(x, nm, line);
            }
            return T(a.t === 'decimal' ? 'decimal' : 'double', mathRound(n(0), digits, away));
          }
          case 'Sign': return T('int', Math.sign(n(0)));
          case 'Sin': return D(Math.sin(n(0)));
          case 'Cos': return D(Math.cos(n(0)));
          case 'Tan': return D(Math.tan(n(0)));
          case 'Asin': return D(Math.asin(n(0)));
          case 'Acos': return D(Math.acos(n(0)));
          case 'Atan': return D(Math.atan(n(0)));
          case 'Atan2': return D(Math.atan2(n(0), n(1)));
          case 'Exp': return D(Math.exp(n(0)));
          case 'Log': return D(args.length > 1 ? Math.log(n(0)) / Math.log(n(1)) : Math.log(n(0)));
          case 'Log10': return D(Math.log10(n(0)));
          case 'Log2': return D(Math.log2(n(0)));
          case 'Clamp': { const a = this.unbox(A(0)); return T(a.t, Math.min(Math.max(n(0), n(1)), n(2))); }
          default: return undefined;
        }
      }
      case 'int': case 'long': case 'double': case 'float': case 'decimal': {
        if (name === 'Parse') {
          this.needArgs(args, 1, nm, line);
          return T(tn, this.parseNumber(this.strArg(A(0), nm, line), tn, line));
        }
        if (name === 'TryParse') {
          this.needArgs(args, 2, nm, line);
          const s = this.strArg(A(0), nm, line);
          const cell = this.outCell(args[1], tn, env, line);
          const v = this.tryParseNumber(s, tn);
          cell.v = v === null ? 0 : v;
          cell.unassigned = false;
          return T('bool', v !== null);
        }
        if (name === 'IsNaN') return T('bool', Number.isNaN(this.numArg(A(0), nm, line)));
        if (name === 'IsInfinity') return T('bool', !Number.isFinite(this.numArg(A(0), nm, line)) && !Number.isNaN(this.numArg(A(0), nm, line)));
        if (name === 'IsPositiveInfinity') return T('bool', this.numArg(A(0), nm, line) === Infinity);
        return undefined;
      }
      case 'bool': {
        if (name === 'Parse') {
          const s = (this.strArg(A(0), nm, line) || '').trim().toLowerCase();
          if (s !== 'true' && s !== 'false') this.throwEx('FormatException', `String '${A(0).v}' was not recognized as a valid Boolean.`, line);
          return T('bool', s === 'true');
        }
        if (name === 'TryParse') {
          const s = (this.strArg(A(0), nm, line) || '').trim().toLowerCase();
          const cell = this.outCell(args[1], 'bool', env, line);
          cell.v = s === 'true';
          cell.unassigned = false;
          return T('bool', s === 'true' || s === 'false');
        }
        return undefined;
      }
      case 'char': {
        const ch = () => {
          const a = A(0);
          if (args.length === 2) { const s = this.strArg(a, nm, line); const i = this.numArg(A(1), nm, line); if (i < 0 || i >= s.length) this.throwEx('ArgumentOutOfRangeException', 'Index was out of range.', line); return s[i]; }
          if (a.t !== 'char') this.err(`${nm}: oczekiwano znaku (char), a podano '${csName(a.t)}' – znak zapisujemy w apostrofach 'a' (CS1503)`, line);
          return String.fromCharCode(a.v);
        };
        switch (name) {
          case 'IsDigit': return T('bool', /^[0-9]$/.test(ch()));
          case 'IsNumber': return T('bool', /^\p{N}$/u.test(ch()));
          case 'IsLetter': return T('bool', /^\p{L}$/u.test(ch()));
          case 'IsLetterOrDigit': return T('bool', /^[\p{L}\p{Nd}]$/u.test(ch()));
          case 'IsUpper': return T('bool', /^\p{Lu}$/u.test(ch()));
          case 'IsLower': return T('bool', /^\p{Ll}$/u.test(ch()));
          case 'IsWhiteSpace': return T('bool', /^\s$/.test(ch()));
          case 'IsPunctuation': return T('bool', /^\p{P}$/u.test(ch()));
          case 'IsSymbol': return T('bool', /^\p{S}$/u.test(ch()));
          case 'ToUpper': return T('char', ch().toUpperCase().charCodeAt(0));
          case 'ToLower': return T('char', ch().toLowerCase().charCodeAt(0));
          case 'GetNumericValue': { const c = ch(); return T('double', /^[0-9]$/.test(c) ? Number(c) : -1); }
          case 'Parse': { const s = this.strArg(A(0), nm, line); if (s === null || s.length !== 1) this.throwEx('FormatException', 'String must be exactly one character long.', line); return T('char', s.charCodeAt(0)); }
          default: return undefined;
        }
      }
      case 'string': {
        switch (name) {
          case 'Join': {
            const sep = this.toStr(A(0), line);
            let items;
            if (args.length === 2) {
              const e = this.elems(A(1), line);
              items = e && A(1).t !== 'string' ? e.items : [A(1)];
            } else items = args.slice(1).map((a) => this.argTV(a));
            return T('string', items.map((x) => this.toStr(x, line)).join(sep));
          }
          case 'Concat': return T('string', args.map((a) => {
            const x = this.argTV(a);
            const e = x.t !== 'string' && x.v && (x.v.kind === 'list' || x.v.kind === 'arr') ? this.elems(x, line) : null;
            return e ? e.items.map((y) => this.toStr(y, line)).join('') : this.toStr(x, line);
          }).join(''));
          case 'IsNullOrEmpty': { const s = A(0).v; return T('bool', s === null || s === ''); }
          case 'IsNullOrWhiteSpace': { const s = A(0).v; return T('bool', s === null || s.trim() === ''); }
          case 'Format': return T('string', this.formatComposite(this.strArg(A(0), nm, line), args.slice(1).map((a) => this.argTV(a)), line));
          case 'Compare': {
            let a = A(0).v, b = A(1).v;
            if (args.length > 2 && A(2).v === true) { a = a && a.toLowerCase(); b = b && b.toLowerCase(); }
            return T('int', this.compareTV(T('string', a), T('string', b), line));
          }
          case 'Equals': return T('bool', A(0).v === A(1).v);
          default: return undefined;
        }
      }
      case 'Convert': {
        const a = () => A(0);
        switch (name) {
          case 'ToInt32': return T('int', this.toIntConvert(a(), 'int', line));
          case 'ToInt64': return T('long', this.toIntConvert(a(), 'long', line));
          case 'ToDouble': case 'ToDecimal': case 'ToSingle': {
            const u = this.unbox(a());
            const t = name === 'ToDouble' ? 'double' : name === 'ToDecimal' ? 'decimal' : 'float';
            if (u.t === 'string' || u.t === 'null') return T(t, u.v === null ? 0 : this.parseNumber(u.v, t, line));
            if (u.t === 'bool') return T(t, u.v ? 1 : 0);
            if (u.t === 'char') this.throwEx('InvalidCastException', "Invalid cast from 'Char' to 'Double'.", line);
            return T(t, this.numArg(u, nm, line));
          }
          case 'ToString': {
            if (args.length === 2 && isIntT(A(0).t)) return T('string', A(0).v.toString(A(1).v));
            return T('string', this.toStr(a(), line));
          }
          case 'ToChar': { const u = this.unbox(a()); if (u.t === 'string') { if (u.v.length !== 1) this.throwEx('FormatException', 'String must be exactly one character long.', line); return T('char', u.v.charCodeAt(0)); } return T('char', this.numArg(u, nm, line) & 0xffff); }
          case 'ToBoolean': {
            const u = this.unbox(a());
            if (u.t === 'string') { const s = u.v.trim().toLowerCase(); if (s !== 'true' && s !== 'false') this.throwEx('FormatException', `String '${u.v}' was not recognized as a valid Boolean.`, line); return T('bool', s === 'true'); }
            if (isNum(u.t)) return T('bool', u.v !== 0);
            return T('bool', !!u.v);
          }
          default: return undefined;
        }
      }
      case 'Array': {
        const arr = () => { const x = A(0); if (!x.v || x.v.kind !== 'arr') this.err(`${nm}: pierwszy argument musi być tablicą (CS1503)`, line); return x.v; };
        switch (name) {
          case 'Sort': {
            const a = arr();
            const cmp = args.length > 1 ? this.argTV(args[1], { params: [a.et, a.et], ret: 'int' }).v : null;
            this.sortCells(a.cells, cmp, line);
            return VOIDV;
          }
          case 'Reverse': { const a = arr(); const vals = a.cells.map((c) => c.v).reverse(); a.cells.forEach((c, k) => { c.v = vals[k]; }); return VOIDV; }
          case 'IndexOf': { const a = arr(); const x = A(1); return T('int', a.cells.findIndex((c) => this.valuesEqual(T(c.t, c.v), x))); }
          case 'LastIndexOf': { const a = arr(); const x = A(1); let r = -1; a.cells.forEach((c, k) => { if (this.valuesEqual(T(c.t, c.v), x)) r = k; }); return T('int', r); }
          case 'Exists': { const a = arr(); const f = this.argTV(args[1], { params: [a.et], ret: 'bool' }).v; return T('bool', a.cells.some((c) => this.invokeFn(f, [T(c.t, c.v)], line).v)); }
          case 'Find': { const a = arr(); const f = this.argTV(args[1], { params: [a.et], ret: 'bool' }).v; const c = a.cells.find((x) => this.invokeFn(f, [T(x.t, x.v)], line).v); return T(a.et, c ? c.v : this.defaultOf(a.et)); }
          case 'FindAll': { const a = arr(); const f = this.argTV(args[1], { params: [a.et], ret: 'bool' }).v; const tvs = a.cells.filter((x) => this.invokeFn(f, [T(x.t, x.v)], line).v).map((c) => T(c.t, c.v)); return T({ arr: a.et, rank: 1 }, this.makeArray(a.et, tvs)); }
          case 'Fill': { const a = arr(); const x = A(1); a.cells.forEach((c) => { c.v = this.storeValue(x, a.et, line); }); return VOIDV; }
          case 'Clear': {
            const a = arr();
            const from = args.length > 1 ? A(1).v : 0;
            const len = args.length > 2 ? A(2).v : a.cells.length;
            for (let k = from; k < from + len; k++) a.cells[k].v = this.defaultOf(a.et);
            return VOIDV;
          }
          case 'Copy': {
            let src, dst, si = 0, di = 0, len;
            if (args.length === 3) { src = A(0).v; dst = A(1).v; len = A(2).v; } else { src = A(0).v; si = A(1).v; dst = A(2).v; di = A(3).v; len = A(4).v; }
            if (si + len > src.cells.length || di + len > dst.cells.length) this.throwEx('ArgumentException', 'Destination array was not long enough.', line);
            const vals = src.cells.slice(si, si + len).map((c) => this.copyVal(c.v));
            vals.forEach((v, k) => { dst.cells[di + k].v = v; });
            return VOIDV;
          }
          case 'Resize': {
            if (args[0].mode !== 'ref') this.err("Array.Resize wymaga przekazania tablicy przez ref: Array.Resize(ref t, n) (CS1620)", line);
            const cell = args[0].lv.cell;
            const a = cell.v;
            const n = A(1).v;
            const et = a ? a.et : cell.t.arr;
            const cells = [];
            for (let k = 0; k < n; k++) cells.push(new this.Cell(et, a && k < a.cells.length ? a.cells[k].v : this.defaultOf(et)));
            cell.v = { kind: 'arr', et, cells, dims: [n] };
            return VOIDV;
          }
          default: return undefined;
        }
      }
      case 'Environment':
        if (name === 'Exit') { this.flush(); throw new (this.ExitSignal)(this.numArg(A(0), nm, line)); }
        return undefined;
      default: return undefined;
    }
  },

  // ---------- właściwości wartości wbudowanych ----------
  builtinMember(o, name, line) {
    const v = o.v;
    const t = o.t;
    if (t === 'string') {
      if (name === 'Length') return T('int', v.length);
      return undefined;
    }
    if (has(t, 'nullable')) {
      if (name === 'HasValue') return T('bool', v !== null);
      if (name === 'Value') { if (v === null) this.throwEx('InvalidOperationException', 'Nullable object must have a value.', line); return T(t.nullable, v); }
      return undefined;
    }
    if (v === null || typeof v !== 'object') return undefined;
    switch (v.kind) {
      case 'arr':
        if (name === 'Length') return T('int', v.cells.length);
        if (name === 'Rank') return T('int', v.dims.length);
        return undefined;
      case 'list':
        if (name === 'Count') return T('int', v.cells.length);
        if (name === 'Capacity') return T('int', Math.max(4, v.cells.length));
        return undefined;
      case 'dict':
        if (name === 'Count') return T('int', v.map.size);
        if (name === 'Keys') return T({ list: v.kt }, this.makeList(v.kt, [...v.map.values()].map((e) => e.key)));
        if (name === 'Values') return T({ list: v.vt }, this.makeList(v.vt, [...v.map.values()].map((e) => T(v.vt, e.cell.v))));
        return undefined;
      case 'kvp':
        if (name === 'Key') return v.key;
        if (name === 'Value') return v.val;
        return undefined;
      case 'tuple': { const k = this.tupleIndex(o, name, line); const c = v.cells[k]; return T(c.t, c.v); }
      case 'sb': if (name === 'Length') return T('int', v.s.length); return undefined;
      case 'typeobj': if (name === 'Name') return T('string', v.name); if (name === 'FullName') return T('string', v.full); return undefined;
      default: return undefined;
    }
  },

  // ---------- metody wartości wbudowanych ----------
  callInstance(o, name, args, env, line) {
    const A = (k) => this.argTV(args[k]);
    const v = o.v;
    const t = o.t;
    const u = this.unbox(o);
    // wspólne dla wszystkich typów
    if (name === 'ToString') {
      if (args.length === 1 && isNum(u.t)) return T('string', this.formatValue(u, this.strArg(A(0), 'ToString', line), line));
      this.needArgs(args, 0, 'ToString', line);
      return T('string', this.toStr(o, line));
    }
    if (name === 'Equals' && args.length === 1) return T('bool', this.valuesEqual(o, A(0)));
    if (name === 'GetHashCode') return T('int', 0);
    if (name === 'GetType') {
      const full = netName(u.t, this.types);
      return T('object', { kind: 'typeobj', name: full.split('.').pop().replace(/`.*$/, ''), full });
    }
    if (name === 'CompareTo' && args.length === 1 && (isNum(u.t) || u.t === 'string' || u.t === 'bool' || has(u.t, 'enum'))) return T('int', this.compareTV(u, A(0), line));
    if (name === 'Invoke' && v && v.kind === 'fn') return this.invokeFn(v, args.map((a) => this.argTV(a)), line);
    if (name === 'GetValueOrDefault' && has(t, 'nullable')) return T(t.nullable, v === null ? (args.length ? A(0).v : this.defaultOf(t.nullable)) : v);
    if (t === 'string') return this.stringMethod(v, name, args, A, line);
    if (v && typeof v === 'object') {
      if (v.kind === 'arr') {
        if (name === 'GetLength') { const d = A(0).v; if (d < 0 || d >= v.dims.length) this.throwEx('IndexOutOfRangeException', 'Index was outside the bounds of the array.', line); return T('int', v.dims[d]); }
        if (name === 'GetUpperBound') return T('int', v.dims[A(0).v] - 1);
        if (name === 'Clone') return T(t, { kind: 'arr', et: v.et, cells: v.cells.map((c) => new this.Cell(c.t, this.copyVal(c.v))), dims: [...v.dims] });
        if (name === 'CopyTo') { const dst = A(0).v; const at = A(1).v; v.cells.forEach((c, k) => { dst.cells[at + k].v = this.copyVal(c.v); }); return VOIDV; }
      }
      if (v.kind === 'list') { const r = this.listMethod(o, name, args, A, env, line); if (r !== undefined) return r; }
      if (v.kind === 'dict') { const r = this.dictMethod(o, name, args, A, env, line); if (r !== undefined) return r; }
      if (v.kind === 'sb') return this.sbMethod(o, name, args, A, line);
      if (v.kind === 'random') {
        const r = this.nextRandom(v);
        if (name === 'Next') {
          if (!args.length) return T('int', Math.floor(r * 2147483647));
          if (args.length === 1) { const mx = this.numArg(A(0), 'Next', line); if (mx < 0) this.throwEx('ArgumentOutOfRangeException', "'maxValue' must be greater than zero.", line); return T('int', Math.floor(r * mx)); }
          const lo = this.numArg(A(0), 'Next', line), hi = this.numArg(A(1), 'Next', line);
          if (lo > hi) this.throwEx('ArgumentOutOfRangeException', "'minValue' cannot be greater than maxValue.", line);
          return T('int', lo + Math.floor(r * (hi - lo)));
        }
        if (name === 'NextDouble') return T('double', r);
        return undefined;
      }
    }
    const e = this.elems(o, line);
    if (e) return this.linq(o, e, name, args, line);
    return undefined;
  },

  stringMethod(s, name, args, A, line) {
    const S = (k) => this.strArg(A(k), name, line);
    const N = (k) => this.numArg(A(k), name, line);
    const range = (msg) => this.throwEx('ArgumentOutOfRangeException', msg, line);
    switch (name) {
      case 'ToUpper': case 'ToUpperInvariant': return T('string', s.toUpperCase());
      case 'ToLower': case 'ToLowerInvariant': return T('string', s.toLowerCase());
      case 'Trim': case 'TrimStart': case 'TrimEnd': {
        if (!args.length) return T('string', name === 'Trim' ? s.trim() : name === 'TrimStart' ? s.trimStart() : s.trimEnd());
        const chars = args.map((a) => String.fromCharCode(this.argTV(a).v));
        let a = 0, b = s.length;
        if (name !== 'TrimEnd') while (a < b && chars.includes(s[a])) a++;
        if (name !== 'TrimStart') while (b > a && chars.includes(s[b - 1])) b--;
        return T('string', s.slice(a, b));
      }
      case 'Substring': {
        const st = N(0);
        if (st < 0 || st > s.length) range('startIndex cannot be larger than length of string. (Parameter \'startIndex\')');
        if (args.length > 1) {
          const len = N(1);
          if (len < 0 || st + len > s.length) range("Index and length must refer to a location within the string. (Parameter 'length')");
          return T('string', s.substr(st, len));
        }
        return T('string', s.slice(st));
      }
      case 'IndexOf': case 'LastIndexOf': {
        const what = S(0);
        const from = args.length > 1 ? N(1) : undefined;
        return T('int', name === 'IndexOf' ? s.indexOf(what, from) : s.lastIndexOf(what, from));
      }
      case 'IndexOfAny': { const chars = A(0).v.cells.map((c) => String.fromCharCode(c.v)); return T('int', [...s].findIndex((c) => chars.includes(c))); }
      case 'Contains': return T('bool', s.includes(S(0)));
      case 'StartsWith': return T('bool', s.startsWith(S(0)));
      case 'EndsWith': return T('bool', s.endsWith(S(0)));
      case 'Replace': {
        const a = S(0), b = S(1) ?? '';
        if (a === '') this.throwEx('ArgumentException', "String cannot be of zero length. (Parameter 'oldValue')", line);
        return T('string', s.split(a).join(b));
      }
      case 'Split': {
        let seps = [];
        let removeEmpty = false;
        let trim = false;
        args.forEach((a) => {
          const x = this.argTV(a);
          if (x.t === 'splitopt') { removeEmpty = !!(x.v & 1); trim = !!(x.v & 2); }
          else if (x.t === 'char') seps.push(String.fromCharCode(x.v));
          else if (x.t === 'string') seps.push(x.v);
          else if (x.v && x.v.kind === 'arr') x.v.cells.forEach((c) => seps.push(c.t === 'char' ? String.fromCharCode(c.v) : c.v));
          else if (isIntT(x.t)) { /* count – pomijamy */ }
        });
        let parts;
        if (!seps.length) parts = s.split(/[\s]/);
        else {
          const re = new RegExp(seps.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'));
          parts = s.split(re);
        }
        if (trim) parts = parts.map((p) => p.trim());
        if (removeEmpty) parts = parts.filter((p) => p !== '');
        return T({ arr: 'string', rank: 1 }, this.makeArray('string', parts.map((p) => T('string', p))));
      }
      case 'Insert': { const i = N(0); if (i < 0 || i > s.length) range("Specified argument was out of the range of valid values. (Parameter 'startIndex')"); return T('string', s.slice(0, i) + S(1) + s.slice(i)); }
      case 'Remove': {
        const i = N(0);
        if (i < 0 || i > s.length) range('startIndex must be less than length of string.');
        if (args.length > 1) { const n = N(1); if (i + n > s.length) range('Index and count must refer to a location within the string.'); return T('string', s.slice(0, i) + s.slice(i + n)); }
        return T('string', s.slice(0, i));
      }
      case 'PadLeft': case 'PadRight': {
        const n = N(0);
        const ch = args.length > 1 ? String.fromCharCode(A(1).v) : ' ';
        return T('string', name === 'PadLeft' ? s.padStart(n, ch) : s.padEnd(n, ch));
      }
      case 'ToCharArray': return T({ arr: 'char', rank: 1 }, this.makeArray('char', Array.from(s, (c) => T('char', c.charCodeAt(0)))));
      case 'Equals': return T('bool', s === A(0).v);
      case 'CompareTo': return T('int', this.compareTV(T('string', s), A(0), line));
      default: {
        const e = this.elems(T('string', s), line);
        return this.linq(T('string', s), e, name, args, line);
      }
    }
  },

  listMethod(o, name, args, A, env, line) {
    const l = o.v;
    const et = l.et;
    const bump = () => { l.version = (l.version || 0) + 1; };
    const idxCheck = (i, max) => { if (i < 0 || i > max) this.throwEx('ArgumentOutOfRangeException', "Index was out of range. Must be non-negative and less than or equal to the size of the collection. (Parameter 'index')", line); };
    const pred = (k) => this.argTV(args[k], { params: [et], ret: 'bool' }).v;
    switch (name) {
      case 'Add': this.needArgs(args, 1, 'Add', line); l.cells.push(new this.Cell(et, this.storeValue(A(0), et, line))); bump(); return VOIDV;
      case 'AddRange': { const e = this.elems(A(0), line); e.items.forEach((x) => l.cells.push(new this.Cell(et, this.storeValue(x, et, line)))); bump(); return VOIDV; }
      case 'Insert': { const i = A(0).v; idxCheck(i, l.cells.length); l.cells.splice(i, 0, new this.Cell(et, this.storeValue(A(1), et, line))); bump(); return VOIDV; }
      case 'Remove': { const x = A(0); const k = l.cells.findIndex((c) => this.valuesEqual(T(c.t, c.v), x)); if (k >= 0) { l.cells.splice(k, 1); bump(); } return T('bool', k >= 0); }
      case 'RemoveAt': { const i = A(0).v; idxCheck(i, l.cells.length - 1); l.cells.splice(i, 1); bump(); return VOIDV; }
      case 'RemoveRange': { const i = A(0).v, n = A(1).v; if (i < 0 || i + n > l.cells.length) idxCheck(-1, 0); l.cells.splice(i, n); bump(); return VOIDV; }
      case 'RemoveAll': { const f = pred(0); const before = l.cells.length; l.cells = l.cells.filter((c) => !this.invokeFn(f, [T(c.t, c.v)], line).v); bump(); return T('int', before - l.cells.length); }
      case 'Clear': l.cells = []; bump(); return VOIDV;
      case 'Contains': { const x = A(0); return T('bool', l.cells.some((c) => this.valuesEqual(T(c.t, c.v), x))); }
      case 'IndexOf': { const x = A(0); return T('int', l.cells.findIndex((c) => this.valuesEqual(T(c.t, c.v), x))); }
      case 'LastIndexOf': { const x = A(0); let r = -1; l.cells.forEach((c, k) => { if (this.valuesEqual(T(c.t, c.v), x)) r = k; }); return T('int', r); }
      case 'Sort': { const cmp = args.length ? this.argTV(args[0], { params: [et, et], ret: 'int' }).v : null; this.sortCells(l.cells, cmp, line); bump(); return VOIDV; }
      case 'Reverse': { if (args.length) return undefined; const vals = l.cells.map((c) => c.v).reverse(); l.cells.forEach((c, k) => { c.v = vals[k]; }); bump(); return VOIDV; }
      case 'ToArray': return T({ arr: et, rank: 1 }, this.makeArray(et, l.cells.map((c) => T(c.t, c.v))));
      case 'Find': case 'FindLast': {
        const f = pred(0);
        const arr = name === 'Find' ? l.cells : [...l.cells].reverse();
        const c = arr.find((x) => this.invokeFn(f, [T(x.t, x.v)], line).v);
        return T(et, c ? c.v : this.defaultOf(et));
      }
      case 'FindAll': { const f = pred(0); return T({ list: et }, this.makeList(et, l.cells.filter((x) => this.invokeFn(f, [T(x.t, x.v)], line).v).map((c) => T(c.t, c.v)))); }
      case 'FindIndex': { const f = pred(0); return T('int', l.cells.findIndex((x) => this.invokeFn(f, [T(x.t, x.v)], line).v)); }
      case 'Exists': { const f = pred(0); return T('bool', l.cells.some((x) => this.invokeFn(f, [T(x.t, x.v)], line).v)); }
      case 'TrueForAll': { const f = pred(0); return T('bool', l.cells.every((x) => this.invokeFn(f, [T(x.t, x.v)], line).v)); }
      case 'ForEach': { const f = this.argTV(args[0], { params: [et], ret: 'void' }).v; [...l.cells].forEach((c) => this.invokeFn(f, [T(c.t, c.v)], line)); return VOIDV; }
      case 'GetRange': { const i = A(0).v, n = A(1).v; if (i < 0 || n < 0 || i + n > l.cells.length) this.throwEx('ArgumentException', 'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.', line); return T({ list: et }, this.makeList(et, l.cells.slice(i, i + n).map((c) => T(c.t, c.v)))); }
      default: return undefined;
    }
  },

  dictMethod(o, name, args, A, env, line) {
    const d = o.v;
    const bump = () => { d.version = (d.version || 0) + 1; };
    switch (name) {
      case 'Add': {
        const key = this.dictKey(A(0), d, line);
        if (d.map.has(key)) this.throwEx('ArgumentException', `An item with the same key has already been added. Key: ${this.toStr(A(0), line)}`, line);
        d.map.set(key, { key: T(d.kt, key), cell: new this.Cell(d.vt, this.storeValue(A(1), d.vt, line)) });
        bump();
        return VOIDV;
      }
      case 'ContainsKey': return T('bool', d.map.has(this.dictKey(A(0), d, line)));
      case 'ContainsValue': { const x = A(0); return T('bool', [...d.map.values()].some((e) => this.valuesEqual(T(d.vt, e.cell.v), x))); }
      case 'Remove': { const r = d.map.delete(this.dictKey(A(0), d, line)); if (r) bump(); return T('bool', r); }
      case 'TryGetValue': {
        const e = d.map.get(this.dictKey(A(0), d, line));
        const cell = this.outCell(args[1], d.vt, env, line);
        cell.v = e ? this.copyVal(e.cell.v) : this.defaultOf(d.vt);
        cell.unassigned = false;
        return T('bool', !!e);
      }
      case 'Clear': d.map.clear(); bump(); return VOIDV;
      default: return undefined;
    }
  },

  sbMethod(o, name, args, A, line) {
    const sb = o.v;
    switch (name) {
      case 'Append': if (args.length) sb.s += this.toStr(A(0), line); return o;
      case 'AppendLine': sb.s += (args.length ? this.toStr(A(0), line) : '') + '\n'; return o;
      case 'Insert': { const i = this.numArg(A(0), 'Insert', line); if (i < 0 || i > sb.s.length) this.throwEx('ArgumentOutOfRangeException', 'Index was out of range.', line); sb.s = sb.s.slice(0, i) + this.toStr(A(1), line) + sb.s.slice(i); return o; }
      case 'Remove': { const i = A(0).v, n = A(1).v; if (i < 0 || i + n > sb.s.length) this.throwEx('ArgumentOutOfRangeException', 'Index was out of range.', line); sb.s = sb.s.slice(0, i) + sb.s.slice(i + n); return o; }
      case 'Replace': sb.s = sb.s.split(this.toStr(A(0), line)).join(this.toStr(A(1), line)); return o;
      case 'Clear': sb.s = ''; return o;
      default: return undefined;
    }
  },

  // ---------- LINQ ----------
  linq(o, e, name, args, line) {
    const et = e.et;
    const items = e.items;
    const fn = (k, ret) => this.argTV(args[k], { params: [et], ret }).v;
    const call = (f, x) => this.invokeFn(f, [x], line);
    const noElems = () => this.throwEx('InvalidOperationException', 'Sequence contains no elements', line);
    const listOf = (t, tvs) => T({ list: t }, this.makeList(t, tvs));
    const numT = (tvs, t0) => {
      let t = t0;
      for (const x of tvs) if (isNum(x.t) && isNum(t) && numWidens(t, x.t)) t = x.t;
      return t === 'char' ? 'int' : t;
    };
    switch (name) {
      case 'Count': case 'LongCount': {
        if (!args.length) return T('int', items.length);
        const f = fn(0, 'bool');
        return T('int', items.filter((x) => call(f, x).v).length);
      }
      case 'Sum': case 'Average': case 'Max': case 'Min': {
        let vals = items;
        if (args.length) { const f = fn(0, null); vals = items.map((x) => call(f, x)); }
        if (!vals.length) {
          if (name === 'Sum') return T(args.length ? 'int' : (et === 'char' ? 'int' : et), 0);
          noElems();
        }
        if (name === 'Max' || name === 'Min') {
          let best = vals[0];
          for (const x of vals) { const c = this.compareTV(x, best, line); if (name === 'Max' ? c > 0 : c < 0) best = x; }
          return best;
        }
        for (const x of vals) this.numArg(x, name, line);
        const t = numT(vals, vals[0].t);
        const s = vals.reduce((acc, x) => acc + this.unbox(x).v, 0);
        if (name === 'Sum') return T(t, this.fit(s, t));
        return T(t === 'decimal' ? 'decimal' : 'double', s / vals.length);
      }
      case 'Where': { const f = fn(0, 'bool'); return listOf(et, items.filter((x) => call(f, x).v)); }
      case 'Select': {
        const f = fn(0, null);
        const res = items.map((x) => call(f, x));
        const rt = res.length ? res[0].t : 'object';
        return listOf(rt, res);
      }
      case 'OrderBy': case 'OrderByDescending': {
        const f = args.length ? fn(0, null) : null;
        const keyed = items.map((x, k) => ({ x, key: f ? call(f, x) : x, k }));
        keyed.sort((a, b) => {
          const c = this.compareTV(a.key, b.key, line);
          return (name === 'OrderBy' ? c : -c) || a.k - b.k;
        });
        this.steps += items.length * 4;
        return listOf(et, keyed.map((q) => q.x));
      }
      case 'ToList': return listOf(et, items);
      case 'ToArray': return T({ arr: et, rank: 1 }, this.makeArray(et, items));
      case 'First': case 'FirstOrDefault': case 'Last': case 'LastOrDefault': {
        let arr = name.startsWith('Last') ? [...items].reverse() : items;
        if (args.length) { const f = fn(0, 'bool'); arr = arr.filter((x) => call(f, x).v); }
        if (!arr.length) {
          if (name.endsWith('OrDefault')) return T(et, this.defaultOf(et));
          this.throwEx('InvalidOperationException', args.length ? 'Sequence contains no matching element' : 'Sequence contains no elements', line);
        }
        return arr[0];
      }
      case 'Any': { if (!args.length) return T('bool', items.length > 0); const f = fn(0, 'bool'); return T('bool', items.some((x) => call(f, x).v)); }
      case 'All': { const f = fn(0, 'bool'); return T('bool', items.every((x) => call(f, x).v)); }
      case 'Contains': { const x = this.argTV(args[0]); return T('bool', items.some((y) => this.valuesEqual(y, x))); }
      case 'Distinct': {
        const out = [];
        for (const x of items) if (!out.some((y) => this.valuesEqual(x, y))) out.push(x);
        return listOf(et, out);
      }
      case 'Reverse': return listOf(et, [...items].reverse());
      case 'Take': return listOf(et, items.slice(0, Math.max(0, this.argTV(args[0]).v)));
      case 'Skip': return listOf(et, items.slice(Math.max(0, this.argTV(args[0]).v)));
      case 'ElementAt': {
        const i = this.argTV(args[0]).v;
        if (i < 0 || i >= items.length) this.throwEx('ArgumentOutOfRangeException', "Index was out of range. (Parameter 'index')", line);
        return items[i];
      }
      default: return undefined;
    }
  },

  // ---------- new dla typów wbudowanych ----------
  newBuiltin(t, args, line) {
    const A = (k) => this.argTV(args[k]);
    if (has(t, 'list')) {
      const l = this.makeList(t.list, []);
      if (args.length === 1 && !isIntT(A(0).t)) {
        const e = this.elems(A(0), line);
        if (!e) this.err(`List<${csName(t.list)}> można utworzyć z innej kolekcji lub pojemności (int) (CS1503)`, line);
        e.items.forEach((x) => l.cells.push(new this.Cell(t.list, this.storeValue(x, t.list, line))));
      }
      return T(t, l);
    }
    if (has(t, 'dict')) return T(t, { kind: 'dict', kt: t.dict[0], vt: t.dict[1], map: new Map(), version: 0 });
    if (t === 'sb') return T(t, { kind: 'sb', s: args.length && A(0).t === 'string' ? A(0).v : '' });
    if (t === 'random') return T(t, { kind: 'random', state: args.length ? this.numArg(A(0), 'Random', line) : this.seed });
    if (t === 'string') {
      if (args.length === 2) return T('string', String.fromCharCode(A(0).v).repeat(Math.max(0, A(1).v)));
      if (args.length === 1 && A(0).v && A(0).v.kind === 'arr') return T('string', A(0).v.cells.map((c) => String.fromCharCode(c.v)).join(''));
      this.err('new string(...) przyjmuje (znak, liczba) albo (tablica char[]) (CS1729)', line);
    }
    if (t === 'object') return T('object', { kind: 'plainobj' });
    if (has(t, 'arr')) this.err('tablicę tworzymy z rozmiarem w nawiasach kwadratowych: new int[5] (CS1586)', line);
    this.err(`nie można utworzyć obiektu typu '${csName(t)}' przez new`, line);
    return null;
  },

  applyCollectionInit(r, init, env, line) {
    const v = r.v;
    if (init.members.length) this.err('inicjalizator obiektu { Pole = ... } wymaga klasy użytkownika', line);
    if (v.kind === 'list') {
      for (const it of init.items) v.cells.push(new this.Cell(v.et, this.storeValue(this.evalWithTarget(it.value, env, v.et), v.et, line)));
      return;
    }
    if (v.kind === 'dict') {
      for (const it of init.items) {
        if (!it.key) this.err('w inicjalizatorze słownika podawaj pary { klucz, wartość } albo [klucz] = wartość', line);
        const k = this.eval(it.key, env);
        const key = this.dictKey(k, v, line);
        v.map.set(key, { key: T(v.kt, key), cell: new this.Cell(v.vt, this.storeValue(this.evalWithTarget(it.value, env, v.vt), v.vt, line)) });
      }
      return;
    }
    this.err(`typ '${csName(r.t)}' nie obsługuje inicjalizatora kolekcji { ... }`, line);
  },
};
