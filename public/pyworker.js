/* Web Worker z interpreterem Pythona (Pyodide – CPython skompilowany do WebAssembly).
   Worker jest długowieczny: Pyodide ładuje się raz (kilka sekund), a kolejne programy
   uruchamiane są w świeżej przestrzeni nazw. */
/* global loadPyodide */
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
importScripts(PYODIDE_URL + 'pyodide.js');

const WRAPPER = `
import sys, builtins, random, traceback, io

class _LabNeedInput(BaseException):
    pass

_orig_input = builtins.input

def _lab_killer(frame, event, arg):
    if event == 'line' and frame.f_code.co_filename == 'main.py':
        raise _LabNeedInput()
    return _lab_killer

def _lab_global_killer(frame, event, arg):
    if frame.f_code.co_filename == 'main.py':
        return _lab_killer
    return None

def _lab_run(code, inputs, interactive, seed, echo):
    lines = list(inputs)
    pos = [0]
    needed = [False]

    def _next_line():
        if pos[0] < len(lines):
            line = lines[pos[0]]
            pos[0] += 1
            sys.stdout.flush()
            echo(line)
            return line
        if interactive:
            needed[0] = True
            # nawet jeśli program złapie wyjątek przez "except:", zatrzymujemy go
            sys.settrace(_lab_global_killer)
            f = sys._getframe(1)
            while f is not None:
                if f.f_code.co_filename == 'main.py':
                    f.f_trace = _lab_killer
                f = f.f_back
            raise _LabNeedInput()
        raise EOFError('EOF when reading a line')

    def _input(prompt=''):
        if prompt != '':
            sys.stdout.write(str(prompt))
        sys.stdout.flush()
        return _next_line()

    class _Stdin(io.TextIOBase):
        def readable(self):
            return True
        def readline(self, size=-1):
            try:
                return _next_line() + '\\n'
            except EOFError:
                return ''
        def read(self, size=-1):
            out = []
            while True:
                part = self.readline()
                if not part:
                    break
                out.append(part)
            return ''.join(out)
        def readlines(self, hint=-1):
            return self.read().splitlines(True)

    old_stdin = sys.stdin
    builtins.input = _input
    sys.stdin = _Stdin()
    random.seed(seed)
    sys.setrecursionlimit(1000)
    ns = {'__name__': '__main__', '__builtins__': builtins}
    result = {'status': 'done', 'error': None, 'exit': 0}
    try:
        compiled = compile(code, 'main.py', 'exec')
        exec(compiled, ns)
    except _LabNeedInput:
        result['status'] = 'need-input'
    except SystemExit as e:
        c = e.code
        if c is None:
            result['exit'] = 0
        elif isinstance(c, int):
            result['exit'] = c
        else:
            print(c, file=sys.stderr)
            result['exit'] = 1
    except SyntaxError as e:
        result['status'] = 'error'
        result['error'] = {'type': type(e).__name__, 'message': str(e.msg), 'line': e.lineno, 'kind': 'compile'}
    except BaseException as e:
        result['status'] = 'error'
        line = None
        for fr in traceback.extract_tb(e.__traceback__):
            if fr.filename == 'main.py':
                line = fr.lineno
        result['error'] = {'type': type(e).__name__, 'message': str(e), 'line': line, 'kind': 'runtime'}
    finally:
        sys.settrace(None)
        try:
            sys.stdout.flush()
        except BaseException:
            pass
        builtins.input = _orig_input
        sys.stdin = old_stdin
    if needed[0]:
        result['status'] = 'need-input'
        result['error'] = None
    return result
`;

let pyodide = null;
const ready = (async () => {
  pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
  pyodide.runPython(WRAPPER);
})();

ready.then(
  () => postMessage({ type: 'ready' }),
  (e) => postMessage({ type: 'load-error', message: String(e && e.message ? e.message : e) }),
);

const MAX_OUTPUT = 200000;
let segments = [];
let outLen = 0;
let lastFlush = 0;
let currentId = null;

function write(text, type) {
  if (!text) return;
  outLen += text.length;
  if (outLen > MAX_OUTPUT) throw new Error('LAB_OUTPUT_LIMIT');
  const last = segments[segments.length - 1];
  if (last && last.type === type) last.text += text;
  else segments.push({ type, text });
  const now = Date.now();
  if (now - lastFlush > 60) {
    lastFlush = now;
    postMessage({ type: 'chunk', id: currentId, segments });
    segments = [];
  }
}

self.onmessage = async (e) => {
  const { id, code, inputs, interactive, seed } = e.data;
  try {
    await ready;
  } catch (err) {
    postMessage({ type: 'result', id, result: { status: 'error', segments: [], warnings: [], error: { kind: 'internal', line: null, message: `nie udało się wczytać interpretera Pythona (Pyodide): ${err}. Sprawdź połączenie z internetem.` } } });
    return;
  }
  currentId = id;
  segments = [];
  outLen = 0;
  lastFlush = Date.now();
  const outDec = new TextDecoder();
  const errDec = new TextDecoder();
  pyodide.setStdout({ write: (buf) => { write(outDec.decode(buf, { stream: true }), 'out'); return buf.length; } });
  pyodide.setStderr({ write: (buf) => { write(errDec.decode(buf, { stream: true }), 'err'); return buf.length; } });
  const started = Date.now();
  let result;
  try {
    const run = pyodide.globals.get('_lab_run');
    const pyInputs = pyodide.toPy(inputs);
    const echo = (line) => write(String(line) + '\n', 'in');
    const r = run(code, pyInputs, interactive, seed, echo);
    const obj = r.toJs({ dict_converter: Object.fromEntries });
    r.destroy();
    pyInputs.destroy();
    run.destroy();
    result = { status: obj.status, exitCode: obj.exit, error: obj.error ? { ...obj.error } : null };
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    result = msg.includes('LAB_OUTPUT_LIMIT')
      ? { status: 'error', error: { kind: 'limit', line: null, message: 'program wypisał zbyt dużo danych – przerwano (możliwa nieskończona pętla)' } }
      : { status: 'error', error: { kind: 'internal', line: null, message: msg.split('\n').slice(-3).join(' ') } };
  }
  postMessage({ type: 'result', id, result: { ...result, segments, warnings: [], ms: Date.now() - started } });
  segments = [];
};
