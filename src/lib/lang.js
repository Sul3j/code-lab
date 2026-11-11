// Konfiguracja trzech języków programowania dostępnych w aplikacji.
import { DEFAULT_TEMPLATE, ensureUsingStd } from '../data/template.js';
import { CS_TEMPLATE, PY_TEMPLATE, ensureUsingSystem } from '../data/lang-templates.js';
import { SANDBOX_TEMPLATES, SNIPPETS } from '../data/sandbox.js';
import { CS_SANDBOX_TEMPLATES, CS_SNIPPETS, PY_SANDBOX_TEMPLATES, PY_SNIPPETS } from '../data/sandbox-langs.js';
import { CHEATSHEET } from '../data/cheatsheet.js';
import { CHEATSHEET_CS } from '../data/cheatsheet-cs.js';
import { CHEATSHEET_PY } from '../data/cheatsheet-py.js';

export const LANGS = {
  cpp: {
    id: 'cpp',
    label: 'C++',
    badge: 'C++',
    gradient: 'from-sky-500 to-blue-700',
    ext: 'cpp',
    mainFile: 'main.cpp',
    command: '$ g++ main.cpp -o main && ./main',
    inputName: 'cin',
    template: DEFAULT_TEMPLATE,
    ensure: ensureUsingStd,
    isProgram: (b) => /int\s+main\s*\(/.test(b.code),
    lineComment: '//',
    templates: SANDBOX_TEMPLATES,
    snippets: SNIPPETS,
    cheatsheet: CHEATSHEET,
    cheatHint: 'Szukaj, np. średnik, wskaźnik…',
    engine: 'C++ (interpreter w przeglądarce)',
  },
  csharp: {
    id: 'csharp',
    label: 'C#',
    badge: 'C#',
    gradient: 'from-violet-500 to-purple-700',
    ext: 'cs',
    mainFile: 'Program.cs',
    command: '$ dotnet run',
    inputName: 'Console.ReadLine',
    template: CS_TEMPLATE,
    ensure: ensureUsingSystem,
    isProgram: (b) => /static\s+(?:void|int)\s+Main\s*\(/.test(b.code),
    lineComment: '//',
    templates: CS_SANDBOX_TEMPLATES,
    snippets: CS_SNIPPETS,
    cheatsheet: CHEATSHEET_CS,
    cheatHint: 'Szukaj, np. Parse, List, właściwość…',
    engine: 'C# (interpreter w przeglądarce)',
  },
  python: {
    id: 'python',
    label: 'Python',
    badge: 'Py',
    gradient: 'from-yellow-500 to-emerald-600',
    ext: 'py',
    mainFile: 'main.py',
    command: '$ python main.py',
    inputName: 'input',
    template: PY_TEMPLATE,
    ensure: (c) => c,
    isProgram: (b) => !!b.run,
    lineComment: '#',
    templates: PY_SANDBOX_TEMPLATES,
    snippets: PY_SNIPPETS,
    cheatsheet: CHEATSHEET_PY,
    cheatHint: 'Szukaj, np. wcięcia, lista, f-string…',
    engine: 'Python 3 (Pyodide w przeglądarce)',
  },
};

export const LANG_ORDER = ['cpp', 'csharp', 'python'];

export const langOf = (id) => LANGS[id] || LANGS.cpp;
