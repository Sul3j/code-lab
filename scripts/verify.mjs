// Weryfikacja bazy zadań: npm run verify
// 1) każdy kod (szablon, przykład, starter, rozwiązanie) zawiera `using namespace std;`
// 2) każdy przykład i starter uruchamia się bez błędu kompilacji
// 3) każde rozwiązanie przechodzi wszystkie testy i wymagania (checks)
import { runProgram } from '../src/interpreter/interpreter.js';
import { checkOutput } from '../src/interpreter/runner.js';
import { MODULES } from '../src/data/modules.js';
import { DEFAULT_TEMPLATE } from '../src/data/template.js';
import { CHEATSHEET } from '../src/data/cheatsheet.js';
import { SANDBOX_TEMPLATES } from '../src/data/sandbox.js';
import { runCSharp } from '../src/interpreter/csharp/interpreter.js';
import { getCourse } from '../src/data/course.js';
import { CS_TEMPLATE } from '../src/data/lang-templates.js';
import { CS_SANDBOX_TEMPLATES, PY_SANDBOX_TEMPLATES } from '../src/data/sandbox-langs.js';
import { CHEATSHEET_CS } from '../src/data/cheatsheet-cs.js';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const USING = /using\s+namespace\s+std\s*;/;
let failures = 0;
let checked = 0;
const fail = (msg) => { failures++; console.log('  ✗ ' + msg); };

function outText(r) {
  return r.segments.filter((s) => s.type === 'out').map((s) => s.text).join('');
}

function requireUsing(label, code) {
  checked++;
  if (!USING.test(code)) fail(`${label}: brak 'using namespace std;'`);
}

function compiles(label, code, input = '') {
  const r = runProgram(code, { inputs: input ? input.split('\n') : [], timeLimit: 3000 });
  if (r.status === 'error' && r.error.kind !== 'runtime') fail(`${label}: ${r.error.kind} L${r.error.line}: ${r.error.message}`);
  return r;
}

requireUsing('DEFAULT_TEMPLATE', DEFAULT_TEMPLATE);
compiles('DEFAULT_TEMPLATE', DEFAULT_TEMPLATE);

for (const t of SANDBOX_TEMPLATES) {
  requireUsing(`piaskownica/${t.id}`, t.code);
  const r = compiles(`piaskownica/${t.id}`, t.code, 'Ola\n7');
  if (r.status !== 'done') fail(`piaskownica/${t.id}: ${r.status} ${r.error && r.error.message}`);
}

for (const sec of CHEATSHEET) {
  for (const item of sec.items) {
    if (item.code && /#include/.test(item.code)) {
      requireUsing(`ściąga/${item.title}`, item.code);
      compiles(`ściąga/${item.title}`, item.code);
    }
  }
}

