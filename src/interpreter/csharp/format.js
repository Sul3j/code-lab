// Formatowanie liczb zgodne z .NET (kultura niezmienna – kropka dziesiętna).

function pad2exp(e) {
  const a = Math.abs(e);
  return `${e < 0 ? '-' : '+'}${a < 10 ? '0' + a : a}`;
}

// double.ToString() – najkrótszy zapis jednoznaczny ("R"), notacja E dla bardzo dużych/małych
export function fmtDouble(v, maxExp = 16) {
  if (Number.isNaN(v)) return 'NaN';
  if (v === Infinity) return 'Infinity';
  if (v === -Infinity) return '-Infinity';
  if (v === 0) return Object.is(v, -0) ? '-0' : '0';
  const [m, e] = v.toExponential().split('e');
  const exp = parseInt(e, 10);
  if (exp > maxExp || exp <= -5) return `${m}E${pad2exp(exp)}`;
  if (exp >= 21) return BigInt(Math.round(v)).toString();
  return String(v);
}

export function fmtFloat(v) {
  if (!Number.isFinite(v) || v === 0) return fmtDouble(v);
  const f = Math.fround(v);
  for (let p = 1; p <= 9; p++) {
    const s = Number(f.toPrecision(p));
    if (Math.fround(s) === f) return fmtDouble(s, 8);
  }
  return fmtDouble(f, 8);
}

export function fmtDecimal(v) {
  if (v === 0) return '0';
  const s = Number(v.toPrecision(15));
  const str = String(s);
  return str.includes('e') ? s.toFixed(Math.max(0, 15)).replace(/\.?0+$/, '') : str;
}

function groupThousands(intPart) {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// liczba całkowita / rzeczywista ze specyfikatorem formatu (F2, N2, D3, E2, P1, X, 0.00 ...)
export function formatNumber(v, spec, isInteger) {
  if (!spec) return null;
  const m = spec.match(/^([A-Za-z])(\d*)$/);
  if (m) {
    const kind = m[1].toUpperCase();
    const digits = m[2] === '' ? null : parseInt(m[2], 10);
    switch (kind) {
      case 'F': return roundFixed(v, digits ?? 2);
      case 'N': {
        const s = roundFixed(Math.abs(v), digits ?? 2);
        const [ip, fp] = s.split('.');
        return (v < 0 && Number(s) !== 0 ? '-' : '') + groupThousands(ip) + (fp !== undefined ? '.' + fp : '');
      }
      case 'D':
        if (!isInteger) return null;
        return (v < 0 ? '-' : '') + String(Math.abs(v)).padStart(digits ?? 0, '0');
      case 'E': {
        const [mm, ee] = v.toExponential(digits ?? 6).split('e');
        const exp = parseInt(ee, 10);
        const ex = String(Math.abs(exp)).padStart(3, '0');
        const r = `${mm}E${exp < 0 ? '-' : '+'}${ex}`;
        return m[1] === 'e' ? r.toLowerCase() : r;
      }
      case 'P': {
        const s = formatNumber(v * 100, `N${digits ?? 2}`, false);
        return `${s} %`;
      }
      case 'X': {
        if (!isInteger) return null;
        const u = v < 0 ? (v >>> 0) : v;
        const s = u.toString(16).padStart(digits ?? 0, '0');
        return m[1] === 'X' ? s.toUpperCase() : s;
      }
      case 'C': return '¤' + formatNumber(v, `N${digits ?? 2}`, false);
      case 'G': return null;
      default: return null;
    }
  }
  // format własny: 0.00, #.##, 000, #,##0.00
  if (/^[0#,.]+$/.test(spec)) {
    const [ipat, fpat = ''] = spec.split('.');
    const minFrac = (fpat.match(/0/g) || []).length;
    const maxFrac = fpat.length;
    const minInt = (ipat.replace(/,/g, '').match(/0/g) || []).length;
    let s = roundFixed(Math.abs(v), maxFrac);
    let [ip, fp = ''] = s.split('.');
    while (fp.length > minFrac && fp.endsWith('0')) fp = fp.slice(0, -1);
    if (ip === '0' && minInt === 0) ip = '';
    ip = ip.padStart(minInt, '0');
    if (ipat.includes(',')) ip = groupThousands(ip);
    s = ip + (fp ? '.' + fp : '');
    if (s === '') s = '0';
    return (v < 0 && Number(s) !== 0 ? '-' : '') + s;
  }
  return null;
}

// zaokrąglenie do n miejsc (połówki od zera – jak przy formatowaniu w .NET)
export function roundFixed(v, n) {
  if (!Number.isFinite(v)) return String(v);
  const s = v.toFixed(Math.min(n, 100));
  return s === '-0' || /^-0\.0*$/.test(s) ? s.slice(1) : s;
}

// Math.Round – zaokrąglenie bankierskie (do parzystej) lub "od zera"
export function mathRound(x, digits = 0, awayFromZero = false) {
  const m = 10 ** digits;
  const y = x * m;
  const f = Math.floor(y);
  const diff = y - f;
  let r;
  if (diff === 0.5) {
    if (awayFromZero) r = y >= 0 ? f + 1 : f;
    else r = f % 2 === 0 ? f : f + 1;
  } else r = Math.round(y);
  return r / m;
}

// .NET: int.Parse / double.Parse (kultura niezmienna)
export function parseIntStrict(s) {
  if (s === null || s === undefined) return null;
  const t = s.trim();
  if (!/^[+-]?\d+$/.test(t)) return null;
  return Number(t);
}

export function parseDoubleStrict(s) {
  if (s === null || s === undefined) return null;
  const t = s.trim();
  if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) return Number(t);
  if (/^[+-]?(Infinity|∞)$/.test(t)) return t.startsWith('-') ? -Infinity : Infinity;
  if (t === 'NaN') return NaN;
  return null;
}
