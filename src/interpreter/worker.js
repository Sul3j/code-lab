// Web Worker – wykonuje program C++ albo C# poza głównym wątkiem,
// dzięki czemu nieskończona pętla nie zawiesza interfejsu (przycisk Stop kończy workera).
// Python działa w osobnym, długowiecznym workerze (public/pyworker.js).
import { runProgram } from './interpreter.js';
import { runCSharp } from './csharp/interpreter.js';

self.onmessage = (e) => {
  const { lang, code, inputs, interactive, seed, timeLimit } = e.data;
  const run = lang === 'csharp' ? runCSharp : runProgram;
  const result = run(code, {
    inputs,
    interactive,
    seed,
    timeLimit,
    onFlush: (segments) => self.postMessage({ type: 'chunk', segments }),
  });
  self.postMessage({ type: 'result', result });
};
