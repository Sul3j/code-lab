// Dodatkowe ćwiczenia do tematów kursu (klucz = id tematu).
// Każdy kod startowy i każde rozwiązanie zawiera `using namespace std;`.
import { DEFAULT_TEMPLATE, starter } from './template.js';

const H = (extra = []) => ['iostream', 'string', ...extra].map((i) => `#include <${i}>`).join('\n') + '\nusing namespace std;\n';

export const EXERCISES = {
  // ─────────────── 4. Typ wyliczeniowy ───────────────
  k04: [
    {
      id: 'k04t3',
      title: 'Pory roku',
      difficulty: 2,
      description: 'Zdefiniuj `enum PoraRoku { WIOSNA, LATO, JESIEN, ZIMA };` i funkcję `PoraRoku pora(int miesiac)` (3–5 wiosna, 6–8 lato, 9–11 jesień, 12, 1, 2 zima). Wczytaj numer miesiąca (1–12) i wypisz nazwę pory roku: `Wiosna`, `Lato`, `Jesien` albo `Zima`.',
      expectedOutput: 'Wiosna',
      exampleInput: '4',
      starter: starter({
        before: `enum PoraRoku { WIOSNA, LATO, JESIEN, ZIMA };

PoraRoku pora(int miesiac) {
    // uzupelnij
    return ZIMA;
}`,
        body: '    int m;\n    cin >> m;\n    // wypisz nazwe pory roku (uzyj switch)\n',
      }),
      hints: [
        'W funkcji `pora` wystarczą warunki: `if (miesiac >= 3 && miesiac <= 5) return WIOSNA;` itd.',
        'W main zapisz wynik: `PoraRoku p = pora(m);` i użyj `switch (p)`.',
      ],
      checks: [{ pattern: 'enum\\s+PoraRoku', message: 'Użyj typu wyliczeniowego enum PoraRoku.' }],
      solution: `${H()}
enum PoraRoku { WIOSNA, LATO, JESIEN, ZIMA };

PoraRoku pora(int miesiac) {
    if (miesiac >= 3 && miesiac <= 5) return WIOSNA;
    if (miesiac >= 6 && miesiac <= 8) return LATO;
    if (miesiac >= 9 && miesiac <= 11) return JESIEN;
    return ZIMA;
}

int main() {
    int m;
    cin >> m;
    switch (pora(m)) {
        case WIOSNA: cout << "Wiosna" << endl; break;
        case LATO:   cout << "Lato" << endl; break;
        case JESIEN: cout << "Jesien" << endl; break;
        case ZIMA:   cout << "Zima" << endl; break;
    }
    return 0;
}
`,
      tests: [
        { input: '4', expected: 'Wiosna' },
        { input: '7', expected: 'Lato' },
        { input: '9', expected: 'Jesien' },
        { input: '12', expected: 'Zima' },
        { input: '1', expected: 'Zima' },
      ],
    },
  ],

  // ─────────────── 5. Zmienne wskaźnikowe ───────────────
  k05: [
    {
      id: 'k05t3',
      title: 'Wskaźnik na większą',
      difficulty: 3,
      description: 'Napisz funkcję `int* wieksza(int *a, int *b)`, która zwraca wskaźnik na większą z dwóch liczb (przy równych – na pierwszą). W `main` wczytaj `x` i `y`, a potem **wyzeruj większą** z nich instrukcją `*wieksza(&x, &y) = 0;`. Wypisz:',
      expectedOutput: 'x = 3, y = 0',
      exampleInput: '3 8',
      starter: starter({
        before: `int* wieksza(int *a, int *b) {
    // uzupelnij
    return a;
}`,
        body: '    int x, y;\n    cin >> x >> y;\n    // wyzeruj wieksza liczbe przez wskaznik\n    cout << "x = " << x << ", y = " << y << endl;\n',
      }),
      hints: [
        'Porównujesz wartości, czyli `*a` i `*b`, a zwracasz wskaźnik: `return a;` albo `return b;`.',
        'Wynik funkcji to adres – po dereferencji można do niego przypisać: `*wieksza(&x, &y) = 0;`',
      ],
      checks: [{ pattern: 'int\\s*\\*\\s*wieksza\\s*\\(', message: 'Funkcja powinna mieć nagłówek int* wieksza(int *a, int *b).' }],
      solution: `${H()}
int* wieksza(int *a, int *b) {
    if (*a >= *b) return a;
    return b;
}

int main() {
    int x, y;
    cin >> x >> y;
    *wieksza(&x, &y) = 0;
    cout << "x = " << x << ", y = " << y << endl;
    return 0;
}
`,
      tests: [
        { input: '3 8', expected: 'x = 3, y = 0' },
        { input: '9 2', expected: 'x = 0, y = 2' },
        { input: '5 5', expected: 'x = 0, y = 5' },
      ],
    },
  ],

  // ─────────────── 6. Zmienne dynamiczne ───────────────
  k06: [
    {
      id: 'k06t1',
      title: 'Suma na stercie',
      difficulty: 1,
      description: 'Utwórz zmienną dynamiczną `int *suma = new int(0);`. Wczytaj `n`, a potem `n` liczb i dodawaj je do `*suma`. Wypisz wynik i zwolnij pamięć instrukcją `delete`.',
      expectedOutput: 'Suma: 6',
      exampleInput: '3\n1 2 3',
      starter: DEFAULT_TEMPLATE,
      hints: [
        'Dostęp do wartości zmiennej dynamicznej: `*suma += x;`',
        'Na końcu: `delete suma;` – środowisko ostrzeże Cię, jeśli zapomnisz.',
      ],
      checks: [
        { pattern: 'new\\s+int', message: 'Utwórz zmienną dynamiczną: new int(0).' },
        { pattern: 'delete\\s+\\w+', message: 'Zwolnij pamięć instrukcją delete.' },
      ],
      solution: `${H()}
int main() {
    int *suma = new int(0);
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        *suma += x;
    }
    cout << "Suma: " << *suma << endl;
    delete suma;
    return 0;
}
`,
      tests: [
        { input: '3\n1 2 3', expected: 'Suma: 6' },
        { input: '1\n-5', expected: 'Suma: -5' },
        { input: '4\n10 20 30 40', expected: 'Suma: 100' },
      ],
    },
    {
      id: 'k06t2',
      title: 'Fabryka liczb',
      difficulty: 2,
      description: 'Napisz funkcję `double* utworz(double v)`, która tworzy zmienną dynamiczną o wartości `v` i zwraca do niej wskaźnik. W `main` wczytaj dwie liczby, utwórz dla nich zmienne funkcją `utworz`, wypisz sumę i iloczyn, a następnie zwolnij obie zmienne.',
      expectedOutput: 'Suma: 5.5\nIloczyn: 7',
      exampleInput: '2 3.5',
      starter: starter({
        before: `double* utworz(double v) {
    // uzupelnij
    return nullptr;
}`,
        body: '    double a, b;\n    cin >> a >> b;\n    // Twoj kod tutaj\n',
      }),
      hints: [
        'W funkcji: `return new double(v);`',
        'W main: `double *p = utworz(a);`, a wartość odczytasz jako `*p`.',
        'Pamiętaj o dwóch instrukcjach `delete`.',
      ],
      checks: [
        { pattern: 'double\\s*\\*\\s*utworz\\s*\\(', message: 'Zdefiniuj funkcję double* utworz(double v).' },
        { pattern: 'new\\s+double', message: 'Funkcja powinna tworzyć zmienną przez new double.' },
      ],
      solution: `${H()}
double* utworz(double v) {
    return new double(v);
}

int main() {
    double a, b;
    cin >> a >> b;
    double *p = utworz(a);
    double *q = utworz(b);
    cout << "Suma: " << *p + *q << endl;
    cout << "Iloczyn: " << *p * *q << endl;
    delete p;
    delete q;
    return 0;
}
`,
      tests: [
        { input: '2 3.5', expected: 'Suma: 5.5\nIloczyn: 7' },
        { input: '1.5 2', expected: 'Suma: 3.5\nIloczyn: 3' },
        { input: '-1 4', expected: 'Suma: 3\nIloczyn: -4' },
      ],
    },
    {
      id: 'k06t3',
      title: 'Wskaźnik pusty, gdy brak danych',
      difficulty: 2,
      description: 'Wczytaj liczbę `n`. Jeśli `n > 0`, utwórz zmienną dynamiczną o wartości `n * n`; w przeciwnym razie ustaw wskaźnik na `nullptr`. Następnie sprawdź wskaźnik: wypisz `Wynik: X` albo `Brak danych`. Zwolnij pamięć tylko wtedy, gdy była zaalokowana.',
      expectedOutput: 'Wynik: 25',
      exampleInput: '5',
      starter: DEFAULT_TEMPLATE,
      hints: [
        'Deklaracja: `int *p = nullptr;`, a potem `if (n > 0) p = new int(n * n);`',
        'Sprawdzenie: `if (p != nullptr) { ... }`',
        '`delete` na `nullptr` jest bezpieczne, ale zwolnij pamięć wewnątrz tego samego warunku – tak będzie czytelniej.',
      ],
      checks: [{ pattern: 'nullptr', message: 'Użyj nullptr dla wskaźnika bez danych.' }],
      solution: `${H()}
int main() {
    int n;
    cin >> n;
    int *p = nullptr;
    if (n > 0) {
        p = new int(n * n);
    }
    if (p != nullptr) {
        cout << "Wynik: " << *p << endl;
        delete p;
    } else {
        cout << "Brak danych" << endl;
    }
    return 0;
}
`,
      tests: [
        { input: '5', expected: 'Wynik: 25' },
        { input: '0', expected: 'Brak danych' },
        { input: '-3', expected: 'Brak danych' },
        { input: '12', expected: 'Wynik: 144' },
      ],
    },
  ],

  // ─────────────── 8. Tablice i wskaźniki ───────────────
  k08: [
    {
      id: 'k08t1',
      title: 'Wskaźnik na maksimum',
      difficulty: 2,
      description: 'Napisz funkcję `int* znajdzMax(int *t, int n)`, która zwraca **wskaźnik** na największy element tablicy (pierwszy, jeśli jest ich kilka). W `main` wczytaj `n` (1–100) i liczby, a następnie wypisz wartość maksimum i jego indeks, obliczony jako różnica wskaźników `p - t`.',
      expectedOutput: 'Max: 9\nIndeks: 1',
      exampleInput: '5\n3 9 2 9 1',
      starter: starter({
        before: `int* znajdzMax(int *t, int n) {
    // uzupelnij
    return t;
}`,
        body: '    int n;\n    int t[100];\n    cin >> n;\n    for (int i = 0; i < n; i++) cin >> t[i];\n    // Twoj kod tutaj\n',
      }),
      hints: [
        'Zacznij od `int *naj = t;` i przechodź po tablicy: `if (*(t + i) > *naj) naj = t + i;`',
        'W main: `int *p = znajdzMax(t, n);` – wartość to `*p`, a indeks to `p - t`.',
      ],
      checks: [{ pattern: 'int\\s*\\*\\s*znajdzMax\\s*\\(', message: 'Zdefiniuj funkcję int* znajdzMax(int *t, int n).' }],
      solution: `${H()}
int* znajdzMax(int *t, int n) {
    int *naj = t;
    for (int i = 1; i < n; i++) {
        if (*(t + i) > *naj) naj = t + i;
    }
    return naj;
}

int main() {
    int n;
    int t[100];
    cin >> n;
    for (int i = 0; i < n; i++) cin >> t[i];
    int *p = znajdzMax(t, n);
    cout << "Max: " << *p << endl;
    cout << "Indeks: " << p - t << endl;
    return 0;
}
`,
      tests: [
        { input: '5\n3 9 2 9 1', expected: 'Max: 9\nIndeks: 1' },
        { input: '1\n7', expected: 'Max: 7\nIndeks: 0' },
        { input: '4\n-5 -2 -8 -3', expected: 'Max: -2\nIndeks: 1' },
      ],
    },
    {
      id: 'k08t3',
      title: 'Odwracanie dwoma wskaźnikami',
      difficulty: 3,
      description: 'Wczytaj `n` (1–100) i `n` liczb. Odwróć kolejność elementów **w tablicy** za pomocą dwóch wskaźników: jeden zaczyna od początku, drugi od końca; zamieniaj wskazywane wartości i przesuwaj wskaźniki ku sobie. Wypisz tablicę po odwróceniu.',
      expectedOutput: '5 4 3 2 1',
      exampleInput: '5\n1 2 3 4 5',
      starter: starter({ body: '    int n;\n    int t[100];\n    cin >> n;\n    for (int i = 0; i < n; i++) cin >> t[i];\n    // odwroc tablice dwoma wskaznikami\n' }),
      hints: [
        'Wskaźniki: `int *lewy = t; int *prawy = t + n - 1;`',
        'Pętla: `while (lewy < prawy) { swap(*lewy, *prawy); lewy++; prawy--; }`',
      ],
      checks: [{ pattern: 'int\\s*\\*\\s*\\w+\\s*=\\s*\\w+\\s*\\+', message: 'Użyj wskaźnika ustawionego na koniec tablicy, np. int *prawy = t + n - 1;' }],
      solution: `${H()}
int main() {
    int n;
    int t[100];
    cin >> n;
    for (int i = 0; i < n; i++) cin >> t[i];
    int *lewy = t;
    int *prawy = t + n - 1;
    while (lewy < prawy) {
        int tmp = *lewy;
        *lewy = *prawy;
        *prawy = tmp;
        lewy++;
        prawy--;
    }
    for (int i = 0; i < n; i++) cout << t[i] << " ";
    cout << endl;
    return 0;
}
`,
      tests: [
        { input: '5\n1 2 3 4 5', expected: '5 4 3 2 1' },
        { input: '4\n10 20 30 40', expected: '40 30 20 10' },
        { input: '1\n7', expected: '7' },
      ],
    },
  ],

  // ─────────────── 10. Pętla foreach ───────────────
  k10: [
    {
      id: 'k10t3',
      title: 'Najdłuższe słowo',
      difficulty: 2,
      description: 'Wczytaj `n`, a potem `n` słów do `vector<string>`. Używając **pętli foreach**, znajdź najdłuższe słowo (pierwsze, jeśli kilka ma tę samą długość). Wypisz:',
      expectedOutput: 'Najdluzsze: programowanie (13)',
      exampleInput: '3\nkot programowanie dom',
      starter: starter({ includes: ['vector'], body: '    int n;\n    cin >> n;\n    vector<string> slowa(n);\n    for (int i = 0; i < n; i++) cin >> slowa[i];\n    // znajdz najdluzsze petla foreach\n' }),
      hints: [
        'Zapamiętuj najlepsze słowo: `string naj = "";`',
        '`for (const string &s : slowa) if (s.length() > naj.length()) naj = s;`',
      ],
      checks: [{ pattern: 'for\\s*\\([^;()]*:[^;]*\\)', message: 'Użyj pętli foreach.' }],
      solution: `${H(['vector'])}
int main() {
    int n;
    cin >> n;
    vector<string> slowa(n);
    for (int i = 0; i < n; i++) cin >> slowa[i];
    string naj = "";
    for (const string &s : slowa) {
        if (s.length() > naj.length()) naj = s;
    }
    cout << "Najdluzsze: " << naj << " (" << naj.length() << ")" << endl;
    return 0;
}
`,
      tests: [
        { input: '3\nkot programowanie dom', expected: 'Najdluzsze: programowanie (13)' },
        { input: '1\nC', expected: 'Najdluzsze: C (1)' },
        { input: '4\nala ola ewa jan', expected: 'Najdluzsze: ala (3)' },
      ],
    },
  ],

  // ─────────────── 11. C-napisy ───────────────
  k11: [
    {
      id: 'k11t1',
      title: 'Długość bez strlen',
      difficulty: 1,
      description: "Wczytaj jedno słowo do tablicy `char s[100]` i policz jego długość **bez używania strlen** – przechodź po tablicy, aż trafisz na znak końca `'\\0'`.",
      expectedOutput: 'Dlugosc: 5',
      exampleInput: 'kajak',
      starter: starter({ body: '    char s[100];\n    cin >> s;\n    // policz dlugosc bez strlen\n' }),
      hints: [
        "Pętla: `int n = 0; while (s[n] != '\\0') n++;`",
        'Znak `\\0` ma kod 0, więc warunek można też zapisać jako `s[n] != 0`.',
      ],
      checks: [{ pattern: '^(?![\\s\\S]*strlen)', message: 'Nie używaj funkcji strlen – policz znaki samodzielnie.' }],
      solution: `${H()}
int main() {
    char s[100];
    cin >> s;
    int n = 0;
    while (s[n] != '\\0') {
        n++;
    }
    cout << "Dlugosc: " << n << endl;
    return 0;
}
`,
      tests: [
        { input: 'kajak', expected: 'Dlugosc: 5' },
        { input: 'C++', expected: 'Dlugosc: 3' },
        { input: 'a', expected: 'Dlugosc: 1' },
      ],
    },
    {
      id: 'k11t2',
      title: 'Nazwisko, Imię',
      difficulty: 2,
      description: 'Wczytaj imię i nazwisko do dwóch tablic znaków. Za pomocą `strcpy` i `strcat` zbuduj w trzeciej tablicy napis w formacie `Nazwisko, Imie` i wypisz go.',
      expectedOutput: 'Kowalski, Jan',
      exampleInput: 'Jan Kowalski',
      starter: starter({ includes: ['cstring'], body: '    char imie[50], nazwisko[50], wynik[110];\n    cin >> imie >> nazwisko;\n    // zbuduj napis w tablicy wynik\n' }),
      hints: [
        'Najpierw skopiuj nazwisko: `strcpy(wynik, nazwisko);`',
        'Potem dopisz: `strcat(wynik, ", ");` i `strcat(wynik, imie);`',
      ],
      checks: [
        { pattern: 'strcpy\\s*\\(', message: 'Użyj funkcji strcpy.' },
        { pattern: 'strcat\\s*\\(', message: 'Użyj funkcji strcat.' },
      ],
      solution: `${H(['cstring'])}
int main() {
    char imie[50], nazwisko[50], wynik[110];
    cin >> imie >> nazwisko;
    strcpy(wynik, nazwisko);
    strcat(wynik, ", ");
    strcat(wynik, imie);
    cout << wynik << endl;
    return 0;
}
`,
      tests: [
        { input: 'Jan Kowalski', expected: 'Kowalski, Jan' },
        { input: 'Ola Nowak', expected: 'Nowak, Ola' },
        { input: 'A B', expected: 'B, A' },
      ],
    },
    {
      id: 'k11t3',
      title: 'Porównanie haseł',
      difficulty: 2,
      description: 'Wczytaj dwa słowa do tablic znaków i porównaj je funkcją `strcmp`. Jeśli są identyczne, wypisz `Hasla zgodne`. W przeciwnym razie wypisz `Hasla rozne`, a w kolejnej linii słowo, które jest pierwsze w kolejności alfabetycznej (wg kodów ASCII):',
      expectedOutput: 'Hasla rozne\nPierwsze alfabetycznie: kos',
      exampleInput: 'kot kos',
      starter: starter({ includes: ['cstring'], body: '    char a[50], b[50];\n    cin >> a >> b;\n    // porownaj przez strcmp\n' }),
      hints: [
        '`strcmp(a, b) == 0` oznacza równe napisy.',
        '`strcmp(a, b) < 0` oznacza, że `a` jest wcześniej w kolejności alfabetycznej.',
        'Pamiętaj: w kodach ASCII wielkie litery są przed małymi.',
      ],
      checks: [{ pattern: 'strcmp\\s*\\(', message: 'Porównaj napisy funkcją strcmp.' }],
      solution: `${H(['cstring'])}
int main() {
    char a[50], b[50];
    cin >> a >> b;
    int w = strcmp(a, b);
    if (w == 0) {
        cout << "Hasla zgodne" << endl;
    } else {
        cout << "Hasla rozne" << endl;
        cout << "Pierwsze alfabetycznie: " << (w < 0 ? a : b) << endl;
    }
    return 0;
}
`,
      tests: [
        { input: 'kot kos', expected: 'Hasla rozne\nPierwsze alfabetycznie: kos' },
        { input: 'abc abc', expected: 'Hasla zgodne' },
        { input: 'ala Ala', expected: 'Hasla rozne\nPierwsze alfabetycznie: Ala' },
      ],
    },
  ],

  // ─────────────── 13. Struktury ───────────────
  k13: [
    {
      id: 'k13t1',
      title: 'Odległość punktów',
      difficulty: 1,
      description: 'Zdefiniuj strukturę `Punkt` z polami `x` i `y` (double) oraz funkcję `double odleglosc(Punkt a, Punkt b)`. Wczytaj współrzędne dwóch punktów i wypisz ich odległość z dokładnością do 2 miejsc po przecinku:',
      expectedOutput: 'Odleglosc: 5.00',
      exampleInput: '0 0 3 4',
      starter: starter({ includes: ['cmath', 'iomanip'], before: 'struct Punkt {\n    // pola x i y\n};', body: '    // wczytaj dwa punkty i wypisz odleglosc\n' }),
      hints: [
        'Wczytanie: `Punkt a, b; cin >> a.x >> a.y >> b.x >> b.y;`',
        'Wzór: `sqrt(pow(b.x - a.x, 2) + pow(b.y - a.y, 2))`',
        'Formatowanie: `cout << fixed << setprecision(2) << ...`',
      ],
      checks: [{ pattern: 'struct\\s+Punkt', message: 'Zdefiniuj strukturę Punkt.' }],
      solution: `${H(['cmath', 'iomanip'])}
struct Punkt {
    double x, y;
};

double odleglosc(Punkt a, Punkt b) {
    return sqrt(pow(b.x - a.x, 2) + pow(b.y - a.y, 2));
}

int main() {
    Punkt a, b;
    cin >> a.x >> a.y >> b.x >> b.y;
    cout << fixed << setprecision(2) << "Odleglosc: " << odleglosc(a, b) << endl;
    return 0;
}
`,
      tests: [
        { input: '0 0 3 4', expected: 'Odleglosc: 5.00' },
        { input: '1 1 1 1', expected: 'Odleglosc: 0.00' },
        { input: '0 0 1 1', expected: 'Odleglosc: 1.41' },
      ],
    },
    {
      id: 'k13t2',
      title: 'Najstarsza osoba',
      difficulty: 2,
      description: 'Zdefiniuj strukturę `Osoba { string imie; int wiek; }`. Wczytaj `n` (1–30), a potem `n` par `imie wiek` do **tablicy struktur**. Wypisz najstarszą osobę (pierwszą, jeśli kilka ma ten sam wiek):',
      expectedOutput: 'Najstarsza: Ola (17)',
      exampleInput: '3\nAla 15\nOla 17\nEla 16',
      starter: starter({ before: 'struct Osoba {\n    string imie;\n    int wiek;\n};', body: '    int n;\n    Osoba t[30];\n    cin >> n;\n    // Twoj kod tutaj\n' }),
      hints: [
        'Wczytywanie: `cin >> t[i].imie >> t[i].wiek;`',
        'Zapamiętaj indeks najstarszej osoby: `int naj = 0;` i porównuj `t[i].wiek > t[naj].wiek`.',
      ],
      checks: [{ pattern: 'struct\\s+Osoba', message: 'Użyj struktury Osoba.' }],
      solution: `${H()}
struct Osoba {
    string imie;
    int wiek;
};

int main() {
    int n;
    Osoba t[30];
    cin >> n;
    for (int i = 0; i < n; i++) {
        cin >> t[i].imie >> t[i].wiek;
    }
    int naj = 0;
    for (int i = 1; i < n; i++) {
        if (t[i].wiek > t[naj].wiek) naj = i;
    }
    cout << "Najstarsza: " << t[naj].imie << " (" << t[naj].wiek << ")" << endl;
    return 0;
}
`,
      tests: [
        { input: '3\nAla 15\nOla 17\nEla 16', expected: 'Najstarsza: Ola (17)' },
        { input: '1\nJan 14', expected: 'Najstarsza: Jan (14)' },
        { input: '4\nA 10\nB 12\nC 12\nD 9', expected: 'Najstarsza: B (12)' },
      ],
    },
    {
      id: 'k13t3',
      title: 'Dodawanie ułamków',
      difficulty: 3,
      description: 'Zdefiniuj strukturę `Ulamek { int l, m; }` (licznik i mianownik) i funkcję `Ulamek dodaj(Ulamek a, Ulamek b)`, która zwraca sumę ułamków **skróconą** do najprostszej postaci. Wczytaj dwa ułamki jako 4 liczby `l1 m1 l2 m2` (mianowniki dodatnie) i wypisz wynik w formacie `l/m`.',
      expectedOutput: '5/6',
      exampleInput: '1 2 1 3',
      starter: starter({ before: 'struct Ulamek {\n    int l, m;\n};\n\nint nwd(int a, int b) {\n    if (a < 0) a = -a;\n    while (b != 0) {\n        int r = a % b;\n        a = b;\n        b = r;\n    }\n    return a;\n}', body: '    // wczytaj dwa ulamki, dodaj i wypisz wynik\n' }),
      hints: [
        'Suma: licznik `a.l * b.m + b.l * a.m`, mianownik `a.m * b.m`.',
        'Skracanie: podziel licznik i mianownik przez `nwd(licznik, mianownik)` (funkcja jest już w kodzie startowym).',
        'Zwracanie struktury: `Ulamek w; w.l = ...; w.m = ...; return w;`',
      ],
      checks: [
        { pattern: 'struct\\s+Ulamek', message: 'Użyj struktury Ulamek.' },
        { pattern: 'Ulamek\\s+dodaj\\s*\\(', message: 'Zdefiniuj funkcję Ulamek dodaj(Ulamek a, Ulamek b).' },
      ],
      solution: `${H()}
struct Ulamek {
    int l, m;
};

int nwd(int a, int b) {
    if (a < 0) a = -a;
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}

Ulamek dodaj(Ulamek a, Ulamek b) {
    Ulamek w;
    w.l = a.l * b.m + b.l * a.m;
    w.m = a.m * b.m;
    int d = nwd(w.l, w.m);
    w.l /= d;
    w.m /= d;
    return w;
}

int main() {
    Ulamek a, b;
    cin >> a.l >> a.m >> b.l >> b.m;
    Ulamek s = dodaj(a, b);
    cout << s.l << "/" << s.m << endl;
    return 0;
}
`,
      tests: [
        { input: '1 2 1 3', expected: '5/6' },
        { input: '1 4 1 4', expected: '1/2' },
        { input: '2 3 1 3', expected: '1/1' },
        { input: '3 5 -1 5', expected: '2/5' },
      ],
    },
  ],

  // ─────────────── 14. Unie ───────────────
  k14: [
    {
      id: 'k14t1',
      title: 'Najmłodszy bajt',
      difficulty: 2,
      description: 'Zdefiniuj unię `union Bajty { int liczba; char bajt; };`. Wczytaj nieujemną liczbę całkowitą, zapisz ją w polu `liczba` i odczytaj pole `bajt` – to najmłodszy bajt liczby (w komputerach x86 leży pod tym samym adresem co początek `int`). Wypisz jego wartość liczbową:',
      expectedOutput: 'Najmlodszy bajt: 44',
      exampleInput: '300',
      starter: starter({ before: 'union Bajty {\n    // pola liczba (int) i bajt (char)\n};', body: '    int n;\n    cin >> n;\n    // zapisz n do unii i odczytaj bajt\n' }),
      hints: [
        'Utwórz unię: `Bajty u; u.liczba = n;`',
        'Wartość liczbowa znaku: `(int)u.bajt`.',
        'Sprawdź: wynik powinien być równy `n % 256` (dla przykładów z zadania).',
      ],
      checks: [{ pattern: 'union\\s+Bajty', message: 'Użyj unii Bajty.' }],
      solution: `${H()}
union Bajty {
    int liczba;
    char bajt;
};

int main() {
    int n;
    cin >> n;
    Bajty u;
    u.liczba = n;
    cout << "Najmlodszy bajt: " << (int)u.bajt << endl;
    return 0;
}
`,
      tests: [
        { input: '300', expected: 'Najmlodszy bajt: 44' },
        { input: '65', expected: 'Najmlodszy bajt: 65' },
        { input: '1027', expected: 'Najmlodszy bajt: 3' },
        { input: '256', expected: 'Najmlodszy bajt: 0' },
      ],
    },
    {
      id: 'k14t2',
      title: 'Unia z etykietą',
      difficulty: 3,
      description: 'Zdefiniuj `union Dane { int liczba; char znak; };` oraz strukturę `Element { char typ; Dane d; };`, gdzie `typ` to etykieta: `L` – liczba, `Z` – znak. Wczytaj `n` (1–20), a potem `n` linii postaci `L 42` lub `Z x`, zapisz je w tablicy elementów, a następnie wypisz każdy element jako `liczba: 42` lub `znak: x`.',
      expectedOutput: 'liczba: 42\nznak: x\nliczba: -7',
      exampleInput: '3\nL 42\nZ x\nL -7',
      starter: starter({ before: 'union Dane {\n    int liczba;\n    char znak;\n};\n\nstruct Element {\n    char typ;\n    Dane d;\n};', body: '    int n;\n    Element t[20];\n    cin >> n;\n    // wczytaj elementy, a potem je wypisz\n' }),
      hints: [
        'Najpierw wczytaj etykietę: `cin >> t[i].typ;`',
        "W zależności od etykiety wczytaj `t[i].d.liczba` albo `t[i].d.znak`.",
        'Przy wypisywaniu ta sama etykieta mówi, które pole unii odczytać.',
      ],
      checks: [{ pattern: 'union\\s+Dane', message: 'Użyj unii Dane.' }],
      solution: `${H()}
union Dane {
    int liczba;
    char znak;
};

struct Element {
    char typ;
    Dane d;
};

int main() {
    int n;
    Element t[20];
    cin >> n;
    for (int i = 0; i < n; i++) {
        cin >> t[i].typ;
        if (t[i].typ == 'L') cin >> t[i].d.liczba;
        else cin >> t[i].d.znak;
    }
    for (int i = 0; i < n; i++) {
        if (t[i].typ == 'L') cout << "liczba: " << t[i].d.liczba << endl;
        else cout << "znak: " << t[i].d.znak << endl;
    }
    return 0;
}
`,
      tests: [
        { input: '3\nL 42\nZ x\nL -7', expected: 'liczba: 42\nznak: x\nliczba: -7' },
        { input: '1\nZ #', expected: 'znak: #' },
        { input: '2\nL 0\nL 100', expected: 'liczba: 0\nliczba: 100' },
      ],
    },
  ],

  // ─────────────── 15. Funkcje ───────────────
  k15: [
    {
      id: 'k15t3',
      title: 'Liczby pierwsze',
      difficulty: 2,
      description: 'Napisz funkcję `bool czyPierwsza(int n)`. Wczytaj liczbę `n` (n ≥ 2) i wypisz w jednej linii wszystkie liczby pierwsze od 2 do `n`, oddzielone spacjami.',
      expectedOutput: '2 3 5 7',
      exampleInput: '10',
      starter: starter({ before: 'bool czyPierwsza(int n) {\n    // uzupelnij\n    return false;\n}', body: '    int n;\n    cin >> n;\n    // wypisz liczby pierwsze od 2 do n\n' }),
      hints: [
        'Liczba jest pierwsza, gdy jest większa od 1 i nie dzieli się przez żadne `d` od 2 do pierwiastka z `n`.',
        'Pętla w funkcji: `for (int d = 2; d * d <= n; d++) if (n % d == 0) return false;`',
      ],
      checks: [{ pattern: 'bool\\s+czyPierwsza\\s*\\(', message: 'Zdefiniuj funkcję bool czyPierwsza(int n).' }],
      solution: `${H()}
bool czyPierwsza(int n) {
    if (n < 2) return false;
    for (int d = 2; d * d <= n; d++) {
        if (n % d == 0) return false;
    }
    return true;
}

int main() {
    int n;
    cin >> n;
    for (int i = 2; i <= n; i++) {
        if (czyPierwsza(i)) cout << i << " ";
    }
    cout << endl;
    return 0;
}
`,
      tests: [
        { input: '10', expected: '2 3 5 7' },
        { input: '2', expected: '2' },
        { input: '20', expected: '2 3 5 7 11 13 17 19' },
      ],
    },
  ],

  // ─────────────── 16. Funkcje rekurencyjne ───────────────
  k16: [
    {
      id: 'k16t1',
      title: 'Fibonacci rekurencyjnie',
      difficulty: 1,
      description: 'Napisz **rekurencyjną** funkcję `int fib(int n)` (fib(0) = 0, fib(1) = 1, fib(n) = fib(n−1) + fib(n−2)). Wczytaj `n` (0–25) i wypisz:',
      expectedOutput: 'fib(10) = 55',
      exampleInput: '10',
      starter: starter({ before: 'int fib(int n) {\n    // uzupelnij rekurencyjnie\n    return 0;\n}', body: '    int n;\n    cin >> n;\n    cout << "fib(" << n << ") = " << fib(n) << endl;\n' }),
      hints: [
        'Warunek stopu: `if (n < 2) return n;`',
        'Krok rekurencyjny: `return fib(n - 1) + fib(n - 2);`',
      ],
      checks: [{ pattern: 'return\\s+fib\\s*\\(', message: 'Funkcja fib powinna wywoływać samą siebie (rekurencja).' }],
      solution: `${H()}
int fib(int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}

int main() {
    int n;
    cin >> n;
    cout << "fib(" << n << ") = " << fib(n) << endl;
    return 0;
}
`,
      tests: [
        { input: '10', expected: 'fib(10) = 55' },
        { input: '0', expected: 'fib(0) = 0' },
        { input: '1', expected: 'fib(1) = 1' },
        { input: '20', expected: 'fib(20) = 6765' },
      ],
    },
    {
      id: 'k16t2',
      title: 'Suma cyfr rekurencyjnie',
      difficulty: 2,
      description: 'Napisz **rekurencyjną** funkcję `int sumaCyfr(int n)` bez używania pętli. Wczytaj nieujemną liczbę i wypisz sumę jej cyfr:',
      expectedOutput: 'Suma cyfr: 6',
      exampleInput: '123',
      starter: starter({ before: 'int sumaCyfr(int n) {\n    // uzupelnij rekurencyjnie\n    return 0;\n}', body: '    int n;\n    cin >> n;\n    cout << "Suma cyfr: " << sumaCyfr(n) << endl;\n' }),
      hints: [
        'Warunek stopu: liczba jednocyfrowa – `if (n < 10) return n;`',
        'Ostatnia cyfra to `n % 10`, a reszta liczby to `n / 10`.',
      ],
      checks: [
        { pattern: 'sumaCyfr\\s*\\([^)]*\\/\\s*10', message: 'Funkcja powinna wywoływać samą siebie, np. sumaCyfr(n / 10).' },
        { pattern: '^(?![\\s\\S]*\\b(for|while)\\b)', message: 'Nie używaj pętli – rozwiąż zadanie rekurencyjnie.' },
      ],
      solution: `${H()}
int sumaCyfr(int n) {
    if (n < 10) return n;
    return n % 10 + sumaCyfr(n / 10);
}

int main() {
    int n;
    cin >> n;
    cout << "Suma cyfr: " << sumaCyfr(n) << endl;
    return 0;
}
`,
      tests: [
        { input: '123', expected: 'Suma cyfr: 6' },
        { input: '0', expected: 'Suma cyfr: 0' },
        { input: '99999', expected: 'Suma cyfr: 45' },
      ],
    },
    {
      id: 'k16t3',
      title: 'Potęga rekurencyjna',
      difficulty: 2,
      description: 'Napisz **rekurencyjną** funkcję `long long potega(int a, int n)` (a⁰ = 1, aⁿ = a · aⁿ⁻¹). Wczytaj `a` i `n` (n ≥ 0) i wypisz:',
      expectedOutput: 'Wynik: 1024',
      exampleInput: '2 10',
      starter: starter({ before: 'long long potega(int a, int n) {\n    // uzupelnij rekurencyjnie\n    return 1;\n}', body: '    int a, n;\n    cin >> a >> n;\n    cout << "Wynik: " << potega(a, n) << endl;\n' }),
      hints: [
        'Warunek stopu: `if (n == 0) return 1;`',
        'Krok: `return a * potega(a, n - 1);`',
      ],
      checks: [{ pattern: 'potega\\s*\\(\\s*a\\s*,\\s*n\\s*-\\s*1\\s*\\)|potega\\s*\\([^;]*n\\s*\\/\\s*2', message: 'Funkcja powinna wywoływać samą siebie, np. potega(a, n - 1).' }],
      solution: `${H()}
long long potega(int a, int n) {
    if (n == 0) return 1;
    return a * potega(a, n - 1);
}

int main() {
    int a, n;
    cin >> a >> n;
    cout << "Wynik: " << potega(a, n) << endl;
    return 0;
}
`,
      tests: [
        { input: '2 10', expected: 'Wynik: 1024' },
        { input: '3 0', expected: 'Wynik: 1' },
        { input: '5 3', expected: 'Wynik: 125' },
      ],
    },
  ],

  // ─────────────── 17. Funkcje przeciążone ───────────────
  k17: [
    {
      id: 'k17t1',
      title: 'Pole figur',
      difficulty: 2,
      description: 'Napisz trzy **przeciążone** funkcje o nazwie `pole`:\n\n`double pole(double r)` – koło (π = 3.14159), `double pole(double a, double b)` – prostokąt, `double pole(double a, double b, double h)` – trapez.\n\nProgram wczytuje liczbę parametrów `k` (1, 2 lub 3), a potem `k` liczb, i wypisuje wynik odpowiedniej wersji funkcji:',
      expectedOutput: 'Pole: 12',
      exampleInput: '2 3 4',
      starter: starter({ body: '    int k;\n    cin >> k;\n    // wczytaj k liczb i wywolaj odpowiednia wersje funkcji pole\n' }),
      hints: [
        'Trzy funkcje mają tę samą nazwę – różnią się liczbą parametrów.',
        'Trapez: `(a + b) * h / 2`.',
        'W main: `if (k == 1) { double r; cin >> r; cout << "Pole: " << pole(r) << endl; } ...`',
      ],
      checks: [{ pattern: '(double\\s+pole\\s*\\([\\s\\S]*){3}', message: 'Zdefiniuj trzy przeciążone funkcje double pole(...).' }],
      solution: `${H()}
double pole(double r) {
    return 3.14159 * r * r;
}

double pole(double a, double b) {
    return a * b;
}

double pole(double a, double b, double h) {
    return (a + b) * h / 2;
}

int main() {
    int k;
    cin >> k;
    if (k == 1) {
        double r;
        cin >> r;
        cout << "Pole: " << pole(r) << endl;
    } else if (k == 2) {
        double a, b;
        cin >> a >> b;
        cout << "Pole: " << pole(a, b) << endl;
    } else {
        double a, b, h;
        cin >> a >> b >> h;
        cout << "Pole: " << pole(a, b, h) << endl;
    }
    return 0;
}
`,
      tests: [
        { input: '2 3 4', expected: 'Pole: 12' },
        { input: '1 2', expected: 'Pole: 12.5664' },
        { input: '3 2 4 3', expected: 'Pole: 9' },
      ],
    },
    {
      id: 'k17t2',
      title: 'Wypisz według typu',
      difficulty: 1,
      description: 'Napisz trzy **przeciążone** procedury `wypisz`: dla `int` (wypisuje `calkowita: X`), dla `double` (`rzeczywista: X`) i dla `string` (`tekst: X`). Wczytaj kolejno liczbę całkowitą, rzeczywistą i słowo, a potem wywołaj `wypisz` dla każdej wartości.',
      expectedOutput: 'calkowita: 5\nrzeczywista: 2.5\ntekst: Ala',
      exampleInput: '5 2.5 Ala',
      starter: starter({ body: '    int a;\n    double b;\n    string c;\n    cin >> a >> b >> c;\n    // wywolaj wypisz(a), wypisz(b), wypisz(c)\n' }),
      hints: [
        'Nagłówki: `void wypisz(int x)`, `void wypisz(double x)`, `void wypisz(string x)`.',
        'Kompilator sam wybierze wersję na podstawie typu argumentu.',
      ],
      checks: [{ pattern: '(void\\s+wypisz\\s*\\([\\s\\S]*){3}', message: 'Zdefiniuj trzy przeciążone procedury void wypisz(...).' }],
      solution: `${H()}
void wypisz(int x) {
    cout << "calkowita: " << x << endl;
}

void wypisz(double x) {
    cout << "rzeczywista: " << x << endl;
}

void wypisz(string x) {
    cout << "tekst: " << x << endl;
}

int main() {
    int a;
    double b;
    string c;
    cin >> a >> b >> c;
    wypisz(a);
    wypisz(b);
    wypisz(c);
    return 0;
}
`,
      tests: [
        { input: '5 2.5 Ala', expected: 'calkowita: 5\nrzeczywista: 2.5\ntekst: Ala' },
        { input: '-1 0.125 C++', expected: 'calkowita: -1\nrzeczywista: 0.125\ntekst: C++' },
      ],
    },
    {
      id: 'k17t3',
      title: 'Średnia z dwóch lub trzech',
      difficulty: 1,
      description: 'Napisz dwie przeciążone funkcje `double srednia(int a, int b)` i `double srednia(int a, int b, int c)`. Program wczytuje `k` (2 lub 3), potem `k` liczb całkowitych i wypisuje średnią:',
      expectedOutput: 'Srednia: 3.5',
      exampleInput: '2 3 4',
      starter: starter({ body: '    int k;\n    cin >> k;\n    // Twoj kod tutaj\n' }),
      hints: [
        'Uważaj na dzielenie całkowite: `(a + b) / 2.0`.',
        'W main wybierz wersję funkcji w zależności od `k`.',
      ],
      checks: [{ pattern: '(double\\s+srednia\\s*\\([\\s\\S]*){2}', message: 'Zdefiniuj dwie przeciążone funkcje double srednia(...).' }],
      solution: `${H()}
double srednia(int a, int b) {
    return (a + b) / 2.0;
}

double srednia(int a, int b, int c) {
    return (a + b + c) / 3.0;
}

int main() {
    int k;
    cin >> k;
    if (k == 2) {
        int a, b;
        cin >> a >> b;
        cout << "Srednia: " << srednia(a, b) << endl;
    } else {
        int a, b, c;
        cin >> a >> b >> c;
        cout << "Srednia: " << srednia(a, b, c) << endl;
    }
    return 0;
}
`,
      tests: [
        { input: '2 3 4', expected: 'Srednia: 3.5' },
        { input: '3 1 2 4', expected: 'Srednia: 2.33333' },
        { input: '3 3 3 3', expected: 'Srednia: 3' },
      ],
    },
  ],

  // ─────────────── 18. Funkcje inline ───────────────
  k18: [
    {
      id: 'k18t1',
      title: 'Min i max inline',
      difficulty: 1,
      description: 'Napisz funkcje **inline** `int mniejsza(int a, int b)` i `int wieksza(int a, int b)`. Wczytaj trzy liczby i za ich pomocą wypisz najmniejszą i największą:',
      expectedOutput: 'Min: 2\nMax: 9',
      exampleInput: '4 9 2',
      starter: DEFAULT_TEMPLATE,
      hints: [
        'Definicja: `inline int mniejsza(int a, int b) { return a < b ? a : b; }`',
        'Dla trzech liczb: `mniejsza(mniejsza(a, b), c)`.',
      ],
      checks: [{ pattern: 'inline\\s+int\\s+mniejsza', message: 'Zdefiniuj funkcję inline int mniejsza(int a, int b).' }],
      solution: `${H()}
inline int mniejsza(int a, int b) { return a < b ? a : b; }
inline int wieksza(int a, int b) { return a > b ? a : b; }

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    cout << "Min: " << mniejsza(mniejsza(a, b), c) << endl;
    cout << "Max: " << wieksza(wieksza(a, b), c) << endl;
    return 0;
}
`,
      tests: [
        { input: '4 9 2', expected: 'Min: 2\nMax: 9' },
        { input: '1 1 1', expected: 'Min: 1\nMax: 1' },
        { input: '-3 7 0', expected: 'Min: -3\nMax: 7' },
      ],
    },
    {
      id: 'k18t2',
      title: 'Tabela potęg',
      difficulty: 1,
      description: 'Napisz funkcje **inline** `kwadrat` i `szescian`. Wczytaj `n` (1–20) i dla każdego `i` od 1 do `n` wypisz linię: `i i² i³` (liczby oddzielone spacjami).',
      expectedOutput: '1 1 1\n2 4 8\n3 9 27',
      exampleInput: '3',
      starter: DEFAULT_TEMPLATE,
      hints: [
        '`inline int kwadrat(int x) { return x * x; }`',
        'Sześcian możesz zapisać przez kwadrat: `return x * kwadrat(x);`',
      ],
      checks: [{ pattern: 'inline\\s+\\w+\\s+kwadrat', message: 'Zdefiniuj funkcję inline kwadrat.' }],
      solution: `${H()}
inline int kwadrat(int x) { return x * x; }
inline int szescian(int x) { return x * kwadrat(x); }

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        cout << i << " " << kwadrat(i) << " " << szescian(i) << endl;
    }
    return 0;
}
`,
      tests: [
        { input: '3', expected: '1 1 1\n2 4 8\n3 9 27' },
        { input: '1', expected: '1 1 1' },
        { input: '5', expected: '1 1 1\n2 4 8\n3 9 27\n4 16 64\n5 25 125' },
      ],
    },
    {
      id: 'k18t3',
      title: 'Czy w przedziale?',
      difficulty: 2,
      description: 'Napisz funkcję **inline** `bool wPrzedziale(int x, int a, int b)`, która sprawdza, czy `a ≤ x ≤ b`. Wczytaj granice `a` i `b`, potem `n` i `n` liczb. Wypisz, ile z nich należy do przedziału:',
      expectedOutput: 'W przedziale: 3',
      exampleInput: '1 10\n5\n0 1 5 10 11',
      starter: DEFAULT_TEMPLATE,
      hints: [
        '`inline bool wPrzedziale(int x, int a, int b) { return x >= a && x <= b; }`',
        'Liczniki zwiększaj w pętli: `if (wPrzedziale(x, a, b)) ile++;`',
      ],
      checks: [{ pattern: 'inline\\s+bool\\s+wPrzedziale', message: 'Zdefiniuj funkcję inline bool wPrzedziale(int x, int a, int b).' }],
      solution: `${H()}
inline bool wPrzedziale(int x, int a, int b) {
    return x >= a && x <= b;
}

int main() {
    int a, b, n;
    cin >> a >> b >> n;
    int ile = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        if (wPrzedziale(x, a, b)) ile++;
    }
    cout << "W przedziale: " << ile << endl;
    return 0;
}
`,
      tests: [
        { input: '1 10\n5\n0 1 5 10 11', expected: 'W przedziale: 3' },
        { input: '-5 5\n3\n-6 6 7', expected: 'W przedziale: 0' },
        { input: '0 0\n2\n0 0', expected: 'W przedziale: 2' },
      ],
    },
  ],

  // ─────────────── 19. Funkcje matematyczne ───────────────
  k19: [
    {
      id: 'k19t1',
      title: 'Przeciwprostokątna',
      difficulty: 1,
      description: 'Wczytaj długości przyprostokątnych `a` i `b` trójkąta prostokątnego. Oblicz przeciwprostokątną (twierdzenie Pitagorasa) i wypisz ją z dokładnością do 2 miejsc po przecinku:',
      expectedOutput: 'c = 5.00',
      exampleInput: '3 4',
      starter: starter({ includes: ['cmath', 'iomanip'] }),
      hints: [
        '`c = sqrt(a * a + b * b)` – albo krócej `hypot(a, b)`.',
        'Formatowanie: `cout << fixed << setprecision(2) << c;`',
      ],
      checks: [{ pattern: 'sqrt\\s*\\(|hypot\\s*\\(', message: 'Użyj funkcji sqrt lub hypot z biblioteki cmath.' }],
      solution: `${H(['cmath', 'iomanip'])}
int main() {
    double a, b;
    cin >> a >> b;
    double c = sqrt(a * a + b * b);
    cout << fixed << setprecision(2) << "c = " << c << endl;
    return 0;
}
`,
      tests: [
        { input: '3 4', expected: 'c = 5.00' },
        { input: '1 1', expected: 'c = 1.41' },
        { input: '5 12', expected: 'c = 13.00' },
      ],
    },
    {
      id: 'k19t2',
      title: 'Równanie kwadratowe',
      difficulty: 3,
      description: 'Wczytaj współczynniki `a b c` równania `ax² + bx + c = 0` (a > 0). Wypisz z dokładnością do 2 miejsc po przecinku:\n\n• dla Δ > 0: `x1 = ...` i `x2 = ...` (x1 mniejszy),\n• dla Δ = 0: `x = ...`,\n• dla Δ < 0: `Brak rozwiazan`.',
      expectedOutput: 'x1 = 1.00\nx2 = 2.00',
      exampleInput: '1 -3 2',
      starter: starter({ includes: ['cmath', 'iomanip'] }),
      hints: [
        '`double delta = b * b - 4 * a * c;`',
        'Pierwiastki: `(-b - sqrt(delta)) / (2 * a)` oraz `(-b + sqrt(delta)) / (2 * a)`.',
        'Na początku ustaw formatowanie: `cout << fixed << setprecision(2);`',
      ],
      checks: [{ pattern: 'sqrt\\s*\\(', message: 'Użyj funkcji sqrt.' }],
      solution: `${H(['cmath', 'iomanip'])}
int main() {
    double a, b, c;
    cin >> a >> b >> c;
    double delta = b * b - 4 * a * c;
    cout << fixed << setprecision(2);
    if (delta > 0) {
        cout << "x1 = " << (-b - sqrt(delta)) / (2 * a) << endl;
        cout << "x2 = " << (-b + sqrt(delta)) / (2 * a) << endl;
    } else if (delta == 0) {
        cout << "x = " << -b / (2 * a) << endl;
    } else {
        cout << "Brak rozwiazan" << endl;
    }
    return 0;
}
`,
      tests: [
        { input: '1 -3 2', expected: 'x1 = 1.00\nx2 = 2.00' },
        { input: '1 2 1', expected: 'x = -1.00' },
        { input: '1 0 1', expected: 'Brak rozwiazan' },
        { input: '2 -4 -6', expected: 'x1 = -1.00\nx2 = 3.00' },
      ],
    },
    {
      id: 'k19t3',
      title: 'Trzy zaokrąglenia',
      difficulty: 1,
      description: 'Wczytaj liczbę rzeczywistą `x` i wypisz wyniki funkcji `floor`, `ceil` i `round`:',
      expectedOutput: 'floor: 2\nceil: 3\nround: 3',
      exampleInput: '2.5',
      starter: starter({ includes: ['cmath'] }),
      hints: [
        '`floor` – w dół, `ceil` – w górę, `round` – do najbliższej (połówki „od zera”).',
        'Zwróć uwagę na liczby ujemne: `floor(-2.5)` to -3!',
      ],
      checks: [{ pattern: 'floor\\s*\\([\\s\\S]*ceil\\s*\\([\\s\\S]*round\\s*\\(', message: 'Użyj funkcji floor, ceil i round.' }],
      solution: `${H(['cmath'])}
int main() {
    double x;
    cin >> x;
    cout << "floor: " << floor(x) << endl;
    cout << "ceil: " << ceil(x) << endl;
    cout << "round: " << round(x) << endl;
    return 0;
}
`,
      tests: [
        { input: '2.5', expected: 'floor: 2\nceil: 3\nround: 3' },
        { input: '-2.5', expected: 'floor: -3\nceil: -2\nround: -3' },
        { input: '4', expected: 'floor: 4\nceil: 4\nround: 4' },
        { input: '2.4', expected: 'floor: 2\nceil: 3\nround: 2' },
      ],
    },
  ],

  // ─────────────── 20. Funkcje znakowe ───────────────
  k20: [
    {
      id: 'k20t1',
      title: 'Statystyka znaków',
      difficulty: 1,
      description: 'Wczytaj całą linię tekstu i policz litery, cyfry i spacje (użyj `isalpha`, `isdigit`, `isspace`). Wypisz:',
      expectedOutput: 'Litery: 9\nCyfry: 1\nSpacje: 3',
      exampleInput: 'Ala ma 2 koty',
      starter: starter({ includes: ['cctype'], body: '    string tekst;\n    getline(cin, tekst);\n    // policz litery, cyfry i spacje\n' }),
      hints: [
        'Przejdź po napisie: `for (char c : tekst)`.',
        '`if (isalpha(c)) litery++;` itd.',
      ],
      checks: [{ pattern: 'isalpha\\s*\\(', message: 'Użyj funkcji isalpha.' }],
      solution: `${H(['cctype'])}
int main() {
    string tekst;
    getline(cin, tekst);
    int litery = 0, cyfry = 0, spacje = 0;
    for (char c : tekst) {
        if (isalpha(c)) litery++;
        else if (isdigit(c)) cyfry++;
        else if (isspace(c)) spacje++;
    }
    cout << "Litery: " << litery << endl;
    cout << "Cyfry: " << cyfry << endl;
    cout << "Spacje: " << spacje << endl;
    return 0;
}
`,
      tests: [
        { input: 'Ala ma 2 koty', expected: 'Litery: 9\nCyfry: 1\nSpacje: 3' },
        { input: 'C++ 2024!', expected: 'Litery: 1\nCyfry: 4\nSpacje: 1' },
        { input: 'abc', expected: 'Litery: 3\nCyfry: 0\nSpacje: 0' },
      ],
    },
    {
      id: 'k20t2',
      title: 'Szyfr Cezara',
      difficulty: 3,
      description: 'Wczytaj przesunięcie `k` (0–25), a w następnej linii tekst. Zaszyfruj tekst szyfrem Cezara: każdą literę przesuń o `k` miejsc w alfabecie (po `z` wracamy do `a`), zachowując wielkość liter. Inne znaki zostaw bez zmian.',
      expectedOutput: 'Dod pd nrwd',
      exampleInput: '3\nAla ma kota',
      starter: starter({ includes: ['cctype'], body: '    int k;\n    string tekst;\n    cin >> k;\n    cin.ignore();\n    getline(cin, tekst);\n    // zaszyfruj tekst\n' }),
      hints: [
        "Dla małej litery: `c = 'a' + (c - 'a' + k) % 26;`",
        "Dla wielkiej litery analogicznie z `'A'`. Sprawdzaj `islower(c)` / `isupper(c)`.",
        'Zmieniaj znaki napisu przez referencję: `for (char &c : tekst)`.',
      ],
      checks: [{ pattern: '%\\s*26', message: 'Zawijanie alfabetu zrób przez resztę z dzielenia % 26.' }],
      solution: `${H(['cctype'])}
int main() {
    int k;
    string tekst;
    cin >> k;
    cin.ignore();
    getline(cin, tekst);
    for (char &c : tekst) {
        if (islower(c)) c = 'a' + (c - 'a' + k) % 26;
        else if (isupper(c)) c = 'A' + (c - 'A' + k) % 26;
    }
    cout << tekst << endl;
    return 0;
}
`,
      tests: [
        { input: '3\nAla ma kota', expected: 'Dod pd nrwd' },
        { input: '1\nxyz XYZ!', expected: 'yza YZA!' },
        { input: '0\nBez zmian', expected: 'Bez zmian' },
      ],
    },
    {
      id: 'k20t3',
      title: 'Wielkie pierwsze litery',
      difficulty: 2,
      description: 'Wczytaj linię tekstu. Zamień pierwszą literę każdego słowa na wielką, a pozostałe litery na małe. Słowa oddzielone są spacjami.',
      expectedOutput: 'Ala Ma Kota',
      exampleInput: 'ala MA kota',
      starter: starter({ includes: ['cctype'], body: '    string tekst;\n    getline(cin, tekst);\n    // Twoj kod tutaj\n' }),
      hints: [
        'Znak jest początkiem słowa, gdy stoi na pozycji 0 albo poprzedni znak to spacja.',
        "`if (i == 0 || tekst[i - 1] == ' ') tekst[i] = toupper(tekst[i]); else tekst[i] = tolower(tekst[i]);`",
      ],
      checks: [{ pattern: 'toupper\\s*\\(', message: 'Użyj funkcji toupper.' }],
      solution: `${H(['cctype'])}
int main() {
    string tekst;
    getline(cin, tekst);
    for (int i = 0; i < tekst.length(); i++) {
        if (i == 0 || tekst[i - 1] == ' ') tekst[i] = toupper(tekst[i]);
        else tekst[i] = tolower(tekst[i]);
    }
    cout << tekst << endl;
    return 0;
}
`,
      tests: [
        { input: 'ala MA kota', expected: 'Ala Ma Kota' },
        { input: 'c++ jest SUPER', expected: 'C++ Jest Super' },
        { input: 'x', expected: 'X' },
      ],
    },
  ],

  // ─────────────── 21. Konwersja typu danych ───────────────
  k21: [
    {
      id: 'k21t1',
      title: 'Średnia bez pułapki',
      difficulty: 1,
      description: 'Wczytaj `n` i `n` liczb całkowitych. Oblicz ich średnią, używając **jawnej konwersji** (`static_cast<double>` lub `(double)`), tak aby nie stracić części ułamkowej. Wypisz:',
      expectedOutput: 'Srednia: 2.5',
      exampleInput: '4\n1 2 3 4',
      starter: starter({ body: '    int n;\n    cin >> n;\n    int suma = 0;\n    for (int i = 0; i < n; i++) {\n        int x;\n        cin >> x;\n        suma += x;\n    }\n    // oblicz srednia z jawna konwersja\n' }),
      hints: [
        'Samo `suma / n` to dzielenie całkowite!',
        '`double sr = static_cast<double>(suma) / n;`',
      ],
      checks: [{ pattern: 'static_cast\\s*<\\s*double\\s*>|\\(\\s*double\\s*\\)', message: 'Użyj jawnej konwersji: static_cast<double>(...) lub (double).' }],
      solution: `${H()}
int main() {
    int n;
    cin >> n;
    int suma = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        suma += x;
    }
    double sr = static_cast<double>(suma) / n;
    cout << "Srednia: " << sr << endl;
    return 0;
}
`,
      tests: [
        { input: '4\n1 2 3 4', expected: 'Srednia: 2.5' },
        { input: '3\n1 2 2', expected: 'Srednia: 1.66667' },
        { input: '2\n5 5', expected: 'Srednia: 5' },
      ],
    },
    {
      id: 'k21t2',
      title: 'Suma cyfr bardzo długiej liczby',
      difficulty: 2,
      description: "Wczytaj liczbę jako **napis** (może mieć nawet 50 cyfr – nie zmieści się w żadnym typie liczbowym!). Zamieniając każdy znak-cyfrę na liczbę (`c - '0'`), oblicz sumę cyfr:",
      expectedOutput: 'Suma cyfr: 90',
      exampleInput: '12345678901234567890',
      starter: starter({ body: '    string liczba;\n    cin >> liczba;\n    // policz sume cyfr\n' }),
      hints: [
        "Znak `'7'` ma kod 55, a `'0'` – 48, więc `'7' - '0'` daje 7.",
        "`for (char c : liczba) suma += c - '0';`",
      ],
      checks: [{ pattern: "-\\s*'0'", message: "Zamień znak na cyfrę wyrażeniem c - '0'." }],
      solution: `${H()}
int main() {
    string liczba;
    cin >> liczba;
    int suma = 0;
    for (char c : liczba) {
        suma += c - '0';
    }
    cout << "Suma cyfr: " << suma << endl;
    return 0;
}
`,
      tests: [
        { input: '12345678901234567890', expected: 'Suma cyfr: 90' },
        { input: '7', expected: 'Suma cyfr: 7' },
        { input: '1000', expected: 'Suma cyfr: 1' },
      ],
    },
    {
      id: 'k21t3',
      title: 'Liczby zapisane jako tekst',
      difficulty: 2,
      description: 'Wczytaj dwa słowa zawierające liczby całkowite (do zmiennych typu `string`). Wypisz ich **sumę liczbową** (użyj `stoi`) oraz wynik **sklejenia napisów**:',
      expectedOutput: 'Suma: 30\nSklejone: 1020',
      exampleInput: '10 20',
      starter: starter({ body: '    string a, b;\n    cin >> a >> b;\n    // Twoj kod tutaj\n' }),
      hints: [
        'Zamiana na liczbę: `stoi(a)`.',
        'Sklejanie napisów to zwykłe `a + b`.',
      ],
      checks: [{ pattern: 'stoi\\s*\\(', message: 'Użyj funkcji stoi.' }],
      solution: `${H()}
int main() {
    string a, b;
    cin >> a >> b;
    cout << "Suma: " << stoi(a) + stoi(b) << endl;
    cout << "Sklejone: " << a + b << endl;
    return 0;
}
`,
      tests: [
        { input: '10 20', expected: 'Suma: 30\nSklejone: 1020' },
        { input: '7 -3', expected: 'Suma: 4\nSklejone: 7-3' },
        { input: '0 5', expected: 'Suma: 5\nSklejone: 05' },
      ],
    },
  ],

  // ─────────────── 22. Funkcje we/wy ───────────────
  k22: [
    {
      id: 'k22t1',
      title: 'Paragon',
      difficulty: 1,
      description: 'Wczytaj cenę produktu (liczba rzeczywista) i liczbę sztuk. Wypisz kwotę do zapłaty **zawsze z dwoma miejscami po przecinku** (`fixed` i `setprecision`):',
      expectedOutput: 'Do zaplaty: 12.50 zl',
      exampleInput: '2.5 5',
      starter: starter({ includes: ['iomanip'] }),
      hints: [
        '`cout << fixed << setprecision(2) << kwota;`',
        'Pamiętaj o `#include <iomanip>` (jest już w kodzie startowym).',
      ],
      checks: [{ pattern: 'setprecision\\s*\\(', message: 'Użyj manipulatora setprecision.' }],
      solution: `${H(['iomanip'])}
int main() {
    double cena;
    int ilosc;
    cin >> cena >> ilosc;
    cout << fixed << setprecision(2);
    cout << "Do zaplaty: " << cena * ilosc << " zl" << endl;
    return 0;
}
`,
      tests: [
        { input: '2.5 5', expected: 'Do zaplaty: 12.50 zl' },
        { input: '0.99 3', expected: 'Do zaplaty: 2.97 zl' },
        { input: '10 1', expected: 'Do zaplaty: 10.00 zl' },
      ],
    },
    {
      id: 'k22t2',
      title: 'Wypisywanie przez printf',
      difficulty: 1,
      description: 'Wczytaj liczbę całkowitą `a` i rzeczywistą `b`, a następnie wypisz je **funkcją printf** – `b` z trzema miejscami po przecinku:',
      expectedOutput: 'a = 7, b = 3.142',
      exampleInput: '7 3.14159',
      starter: starter({ includes: ['cstdio'], body: '    int a;\n    double b;\n    cin >> a >> b;\n    // wypisz printf-em\n' }),
      hints: [
        'Znacznik dla int to `%d`, dla double z 3 miejscami – `%.3f`.',
        '`printf("a = %d, b = %.3f\\n", a, b);`',
      ],
      checks: [{ pattern: 'printf\\s*\\(', message: 'Wypisz wynik funkcją printf.' }],
      solution: `${H(['cstdio'])}
int main() {
    int a;
    double b;
    cin >> a >> b;
    printf("a = %d, b = %.3f\\n", a, b);
    return 0;
}
`,
      tests: [
        { input: '7 3.14159', expected: 'a = 7, b = 3.142' },
        { input: '-2 0.5', expected: 'a = -2, b = 0.500' },
      ],
    },
    {
      id: 'k22t3',
      title: 'scanf i printf',
      difficulty: 2,
      description: 'Wczytaj dwie liczby całkowite **funkcją scanf** i wypisz **funkcją printf** ich sumę oraz iloraz rzeczywisty (2 miejsca po przecinku):',
      expectedOutput: 'Suma: 9\nIloraz: 3.50',
      exampleInput: '7 2',
      starter: starter({ includes: ['cstdio'], body: '    int a, b;\n    // wczytaj scanf-em, wypisz printf-em\n' }),
      hints: [
        'Pamiętaj o adresach: `scanf("%d %d", &a, &b);`',
        'Iloraz rzeczywisty: `(double)a / b` i znacznik `%.2f`.',
      ],
      checks: [
        { pattern: 'scanf\\s*\\(', message: 'Wczytaj dane funkcją scanf.' },
        { pattern: 'printf\\s*\\(', message: 'Wypisz wynik funkcją printf.' },
      ],
      solution: `${H(['cstdio'])}
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("Suma: %d\\n", a + b);
    printf("Iloraz: %.2f\\n", (double)a / b);
    return 0;
}
`,
      tests: [
        { input: '7 2', expected: 'Suma: 9\nIloraz: 3.50' },
        { input: '10 4', expected: 'Suma: 14\nIloraz: 2.50' },
        { input: '1 3', expected: 'Suma: 4\nIloraz: 0.33' },
      ],
    },
    {
      id: 'k22t4',
      title: 'Systemy liczbowe',
      difficulty: 1,
      description: 'Wczytaj nieujemną liczbę całkowitą i wypisz ją w systemie dziesiętnym, szesnastkowym i ósemkowym, używając manipulatorów `dec`, `hex` i `oct`:',
      expectedOutput: 'dec: 255\nhex: ff\noct: 377',
      exampleInput: '255',
      starter: DEFAULT_TEMPLATE,
      hints: [
        '`cout << "hex: " << hex << n << endl;`',
        'Manipulatory działają „na stałe” – przed kolejnym wypisaniem przełącz system.',
      ],
      checks: [{ pattern: '\\bhex\\b', message: 'Użyj manipulatora hex.' }],
      solution: `${H()}
int main() {
    int n;
    cin >> n;
    cout << "dec: " << dec << n << endl;
    cout << "hex: " << hex << n << endl;
    cout << "oct: " << oct << n << endl;
    return 0;
}
`,
      tests: [
        { input: '255', expected: 'dec: 255\nhex: ff\noct: 377' },
        { input: '8', expected: 'dec: 8\nhex: 8\noct: 10' },
        { input: '100', expected: 'dec: 100\nhex: 64\noct: 144' },
      ],
    },
  ],

  // ─────────────── 23. Klasy abstrakcyjne a interfejsy ───────────────
  k23: [
    {
      id: 'k23t1',
      title: 'Zwierzęta (polimorfizm)',
      difficulty: 2,
      description: 'Klasa abstrakcyjna `Zwierze` ma czysto wirtualne metody `nazwa()` i `dzwiek()`. Utwórz klasy `Pies` (`Pies`, `Hau!`), `Kot` (`Kot`, `Miau!`) i `Krowa` (`Krowa`, `Muu!`). Wczytaj `n` (1–20) i `n` słów (`pies`, `kot` lub `krowa`), utwórz odpowiednie obiekty przez `new` w tablicy `Zwierze*`, a potem dla każdego wypisz:',
      expectedOutput: 'Pies mowi: Hau!\nKot mowi: Miau!\nKrowa mowi: Muu!',
      exampleInput: '3\npies kot krowa',
      starter: starter({
        before: `class Zwierze {
public:
    virtual string nazwa() const = 0;
    virtual string dzwiek() const = 0;
    virtual ~Zwierze() {}
};

// klasy Pies, Kot i Krowa`,
        body: '    int n;\n    cin >> n;\n    Zwierze *t[20];\n    // Twoj kod tutaj\n',
      }),
      hints: [
        'Klasa pochodna: `class Pies : public Zwierze { public: string nazwa() const override { return "Pies"; } ... };`',
        'Tworzenie: `if (s == "pies") t[i] = new Pies();`',
        'Wypisywanie: `t[i]->nazwa()` – dzięki `virtual` wywoła się wersja z właściwej klasy. Na końcu `delete t[i];`.',
      ],
      checks: [
        { pattern: 'class\\s+Pies\\s*:\\s*public\\s+Zwierze', message: 'Klasa Pies powinna dziedziczyć po Zwierze.' },
        { pattern: '->\\s*dzwiek\\s*\\(', message: 'Wywołuj metody przez wskaźnik na klasę bazową: t[i]->dzwiek().' },
      ],
      solution: `${H()}
class Zwierze {
public:
    virtual string nazwa() const = 0;
    virtual string dzwiek() const = 0;
    virtual ~Zwierze() {}
};

class Pies : public Zwierze {
public:
    string nazwa() const override { return "Pies"; }
    string dzwiek() const override { return "Hau!"; }
};

class Kot : public Zwierze {
public:
    string nazwa() const override { return "Kot"; }
    string dzwiek() const override { return "Miau!"; }
};

class Krowa : public Zwierze {
public:
    string nazwa() const override { return "Krowa"; }
    string dzwiek() const override { return "Muu!"; }
};

int main() {
    int n;
    cin >> n;
    Zwierze *t[20];
    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;
        if (s == "pies") t[i] = new Pies();
        else if (s == "kot") t[i] = new Kot();
        else t[i] = new Krowa();
    }
    for (int i = 0; i < n; i++) {
        cout << t[i]->nazwa() << " mowi: " << t[i]->dzwiek() << endl;
    }
    for (int i = 0; i < n; i++) delete t[i];
    return 0;
}
`,
      tests: [
        { input: '3\npies kot krowa', expected: 'Pies mowi: Hau!\nKot mowi: Miau!\nKrowa mowi: Muu!' },
        { input: '2\nkrowa krowa', expected: 'Krowa mowi: Muu!\nKrowa mowi: Muu!' },
        { input: '1\nkot', expected: 'Kot mowi: Miau!' },
      ],
    },
    {
      id: 'k23t2',
      title: 'Interfejs Figura',
      difficulty: 3,
      description: 'Interfejs `Figura` ma tylko metodę `virtual double pole() const = 0;` i wirtualny destruktor. Zaimplementuj klasy `Kwadrat(a)`, `Prostokat(a, b)` i `Kolo(r)` (π = 3.14). Wczytaj `n`, a potem `n` linii: `K a`, `P a b` lub `O r`. Przechowuj figury w `vector<Figura*>` i wypisz sumę ich pól:',
      expectedOutput: 'Suma pol: 10',
      exampleInput: '2\nK 2\nP 2 3',
      starter: starter({
        includes: ['vector'],
        before: `class Figura {
public:
    virtual double pole() const = 0;
    virtual ~Figura() {}
};

// klasy Kwadrat, Prostokat i Kolo`,
        body: '    int n;\n    cin >> n;\n    vector<Figura*> figury;\n    // Twoj kod tutaj\n',
      }),
      hints: [
        'Klasa z polem i konstruktorem: `class Kwadrat : public Figura { double a; public: Kwadrat(double a) : a(a) {} double pole() const override { return a * a; } };`',
        'Dodawanie: `figury.push_back(new Kwadrat(a));`',
        'Suma: `for (Figura *f : figury) suma += f->pole();` – i nie zapomnij o `delete`.',
      ],
      checks: [
        { pattern: 'class\\s+Kolo\\s*:\\s*public\\s+Figura', message: 'Klasa Kolo powinna implementować interfejs Figura.' },
        { pattern: 'vector\\s*<\\s*Figura\\s*\\*\\s*>', message: 'Przechowuj figury w vector<Figura*>.' },
      ],
      solution: `${H(['vector'])}
class Figura {
public:
    virtual double pole() const = 0;
    virtual ~Figura() {}
};

class Kwadrat : public Figura {
    double a;
public:
    Kwadrat(double a) : a(a) {}
    double pole() const override { return a * a; }
};

class Prostokat : public Figura {
    double a, b;
public:
    Prostokat(double a, double b) : a(a), b(b) {}
    double pole() const override { return a * b; }
};

class Kolo : public Figura {
    double r;
public:
    Kolo(double r) : r(r) {}
    double pole() const override { return 3.14 * r * r; }
};

int main() {
    int n;
    cin >> n;
    vector<Figura*> figury;
    for (int i = 0; i < n; i++) {
        char typ;
        cin >> typ;
        if (typ == 'K') {
            double a;
            cin >> a;
            figury.push_back(new Kwadrat(a));
        } else if (typ == 'P') {
            double a, b;
            cin >> a >> b;
            figury.push_back(new Prostokat(a, b));
        } else {
            double r;
            cin >> r;
            figury.push_back(new Kolo(r));
        }
    }
    double suma = 0;
    for (Figura *f : figury) suma += f->pole();
    cout << "Suma pol: " << suma << endl;
    for (Figura *f : figury) delete f;
    return 0;
}
`,
      tests: [
        { input: '2\nK 2\nP 2 3', expected: 'Suma pol: 10' },
        { input: '1\nO 1', expected: 'Suma pol: 3.14' },
        { input: '3\nK 1\nK 1\nO 2', expected: 'Suma pol: 14.56' },
      ],
    },
  ],
};