for (const m of MODULES) {
  console.log(`Moduł ${m.number}: ${m.title}`);
  for (const b of m.theory) {
    if (b.type === 'code' && /int\s+main\s*\(/.test(b.code)) {
      requireUsing(`${m.id}/teoria`, b.code);
      const r = compiles(`${m.id}/teoria`, b.code);
      if (r.status !== 'done') fail(`${m.id}/teoria: ${r.status} ${r.error && r.error.message}`);
    }
  }
  requireUsing(`${m.id}/przykład`, m.example.code);
  const ex = compiles(`${m.id}/przykład`, m.example.code, m.example.input ?? 'Ola\n15\n5');
  if (ex.status !== 'done') fail(`${m.id}/przykład: ${ex.status} ${ex.error && ex.error.message}`);
  if (ex.warnings.length) fail(`${m.id}/przykład: ostrzeżenia ${JSON.stringify(ex.warnings)}`);
  for (const t of m.tasks) {
    requireUsing(`${t.id}/starter`, t.starter);
    requireUsing(`${t.id}/rozwiązanie`, t.solution);
    if (!t.starterIncomplete) compiles(`${t.id}/starter`, t.starter, t.tests[0].input);
    for (const c of t.checks || []) {
      if (!new RegExp(c.pattern).test(t.solution)) fail(`${t.id}: rozwiązanie nie spełnia wymagania: ${c.message}`);
    }
    if (t.exampleInput !== undefined && !t.tests.some((x) => x.input === t.exampleInput)) fail(`${t.id}: przykładowe wejście nie jest testem`);
    for (const [k, test] of t.tests.entries()) {
      checked++;
      const r = runProgram(t.solution, { inputs: test.input ? test.input.split('\n') : [], timeLimit: 3000 });
      if (r.status !== 'done') { fail(`${t.id} test ${k + 1}: ${r.status} ${r.error && r.error.message}`); continue; }
      if (!checkOutput(outText(r), test.expected)) {
        fail(`${t.id} test ${k + 1}: oczekiwano ${JSON.stringify(test.expected)}, otrzymano ${JSON.stringify(outText(r))}`);
      }
    }
    // starter nie powinien przechodzić testów (inaczej zadanie jest puste)
    const sr = runProgram(t.starter, { inputs: t.tests[0].input ? t.tests[0].input.split('\n') : [], timeLimit: 3000 });
    if (sr.status === 'done' && t.tests.every((test) => {
      const r = runProgram(t.starter, { inputs: test.input ? test.input.split('\n') : [], timeLimit: 3000 });
      return r.status === 'done' && checkOutput(outText(r), test.expected);
    })) fail(`${t.id}: kod startowy już przechodzi testy`);
  }
}

// ───────────────────────── C# (własny interpreter) ─────────────────────────
const toInputs = (text) => (text === '' || text === undefined ? [] : text.replace(/\n$/, '').split('\n'));
const USING_SYSTEM = /^\s*using\s+System\s*;/m;
const csRun = (code, input) => runCSharp(code, { inputs: toInputs(input), timeLimit: 3000, seed: 1700000000 });
const isCsProgram = (code) => /static\s+(?:void|int)\s+Main\s*\(/.test(code);

function csMustRun(label, code, input = '') {
  checked++;
  if (!USING_SYSTEM.test(code)) fail(`${label}: brak 'using System;'`);
  const r = csRun(code, input);
  if (r.status !== 'done') fail(`${label}: ${r.status} ${r.error && `${r.error.kind} L${r.error.line}: ${r.error.message}`}`);
  return r;
}

console.log('\n══ Kurs C# ══');
csMustRun('C#/szablon', CS_TEMPLATE);
for (const t of CS_SANDBOX_TEMPLATES) csMustRun(`C#/piaskownica/${t.id}`, t.code, 'Ola\n7');
for (const sec of CHEATSHEET_CS) for (const it of sec.items) if (it.code && isCsProgram(it.code)) csMustRun(`C#/ściąga/${it.title}`, it.code);

const csCourse = getCourse('csharp');
for (const m of csCourse.MODULES) {
  console.log(`C# ${m.number}: ${m.title}`);
  for (const b of m.theory) if (b.type === 'code' && isCsProgram(b.code)) csMustRun(`${m.id}/teoria`, b.code);
  const ex = csMustRun(`${m.id}/przykład`, m.example.code, m.example.input ?? '');
  if (ex.warnings?.length) fail(`${m.id}/przykład: ostrzeżenia ${JSON.stringify(ex.warnings)}`);
  for (const t of m.tasks) {
    checked++;
    if (!USING_SYSTEM.test(t.starter) || !USING_SYSTEM.test(t.solution)) fail(`${t.id}: brak 'using System;'`);
    const st = csRun(t.starter, t.tests[0].input);
    if (st.status === 'error' && st.error.kind === 'compile') fail(`${t.id}/starter: ${st.error.message}`);
    for (const c of t.checks || []) if (!new RegExp(c.pattern).test(t.solution)) fail(`${t.id}: rozwiązanie nie spełnia wymagania: ${c.message}`);
    if (t.exampleInput !== undefined && !t.tests.some((x) => x.input === t.exampleInput)) fail(`${t.id}: przykładowe wejście nie jest testem`);
    let starterPasses = true;
    for (const [k, test] of t.tests.entries()) {
      checked++;
      const r = csRun(t.solution, test.input);
      if (r.status !== 'done') fail(`${t.id} test ${k + 1}: ${r.status} ${r.error && r.error.message}`);
      else if (!checkOutput(outText(r), test.expected)) fail(`${t.id} test ${k + 1}: oczekiwano ${JSON.stringify(test.expected)}, otrzymano ${JSON.stringify(outText(r))}`);
      const s = csRun(t.starter, test.input);
      if (!(s.status === 'done' && checkOutput(outText(s), test.expected))) starterPasses = false;
    }
    if (starterPasses) fail(`${t.id}: kod startowy już przechodzi testy`);
  }
}

// ───────────────────────── Python (lokalny CPython, jeśli jest) ─────────────────────────
console.log('\n══ Kurs Python ══');
const pyDir = mkdtempSync(join(tmpdir(), 'lab-py-'));
const pyFile = join(pyDir, 'main.py');
const pyRun = (code, input) => {
  writeFileSync(pyFile, code);
  const r = spawnSync(PYTHON, ['-I', pyFile], { input: input ? `${input}\n` : '', encoding: 'utf8', timeout: 10000, cwd: pyDir });
  return { ok: r.status === 0, out: (r.stdout || '').replace(/\r\n/g, '\n'), err: (r.stderr || '').trim().split('\n').slice(-1)[0] };
};
const PYTHON = ['python3', 'python'].find((p) => spawnSync(p, ['--version'], { encoding: 'utf8' }).status === 0);

if (!PYTHON) {
  console.log('  (pominięto – nie znaleziono interpretera python w systemie)');
} else {
  const pyMustRun = (label, code, input = '') => {
    checked++;
    const r = pyRun(code, input);
    if (!r.ok) fail(`${label}: ${r.err}`);
    return r;
  };
  for (const t of PY_SANDBOX_TEMPLATES) pyMustRun(`Python/piaskownica/${t.id}`, t.code, 'Ola\n7');
  const pyCourse = getCourse('python');
  for (const m of pyCourse.MODULES) {
    console.log(`Python ${m.number}: ${m.title}`);
    for (const b of m.theory) if (b.type === 'code' && b.run) pyMustRun(`${m.id}/teoria`, b.code);
    pyMustRun(`${m.id}/przykład`, m.example.code, m.example.input ?? '');
    for (const t of m.tasks) {
      const st = pyRun(t.starter, t.tests[0].input);
      if (/SyntaxError|IndentationError/.test(st.err)) fail(`${t.id}/starter: ${st.err}`);
      for (const c of t.checks || []) if (!new RegExp(c.pattern).test(t.solution)) fail(`${t.id}: rozwiązanie nie spełnia wymagania: ${c.message}`);
      if (t.exampleInput !== undefined && !t.tests.some((x) => x.input === t.exampleInput)) fail(`${t.id}: przykładowe wejście nie jest testem`);
      let starterPasses = true;
      for (const [k, test] of t.tests.entries()) {
        checked++;
        const r = pyRun(t.solution, test.input);
        if (!r.ok) fail(`${t.id} test ${k + 1}: ${r.err}`);
        else if (!checkOutput(r.out, test.expected)) fail(`${t.id} test ${k + 1}: oczekiwano ${JSON.stringify(test.expected)}, otrzymano ${JSON.stringify(r.out)}`);
        const s = pyRun(t.starter, test.input);
        if (!(s.ok && checkOutput(s.out, test.expected))) starterPasses = false;
      }
      if (starterPasses) fail(`${t.id}: kod startowy już przechodzi testy`);
    }
  }
}

console.log(`\nSprawdzono ${checked} elementów. ${failures ? `Błędy: ${failures}` : 'Wszystko OK ✓'}`);
process.exit(failures ? 1 : 0);
