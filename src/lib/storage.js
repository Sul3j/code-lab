// Zapis postępu ucznia w localStorage przeglądarki.
const KEY = 'cpp-school-lab:v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const s = JSON.parse(raw);
    return s && typeof s === 'object' ? s : {};
  } catch {
    return {};
  }
}

let timer = null;
export function saveState(state) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* brak dostępu do localStorage – postęp nie zostanie zapamiętany */
    }
  }, 300);
}

export function clearState() {
  try { localStorage.removeItem(KEY); } catch { /* ignoruj */ }
}
