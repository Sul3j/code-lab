// Szablon startowy każdego nowego lub zresetowanego projektu.
// Zasada projektu: KAŻDY kod w aplikacji zawiera linijkę `using namespace std;`.
export const DEFAULT_TEMPLATE = `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Twój kod tutaj
    return 0;
}
`;

// Buduje kod startowy zadania z dodatkowymi bibliotekami / kodem przed main.
export function starter({ includes = [], before = '', body = '    // Twój kod tutaj\n' } = {}) {
  const inc = ['iostream', 'string', ...includes.filter((i) => i !== 'iostream' && i !== 'string')]
    .map((i) => `#include <${i}>`)
    .join('\n');
  return `${inc}
using namespace std;
${before ? `\n${before.trim()}\n` : ''}
int main() {
${body}    return 0;
}
`;
}

// Gwarancja zasady architektury – dopisuje `using namespace std;`, gdyby go zabrakło.
export function ensureUsingStd(code) {
  if (/using\s+namespace\s+std\s*;/.test(code)) return code;
  const lines = code.split('\n');
  let lastInclude = -1;
  lines.forEach((l, i) => { if (/^\s*#\s*include/.test(l)) lastInclude = i; });
  lines.splice(lastInclude + 1, 0, 'using namespace std;');
  return lines.join('\n');
}
