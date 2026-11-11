// Warstwa uruchamiania programów w Web Workerze.
//
// Interaktywne cin działa w trybie "powtórki": gdy program potrzebuje danych,
// worker kończy pracę ze statusem 'need-input'. Po wpisaniu linii przez ucznia
// program jest uruchamiany od nowa z dopisaną linią. Ponieważ wykonanie jest
// deterministyczne (stałe ziarno rand/time), wynik jest identyczny jak w prawdziwej konsoli.
//
// Języki: C++ i C# – własne interpretery w krótko żyjącym workerze (worker.js),
// Python – Pyodide w długowiecznym workerze (public/pyworker.js).
//
// Miejsce na podpięcie zewnętrznej piaskownicy (np. kompilatora na serwerze):
// wystarczy zaimplementować funkcję o tym samym interfejsie co executeOnce().
import { translatePyError } from './python/errors.js';

// ---------- Python (Pyodide) ----------
class PyEngine {
  constructor() {
    this.worker = null;
    this.ready = null;
    this.isReady = false;
    this.queue = Promise.resolve();
    this.nextId = 1;
    this.handlers = new Map();
    this.listeners = new Set();
  }

  onStatus(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(status) { for (const fn of this.listeners) fn(status); }

  ensure() {
    if (this.worker) return this.ready;
    const base = (import.meta.env && import.meta.env.BASE_URL) || '/';
    this.worker = new Worker(`${base}pyworker.js`);
    this.isReady = false;
    this.emit('loading');
    this.ready = new Promise((resolve) => {
      this.worker.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === 'ready') { this.isReady = true; this.emit('ready'); resolve(true); return; }
        if (msg.type === 'load-error') { this.emit('error'); resolve(false); return; }
        const h = this.handlers.get(msg.id);
        if (!h) return;
        if (msg.type === 'chunk') h.onChunk?.(msg.segments);
        else if (msg.type === 'result') h.done(msg.result);
      };
      this.worker.onerror = () => { this.emit('error'); resolve(false); };
    });
    return this.ready;
  }

  kill() {
    if (this.worker) this.worker.terminate();
    this.worker = null;
    this.ready = null;
    this.isReady = false;
    const pending = [...this.handlers.values()];
    this.handlers.clear();
    this.queue = Promise.resolve();
    for (const h of pending) h.done({ status: 'stopped', segments: [], warnings: [], error: null });
  }

  run(job, onChunk) {
    let cancelFn = () => {};
    let settled = false;
    const promise = new Promise((resolve) => {
      const finish = (r) => { if (!settled) { settled = true; resolve(r); } };
      cancelFn = () => {
        if (settled) return;
        finish({ status: 'stopped', segments: [], warnings: [], error: null });
        this.kill();
      };
      this.queue = this.queue.then(async () => {
        if (settled) return;
        await this.ensure();
        if (settled) return;
        const id = this.nextId++;
        await new Promise((done) => {
          const timer = setTimeout(() => {
            this.handlers.delete(id);
            finish({ status: 'error', segments: [], warnings: [], error: { kind: 'limit', line: null, message: `przekroczono limit czasu (${Math.round(job.timeLimit / 1000)} s) – możliwa nieskończona pętla` } });
            this.kill();
            done();
          }, job.timeLimit);
          this.handlers.set(id, {
            onChunk,
            done: (result) => {
              clearTimeout(timer);
              this.handlers.delete(id);
              if (result.error) result.error = translatePyError(result.error);
              finish(result);
              done();
            },
          });
          this.worker.postMessage({ id, code: job.code, inputs: job.inputs, interactive: job.interactive, seed: job.seed });
        });
      });
    });
    return { promise, cancel: () => cancelFn() };
  }
}

export const pyEngine = new PyEngine();

function executeOnce(job, onChunk) {
  if (job.lang === 'python') return pyEngine.run(job, onChunk);
  return executeInWorker(job, onChunk);
}

