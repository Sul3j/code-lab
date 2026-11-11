// Moduły 6–9: tablice 2D, napisy, wskaźniki, programowanie obiektowe.
// Każdy przykład, szablon i rozwiązanie zawiera `using namespace std;`.
import { DEFAULT_TEMPLATE, starter } from './template.js';

export const advancedModules = [
  // ───────────────────────────── MODUŁ 6 ─────────────────────────────
  {
    id: 'm6',
    number: 6,
    title: 'Tablice dwuwymiarowe',
    subtitle: 'macierze, pętle zagnieżdżone',
    icon: 'Grid3x3',
    theory: [
      { type: 'p', text: 'Tablica dwuwymiarowa to „tabela” z wierszami i kolumnami – w matematyce nazywamy ją **macierzą**. Pierwszy indeks to numer wiersza, drugi – numer kolumny.' },
      { type: 'code', code: `int m[2][3] = {
    {1, 2, 3},     // wiersz 0
    {4, 5, 6}      // wiersz 1
};
cout << m[1][2];   // wiersz 1, kolumna 2 -> 6` },
      { type: 'h', text: 'Pętle zagnieżdżone' },
      { type: 'p', text: 'Aby odwiedzić każdy element macierzy, używamy pętli w pętli: zewnętrzna przechodzi po wierszach, wewnętrzna po kolumnach.' },
      { type: 'code', code: `for (int i = 0; i < 2; i++) {        // wiersze
    for (int j = 0; j < 3; j++) {    // kolumny
        cout << m[i][j] << " ";
    }
    cout << endl;                    // koniec wiersza
}` },
      { type: 'list', items: [
        'Główna przekątna macierzy kwadratowej to elementy `m[i][i]`.',
        'Transpozycja zamienia wiersze z kolumnami: element `m[i][j]` trafia na miejsce `[j][i]`.',
        'Do ładnego wyrównania kolumn przyda się `setw(n)` z biblioteki `<iomanip>`.',
      ] },
      { type: 'tip', text: 'W pętlach zagnieżdżonych używaj różnych nazw liczników (`i` dla wierszy, `j` dla kolumn) – pomyłka `m[i][i]` zamiast `m[i][j]` to częsty błąd.' },
    ],
    example: {
      title: 'Tabliczka mnożenia',
      description: 'Wypełnienie macierzy 5×5 iloczynami i wyrównane wypisanie za pomocą setw.',
      code: `#include <iostream>
#include <iomanip>
#include <string>
using namespace std;

int main() {
    const int N = 5;
    int tab[N][N];

    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            tab[i][j] = (i + 1) * (j + 1);
        }
    }

    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            cout << setw(4) << tab[i][j];
        }
        cout << endl;
    }

    int przekatna = 0;
    for (int i = 0; i < N; i++) przekatna += tab[i][i];
    cout << "Suma na przekatnej: " << przekatna << endl;
    return 0;
}
`,
    },
    tasks: [
      {
        id: 'm6t1',
        title: 'Suma elementów macierzy',
        difficulty: 1,
        description: 'Wczytaj liczbę wierszy `w` i kolumn `k` (1–10), a potem macierz `w × k` liczb całkowitych. Wypisz sumę wszystkich elementów.',
        expectedOutput: 'Suma: 21',
        exampleInput: '2 3\n1 2 3\n4 5 6',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Zadeklaruj macierz z zapasem: `int m[10][10];`',
          'Wczytuj dwiema pętlami: po `i` (wiersze) i po `j` (kolumny).',
          'Możesz sumować od razu przy wczytywaniu.',
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int w, k;
    int m[10][10];
    cin >> w >> k;
    int suma = 0;
    for (int i = 0; i < w; i++) {
        for (int j = 0; j < k; j++) {
            cin >> m[i][j];
            suma += m[i][j];
        }
    }
    cout << "Suma: " << suma << endl;
    return 0;
}
`,
        tests: [
          { input: '2 3\n1 2 3\n4 5 6', expected: 'Suma: 21' },
          { input: '1 1\n-5', expected: 'Suma: -5' },
          { input: '3 2\n1 1\n2 2\n3 -3', expected: 'Suma: 6' },
        ],
      },
      {
        id: 'm6t2',
        title: 'Główna przekątna',
        difficulty: 2,
        description: 'Wczytaj `n` (1–10) i macierz kwadratową `n × n`. Wypisz sumę elementów na **głównej przekątnej** (od lewego górnego do prawego dolnego rogu).',
        expectedOutput: 'Przekatna: 15',
        exampleInput: '3\n1 2 3\n4 5 6\n7 8 9',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Elementy przekątnej mają równe indeksy wiersza i kolumny: `m[i][i]`.',
          'Do sumowania wystarczy jedna pętla po `i`.',
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    int m[10][10];
    cin >> n;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cin >> m[i][j];
        }
    }
    int suma = 0;
    for (int i = 0; i < n; i++) {
        suma += m[i][i];
    }
    cout << "Przekatna: " << suma << endl;
    return 0;
}
`,
        tests: [
          { input: '3\n1 2 3\n4 5 6\n7 8 9', expected: 'Przekatna: 15' },
          { input: '1\n42', expected: 'Przekatna: 42' },
          { input: '2\n10 -1\n-1 -4', expected: 'Przekatna: 6' },
        ],
      },
      {
        id: 'm6t3',
        title: 'Transpozycja macierzy',
        difficulty: 3,
        description: 'Wczytaj `w` i `k` (1–10) oraz macierz `w × k`. Wypisz macierz **transponowaną** (`k` wierszy po `w` liczb oddzielonych spacjami).',
        expectedOutput: '1 4\n2 5\n3 6',
        exampleInput: '2 3\n1 2 3\n4 5 6',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Nie musisz tworzyć nowej macierzy – wystarczy wypisać elementy w innej kolejności.',
          'Zewnętrzna pętla po kolumnach `j` (od 0 do k-1), wewnętrzna po wierszach `i`.',
          'Wypisuj `m[i][j]`, a po każdej kolumnie `endl`.',
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int w, k;
    int m[10][10];
    cin >> w >> k;
    for (int i = 0; i < w; i++) {
        for (int j = 0; j < k; j++) {
            cin >> m[i][j];
        }
    }
    for (int j = 0; j < k; j++) {
        for (int i = 0; i < w; i++) {
            cout << m[i][j] << " ";
        }
        cout << endl;
    }
    return 0;
}
`,
        tests: [
          { input: '2 3\n1 2 3\n4 5 6', expected: '1 4\n2 5\n3 6' },
          { input: '1 3\n7 8 9', expected: '7\n8\n9' },
          { input: '2 2\n1 2\n3 4', expected: '1 3\n2 4' },
        ],
      },
    ],
  },

  // ───────────────────────────── MODUŁ 7 ─────────────────────────────
  {
    id: 'm7',
    number: 7,
    title: 'Napisy (string)',
    subtitle: 'długość, znaki, palindromy',
    icon: 'Type',
    theory: [
      { type: 'p', text: 'Typ **string** (z biblioteki `<string>`) przechowuje tekst. Napis zachowuje się jak tablica znaków: do i-tego znaku odwołujemy się przez `s[i]`, a numeracja zaczyna się od 0.' },
      { type: 'code', code: `string s = "Programowanie";
cout << s.length();   // 13 (liczba znakow)
cout << s[0];         // 'P'
cout << s[s.length() - 1];  // 'e' - ostatni znak
s[0] = 'p';           // zmiana znaku` },
      { type: 'table', head: ['Operacja', 'Opis', 'Przykład'], rows: [
        ['s.length() / s.size()', 'długość napisu', '"kot" → 3'],
        ['s + t', 'łączenie napisów', '"Ala" + " ma" → "Ala ma"'],
        ['s.substr(p, n)', 'fragment od pozycji p, n znaków', '"kajak".substr(1, 3) → "aja"'],
        ['s.find(t)', 'pozycja pierwszego wystąpienia (lub string::npos)', '"kajak".find("ja") → 2'],
        ['s.empty()', 'czy napis jest pusty', '"" → true'],
        ['getline(cin, s)', 'wczytaj całą linię (ze spacjami)', ''],
      ] },
      { type: 'warn', text: '`cin >> s` wczytuje tylko **jedno słowo** (do spacji). Aby wczytać całe zdanie, użyj `getline(cin, s);`.' },
      { type: 'h', text: 'Znaki – typ char' },
      { type: 'p', text: "Pojedynczy znak zapisujemy w **apostrofach**: `'a'`, a napis w **cudzysłowie**: `\"a\"`. Każdy znak ma kod liczbowy (ASCII), dlatego można je porównywać: `c >= 'a' && c <= 'z'` sprawdza, czy to mała litera." },
      { type: 'h', text: 'Palindrom' },
      { type: 'p', text: 'Palindrom to słowo czytane tak samo od przodu i od tyłu (np. *kajak*, *potop*). Wystarczy porównać znak `s[i]` ze znakiem `s[n - 1 - i]` dla pierwszej połowy napisu.' },
      { type: 'tip', text: 'Funkcje `toupper(c)` i `tolower(c)` zamieniają wielkość litery, a `isdigit(c)` / `isalpha(c)` sprawdzają, czy znak jest cyfrą / literą.' },
    ],
    example: {
      title: 'Analiza napisu',
      description: 'Długość, odwracanie, zamiana na wielkie litery i wyszukiwanie fragmentu.',
      code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string zdanie = "Ala ma kota";
    cout << "Napis: " << zdanie << endl;
    cout << "Dlugosc: " << zdanie.length() << endl;

    string odwrocony = "";
    for (int i = zdanie.length() - 1; i >= 0; i--) {
        odwrocony += zdanie[i];
    }
    cout << "Od tylu: " << odwrocony << endl;

    string wielkie = zdanie;
    for (int i = 0; i < wielkie.length(); i++) {
        wielkie[i] = toupper(wielkie[i]);
    }
    cout << "Wielkimi: " << wielkie << endl;

    int poz = zdanie.find("kot");
    cout << "Slowo 'kot' zaczyna sie na pozycji " << poz << endl;
    cout << "Pierwsze slowo: " << zdanie.substr(0, 3) << endl;
    return 0;
}
`,
    },
    tasks: [
      {
        id: 'm7t1',
        title: 'Długość i odwrócenie',
        difficulty: 1,
        description: 'Wczytaj jedno słowo. Wypisz jego długość oraz słowo zapisane od tyłu:',
        expectedOutput: 'Dlugosc: 6\nOdwrocony: kilots',
        exampleInput: 'stolik',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Długość napisu: `s.length()`.',
          'Utwórz pusty napis `string w = "";` i dopisuj do niego znaki od końca: `w += s[i];`',
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    string w = "";
    for (int i = s.length() - 1; i >= 0; i--) {
        w += s[i];
    }
    cout << "Dlugosc: " << s.length() << endl;
    cout << "Odwrocony: " << w << endl;
    return 0;
}
`,
        tests: [
          { input: 'stolik', expected: 'Dlugosc: 6\nOdwrocony: kilots' },
          { input: 'C++', expected: 'Dlugosc: 3\nOdwrocony: ++C' },
          { input: 'a', expected: 'Dlugosc: 1\nOdwrocony: a' },
        ],
      },
      {
        id: 'm7t2',
        title: 'Czy to palindrom?',
        difficulty: 2,
        description: 'Napisz funkcję `bool czyPalindrom(string s)` i użyj jej w programie: wczytaj słowo i wypisz `TAK`, jeśli jest palindromem, albo `NIE` w przeciwnym razie. Wielkość liter ma znaczenie.',
        expectedOutput: 'TAK',
        exampleInput: 'kajak',
        starter: starter({
          before: `bool czyPalindrom(string s) {
    // uzupelnij funkcje
    return false;
}`,
          body: '    string slowo;\n    cin >> slowo;\n    // wypisz TAK lub NIE\n',
        }),
        hints: [
          'Porównuj znaki parami: `s[i]` z `s[n - 1 - i]`, gdzie `n = s.length()`.',
          'Wystarczy sprawdzić pierwszą połowę: `for (int i = 0; i < n / 2; i++)`.',
          'Jeśli jakaś para się różni – od razu `return false;`. Gdy pętla się skończy – `return true;`',
        ],
        checks: [{ pattern: 'bool\\s+czyPalindrom\\s*\\(', message: 'Zdefiniuj funkcję bool czyPalindrom(string s).' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

bool czyPalindrom(string s) {
    int n = s.length();
    for (int i = 0; i < n / 2; i++) {
        if (s[i] != s[n - 1 - i]) {
            return false;
        }
    }
    return true;
}

int main() {
    string slowo;
    cin >> slowo;
    if (czyPalindrom(slowo)) {
        cout << "TAK" << endl;
    } else {
        cout << "NIE" << endl;
    }
    return 0;
}
`,
        tests: [
          { input: 'kajak', expected: 'TAK' },
          { input: 'kot', expected: 'NIE' },
          { input: 'abba', expected: 'TAK' },
          { input: 'a', expected: 'TAK' },
          { input: 'Kajak', expected: 'NIE' },
        ],
      },
      {
        id: 'm7t3',
        title: 'Licznik samogłosek',
        difficulty: 3,
        description: 'Wczytaj **całą linię tekstu** (może zawierać spacje) i policz samogłoski `a, e, i, o, u, y` – zarówno małe, jak i wielkie.',
        expectedOutput: 'Samogloski: 5',
        exampleInput: 'Ala ma kota',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Całą linię wczytasz przez `getline(cin, tekst);`',
          'Zamień każdy znak na małą literę: `char c = tolower(tekst[i]);`',
          "Sprawdź: `c == 'a' || c == 'e' || ...` (pamiętaj o apostrofach dla znaków!).",
        ],
        checks: [{ pattern: 'getline\\s*\\(', message: 'Użyj getline(cin, tekst), aby wczytać tekst ze spacjami.' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string tekst;
    getline(cin, tekst);
    int ile = 0;
    for (int i = 0; i < tekst.length(); i++) {
        char c = tolower(tekst[i]);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u' || c == 'y') {
            ile++;
        }
    }
    cout << "Samogloski: " << ile << endl;
    return 0;
}
`,
        tests: [
          { input: 'Ala ma kota', expected: 'Samogloski: 5' },
          { input: 'C++ jest super', expected: 'Samogloski: 3' },
          { input: 'Programowanie w C', expected: 'Samogloski: 6' },
          { input: 'xyz', expected: 'Samogloski: 1' },
        ],
      },
    ],
  },

  // ───────────────────────────── MODUŁ 8 ─────────────────────────────
  {
    id: 'm8',
    number: 8,
    title: 'Wskaźniki i adresy',
    subtitle: 'pamięć RAM, operatory & i *',
    icon: 'MemoryStick',
    theory: [
      { type: 'p', text: 'Każda zmienna leży w pamięci RAM pod jakimś **adresem** (numerem komórki). Operator `&` zwraca adres zmiennej, a **wskaźnik** to zmienna, która przechowuje adres innej zmiennej.' },
      { type: 'code', code: `int x = 42;
int *p = &x;     // p przechowuje adres x

cout << x;       // 42  - wartosc
cout << &x;      // np. 0x7ffd5e8a1a40 - adres
cout << p;       // ten sam adres
cout << *p;      // 42  - wartosc pod adresem (dereferencja)
*p = 100;        // zmieniamy x przez wskaznik!` },
      { type: 'table', head: ['Zapis', 'Znaczenie'], rows: [
        ['int *p;', 'deklaracja wskaźnika na int'],
        ['&x', 'adres zmiennej x („gdzie leży x?”)'],
        ['*p', 'wartość pod adresem w p („co tam leży?”)'],
        ['p = nullptr;', 'wskaźnik pusty – na nic nie wskazuje'],
      ] },
      { type: 'h', text: 'Wskaźniki i tablice' },
      { type: 'p', text: 'Nazwa tablicy to adres jej pierwszego elementu. Elementy leżą obok siebie, więc `*(t + i)` to to samo co `t[i]`. Dodanie 1 do wskaźnika przesuwa go o rozmiar jednego elementu (dla int – o 4 bajty).' },
      { type: 'code', code: `int t[3] = {10, 20, 30};
int *p = t;          // p wskazuje na t[0]
cout << *(p + 1);    // 20
cout << &t[1] - &t[0];  // 1 (element dalej)` },
      { type: 'h', text: 'Pamięć dynamiczna – new i delete' },
      { type: 'p', text: 'Operator **new** rezerwuje pamięć w trakcie działania programu i zwraca wskaźnik do niej. Każde `new` musi mieć swoje `delete` (a `new[]` – swoje `delete[]`), inaczej powstaje **wyciek pamięci**.' },
      { type: 'code', code: `int n;
cin >> n;
int *tab = new int[n];   // tablica o rozmiarze z klawiatury
tab[0] = 5;
delete[] tab;            // zwolnienie pamieci` },
      { type: 'warn', text: 'Dereferencja wskaźnika pustego (`nullptr`) lub już zwolnionego to jeden z najgroźniejszych błędów w C++. To środowisko wykryje go i pokaże numer linii.' },
    ],
    example: {
      title: 'Zajrzyj do pamięci',
      description: 'Adresy kolejnych elementów tablicy różnią się o 4 bajty (rozmiar int). Wskaźnik pozwala zmienić zmienną „na odległość”.',
      code: `#include <iostream>
#include <string>
using namespace std;

void podwoj(int *wsk) {
    *wsk = *wsk * 2;
}

int main() {
    int x = 21;
    int *p = &x;
    cout << "x = " << x << ", adres x: " << &x << endl;
    cout << "p = " << p << ", *p = " << *p << endl;

    podwoj(&x);
    cout << "Po podwojeniu: x = " << x << endl;

    int t[4] = {10, 20, 30, 40};
    cout << "sizeof(int) = " << sizeof(int) << " bajty" << endl;
    for (int i = 0; i < 4; i++) {
        cout << "t[" << i << "] = " << *(t + i) << "  adres: " << &t[i] << endl;
    }

    int *dyn = new int(7);
    cout << "Wartosc na stercie: " << *dyn << endl;
    delete dyn;
    return 0;
}
`,
    },
    tasks: [
      {
        id: 'm8t1',
        title: 'Zmiana przez wskaźnik',
        difficulty: 1,
        description: 'Wczytaj liczbę całkowitą `x`. Utwórz wskaźnik `p` wskazujący na `x` i **za pomocą wskaźnika** (bez bezpośredniego użycia `x`) pomnóż wartość przez 3. Potem wypisz:',
        expectedOutput: 'x = 15',
        exampleInput: '5',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Deklaracja wskaźnika: `int *p = &x;`',
          'Zmiana wartości przez wskaźnik: `*p = *p * 3;`',
          'Na końcu wypisz zwykłe `x` – zobaczysz, że się zmieniło!',
        ],
        checks: [
          { pattern: 'int\\s*\\*\\s*\\w+\\s*=\\s*&', message: 'Utwórz wskaźnik na x, np. int *p = &x;' },
          { pattern: '\\*\\s*\\w+\\s*(\\*=|=)', message: 'Zmień wartość przez dereferencję wskaźnika (*p = ...).' },
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int x;
    cin >> x;
    int *p = &x;
    *p = *p * 3;
    cout << "x = " << x << endl;
    return 0;
}
`,
        tests: [
          { input: '5', expected: 'x = 15' },
          { input: '-4', expected: 'x = -12' },
          { input: '0', expected: 'x = 0' },
        ],
      },
      {
        id: 'm8t2',
        title: 'Arytmetyka wskaźników',
        difficulty: 2,
        description: 'Wczytaj `n` (1–100) i `n` liczb do tablicy. Oblicz sumę elementów, odwołując się do nich **wyłącznie przez wskaźnik** – zapisem `*(t + i)` lub przesuwając wskaźnik `p++`.',
        expectedOutput: 'Suma: 10',
        exampleInput: '4\n1 2 3 4',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Wczytać możesz normalnie: `cin >> t[i];`',
          'W pętli sumującej użyj `suma += *(t + i);`',
          'Albo: `int *p = t;` i w pętli `suma += *p; p++;`',
        ],
        checks: [{ pattern: '\\*\\s*\\(\\s*\\w+\\s*\\+|\\+=\\s*\\*\\s*\\w+', message: 'Sumuj elementy przez wskaźnik, np. suma += *(t + i);' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    int t[100];
    cin >> n;
    for (int i = 0; i < n; i++) {
        cin >> t[i];
    }
    int suma = 0;
    for (int i = 0; i < n; i++) {
        suma += *(t + i);
    }
    cout << "Suma: " << suma << endl;
    return 0;
}
`,
        tests: [
          { input: '4\n1 2 3 4', expected: 'Suma: 10' },
          { input: '1\n-9', expected: 'Suma: -9' },
          { input: '5\n10 20 30 40 50', expected: 'Suma: 150' },
        ],
      },
      {
        id: 'm8t3',
        title: 'Dynamiczna tablica',
        difficulty: 3,
        description: 'Wczytaj `n`, a następnie utwórz tablicę **dynamiczną** `new int[n]` i wczytaj do niej `n` liczb. Wypisz w jednej linii każdą liczbę pomnożoną przez 2, a na końcu zwolnij pamięć `delete[]`.',
        expectedOutput: '2 4 6',
        exampleInput: '3\n1 2 3',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Tworzenie: `int *tab = new int[n];`',
          'Z tablicy dynamicznej korzystasz jak ze zwykłej: `tab[i]`.',
          'Na końcu: `delete[] tab;` – środowisko ostrzeże Cię o wycieku pamięci, jeśli o tym zapomnisz.',
        ],
        checks: [
          { pattern: 'new\\s+int\\s*\\[', message: 'Utwórz tablicę dynamiczną: new int[n].' },
          { pattern: 'delete\\s*\\[\\s*\\]', message: 'Zwolnij pamięć instrukcją delete[].' },
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    cin >> n;
    int *tab = new int[n];
    for (int i = 0; i < n; i++) {
        cin >> tab[i];
    }
    for (int i = 0; i < n; i++) {
        cout << tab[i] * 2 << " ";
    }
    cout << endl;
    delete[] tab;
    return 0;
}
`,
        tests: [
          { input: '3\n1 2 3', expected: '2 4 6' },
          { input: '1\n50', expected: '100' },
          { input: '5\n-1 0 1 2 3', expected: '-2 0 2 4 6' },
        ],
      },
    ],
  },

  // ───────────────────────────── MODUŁ 9 ─────────────────────────────
  {
    id: 'm9',
    number: 9,
    title: 'Programowanie obiektowe',
    subtitle: 'klasy, obiekty, konstruktory, metody',
    icon: 'Boxes',
    theory: [
      { type: 'p', text: '**Klasa** to przepis (projekt) na obiekty – opisuje, jakie dane (**pola**) i zachowania (**metody**) mają obiekty. **Obiekt** to konkretny egzemplarz klasy, np. klasa `Samochod`, a obiekty: `mojeAuto`, `autoTaty`.' },
      { type: 'code', code: `class Prostokat {
private:                 // dostepne tylko wewnatrz klasy
    double a, b;
public:                  // dostepne dla wszystkich
    Prostokat(double x, double y) {   // konstruktor
        a = x;
        b = y;
    }
    double pole() {                   // metoda
        return a * b;
    }
};                        // <- srednik po klasie!

Prostokat p(3, 4);        // tworzymy obiekt
cout << p.pole();         // 12` },
      { type: 'list', items: [
        '**Konstruktor** ma nazwę klasy, nie ma typu zwracanego i wywołuje się automatycznie przy tworzeniu obiektu.',
        '**Hermetyzacja**: pola zwykle są `private`, a dostęp do nich dają publiczne metody (gettery/settery).',
        'Do pól i metod obiektu odwołujemy się kropką: `obiekt.metoda()`, a przez wskaźnik strzałką: `wsk->metoda()`.',
        'Lista inicjalizacyjna: `Prostokat(double x, double y) : a(x), b(y) {}` – zwięzły zapis konstruktora.',
        '**Destruktor** `~NazwaKlasy()` wywołuje się automatycznie, gdy obiekt przestaje istnieć.',
      ] },
      { type: 'h', text: 'struct a class' },
      { type: 'p', text: 'W C++ `struct` i `class` są prawie identyczne – różnią się tylko domyślnym dostępem: w `struct` wszystko jest domyślnie `public`, w `class` – `private`. Strukturę stosuje się zwykle dla prostych „paczek danych” (np. punkt `{x, y}`).' },
      { type: 'h', text: 'Dziedziczenie' },
      { type: 'code', code: `class Zwierze {
protected:
    string imie;
public:
    Zwierze(string i) : imie(i) {}
};
class Pies : public Zwierze {     // Pies jest Zwierzeciem
public:
    Pies(string i) : Zwierze(i) {}
    void szczekaj() { cout << imie << ": Hau!"; }
};` },
      { type: 'warn', text: 'Próba odczytania pola `private` spoza klasy (np. `p.a` w `main`) kończy się błędem kompilacji – to celowa ochrona danych.' },
    ],
    example: {
      title: 'Klasa Uczen',
      description: 'Pola prywatne, konstruktor z listą inicjalizacyjną, gettery, metoda zmieniająca stan i destruktor.',
      code: `#include <iostream>
#include <string>
using namespace std;

class Uczen {
private:
    string imie;
    int punkty;

public:
    Uczen(string i) : imie(i), punkty(0) {
        cout << "[Utworzono ucznia " << imie << "]" << endl;
    }

    void dodajPunkty(int ile) {
        if (ile > 0) punkty += ile;
    }

    string getImie() const { return imie; }
    int getPunkty() const { return punkty; }

    void przedstaw() const {
        cout << imie << " ma " << punkty << " pkt." << endl;
    }

    ~Uczen() {
        cout << "[Usunieto ucznia " << imie << "]" << endl;
    }
};

int main() {
    Uczen a("Ola");
    Uczen b("Kuba");

    a.dodajPunkty(15);
    b.dodajPunkty(9);
    a.dodajPunkty(-100);   // zignorowane przez metode

    a.przedstaw();
    b.przedstaw();

    Uczen *wsk = &a;
    cout << "Przez wskaznik: " << wsk->getImie() << endl;
    return 0;
}
`,
    },
    tasks: [
      {
        id: 'm9t1',
        title: 'Klasa Prostokat',
        difficulty: 1,
        description: 'Utwórz klasę `Prostokat` z **prywatnymi** polami `a` i `b` (double), konstruktorem przyjmującym dwa boki oraz metodami `pole()` i `obwod()`. W `main` wczytaj boki, utwórz obiekt i wypisz:',
        expectedOutput: 'Pole: 12\nObwod: 14',
        exampleInput: '3 4',
        starter: starter({
          before: `class Prostokat {
private:
    // pola a i b

public:
    // konstruktor i metody pole(), obwod()
};`,
          body: '    double a, b;\n    cin >> a >> b;\n    // utworz obiekt i wypisz pole i obwod\n',
        }),
        hints: [
          'Konstruktor: `Prostokat(double x, double y) { a = x; b = y; }`',
          'Metoda: `double pole() { return a * b; }`',
          'W main: `Prostokat p(a, b); cout << "Pole: " << p.pole() << endl;`',
        ],
        checks: [
          { pattern: 'class\\s+Prostokat', message: 'Utwórz klasę o nazwie Prostokat.' },
          { pattern: 'private\\s*:', message: 'Pola klasy powinny być prywatne (private:).' },
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

class Prostokat {
private:
    double a, b;

public:
    Prostokat(double x, double y) {
        a = x;
        b = y;
    }
    double pole() {
        return a * b;
    }
    double obwod() {
        return 2 * (a + b);
    }
};

int main() {
    double a, b;
    cin >> a >> b;
    Prostokat p(a, b);
    cout << "Pole: " << p.pole() << endl;
    cout << "Obwod: " << p.obwod() << endl;
    return 0;
}
`,
        tests: [
          { input: '3 4', expected: 'Pole: 12\nObwod: 14' },
          { input: '2.5 2', expected: 'Pole: 5\nObwod: 9' },
          { input: '1 1', expected: 'Pole: 1\nObwod: 4' },
        ],
      },
      {
        id: 'm9t2',
        title: 'Konto bankowe',
        difficulty: 2,
        description: 'Utwórz klasę `Konto` z prywatnym polem `saldo` (początkowo 0) i metodami: `wplac(int kwota)`, `bool wyplac(int kwota)` (zwraca `false` i nic nie zmienia, gdy brakuje środków) oraz `getSaldo()`.\n\nProgram wczytuje liczbę operacji `n`, a potem `n` linii postaci `W kwota` (wpłata) lub `P kwota` (wypłata). Po każdej nieudanej wypłacie wypisuje `Brak srodkow`, a na końcu:',
        expectedOutput: 'Brak srodkow\nSaldo: 70',
        exampleInput: '3\nW 100\nP 200\nP 30',
        starter: starter({
          before: `class Konto {
private:
    int saldo;

public:
    // konstruktor, wplac, wyplac, getSaldo
};`,
          body: '    int n;\n    cin >> n;\n    // wczytaj n operacji: znak (W/P) i kwote\n',
        }),
        hints: [
          'Konstruktor ustawia saldo na zero: `Konto() { saldo = 0; }`',
          'Operację wczytasz tak: `char typ; int kwota; cin >> typ >> kwota;`',
          "Wypłata: `if (!k.wyplac(kwota)) cout << \"Brak srodkow\" << endl;` – sprawdzaj `typ == 'P'`.",
        ],
        checks: [{ pattern: 'class\\s+Konto', message: 'Utwórz klasę o nazwie Konto.' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

class Konto {
private:
    int saldo;

public:
    Konto() {
        saldo = 0;
    }
    void wplac(int kwota) {
        saldo += kwota;
    }
    bool wyplac(int kwota) {
        if (kwota > saldo) {
            return false;
        }
        saldo -= kwota;
        return true;
    }
    int getSaldo() {
        return saldo;
    }
};

int main() {
    Konto k;
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        char typ;
        int kwota;
        cin >> typ >> kwota;
        if (typ == 'W') {
            k.wplac(kwota);
        } else if (typ == 'P') {
            if (!k.wyplac(kwota)) {
                cout << "Brak srodkow" << endl;
            }
        }
    }
    cout << "Saldo: " << k.getSaldo() << endl;
    return 0;
}
`,
        tests: [
          { input: '3\nW 100\nP 200\nP 30', expected: 'Brak srodkow\nSaldo: 70' },
          { input: '1\nP 5', expected: 'Brak srodkow\nSaldo: 0' },
          { input: '4\nW 50\nW 25\nP 75\nP 1', expected: 'Brak srodkow\nSaldo: 0' },
          { input: '2\nW 10\nP 10', expected: 'Saldo: 0' },
        ],
      },
      {
        id: 'm9t3',
        title: 'Najlepszy uczeń',
        difficulty: 3,
        description: 'Utwórz klasę `Uczen` (prywatne pola `imie` i `srednia`, konstruktor, gettery `getImie()` i `getSrednia()`). Wczytaj `n`, a potem `n` linii `imie srednia`. Dla każdej linii utwórz obiekt `Uczen` i znajdź ucznia z najwyższą średnią. Wypisz:',
        expectedOutput: 'Najlepszy: Ola 5.2',
        exampleInput: '3\nKuba 4.5\nOla 5.2\nAdam 3.9',
        starter: starter({
          before: `class Uczen {
private:
    string imie;
    double srednia;

public:
    // konstruktor i gettery
};`,
          body: '    int n;\n    cin >> n;\n',
        }),
        hints: [
          'Konstruktor z listą inicjalizacyjną: `Uczen(string i, double s) : imie(i), srednia(s) {}`',
          'Zapamiętaj najlepszego w zmiennych: `string najImie; double najSr = -1;`',
          'W pętli twórz obiekt `Uczen u(imie, sr);` i porównuj `u.getSrednia() > najSr`.',
        ],
        checks: [{ pattern: 'class\\s+Uczen', message: 'Utwórz klasę o nazwie Uczen.' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

class Uczen {
private:
    string imie;
    double srednia;

public:
    Uczen(string i, double s) : imie(i), srednia(s) {}
    string getImie() const { return imie; }
    double getSrednia() const { return srednia; }
};

int main() {
    int n;
    cin >> n;
    string najImie = "";
    double najSr = -1;
    for (int i = 0; i < n; i++) {
        string imie;
        double sr;
        cin >> imie >> sr;
        Uczen u(imie, sr);
        if (u.getSrednia() > najSr) {
            najSr = u.getSrednia();
            najImie = u.getImie();
        }
    }
    cout << "Najlepszy: " << najImie << " " << najSr << endl;
    return 0;
}
`,
        tests: [
          { input: '3\nKuba 4.5\nOla 5.2\nAdam 3.9', expected: 'Najlepszy: Ola 5.2' },
          { input: '1\nZosia 6', expected: 'Najlepszy: Zosia 6' },
          { input: '4\nA 3.1\nB 2.9\nC 4.75\nD 4.7', expected: 'Najlepszy: C 4.75' },
        ],
      },
    ],
  },
];
