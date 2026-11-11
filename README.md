# School Code Lab – C++, C#, Python

Interaktywne środowisko do nauki programowania dla uczniów (React + Vite + Tailwind CSS + Lucide).
Język kursu wybiera się przełącznikiem **C++ / C# / Python** w górnym pasku – każdy język ma własny kurs
(31 tematów: materiały, przykłady, zadania z testami), własną piaskownicę, ściągę i osobno zapisywany postęp.

Wszystkie programy działają w przeglądarce, bez instalowania kompilatorów:

| Język  | Silnik |
|--------|--------|
| C++    | własny interpreter podzbioru C++ (Web Worker) |
| C#     | własny interpreter podzbioru C# (Web Worker), wyniki zgodne z .NET |
| Python | prawdziwy CPython 3 – **Pyodide** (WebAssembly). Przy pierwszym użyciu Pythona przeglądarka pobiera ok. 10 MB z cdn.jsdelivr.net, więc potrzebny jest internet; później plik jest w pamięci podręcznej. |

## Uruchomienie

Wymagany jest **Node.js 18+** (https://nodejs.org).

```bash
cd projekt-cpp
npm install        # instalacja zależności (tylko za pierwszym razem)
npm run dev        # serwer deweloperski → http://localhost:5173
```

Pozostałe polecenia:

```bash
npm run build      # wersja produkcyjna do folderu dist/
npm run preview    # podgląd wersji produkcyjnej
npm run verify     # sprawdza przykłady, szablony i rozwiązania zadań we wszystkich językach
                   # (część Pythona wymaga zainstalowanego python w systemie – inaczej jest pomijana)
```

## Program kursu C++ (31 tematów)

Każdy temat ma **materiały** (teoria + przykład do uruchomienia; pełne programy z teorii można otworzyć w edytorze)
oraz zadania lub ćwiczenia sprawdzane automatycznie.

**Część I – Podstawy C++:** 1. Podstawowe elementy języka · 2. Instrukcje warunkowe i wyboru · 3. Pętle ·
4. Typ wyliczeniowy · 5. Zmienne wskaźnikowe · 6. Zmienne dynamiczne · 7. Tablice statyczne · 8. Tablice i wskaźniki ·
9. Tablice dynamiczne i wektory · 10. Pętla foreach · 11. C-napisy · 12. Łańcuchy string · 13. Struktury · 14. Unie ·
15. Funkcje · 16. Rekurencja · 17. Funkcje przeciążone · 18. Funkcje inline · 19. Funkcje matematyczne ·
20. Funkcje znakowe · 21. Konwersja typu · 22. Funkcje we/wy

**Część II – Programowanie obiektowe:** 23. Klasy i obiekty · 24. Konstruktory i destruktory ·
25. Enkapsulacja · 26. Składowe statyczne · 27. Dziedziczenie · 28. Polimorfizm ·
29. Klasy abstrakcyjne a interfejsy · 30. Kompozycja i agregacja · 31. Przeciążanie operatorów

Treść: `src/data/course-1.js`, `course-2.js`, `course-3.js` (część I), `course-oop-1.js`, `course-oop-2.js` (część II),
`exercises.js` (dodatkowe ćwiczenia), układ kursu: `src/data/modules.js`.

## Kursy C# i Python

Mają ten sam układ tematów; zagadnienia typowe dla C++ zastąpiono odpowiednikami
(np. wskaźniki → typy referencyjne i `ref`/`out` w C# oraz referencje i `id`/`is` w Pythonie,
unie → krotki, funkcje inline → wyrażenia lambda). W C# każdy program zaczyna się od `using System;`.

- C#: `src/data/cs/course-cs-1.js`, `course-cs-2.js`, `course-cs-oop.js`, zadania dodatkowe `exercises-cs-*.js`
- Python: `src/data/py/course-py-1.js`, `course-py-2.js`, `course-py-oop.js`, zadania dodatkowe `exercises-py-*.js`
- wspólne: `src/data/course.js` (kursy wszystkich języków), `src/lib/lang.js` (konfiguracja języków),
  `sandbox-langs.js`, `cheatsheet-cs.js`, `cheatsheet-py.js`

Każdy temat C# i Python ma 4–5 zadań (125 zadań w C#, 124 w Pythonie). Zadania dodatkowe są w plikach
`src/data/cs/exercises-cs-1.js`, `exercises-cs-2.js` oraz `src/data/py/exercises-py-1.js`, `exercises-py-2.js`.

## Struktura

```
src/
  interpreter/   lexer.js, parser.js, interpreter.js – interpreter podzbioru C++
                 csharp/ – interpreter podzbioru C#, python/errors.js – polskie komunikaty błędów Pythona
                 worker.js – wykonanie w Web Workerze, runner.js – uruchamianie, wejście, testy
public/pyworker.js – worker z Pyodide (Python)
  data/          modules-*.js – 9 modułów (teoria, przykład, 3 zadania z testami)
                 cheatsheet.js – ściąga, sandbox.js – szablony piaskownicy, template.js – szablon startowy
  components/    Sidebar, LessonPanel, CodeEditor, Terminal, CheatSheet, RichText
scripts/verify.mjs – automatyczna weryfikacja treści
```

## Obsługiwany C++

Typy `int`, `long long`, `double`, `char`, `bool`, `string`, `auto`, `const`; `cout`/`cin`/`getline`,
`<iomanip>` (`setw`, `setprecision`, `fixed`); `if`/`switch`/`for`/`while`/`do-while`/range-for;
tablice 1D/2D, funkcje (przeciążanie, referencje, parametry domyślne, rekurencja),
wskaźniki i arytmetyka wskaźników, `new`/`delete` (z wykrywaniem wycieków),
klasy/struktury (konstruktory, listy inicjalizacyjne, destruktory, `private`/`public`/`protected`, dziedziczenie),
`vector`, `<cmath>`, `<cctype>`, `sort`/`reverse`/`max_element`,
`enum` / `enum class`, unie (wspólna pamięć pól), C-napisy (`strlen`, `strcpy`, `strcat`, `strcmp`, `cin.getline`),
`printf`/`scanf`/`puts`/`getchar`, manipulatory `hex`/`oct`/`setw`/`setfill`, makra `#define` (także z parametrami),
metody wirtualne, metody czysto wirtualne, klasy abstrakcyjne, `override`, polimorfizm przez wskaźniki i referencje,
składowe statyczne, konstruktor kopiujący, przeciążanie operatorów (także `friend operator<<`/`>>`), `Klasa::metoda()`, `return *this`.
Nie są obsługiwane: szablony (`template`), operator przypisania `operator=`, `map`/`set`, wyjątki.

Interpreter wykrywa typowe błędy uczniów (brak średnika, brak `using namespace std;`, wyjście poza tablicę,
dzielenie przez zero, `nullptr`, nieskończone pętle) i opisuje je po polsku.

## Podpięcie zewnętrznej piaskownicy

Aby zamiast interpretera użyć prawdziwego kompilatora na serwerze (np. Judge0, Piston),
podmień funkcję `executeOnce()` w `src/interpreter/runner.js` – musi zwracać obiekt
`{ status, segments, error, exitCode }` w tym samym formacie.