function executeInWorker({ lang, code, inputs, interactive, seed, timeLimit }, onChunk) {
  const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  let settled = false;
  let resolveFn;
  const promise = new Promise((resolve) => {
    resolveFn = resolve;
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'chunk') onChunk?.(msg.segments);
      else if (msg.type === 'result') {
        settled = true;
        worker.terminate();
        resolve(msg.result);
      }
    };
    worker.onerror = (err) => {
      settled = true;
      worker.terminate();
      resolve({ status: 'error', segments: [], warnings: [], error: { kind: 'internal', line: null, message: err.message || 'błąd workera' } });
    };
  });
  worker.postMessage({ lang, code, inputs, interactive, seed, timeLimit });
  const cancel = () => {
    if (settled) return;
    settled = true;
    worker.terminate();
    resolveFn({ status: 'stopped', segments: [], warnings: [], error: null });
  };
  return { promise, cancel };
}

export class Runner {
  constructor() {
    this.current = null;
  }

  // Interaktywne uruchomienie (konsola). Zwraca obiekt sesji.
  start(code, { onUpdate, onNeedInput, onFinish, lang = 'cpp' }) {
    this.stop();
    const session = {
      code,
      inputs: [],
      seed: Math.floor(Date.now() / 1000),
      stopped: false,
      exec: null,
    };
    this.current = session;

    const textLen = (segs) => segs.reduce((n, s) => n + s.text.length, 0);
    session.shownLen = 0;

    const runAttempt = () => {
      let live = [];
      const exec = executeOnce(
        { lang, code, inputs: session.inputs, interactive: true, seed: session.seed, timeLimit: 15000 },
        (segs) => {
          live = mergeSegments(live, segs);
          // przy powtórce nie pokazuj krótszego (częściowego) wyniku – unikamy migotania
          if (!session.stopped && textLen(live) >= session.shownLen) {
            session.shownLen = textLen(live);
            onUpdate(live, false);
          }
        },
      );
      session.exec = exec;
      exec.promise.then((result) => {
        if (session.stopped && result.status !== 'stopped') return;
        const segments = mergeSegments(live, result.segments || []);
        session.shownLen = textLen(segments);
        if (result.status === 'need-input') {
          onUpdate(segments, true);
          onNeedInput();
          return;
        }
        if (result.status === 'stopped') return;
        onUpdate(segments, false);
        onFinish(result, segments);
        if (this.current === session) this.current = null;
      });
    };

    session.provideInput = (line) => {
      if (session.stopped) return;
      session.inputs.push(line);
      runAttempt();
    };

    runAttempt();
    return session;
  }

  stop() {
    const s = this.current;
    if (s) {
      s.stopped = true;
      s.exec?.cancel();
      this.current = null;
      return true;
    }
    return false;
  }
}

export function mergeSegments(a, b) {
  const out = a.map((s) => ({ ...s }));
  for (const s of b) {
    const last = out[out.length - 1];
    if (last && last.type === s.type) last.text += s.text;
    else out.push({ ...s });
  }
  return out;
}

// Uruchomienie nieinteraktywne – używane przez automatyczne testy zadań.
export async function runWithInput(code, inputText, timeLimit = 4000, lang = 'cpp') {
  const inputs = inputText === '' ? [] : inputText.replace(/\n$/, '').split('\n');
  const exec = executeOnce({ lang, code, inputs, interactive: false, seed: 1700000000, timeLimit }, null);
  const timer = lang === 'python' ? null : setTimeout(() => exec.cancel(), timeLimit + 1500);
  const result = await exec.promise;
  if (timer) clearTimeout(timer);
  if (result.status === 'stopped') {
    return { ...result, status: 'error', error: { kind: 'limit', line: null, message: 'przekroczono limit czasu' } };
  }
  return result;
}

// Porównanie wyjścia programu z oczekiwanym wynikiem.
// Zasada: każda oczekiwana linia musi pojawić się (w kolejności) na końcu którejś
// linii wyjścia – dzięki temu komunikaty typu "Podaj liczbę: " nie psują testu.
export function checkOutput(output, expected) {
  const norm = (s) => s.replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter((l) => l.length);
  const outLines = norm(output);
  const expLines = norm(expected);
  let k = 0;
  for (const exp of expLines) {
    let found = false;
    while (k < outLines.length) {
      const line = outLines[k++];
      if (line === exp) { found = true; break; }
      if (line.endsWith(exp)) {
        const before = line[line.length - exp.length - 1];
        if (!/[\p{L}\p{N}.,-]/u.test(before) || !/^[\p{L}\p{N}]/u.test(exp)) { found = true; break; }
      }
    }
    if (!found) return false;
  }
  return true;
}
