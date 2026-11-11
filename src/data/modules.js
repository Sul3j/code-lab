// Układ kursu:
//   Część I  – Podstawy języka C++ (tematy z programu nauczania),
//   Część II – Programowanie obiektowe.
// Każdy temat ma materiały (teoria + przykład), a tematy z `practice: true` – zadania praktyczne.
// W pozostałych tematach zadania wyświetlane są jako ćwiczenia.
import { course1 } from './course-1.js';
import { course2 } from './course-2.js';
import { course3 } from './course-3.js';
import { oop1 } from './course-oop-1.js';
import { oopInheritance, oopPolymorphism, oopComposition, oopOperators } from './course-oop-2.js';
import { EXERCISES } from './exercises.js';
import { EXERCISES_2 } from './exercises-2.js';

export const PARTS = [
  { id: 'basics', title: 'Część I – Podstawy C++' },
  { id: 'oop', title: 'Część II – Programowanie obiektowe' },
];

const basics = [...course1, ...course2, ...course3].filter((m) => m.id !== 'k23');
const abstractClasses = { ...course3.find((m) => m.id === 'k23'), part: 'oop', practice: true };

const ordered = [
  ...basics.map((m) => ({ ...m, part: 'basics' })),
  ...oop1,
  oopInheritance,
  oopPolymorphism,
  abstractClasses,
  oopComposition,
  oopOperators,
];

export const MODULES = ordered.map((m, i) => ({
  ...m,
  number: i + 1,
  tasks: [...m.tasks, ...(EXERCISES[m.id] || []), ...(EXERCISES_2[m.id] || [])],
}));

export const ALL_TASKS = MODULES.flatMap((m) => m.tasks.map((t) => ({ ...t, moduleId: m.id })));

export function findTask(id) {
  for (const m of MODULES) {
    const t = m.tasks.find((x) => x.id === id);
    if (t) return { module: m, task: t };
  }
  return null;
}

export function findModule(id) {
  return MODULES.find((m) => m.id === id) || null;
}
