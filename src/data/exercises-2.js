// Dodatkowe ćwiczenia C++ (część 2). Klucz = id tematu.
// Każdy kod startowy i każde rozwiązanie zawiera `using namespace std;`.
import { DEFAULT_TEMPLATE, starter } from './template.js';

const H = (extra = []) => ['iostream', 'string', ...extra].map((i) => `#include <${i}>`).join('\n') + '\nusing namespace std;\n';

// uzupełnia przykładowe wejście/wyjście na podstawie pierwszego testu
const mk = (t) => ({
  starter: DEFAULT_TEMPLATE,
  exampleInput: t.tests[0].input === '' ? undefined : t.tests[0].input,
  expectedOutput: t.tests[0].expected,
  ...t,
});

export const EXERCISES_2 = {
  k01: [
    mk({
      id: 'k01t4', title: 'Przelicznik czasu', difficulty: 1,
      description: 'Wczytaj liczbę sekund i zamień ją na godziny, minuty i sekundy. Użyj dzielenia całkowitego `/` i reszty `%`.',
      hints: ['Godziny: `s / 3600`, minuty: `s % 3600 / 60`, sekundy: `s % 60`.'],
      solution: `${H()}
int main() {
    int s;
    cin >> s;
    int h = s / 3600;
    int m = s % 3600 / 60;
    int sek = s % 60;
    cout << s << " s = " << h << " h " << m << " min " << sek << " s" << endl;
    return 0;
}
`,
      tests: [
        { input: '3725', expected: '3725 s = 1 h 2 min 5 s' },
        { input: '59', expected: '59 s = 0 h 0 min 59 s' },
        { input: '7200', expected: '7200 s = 2 h 0 min 0 s' },
      ],
    }),
  ],

  k02: [
    mk({
      id: 'k02t4', title: 'Rok przestępny', difficulty: 2,
      description: 'Rok jest przestępny, gdy dzieli się przez 4 i nie dzieli się przez 100, albo gdy dzieli się przez 400. Wczytaj rok i wypisz `Rok przestepny` albo `Rok zwykly`.',
      hints: ['Warunek: `(r % 4 == 0 && r % 100 != 0) || r % 400 == 0`.'],
      checks: [{ pattern: '%\\s*400', message: 'Uwzględnij regułę podzielności przez 400.' }],
      solution: `${H()}
int main() {
    int r;
    cin >> r;
    if ((r % 4 == 0 && r % 100 != 0) || r % 400 == 0) {
        cout << "Rok przestepny" << endl;
    } else {
        cout << "Rok zwykly" << endl;
    }
    return 0;
}
`,
      tests: [
        { input: '2024', expected: 'Rok przestepny' },
        { input: '1900', expected: 'Rok zwykly' },
        { input: '2000', expected: 'Rok przestepny' },
        { input: '2023', expected: 'Rok zwykly' },
      ],
    }),
  ],

  k03: [
    mk({
      id: 'k03t4', title: 'Potęga dwójki', difficulty: 2,
      description: 'Wczytaj liczbę dodatnią `n` i za pomocą pętli `while` znajdź najmniejszą potęgę dwójki, która jest większa lub równa `n`.',
      hints: ['Zacznij od `p = 1` i podwajaj, dopóki `p < n`.'],
      checks: [{ pattern: '\\bwhile\\s*\\(', message: 'Użyj pętli while.' }],
      solution: `${H()}
int main() {
    int n;
    cin >> n;
    int p = 1;
    while (p < n) {
        p *= 2;
    }
    cout << "Najmniejsza potega 2 >= " << n << ": " << p << endl;
    return 0;
}
`,
      tests: [
        { input: '100', expected: 'Najmniejsza potega 2 >= 100: 128' },
        { input: '1', expected: 'Najmniejsza potega 2 >= 1: 1' },
        { input: '64', expected: 'Najmniejsza potega 2 >= 64: 64' },
      ],
    }),
  ],

  k04: [
    mk({
      id: 'k04t4', title: 'Kompas', difficulty: 2,
      description: 'Robot stoi zwrócony na północ. Wczytaj liczbę poleceń `n`, a potem `n` znaków: `P` (obrót w prawo) lub `L` (obrót w lewo). Kierunki zapisz w `enum Kierunek { POLNOC, WSCHOD, POLUDNIE, ZACHOD };` i wypisz kierunek końcowy: `Polnoc`, `Wschod`, `Poludnie` albo `Zachod`.',
      starter: starter({ before: 'enum Kierunek { POLNOC, WSCHOD, POLUDNIE, ZACHOD };' }),
      hints: ['Obrót w prawo: `k = static_cast<Kierunek>((k + 1) % 4);`', 'Obrót w lewo to trzy obroty w prawo: `+ 3`.', 'Nazwę wypisz instrukcją `switch (k)`.'],
      checks: [{ pattern: 'static_cast\\s*<\\s*Kierunek\\s*>|\\(\\s*Kierunek\\s*\\)', message: 'Zamień liczbę na Kierunek przez rzutowanie.' }],
      solution: `${H()}
enum Kierunek { POLNOC, WSCHOD, POLUDNIE, ZACHOD };

int main() {
    int n;
    cin >> n;
    Kierunek k = POLNOC;
    for (int i = 0; i < n; i++) {
        char c;
        cin >> c;
        if (c == 'P') k = static_cast<Kierunek>((k + 1) % 4);
        else if (c == 'L') k = static_cast<Kierunek>((k + 3) % 4);
    }
    switch (k) {
        case POLNOC: cout << "Kierunek: Polnoc" << endl; break;
        case WSCHOD: cout << "Kierunek: Wschod" << endl; break;
        case POLUDNIE: cout << "Kierunek: Poludnie" << endl; break;
        case ZACHOD: cout << "Kierunek: Zachod" << endl; break;
    }
    return 0;
}
`,
      tests: [
        { input: '3\nP P L', expected: 'Kierunek: Wschod' },
        { input: '1\nL', expected: 'Kierunek: Zachod' },
        { input: '4\nP P P P', expected: 'Kierunek: Polnoc' },
        { input: '5\nL L L P P', expected: 'Kierunek: Zachod' },
      ],
    }),
  ],

  k05: [
    mk({
      id: 'k05t4', title: 'Min i max przez wskaźniki', difficulty: 2,
      description: 'Napisz funkcję `void minMax(int t[], int n, int* mn, int* mx)`, która zapisuje najmniejszy i największy element tablicy pod adresy `mn` i `mx`. Wczytaj `n` (1–100) i `n` liczb, wywołaj funkcję i wypisz wynik.',
      starter: starter({ before: 'void minMax(int t[], int n, int* mn, int* mx) {\n    // uzupelnij\n}' }),
      hints: ['Zapis pod adres: `*mn = t[0];`', 'Wywołanie: `minMax(t, n, &a, &b);`'],
      checks: [{ pattern: '\\*\\s*mn\\s*=', message: 'Zapisz wynik pod adres wskaźnika: *mn = ...' }, { pattern: '&\\s*\\w+\\s*,\\s*&', message: 'Przekaż adresy zmiennych operatorem &.' }],
      solution: `${H()}
void minMax(int t[], int n, int* mn, int* mx) {
    *mn = t[0];
    *mx = t[0];
    for (int i = 1; i < n; i++) {
        if (t[i] < *mn) *mn = t[i];
        if (t[i] > *mx) *mx = t[i];
    }
}

int main() {
    int n;
    int t[100];
    cin >> n;
    for (int i = 0; i < n; i++) cin >> t[i];
    int a, b;
    minMax(t, n, &a, &b);
    cout << "Min: " << a << endl;
    cout << "Max: " << b << endl;
    return 0;
}
`,
      tests: [
        { input: '5\n4 1 9 -3 7', expected: 'Min: -3\nMax: 9' },
        { input: '1\n6', expected: 'Min: 6\nMax: 6' },
      ],
    }),
  ],

  k06: [
    mk({
      id: 'k06t4', title: 'Liczniki na stercie', difficulty: 2,
      description: 'Utwórz dwie zmienne dynamiczne: `int* suma = new int(0);` i `int* ile = new int(0);`. Wczytuj liczby aż do 0, zwiększając wartości wskazywane przez wskaźniki. Wypisz liczbę i sumę wczytanych liczb, a na końcu zwolnij pamięć (`delete`).',
      hints: ['Zmiana wartości na stercie: `*suma += x; (*ile)++;`', 'Pamiętaj o `delete suma;` i `delete ile;`.'],
      checks: [{ pattern: 'new\\s+int\\s*\\(', message: 'Utwórz zmienne dynamiczne przez new int(...).' }, { pattern: 'delete\\s+\\w+', message: 'Zwolnij pamięć instrukcją delete.' }],
      solution: `${H()}
int main() {
    int* suma = new int(0);
    int* ile = new int(0);
    int x;
    cin >> x;
    while (x != 0) {
        *suma += x;
        (*ile)++;
        cin >> x;
    }
    cout << "Liczb: " << *ile << endl;
    cout << "Suma: " << *suma << endl;
    delete suma;
    delete ile;
    return 0;
}
`,
      tests: [
        { input: '4 7 -1 0', expected: 'Liczb: 3\nSuma: 10' },
        { input: '0', expected: 'Liczb: 0\nSuma: 0' },
      ],
    }),
  ],

  k08: [
    mk({
      id: 'k08t4', title: 'Suma przesuwanym wskaźnikiem', difficulty: 2,
      description: 'Wczytaj `n` (1–100) i `n` liczb do tablicy `t`. Policz ich sumę **bez indeksów** – wskaźnikiem `int* p`, który zaczyna od `t` i przesuwa się `p++` aż do `t + n`.',
      hints: ['`for (int* p = t; p < t + n; p++) suma += *p;`'],
      checks: [{ pattern: 'p\\s*\\+\\+|\\+\\+\\s*p', message: 'Przesuwaj wskaźnik p operatorem ++.' }, { pattern: '\\*\\s*p\\b', message: 'Odczytuj wartość przez *p.' }],
      solution: `${H()}
int main() {
    int n;
    int t[100];
    cin >> n;
    for (int i = 0; i < n; i++) cin >> t[i];
    int suma = 0;
    for (int* p = t; p < t + n; p++) {
        suma += *p;
    }
    cout << "Suma: " << suma << endl;
    return 0;
}
`,
      tests: [
        { input: '4\n1 2 3 4', expected: 'Suma: 10' },
        { input: '3\n-5 5 7', expected: 'Suma: 7' },
      ],
    }),
  ],

  k09: [
    mk({
      id: 'k09t3', title: 'Bez duplikatów', difficulty: 2,
      description: 'Wczytaj `n` i `n` liczb. Zbuduj `vector<int>` bez powtórzeń, zachowując kolejność pierwszych wystąpień, i wypisz go (liczby oddzielone spacjami).',
      starter: starter({ includes: ['vector'] }),
      hints: ['Dla każdej liczby sprawdź pętlą, czy już jest w wektorze; jeśli nie – `push_back`.'],
      checks: [{ pattern: 'vector\\s*<\\s*int\\s*>', message: 'Użyj vector<int>.' }],
      solution: `${H(['vector'])}
int main() {
    int n;
    cin >> n;
    vector<int> wynik;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        bool jest = false;
        for (int y : wynik) {
            if (y == x) jest = true;
        }
        if (!jest) wynik.push_back(x);
    }
    for (int i = 0; i < (int)wynik.size(); i++) {
        if (i > 0) cout << " ";
        cout << wynik[i];
    }
    cout << endl;
    return 0;
}
`,
      tests: [
        { input: '5\n1 5 1 2 5', expected: '1 5 2' },
        { input: '3\n7 7 7', expected: '7' },
      ],
    }),
    mk({
      id: 'k09t4', title: 'Wstawianie z zachowaniem porządku', difficulty: 3,
      description: 'Wczytaj `n` i `n` liczb. Każdą liczbę wstaw do wektora metodą `insert` w takie miejsce, aby wektor był cały czas uporządkowany rosnąco (bez `sort`). Wypisz wektor.',
      starter: starter({ includes: ['vector'] }),
      hints: ['Szukaj pozycji: `int i = 0; while (i < v.size() && v[i] < x) i++;`', 'Wstawienie: `v.insert(v.begin() + i, x);`'],
      checks: [{ pattern: '\\.insert\\s*\\(', message: 'Użyj metody insert.' }],
      solution: `${H(['vector'])}
int main() {
    int n;
    cin >> n;
    vector<int> v;
    for (int k = 0; k < n; k++) {
        int x;
        cin >> x;
        int i = 0;
        while (i < (int)v.size() && v[i] < x) i++;
        v.insert(v.begin() + i, x);
    }
    cout << "Wektor:";
    for (int x : v) cout << " " << x;
    cout << endl;
    return 0;
}
`,
      tests: [
        { input: '4\n4 1 7 3', expected: 'Wektor: 1 3 4 7' },
        { input: '3\n5 5 -2', expected: 'Wektor: -2 5 5' },
      ],
    }),
  ],

  k10: [
    mk({
      id: 'k10t4', title: 'Dodatnie i ujemne', difficulty: 2,
      description: 'Wczytaj `n` i `n` liczb do wektora. Pętlą zakresową `for (int x : v)` policz liczby dodatnie i ujemne oraz ich sumy (zera pomijamy). Wypisz:',
      starter: starter({ includes: ['vector'] }),
      hints: ['Cztery zmienne: licznik i suma dla dodatnich oraz dla ujemnych.'],
      checks: [{ pattern: 'for\\s*\\(\\s*(const\\s+)?(int|auto)\\s*&?\\s*\\w+\\s*:', message: 'Użyj pętli zakresowej for (int x : v).' }],
      solution: `${H(['vector'])}
int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int i = 0; i < n; i++) cin >> v[i];
    int ileD = 0, sumaD = 0, ileU = 0, sumaU = 0;
    for (int x : v) {
        if (x > 0) { ileD++; sumaD += x; }
        else if (x < 0) { ileU++; sumaU += x; }
    }
    cout << "Dodatnie: " << ileD << " (suma " << sumaD << ")" << endl;
    cout << "Ujemne: " << ileU << " (suma " << sumaU << ")" << endl;
    return 0;
}
`,
      tests: [
        { input: '6\n3 -2 0 4 -3 5', expected: 'Dodatnie: 3 (suma 12)\nUjemne: 2 (suma -5)' },
        { input: '3\n0 0 1', expected: 'Dodatnie: 1 (suma 1)\nUjemne: 0 (suma 0)' },
      ],
    }),
  ],

  k11: [
    mk({
      id: 'k11t4', title: 'Odwróć C-napis w miejscu', difficulty: 2,
      description: 'Wczytaj słowo do tablicy `char s[100]` i odwróć je **w miejscu** – zamieniaj znaki z obu końców, idąc do środka (długość z `strlen`). Wypisz wynik.',
      starter: starter({ includes: ['cstring'] }),
      hints: ['`int n = strlen(s); for (int i = 0; i < n / 2; i++) swap(s[i], s[n - 1 - i]);`'],
      checks: [{ pattern: 'strlen\\s*\\(', message: 'Użyj funkcji strlen.' }, { pattern: 'char\\s+\\w+\\s*\\[', message: 'Zapisz słowo w tablicy char.' }],
      solution: `${H(['cstring'])}
int main() {
    char s[100];
    cin >> s;
    int n = strlen(s);
    for (int i = 0; i < n / 2; i++) {
        char tmp = s[i];
        s[i] = s[n - 1 - i];
        s[n - 1 - i] = tmp;
    }
    cout << s << endl;
    return 0;
}
`,
      tests: [
        { input: 'programowanie', expected: 'einawomargorp' },
        { input: 'abc', expected: 'cba' },
        { input: 'x', expected: 'x' },
      ],
    }),
  ],

  k12: [
    mk({
      id: 'k12t4', title: 'Inicjały', difficulty: 1,
      description: 'Wczytaj całą linię (`getline`) z imionami i nazwiskiem pisanymi małymi literami i wypisz inicjały – wielkie litery zakończone kropkami.',
      hints: ['Litera jest początkiem słowa, gdy to pierwszy znak albo poprzedni znak to spacja.', 'Wielka litera: `toupper(c)` – pamiętaj o rzutowaniu na `char`.'],
      checks: [{ pattern: 'getline\\s*\\(', message: 'Wczytaj linię funkcją getline.' }],
      solution: `${H()}
int main() {
    string s;
    getline(cin, s);
    string wynik = "";
    for (int i = 0; i < (int)s.length(); i++) {
        if (s[i] != ' ' && (i == 0 || s[i - 1] == ' ')) {
            wynik += (char)toupper(s[i]);
            wynik += ".";
        }
    }
    cout << wynik << endl;
    return 0;
}
`,
      tests: [
        { input: 'jan maria kowalski', expected: 'J.M.K.' },
        { input: 'ola nowak', expected: 'O.N.' },
      ],
    }),
  ],

  k13: [
    mk({
      id: 'k13t4', title: 'Punkt w prostokącie', difficulty: 2,
      description: 'Struktura `Punkt` ma pola `x`, `y`, a struktura `Prostokat` – lewy dolny róg `a` i prawy górny róg `b`. Napisz funkcję `bool zawiera(Prostokat r, Punkt p)` (brzeg też się liczy). Pierwsza linia: `x1 y1 x2 y2`, druga: `px py`. Wypisz `Punkt w prostokacie: Tak` lub `Nie`.',
      hints: ['Punkt jest w środku, gdy `r.a.x <= p.x && p.x <= r.b.x` i to samo dla y.'],
      checks: [{ pattern: 'struct\\s+Prostokat', message: 'Zdefiniuj strukturę Prostokat.' }, { pattern: 'bool\\s+zawiera\\s*\\(', message: 'Napisz funkcję bool zawiera(...).' }],
      solution: `${H()}
struct Punkt {
    int x, y;
};

struct Prostokat {
    Punkt a, b;
};

bool zawiera(Prostokat r, Punkt p) {
    return r.a.x <= p.x && p.x <= r.b.x && r.a.y <= p.y && p.y <= r.b.y;
}

int main() {
    Prostokat r;
    Punkt p;
    cin >> r.a.x >> r.a.y >> r.b.x >> r.b.y;
    cin >> p.x >> p.y;
    cout << "Punkt w prostokacie: " << (zawiera(r, p) ? "Tak" : "Nie") << endl;
    return 0;
}
`,
      tests: [
        { input: '0 0 4 3\n2 1', expected: 'Punkt w prostokacie: Tak' },
        { input: '0 0 4 3\n5 1', expected: 'Punkt w prostokacie: Nie' },
        { input: '-2 -2 2 2\n2 -2', expected: 'Punkt w prostokacie: Tak' },
      ],
    }),
  ],

  k14: [
    mk({
      id: 'k14t3', title: 'Młodsze części liczby', difficulty: 3,
      description: 'Zdefiniuj `union Liczba { unsigned int wartosc; unsigned short polowka; unsigned char bajt; };`. Wczytaj nieujemną liczbę, zapisz ją w polu `wartosc`, a następnie odczytaj pola `polowka` (2 najmłodsze bajty) i `bajt` (najmłodszy bajt). Wypisz też rozmiar unii (`sizeof`). Wszystkie pola zajmują tę samą pamięć!',
      starter: starter({ before: 'union Liczba {\n    unsigned int wartosc;\n    unsigned short polowka;\n    unsigned char bajt;\n};' }),
      hints: ['Bajt jako liczba: `(int)u.bajt`.', 'Rozmiar unii to rozmiar jej największego pola.', 'Wynik to reszty z dzielenia przez 65536 i 256 – sprawdź to!'],
      checks: [{ pattern: 'union\\s+Liczba', message: 'Użyj unii Liczba.' }, { pattern: 'sizeof', message: 'Wypisz rozmiar unii operatorem sizeof.' }],
      solution: `${H()}
union Liczba {
    unsigned int wartosc;
    unsigned short polowka;
    unsigned char bajt;
};

int main() {
    Liczba u;
    cin >> u.wartosc;
    cout << "Polowka: " << u.polowka << endl;
    cout << "Bajt: " << (int)u.bajt << endl;
    cout << "Rozmiar unii: " << sizeof(Liczba) << endl;
    return 0;
}
`,
      tests: [
        { input: '258', expected: 'Polowka: 258\nBajt: 2\nRozmiar unii: 4' },
        { input: '65541', expected: 'Polowka: 5\nBajt: 5\nRozmiar unii: 4' },
        { input: '70000', expected: 'Polowka: 4464\nBajt: 112\nRozmiar unii: 4' },
      ],
    }),
  ],

  k15: [
    mk({
      id: 'k15t4', title: 'Liczby doskonałe', difficulty: 2,
      description: 'Liczba doskonała jest równa sumie swoich dzielników mniejszych od niej (np. 6 = 1 + 2 + 3). Napisz funkcję `bool czyDoskonala(int n)`. Wczytaj `n` i wypisz wszystkie liczby doskonałe od 1 do `n` albo `brak`.',
      hints: ['Suma dzielników: pętla `d` od 1 do `n - 1`, `if (n % d == 0) suma += d;`', 'Liczba 1 nie jest doskonała.'],
      checks: [{ pattern: 'bool\\s+czyDoskonala\\s*\\(', message: 'Napisz funkcję bool czyDoskonala(int n).' }],
      solution: `${H()}
bool czyDoskonala(int n) {
    int suma = 0;
    for (int d = 1; d < n; d++) {
        if (n % d == 0) suma += d;
    }
    return n > 1 && suma == n;
}

int main() {
    int n;
    cin >> n;
    cout << "Doskonale do " << n << ":";
    bool jest = false;
    for (int i = 1; i <= n; i++) {
        if (czyDoskonala(i)) {
            cout << " " << i;
            jest = true;
        }
    }
    if (!jest) cout << " brak";
    cout << endl;
    return 0;
}
`,
      tests: [
        { input: '30', expected: 'Doskonale do 30: 6 28' },
        { input: '5', expected: 'Doskonale do 5: brak' },
        { input: '500', expected: 'Doskonale do 500: 6 28 496' },
      ],
    }),
  ],

  k17: [
    mk({
      id: 'k17t4', title: 'Największa – trzy wersje', difficulty: 2,
      description: 'Napisz trzy przeciążone funkcje `najwieksza`: dla dwóch liczb `int`, dla trzech liczb `int` oraz dla dwóch liczb `double`. Pierwsza linia: `a b c` (całkowite), druga: `x y` (rzeczywiste). Wypisz:',
      hints: ['Wersja trzyargumentowa może wywołać dwuargumentową: `najwieksza(najwieksza(a, b), c)`.'],
      checks: [
        { pattern: 'najwieksza\\s*\\(\\s*int\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*,\\s*int', message: 'Dodaj wersję najwieksza(int, int, int).' },
        { pattern: 'najwieksza\\s*\\(\\s*double', message: 'Dodaj wersję najwieksza(double, double).' },
      ],
      solution: `${H()}
int najwieksza(int a, int b) {
    return a > b ? a : b;
}

int najwieksza(int a, int b, int c) {
    return najwieksza(najwieksza(a, b), c);
}

double najwieksza(double a, double b) {
    return a > b ? a : b;
}

int main() {
    int a, b, c;
    double x, y;
    cin >> a >> b >> c >> x >> y;
    cout << "najwieksza(a, b) = " << najwieksza(a, b) << endl;
    cout << "najwieksza(a, b, c) = " << najwieksza(a, b, c) << endl;
    cout << "najwieksza(x, y) = " << najwieksza(x, y) << endl;
    return 0;
}
`,
      tests: [
        { input: '3 9 4\n2.5 1.75', expected: 'najwieksza(a, b) = 9\nnajwieksza(a, b, c) = 9\nnajwieksza(x, y) = 2.5' },
        { input: '7 2 11\n-1.5 -0.5', expected: 'najwieksza(a, b) = 7\nnajwieksza(a, b, c) = 11\nnajwieksza(x, y) = -0.5' },
      ],
    }),
  ],

  k18: [
    mk({
      id: 'k18t4', title: 'Suma odległości', difficulty: 2,
      description: 'Napisz funkcję `inline int odleglosc(int a, int b)` zwracającą odległość liczb na osi (wartość bezwzględną różnicy, bez `abs`). Wczytaj `n` (2–100) i `n` liczb i wypisz sumę odległości między kolejnymi liczbami.',
      hints: ['`return a > b ? a - b : b - a;`', 'Sumuj `odleglosc(t[i - 1], t[i])` dla `i` od 1.'],
      checks: [{ pattern: 'inline\\s+int\\s+odleglosc', message: 'Funkcja odleglosc powinna być inline.' }],
      solution: `${H()}
inline int odleglosc(int a, int b) {
    return a > b ? a - b : b - a;
}

int main() {
    int n;
    int t[100];
    cin >> n;
    for (int i = 0; i < n; i++) cin >> t[i];
    int suma = 0;
    for (int i = 1; i < n; i++) {
        suma += odleglosc(t[i - 1], t[i]);
    }
    cout << "Suma odleglosci: " << suma << endl;
    return 0;
}
`,
      tests: [
        { input: '4\n1 5 2 2', expected: 'Suma odleglosci: 7' },
        { input: '3\n-3 3 0', expected: 'Suma odleglosci: 9' },
      ],
    }),
  ],

  k19: [
    mk({
      id: 'k19t4', title: 'Pole i obwód koła', difficulty: 1,
      description: 'Wczytaj promień koła i wypisz jego pole i obwód z dwoma miejscami po przecinku. Liczbę π oblicz jako `acos(-1.0)`, a kwadrat promienia funkcją `pow`.',
      hints: ['`const double PI = acos(-1.0);`', '`cout << fixed << setprecision(2);` (biblioteka `<iomanip>`).'],
      checks: [{ pattern: 'pow\\s*\\(', message: 'Użyj funkcji pow.' }],
      solution: `${H(['cmath', 'iomanip'])}
int main() {
    const double PI = acos(-1.0);
    double r;
    cin >> r;
    cout << fixed << setprecision(2);
    cout << "Pole: " << PI * pow(r, 2) << endl;
    cout << "Obwod: " << 2 * PI * r << endl;
    return 0;
}
`,
      tests: [
        { input: '5', expected: 'Pole: 78.54\nObwod: 31.42' },
        { input: '1', expected: 'Pole: 3.14\nObwod: 6.28' },
        { input: '2.5', expected: 'Pole: 19.63\nObwod: 15.71' },
      ],
    }),
  ],

  k20: [
    mk({
      id: 'k20t4', title: 'Tylko cyfry', difficulty: 1,
      description: 'Wczytaj całą linię tekstu. Wypisz wszystkie cyfry w kolejności występowania oraz ich sumę. Użyj funkcji `isdigit`.',
      hints: ['Wartość cyfry jako liczba: `c - \'0\'`.'],
      checks: [{ pattern: 'isdigit\\s*\\(', message: 'Użyj funkcji isdigit.' }],
      solution: `${H(['cctype'])}
int main() {
    string s;
    getline(cin, s);
    string cyfry = "";
    int suma = 0;
    for (char c : s) {
        if (isdigit(c)) {
            cyfry += c;
            suma += c - '0';
        }
    }
    cout << "Cyfry: " << cyfry << endl;
    cout << "Suma: " << suma << endl;
    return 0;
}
`,
      tests: [
        { input: 'Rok 2024, klasa 3b', expected: 'Cyfry: 20243\nSuma: 11' },
        { input: 'abc9', expected: 'Cyfry: 9\nSuma: 9' },
      ],
    }),
  ],

  k21: [
    mk({
      id: 'k21t4', title: 'Złote i grosze', difficulty: 2,
      description: 'Wczytaj cenę jako liczbę rzeczywistą (np. `12.75`). Część złotową uzyskaj rzutowaniem `(int)`, a grosze – zaokrąglając resztę pomnożoną przez 100 (`round`) i rzutując na `int`. Wypisz:',
      hints: ['`int zl = (int)cena;`', '`int gr = (int)round((cena - zl) * 100);` – samo rzutowanie mogłoby dać 74 zamiast 75 przez błędy zaokrągleń.'],
      checks: [{ pattern: 'round\\s*\\(', message: 'Zaokrąglij grosze funkcją round.' }],
      solution: `${H(['cmath'])}
int main() {
    double cena;
    cin >> cena;
    int zl = (int)cena;
    int gr = (int)round((cena - zl) * 100);
    cout << zl << " zl " << gr << " gr" << endl;
    return 0;
}
`,
      tests: [
        { input: '12.75', expected: '12 zl 75 gr' },
        { input: '0.99', expected: '0 zl 99 gr' },
        { input: '5', expected: '5 zl 0 gr' },
        { input: '19.29', expected: '19 zl 29 gr' },
      ],
    }),
  ],

  o04: [
    mk({
      id: 'o04t4', title: 'Rekord gry', difficulty: 2,
      description: 'Klasa `Gracz` ma pola `imie` i `punkty` oraz **statyczne** pola `rekord` i `mistrz`, aktualizowane w konstruktorze, gdy nowy gracz pobije rekord. Wczytaj `n` i `n` linii `imie punkty`, a potem wypisz rekord.',
      hints: ['Deklaracja w klasie: `static int rekord;`, definicja poza klasą: `int Gracz::rekord = 0;`'],
      checks: [{ pattern: 'static\\s+int\\s+rekord', message: 'Rekord powinien być polem statycznym.' }],
      solution: `${H()}
class Gracz {
public:
    static int rekord;
    static string mistrz;

    string imie;
    int punkty;

    Gracz(string i, int p) : imie(i), punkty(p) {
        if (p > rekord) {
            rekord = p;
            mistrz = i;
        }
    }
};

int Gracz::rekord = 0;
string Gracz::mistrz = "brak";

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string imie;
        int p;
        cin >> imie >> p;
        Gracz g(imie, p);
    }
    cout << "Rekord: " << Gracz::rekord << " (" << Gracz::mistrz << ")" << endl;
    return 0;
}
`,
      tests: [
        { input: '3\nOla 120\nJan 90\nEwa 150', expected: 'Rekord: 150 (Ewa)' },
        { input: '2\nAdam 50\nZosia 50', expected: 'Rekord: 50 (Adam)' },
      ],
    }),
  ],

  o05: [
    mk({
      id: 'o05t4', title: 'Pracownik i kierownik', difficulty: 2,
      description: 'Klasa `Pracownik` ma pole `pensja` i metodę `int wyplata()`. Klasa `Kierownik : public Pracownik` dodaje `premia` i własną metodę `wyplata()`, która korzysta z wersji bazowej `Pracownik::wyplata()`. Wczytaj `pensja premia` i wypisz wypłatę pracownika i kierownika z tą samą pensją.',
      hints: ['Konstruktor pochodnej: `Kierownik(int p, int pr) : Pracownik(p), premia(pr) {}`', '`return Pracownik::wyplata() + premia;`'],
      checks: [{ pattern: 'Pracownik::wyplata\\s*\\(', message: 'Wywołaj wersję bazową Pracownik::wyplata().' }],
      solution: `${H()}
class Pracownik {
protected:
    int pensja;

public:
    Pracownik(int p) : pensja(p) {}

    int wyplata() const {
        return pensja;
    }
};

class Kierownik : public Pracownik {
    int premia;

public:
    Kierownik(int p, int pr) : Pracownik(p), premia(pr) {}

    int wyplata() const {
        return Pracownik::wyplata() + premia;
    }
};

int main() {
    int pensja, premia;
    cin >> pensja >> premia;
    Pracownik p(pensja);
    Kierownik k(pensja, premia);
    cout << "Pracownik: " << p.wyplata() << endl;
    cout << "Kierownik: " << k.wyplata() << endl;
    return 0;
}
`,
      tests: [
        { input: '5000 1500', expected: 'Pracownik: 5000\nKierownik: 6500' },
        { input: '4200 0', expected: 'Pracownik: 4200\nKierownik: 4200' },
      ],
    }),
  ],

  o06: [
    mk({
      id: 'o06t4', title: 'Bilety komunikacji', difficulty: 2,
      description: 'Klasa `Bilet` ma wirtualną metodę `double cena()` (4.40 zł) i wirtualny destruktor. Klasy `Ulgowy` (2.20 zł) i `Rodzinny` (10.00 zł) ją nadpisują. Wczytaj `n` i `n` liter `N`, `U`, `R`, utwórz bilety przez `new` w tablicy wskaźników `Bilet*`, wypisz sumę cen (2 miejsca) i zwolnij pamięć.',
      hints: ['`Bilet* t[20];` i `t[i] = new Ulgowy();`', 'Bez słowa `virtual` zawsze wywołałaby się wersja z klasy Bilet!'],
      checks: [{ pattern: 'virtual\\s+double\\s+cena', message: 'Metoda cena w klasie bazowej powinna być wirtualna.' }, { pattern: 'delete\\s+\\w+', message: 'Zwolnij pamięć instrukcją delete.' }],
      solution: `${H(['iomanip'])}
class Bilet {
public:
    virtual double cena() const { return 4.40; }
    virtual ~Bilet() {}
};

class Ulgowy : public Bilet {
public:
    double cena() const override { return 2.20; }
};

class Rodzinny : public Bilet {
public:
    double cena() const override { return 10.00; }
};

int main() {
    int n;
    cin >> n;
    Bilet* t[20];
    for (int i = 0; i < n; i++) {
        char c;
        cin >> c;
        if (c == 'U') t[i] = new Ulgowy();
        else if (c == 'R') t[i] = new Rodzinny();
        else t[i] = new Bilet();
    }
    double suma = 0;
    for (int i = 0; i < n; i++) suma += t[i]->cena();
    cout << fixed << setprecision(2) << "Suma: " << suma << endl;
    for (int i = 0; i < n; i++) delete t[i];
    return 0;
}
`,
      tests: [
        { input: '4\nN U U R', expected: 'Suma: 18.80' },
        { input: '1\nN', expected: 'Suma: 4.40' },
      ],
    }),
  ],

  k23: [
    mk({
      id: 'k23t3', title: 'Metody płatności', difficulty: 2,
      description: 'Klasa abstrakcyjna `Platnosc` ma metody czysto wirtualne `string nazwa()` i `double oplata(double kwota)`. Zaimplementuj `Karta` (prowizja 1%), `Gotowka` (bez opłat) i `Przelew` (+2 zł). Wczytaj kwotę i wypisz koszt każdą metodą (2 miejsca po przecinku), przechodząc po tablicy wskaźników `Platnosc*`.',
      hints: ['Metoda czysto wirtualna: `virtual double oplata(double kwota) const = 0;`', 'Obiektów klasy abstrakcyjnej nie da się utworzyć – ale wskaźnik `Platnosc*` może wskazywać na obiekt klasy pochodnej.'],
      checks: [{ pattern: '=\\s*0\\s*;', message: 'Klasa Platnosc powinna mieć metody czysto wirtualne (= 0).' }],
      solution: `${H(['iomanip'])}
class Platnosc {
public:
    virtual string nazwa() const = 0;
    virtual double oplata(double kwota) const = 0;
    virtual ~Platnosc() {}
};

class Karta : public Platnosc {
public:
    string nazwa() const override { return "Karta"; }
    double oplata(double kwota) const override { return kwota * 1.01; }
};

class Gotowka : public Platnosc {
public:
    string nazwa() const override { return "Gotowka"; }
    double oplata(double kwota) const override { return kwota; }
};

class Przelew : public Platnosc {
public:
    string nazwa() const override { return "Przelew"; }
    double oplata(double kwota) const override { return kwota + 2; }
};

int main() {
    double kwota;
    cin >> kwota;
    Platnosc* metody[3] = { new Karta(), new Gotowka(), new Przelew() };
    cout << fixed << setprecision(2);
    for (int i = 0; i < 3; i++) {
        cout << metody[i]->nazwa() << ": " << metody[i]->oplata(kwota) << endl;
        delete metody[i];
    }
    return 0;
}
`,
      tests: [
        { input: '100', expected: 'Karta: 101.00\nGotowka: 100.00\nPrzelew: 102.00' },
        { input: '250', expected: 'Karta: 252.50\nGotowka: 250.00\nPrzelew: 252.00' },
      ],
    }),
    mk({
      id: 'k23t4', title: 'Interfejs Opisywalny', difficulty: 2,
      description: 'Klasa `Opisywalny` zawiera **tylko** czysto wirtualną metodę `string opis()` (i wirtualny destruktor) – pełni rolę interfejsu. Niezwiązane ze sobą klasy `Ksiazka(tytul)` i `Film(tytul, minuty)` go implementują. Wczytaj `n` i `n` linii `ksiazka Tytul` lub `film Tytul minuty` i wypisz opisy.',
      hints: ['`string opis() const override { return "Film: " + tytul + " (" + to_string(minuty) + " min)"; }`'],
      checks: [{ pattern: 'class\\s+Opisywalny', message: 'Zdefiniuj interfejs Opisywalny.' }, { pattern: 'opis\\s*\\(\\s*\\)\\s*(const\\s*)?=\\s*0', message: 'Metoda opis() powinna być czysto wirtualna (= 0).' }],
      solution: `${H()}
class Opisywalny {
public:
    virtual string opis() const = 0;
    virtual ~Opisywalny() {}
};

class Ksiazka : public Opisywalny {
    string tytul;

public:
    Ksiazka(string t) : tytul(t) {}
    string opis() const override { return "Ksiazka: " + tytul; }
};

class Film : public Opisywalny {
    string tytul;
    int minuty;

public:
    Film(string t, int m) : tytul(t), minuty(m) {}
    string opis() const override { return "Film: " + tytul + " (" + to_string(minuty) + " min)"; }
};

int main() {
    int n;
    cin >> n;
    Opisywalny* lista[20];
    for (int i = 0; i < n; i++) {
        string typ, tytul;
        cin >> typ >> tytul;
        if (typ == "ksiazka") {
            lista[i] = new Ksiazka(tytul);
        } else {
            int m;
            cin >> m;
            lista[i] = new Film(tytul, m);
        }
    }
    for (int i = 0; i < n; i++) {
        cout << lista[i]->opis() << endl;
        delete lista[i];
    }
    return 0;
}
`,
      tests: [
        { input: '2\nksiazka Lalka\nfilm Shrek 90', expected: 'Ksiazka: Lalka\nFilm: Shrek (90 min)' },
        { input: '1\nfilm Avatar 162', expected: 'Film: Avatar (162 min)' },
      ],
    }),
  ],
};
