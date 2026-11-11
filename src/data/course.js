// Kursy dla trzech języków: C++, C# i Python.
// Każdy kurs ma te same części (podstawy + programowanie obiektowe) i ten sam kształt modułów.
import { MODULES as CPP_MODULES, PARTS as CPP_PARTS } from './modules.js';
import { cs1 } from './cs/course-cs-1.js';
import { cs2 } from './cs/course-cs-2.js';
import { csOop } from './cs/course-cs-oop.js';
import { py1 } from './py/course-py-1.js';
import { py2 } from './py/course-py-2.js';
import { pyOop } from './py/course-py-oop.js';
import { EX_CS_1 } from './cs/exercises-cs-1.js';
import { EX_CS_2 } from './cs/exercises-cs-2.js';
import { EX_PY_1 } from './py/exercises-py-1.js';
import { EX_PY_2 } from './py/exercises-py-2.js';

function build(parts, modules, extra = {}) {
  const MODULES = modules.map((m, i) => ({ part: 'basics', ...m, number: i + 1, tasks: [...m.tasks, ...(extra[m.id] || [])] }));
  const ALL_TASKS = MODULES.flatMap((m) => m.tasks.map((t) => ({ ...t, moduleId: m.id })));
  const findTask = (id) => {
    for (const m of MODULES) {
      const t = m.tasks.find((x) => x.id === id);
      if (t) return { module: m, task: t };
    }
    return null;
  };
  const findModule = (id) => MODULES.find((m) => m.id === id) || null;
  return { PARTS: parts, MODULES, ALL_TASKS, findTask, findModule };
}

const COURSES = {
  cpp: build(CPP_PARTS, CPP_MODULES),
  csharp: build([
    { id: 'basics', title: 'Część I – Podstawy C#' },
    { id: 'oop', title: 'Część II – Programowanie obiektowe' },
  ], [...cs1, ...cs2, ...csOop], { ...EX_CS_1, ...EX_CS_2 }),
  python: build([
    { id: 'basics', title: 'Część I – Podstawy Pythona' },
    { id: 'oop', title: 'Część II – Programowanie obiektowe' },
  ], [...py1, ...py2, ...pyOop], { ...EX_PY_1, ...EX_PY_2 }),
};

export function getCourse(lang) {
  return COURSES[lang] || COURSES.cpp;
}
