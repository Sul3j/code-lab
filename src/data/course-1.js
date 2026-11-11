// Tematy 1–8 kursu. Każdy kod zawiera `using namespace std;`.
import { DEFAULT_TEMPLATE, starter } from './template.js';
import { LEGACY, legacyTask } from './legacy.js';

export const course1 = [
  // ─────────────── 1 ───────────────
  {
    id: 'k01',
    title: 'Podstawowe elementy języka C++',
    subtitle: 'budowa programu, zmienne, typy, operatory',
    icon: 'Terminal',
    practice: false,
    theory: [
      ...LEGACY.m1.theory,
      { type: 'h', text: 'Komentarze i stałe' },
      { type: 'p', text: 'Komentarze opisują kod i są pomijane przez kompilator: `// do końca linii` lub `/* wiele linii */`. Słowo **const** tworzy stałą, której nie można zmienić: `const double VAT = 0.23;`.' },
      { type: 'h', text: 'Operatory arytmetyczne i skrócone' },
      { type: 'table', head: ['Zapis', 'Znaczenie', 'Przykład (x = 10)'], rows: [
        ['+ - * /', 'dodawanie, odejmowanie, mnożenie, dzielenie', 'x / 4 → 2'],
        ['%', 'reszta z dzielenia (tylko liczby całkowite)', 'x % 4 → 2'],
        ['x++ / x--', 'zwiększ / zmniejsz o 1', 'x++ → x = 11'],
        ['x += 5', 'to samo co x = x + 5', 'x → 15'],
      ] },
      { type: 'h', text: 'Rozmiar typów – sizeof' },
      { type: 'p', text: 'Operator `sizeof` zwraca liczbę bajtów zajmowanych przez typ lub zmienną. Typowo: `char` – 1, `int` – 4, `double` – 8, `long long` – 8. Zakres `int` to około ±2,1 miliarda (`INT_MAX` = 2147483647).' },
      { type: 'code', code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    const double PI = 3.14159;   // stala
    int r = 2;
    cout << "Pole kola: " << PI * r * r << endl;
    cout << "sizeof(int) = " << sizeof(int) << endl;
    cout << "sizeof(double) = " << sizeof(double) << endl;
    cout << "Najwiekszy int: " << INT_MAX << endl;
    return 0;
}` },
    ],
    example: LEGACY.m1.example,
    tasks: LEGACY.m1.tasks,
  },

  // ─────────────── 2 ───────────────
  {
    id: 'k02',
    title: 'Instrukcje warunkowe i wyboru',
    subtitle: 'if, else if, else, switch, ?:',
    icon: 'GitBranch',
    practice: true,
    theory: [
      ...LEGACY.m2.theory,
      { type: 'h', text: 'Operator warunkowy ?:' },
      { type: 'p', text: 'Krótka wersja if-else, która zwraca wartość: `warunek ? wartość_gdy_prawda : wartość_gdy_fałsz`. Przykład: `string wynik = (n % 2 == 0) ? "parzysta" : "nieparzysta";`.' },
      { type: 'h', text: 'Zagnieżdżanie warunków' },
      { type: 'p', text: 'Instrukcje if można umieszczać jedna w drugiej. Zawsze używaj nawiasów klamrowych `{ }` – dzięki nim wiadomo, do którego `if` należy `else`.' },
    ],
    example: LEGACY.m2.example,
    tasks: LEGACY.m2.tasks,
  },

  // ─────────────── 3 ───────────────
  {
    id: 'k03',
    title: 'Pętle programowe',
    subtitle: 'for, while, do-while, break, continue',
    icon: 'Repeat',
    practice: true,
    theory: [
      ...LEGACY.m3.theory,
      { type: 'h', text: 'Pętle zagnieżdżone' },
      { type: 'p', text: 'Pętla może znajdować się wewnątrz innej pętli. Wewnętrzna wykonuje się w całości przy każdym obrocie zewnętrznej – tak rysuje się np. prostokąty z gwiazdek albo tabliczkę mnożenia.' },
      { type: 'code', code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    for (int i = 1; i <= 4; i++) {
        for (int j = 1; j <= i; j++) {
            cout << "*";
        }
        cout << endl;
    }
    return 0;
}` },
    ],
    example: LEGACY.m3.example,
    tasks: LEGACY.m3.tasks,
  },

  // ─────────────── 4 ───────────────
  {
    id: 'k04',
    title: 'Typ wyliczeniowy',
    subtitle: 'enum, enum class',
    icon: 'ListOrdered',
    practice: true,
    theory: [
      { type: 'p', text: 'Typ wyliczeniowy **enum** pozwala nadać nazwy kolejnym liczbom całkowitym. Zamiast pamiętać, że 1 to poniedziałek, a 7 to niedziela, piszemy po prostu `PON` i `NIEDZ`. Kod staje się czytelniejszy i trudniej o pomyłkę.' },
      { type: 'code', code: `enum Dzien { PON, WT, SR, CZW, PT, SOB, NIEDZ };
// PON = 0, WT = 1, SR = 2, ...

Dzien d = SR;
cout << d;        // 2` },
      { type: 'list', items: [
        'Domyślnie pierwsza wartość to `0`, a każda następna jest większa o 1.',
        'Wartości można ustawić ręcznie: `enum Ocena { NDST = 1, DOP, DST, DB, BDB, CEL };` – teraz `DOP` = 2 itd.',
        'Zmienne typu wyliczeniowego świetnie współpracują z instrukcją **switch**.',
      ] },
      { type: 'h', text: 'enum class – wyliczenie z zasięgiem (C++11)' },
      { type: 'p', text: 'W zwykłym `enum` nazwy wartości są widoczne w całym programie i mogą kolidować z innymi nazwami. **enum class** zamyka je w swojej „przestrzeni” – trzeba pisać `Kolor::CZERWONY`. Wartości `enum class` nie zamieniają się same na liczby; do tego służy `static_cast<int>(k)`.' },
      { type: 'code', code: `enum class Kolor { CZERWONY, ZIELONY, NIEBIESKI };

Kolor k = Kolor::ZIELONY;
if (k == Kolor::ZIELONY) {
    cout << "Zielony ma numer " << static_cast<int>(k);   // 1
}` },
      { type: 'tip', text: 'Typ wyliczeniowy stosujemy wszędzie tam, gdzie zmienna może przyjmować tylko kilka określonych stanów: dni tygodnia, kierunki (GORA, DOL…), stany gry (MENU, GRA, KONIEC), kolory świateł.' },
      { type: 'warn', text: 'Instrukcja `switch` z wartościami enum powinna mieć `default` – na wypadek, gdyby do zmiennej trafiła nieprzewidziana liczba.' },
    ],
    example: {
      title: 'Kierunek ruchu',
      description: 'Robot porusza się po planszy. Kierunek przechowujemy jako enum, a switch zamienia go na przesunięcie.',
      code: `#include <iostream>
#include <string>
using namespace std;

enum Kierunek { GORA, PRAWO, DOL, LEWO };

string nazwa(Kierunek k) {
    switch (k) {
        case GORA:  return "gora";
        case PRAWO: return "prawo";
        case DOL:   return "dol";
        case LEWO:  return "lewo";
        default:    return "?";
    }
}

int main() {
    int x = 0, y = 0;
    Kierunek ruchy[5] = { GORA, GORA, PRAWO, DOL, PRAWO };

    for (int i = 0; i < 5; i++) {
        Kierunek k = ruchy[i];
        switch (k) {
            case GORA:  y++; break;
            case DOL:   y--; break;
            case PRAWO: x++; break;
            case LEWO:  x--; break;
        }
        cout << "Ruch w " << nazwa(k) << " -> (" << x << ", " << y << ")" << endl;
    }

    enum class Stan { MENU, GRA, KONIEC };
    Stan s = Stan::GRA;
    cout << "Numer stanu gry: " << static_cast<int>(s) << endl;
    return 0;
}
`,
    },
    tasks: [
      {
        id: 'k04t1',
        title: 'Weekend czy dzień roboczy?',
        difficulty: 1,
        description: 'Zdefiniuj typ wyliczeniowy `enum Dzien { PON = 1, WT, SR, CZW, PT, SOB, NIEDZ };`. Wczytaj numer dnia (1–7), zamień go na typ `Dzien` i wypisz `Weekend` (dla SOB i NIEDZ) albo `Dzien roboczy`. Dla liczby spoza zakresu wypisz `Bledny numer`.',
        expectedOutput: 'Weekend',
        exampleInput: '6',
        starter: starter({
          before: 'enum Dzien { PON = 1, WT, SR, CZW, PT, SOB, NIEDZ };',
          body: '    int n;\n    cin >> n;\n    // Twoj kod tutaj\n',
        }),
        hints: [
          'Najpierw sprawdź zakres: `if (n < PON || n > NIEDZ)`.',
          'Zamiana liczby na enum: `Dzien d = static_cast<Dzien>(n);`',
          'Warunek weekendu: `d == SOB || d == NIEDZ`.',
        ],
        checks: [{ pattern: 'enum\\s+Dzien', message: 'Użyj typu wyliczeniowego enum Dzien.' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

enum Dzien { PON = 1, WT, SR, CZW, PT, SOB, NIEDZ };

int main() {
    int n;
    cin >> n;
    if (n < PON || n > NIEDZ) {
        cout << "Bledny numer" << endl;
        return 0;
    }
    Dzien d = static_cast<Dzien>(n);
    if (d == SOB || d == NIEDZ) {
        cout << "Weekend" << endl;
    } else {
        cout << "Dzien roboczy" << endl;
    }
    return 0;
}
`,
        tests: [
          { input: '6', expected: 'Weekend' },
          { input: '7', expected: 'Weekend' },
          { input: '1', expected: 'Dzien roboczy' },
          { input: '5', expected: 'Dzien roboczy' },
          { input: '8', expected: 'Bledny numer' },
        ],
      },
      {
        id: 'k04t2',
        title: 'Sygnalizacja świetlna',
        difficulty: 2,
        description: 'Zdefiniuj `enum class Swiatlo { CZERWONE, ZIELONE, ZOLTE };` oraz funkcje `Swiatlo nastepne(Swiatlo s)` (kolejność: CZERWONE → ZIELONE → ZOLTE → CZERWONE…) i `string nazwa(Swiatlo s)`. Wczytaj numer światła startowego (0–2) i liczbę zmian `k`. Wypisz nazwy kolejnych `k` świateł, każdą w osobnej linii.',
        expectedOutput: 'ZIELONE\nZOLTE\nCZERWONE',
        exampleInput: '0 3',
        starter: starter({
          before: `enum class Swiatlo { CZERWONE, ZIELONE, ZOLTE };

Swiatlo nastepne(Swiatlo s) {
    // uzupelnij
    return s;
}

string nazwa(Swiatlo s) {
    // uzupelnij
    return "";
}`,
          body: '    int start, k;\n    cin >> start >> k;\n    Swiatlo s = static_cast<Swiatlo>(start);\n    // Twoj kod tutaj\n',
        }),
        hints: [
          'W funkcji `nastepne` użyj switch: `case Swiatlo::CZERWONE: return Swiatlo::ZIELONE;` itd.',
          'Funkcja `nazwa` działa podobnie, ale zwraca napis, np. `"CZERWONE"`.',
          'W main: powtórz `k` razy `s = nastepne(s); cout << nazwa(s) << endl;`.',
        ],
        checks: [{ pattern: 'enum\\s+class\\s+Swiatlo', message: 'Użyj enum class Swiatlo.' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

enum class Swiatlo { CZERWONE, ZIELONE, ZOLTE };

Swiatlo nastepne(Swiatlo s) {
    switch (s) {
        case Swiatlo::CZERWONE: return Swiatlo::ZIELONE;
        case Swiatlo::ZIELONE:  return Swiatlo::ZOLTE;
        default:                return Swiatlo::CZERWONE;
    }
}

string nazwa(Swiatlo s) {
    switch (s) {
        case Swiatlo::CZERWONE: return "CZERWONE";
        case Swiatlo::ZIELONE:  return "ZIELONE";
        default:                return "ZOLTE";
    }
}

int main() {
    int start, k;
    cin >> start >> k;
    Swiatlo s = static_cast<Swiatlo>(start);
    for (int i = 0; i < k; i++) {
        s = nastepne(s);
        cout << nazwa(s) << endl;
    }
    return 0;
}
`,
        tests: [
          { input: '0 3', expected: 'ZIELONE\nZOLTE\nCZERWONE' },
          { input: '2 1', expected: 'CZERWONE' },
          { input: '1 4', expected: 'ZOLTE\nCZERWONE\nZIELONE\nZOLTE' },
        ],
      },
    ],
  },

  // ─────────────── 5 ───────────────
  {
    id: 'k05',
    title: 'Zmienne wskaźnikowe',
    subtitle: 'adres, operatory & i *, nullptr',
    icon: 'MousePointer2',
    practice: true,
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
      { type: 'h', text: 'Wskaźniki jako parametry funkcji' },
      { type: 'p', text: 'Gdy funkcja dostaje wskaźnik, może zmienić zmienną, na którą on wskazuje. Przy wywołaniu przekazujemy adres: `podwoj(&x);`.' },
      { type: 'code', code: `void podwoj(int *w) {
    *w = *w * 2;
}` },
      { type: 'warn', text: 'Wskaźnik niezainicjalizowany wskazuje „gdziekolwiek”. Zawsze ustawiaj go na adres zmiennej albo na `nullptr`, a przed użyciem sprawdzaj `if (p != nullptr)`. Dereferencja `nullptr` to błąd – to środowisko go wykryje.' },
      { type: 'tip', text: 'Typ wskaźnika musi pasować do typu zmiennej: `int*` wskazuje na `int`, `double*` na `double`.' },
    ],
    example: {
      title: 'Zajrzyj do pamięci',
      description: 'Wskaźnik pozwala odczytać i zmienić zmienną „na odległość”.',
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

    *p = 50;
    cout << "Po *p = 50: x = " << x << endl;

    podwoj(&x);
    cout << "Po podwojeniu: x = " << x << endl;

    int *pusty = nullptr;
    if (pusty == nullptr) {
        cout << "Wskaznik pusty - nie wolno go dereferencjowac!" << endl;
    }
    return 0;
}
`,
    },
    tasks: [
      legacyTask('m8t1'),
      {
        id: 'k05t2',
        title: 'Zamiana przez wskaźniki',
        difficulty: 2,
        description: 'Napisz funkcję `void zamien(int *a, int *b)`, która zamienia wartości dwóch zmiennych, korzystając ze wskaźników. W `main` wczytaj `x` i `y`, wywołaj `zamien(&x, &y)` i wypisz:',
        expectedOutput: 'x = 9, y = 4',
        exampleInput: '4 9',
        starter: starter({
          before: `void zamien(int *a, int *b) {
    // uzupelnij
}`,
          body: '    int x, y;\n    cin >> x >> y;\n    zamien(&x, &y);\n    cout << "x = " << x << ", y = " << y << endl;\n',
        }),
        hints: [
          'Wartość pod adresem `a` to `*a`.',
          'Zapamiętaj ją w zmiennej pomocniczej: `int tmp = *a;`',
          'Potem `*a = *b;` i `*b = tmp;`',
        ],
        checks: [{ pattern: 'void\\s+zamien\\s*\\(\\s*int\\s*\\*', message: 'Funkcja powinna mieć nagłówek void zamien(int *a, int *b).' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

void zamien(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main() {
    int x, y;
    cin >> x >> y;
    zamien(&x, &y);
    cout << "x = " << x << ", y = " << y << endl;
    return 0;
}
`,
        tests: [
          { input: '4 9', expected: 'x = 9, y = 4' },
          { input: '-1 0', expected: 'x = 0, y = -1' },
          { input: '5 5', expected: 'x = 5, y = 5' },
        ],
      },
    ],
  },

  // ─────────────── 6 ───────────────
  {
    id: 'k06',
    title: 'Zmienne dynamiczne',
    subtitle: 'new, delete, sterta, wycieki pamięci',
    icon: 'Cpu',
    practice: false,
    theory: [
      { type: 'p', text: 'Zwykłe zmienne lokalne tworzone są na **stosie** – powstają przy wejściu do bloku i znikają po jego zakończeniu. Zmienne **dynamiczne** tworzymy sami w trakcie działania programu na **stercie** (ang. heap) operatorem **new** i sami decydujemy, kiedy je usunąć operatorem **delete**.' },
      { type: 'code', code: `int *p = new int;      // nowa zmienna int na stercie
*p = 25;
int *q = new int(7);   // od razu z wartoscia 7

cout << *p + *q;       // 32

delete p;              // zwolnienie pamieci
delete q;
p = nullptr;           // dobra praktyka` },
      { type: 'list', items: [
        '`new typ` zwraca **wskaźnik** do nowo utworzonej zmiennej – dostęp do niej mamy tylko przez ten wskaźnik.',
        'Zmienna dynamiczna istnieje, dopóki nie wywołamy `delete` – nawet po wyjściu z funkcji, w której powstała.',
        'Każde `new` musi mieć dokładnie jedno `delete`.',
      ] },
      { type: 'h', text: 'Typowe błędy' },
      { type: 'table', head: ['Błąd', 'Co się dzieje'], rows: [
        ['brak delete', '**wyciek pamięci** – pamięć jest zajęta do końca programu'],
        ['podwójne delete', 'zwolnienie tej samej pamięci dwa razy – awaria programu'],
        ['użycie po delete', '„wiszący wskaźnik” – odczyt pamięci, która już nie należy do nas'],
        ['delete zwykłej zmiennej', 'delete wolno użyć tylko na pamięci z new'],
      ] },
      { type: 'tip', text: 'To środowisko wykrywa wszystkie te błędy i po zakończeniu programu ostrzega o wyciekach pamięci. Spróbuj usunąć `delete` z przykładu i uruchom go ponownie!' },
      { type: 'warn', text: 'Po `delete p;` warto ustawić `p = nullptr;` – wtedy przypadkowe ponowne `delete p` nic nie zepsuje, a próba użycia od razu zgłosi błąd.' },
    ],
    example: {
      title: 'Obiekt na stercie',
      description: 'Funkcja tworzy zmienną dynamiczną i zwraca wskaźnik – zmienna „przeżywa” zakończenie funkcji.',
      code: `#include <iostream>
#include <string>
using namespace std;

int* utworzLicznik(int start) {
    int *wsk = new int(start);   // zmienna przetrwa koniec funkcji
    return wsk;
}

int main() {
    int *licznik = utworzLicznik(10);
    for (int i = 0; i < 3; i++) {
        (*licznik)++;
    }
    cout << "Licznik: " << *licznik << endl;
    cout << "Adres na stercie: " << licznik << endl;

    delete licznik;      // zwalniamy pamiec
    licznik = nullptr;

    double *cena = new double;
    *cena = 19.99;
    cout << "Cena: " << *cena << endl;
    delete cena;
    return 0;
}
`,
    },
    tasks: [],
  },

  // ─────────────── 7 ───────────────
  {
    id: 'k07',
    title: 'Tablice statyczne',
    subtitle: 'tablice 1D i 2D, indeksy, pętle',
    icon: 'Rows3',
    practice: true,
    theory: [
      ...LEGACY.m4.theory,
      { type: 'h', text: 'Tablice dwuwymiarowe' },
      ...LEGACY.m6.theory,
    ],
    example: LEGACY.m4.example,
    tasks: [...LEGACY.m4.tasks, ...LEGACY.m6.tasks],
  },

  // ─────────────── 8 ───────────────
  {
    id: 'k08',
    title: 'Tablice i wskaźniki',
    subtitle: 'nazwa tablicy jako adres, arytmetyka wskaźników',
    icon: 'Link2',
    practice: false,
    theory: [
      { type: 'p', text: 'Elementy tablicy leżą w pamięci **jeden obok drugiego**. Nazwa tablicy (bez nawiasów) to adres jej pierwszego elementu, dlatego można ją przypisać do wskaźnika: `int *p = t;` (to samo co `int *p = &t[0];`).' },
      { type: 'h', text: 'Arytmetyka wskaźników' },
      { type: 'p', text: 'Dodanie liczby do wskaźnika przesuwa go o tyle **elementów** (a nie bajtów). Dla tablicy `int` przesunięcie o 1 to 4 bajty dalej.' },
      { type: 'table', head: ['Zapis', 'Znaczenie'], rows: [
        ['t[i]', 'i-ty element tablicy'],
        ['*(t + i)', 'to samo co t[i]'],
        ['&t[i]', 'adres i-tego elementu (t + i)'],
        ['p++', 'przesuń wskaźnik na następny element'],
        ['q - p', 'ile elementów dzieli dwa wskaźniki'],
      ] },
      { type: 'code', code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int t[4] = {10, 20, 30, 40};
    int *p = t;

    cout << *p << endl;          // 10
    cout << *(p + 2) << endl;    // 30
    p++;
    cout << *p << endl;          // 20
    cout << &t[3] - &t[0] << endl;   // 3

    for (int *q = t; q < t + 4; q++) {
        cout << *q << " ";
    }
    cout << endl;
    return 0;
}` },
      { type: 'h', text: 'Przekazywanie tablic do funkcji' },
      { type: 'p', text: 'Tablica przekazana do funkcji **nie jest kopiowana** – funkcja dostaje adres pierwszego elementu. Zapisy `void f(int t[], int n)` i `void f(int *t, int n)` oznaczają to samo. Dlatego funkcja może zmieniać elementy tablicy i musi dostać jej rozmiar osobnym parametrem.' },
      { type: 'warn', text: 'Wskaźnik nie „wie”, gdzie kończy się tablica. Przesunięcie go poza ostatni element i odczyt to poważny błąd (to środowisko go wykryje).' },
    ],
    example: {
      title: 'Wskaźnik spaceruje po tablicy',
      description: 'Adresy kolejnych elementów różnią się o rozmiar typu. Funkcja dostaje tablicę jako wskaźnik i ją modyfikuje.',
      code: `#include <iostream>
#include <string>
using namespace std;

void podwojWszystkie(int *t, int n) {
    for (int i = 0; i < n; i++) {
        *(t + i) *= 2;
    }
}

int main() {
    int t[4] = {1, 2, 3, 4};
    cout << "sizeof(int) = " << sizeof(int) << endl;
    for (int i = 0; i < 4; i++) {
        cout << "t[" << i << "] = " << t[i] << "  adres: " << &t[i] << endl;
    }

    podwojWszystkie(t, 4);

    cout << "Po podwojeniu: ";
    for (int *p = t; p != t + 4; p++) {
        cout << *p << " ";
    }
    cout << endl;
    return 0;
}
`,
    },
    tasks: [legacyTask('m8t2')],
  },
];
