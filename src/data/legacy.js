// Dostęp do treści z pierwszej wersji kursu (teoria, przykłady, zadania),
// które zostały włączone do nowego układu 23 tematów.
import { basicModules } from './modules-basic.js';
import { advancedModules } from './modules-advanced.js';

export const LEGACY = Object.fromEntries([...basicModules, ...advancedModules].map((m) => [m.id, m]));

export function legacyTask(id) {
  for (const m of Object.values(LEGACY)) {
    const t = m.tasks.find((x) => x.id === id);
    if (t) return t;
  }
  throw new Error(`Brak zadania ${id}`);
}
