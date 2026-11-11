// Szablony startowe i pomocnicze funkcje budujące programy w C# i Pythonie.
// Zasada projektu dla C#: każdy program zaczyna się od `using System;`.

const indent = (code, n) => code.replace(/\n+$/, '').split('\n').map((l) => (l.trim() ? ' '.repeat(n) + l : '')).join('\n');

// Pełny program C#: typy pomocnicze, metody statyczne klasy Program i treść Main.
export function csProg({ usings = [], types = '', methods = '', main = '' } = {}) {
  const us = ['System', ...usings.filter((u) => u !== 'System')].map((u) => `using ${u};`).join('\n');
  const parts = [us, ''];
  if (types.trim()) parts.push(types.replace(/\n+$/, ''), '');
  parts.push('class Program', '{');
  if (methods.trim()) parts.push(indent(methods, 4), '');
  parts.push('    static void Main(string[] args)', '    {');
  parts.push(main.trim() ? indent(main, 8) : '        // Twój kod tutaj');
  parts.push('    }', '}', '');
  return parts.join('\n');
}

export const CS_TEMPLATE = csProg();

export const PY_TEMPLATE = `# Twój kod tutaj
`;

// Gwarancja zasady dla C# – dopisuje `using System;`, gdyby go zabrakło.
export function ensureUsingSystem(code) {
  if (/^\s*using\s+System\s*;/m.test(code)) return code;
  return `using System;\n${code}`;
}
